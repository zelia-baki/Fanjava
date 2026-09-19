# orders/services.py
"""Règles métier des commandes : création depuis le panier, changements de statut, stock."""

from collections import defaultdict
from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from notifications.services import notifier
from products.models import Produit
from users.models import Entreprise

from .models import Commande, LigneCommande


def recalculer_ventes_entreprise(entreprise_id):
    """Nombre d'unités vendues (commandes livrées) d'une entreprise"""
    total = (
        LigneCommande.objects.filter(commande__entreprise_id=entreprise_id, commande__status='delivered')
        .aggregate(total=Sum('quantite'))['total'] or 0
    )
    Entreprise.objects.filter(pk=entreprise_id).update(nombre_ventes=total)


def _alerte_stock(produit, stock_avant):
    """Notifie l'entreprise quand le stock passe sous le seuil d'alerte (ou à zéro)"""
    if produit.stock == 0 and stock_avant > 0:
        notifier(
            produit.entreprise.user, 'stock', 'Rupture de stock',
            f"« {produit.nom} » est en rupture de stock.",
            lien=f'/entreprise/products/{produit.slug}/edit',
        )
    elif produit.stock <= produit.seuil_alerte_stock < stock_avant:
        notifier(
            produit.entreprise.user, 'stock', 'Stock faible',
            f"Il ne reste que {produit.stock} unité(s) de « {produit.nom} ».",
            lien=f'/entreprise/products/{produit.slug}/edit',
        )


@transaction.atomic
def _creer_commandes(client, panier, donnees_livraison):
    items = list(panier.items.select_related('produit__entreprise'))
    if not items:
        raise ValidationError('Le panier est vide')

    # Verrouille les produits (ordre stable pour éviter les blocages croisés) :
    # deux commandes simultanées ne peuvent plus dépasser le stock.
    ids = sorted({item.produit_id for item in items})
    produits = {p.id: p for p in Produit.objects.select_for_update().select_related('entreprise').filter(id__in=ids)}

    for item in items:
        produit = produits[item.produit_id]
        if produit.status != 'active' or not produit.actif or produit.entreprise.status != 'approved':
            raise ValidationError(f"« {produit.nom} » n'est plus disponible.")
        if produit.stock < item.quantite:
            raise ValidationError(
                f"Stock insuffisant pour {produit.nom}. Stock disponible: {produit.stock}"
            )

    par_entreprise = defaultdict(list)
    for item in items:
        par_entreprise[produits[item.produit_id].entreprise].append(item)

    commandes = []
    alertes = []
    for entreprise, lignes_panier in par_entreprise.items():
        montant_total = sum(
            (produits[i.produit_id].get_prix_final() * i.quantite for i in lignes_panier), Decimal('0')
        )
        # Les frais de livraison sont fixés ensuite par le vendeur (jamais par le client)
        commande = Commande.objects.create(
            client=client,
            entreprise=entreprise,
            montant_total=montant_total,
            frais_livraison=Decimal('0.00'),
            adresse_livraison=donnees_livraison['adresse_livraison'],
            ville_livraison=donnees_livraison['ville_livraison'],
            code_postal_livraison=donnees_livraison['code_postal_livraison'],
            pays_livraison=donnees_livraison['pays_livraison'],
            telephone_livraison=donnees_livraison['telephone_livraison'],
            note_client=donnees_livraison.get('note_client', ''),
        )
        for item in lignes_panier:
            produit = produits[item.produit_id]
            LigneCommande.objects.create(
                commande=commande,
                produit=produit,
                nom_produit=produit.nom,
                prix_unitaire=produit.get_prix_final(),
                quantite=item.quantite,
            )
            stock_avant = produit.stock
            produit.stock -= item.quantite
            produit.nombre_ventes += item.quantite
            produit.save(update_fields=['stock', 'nombre_ventes', 'updated_at'])
            alertes.append((produit, stock_avant))
        commandes.append(commande)

    panier.items.all().delete()
    return commandes, alertes


def creer_commandes_depuis_panier(client, panier, donnees_livraison):
    """
    Crée une commande par entreprise à partir du panier (transaction atomique),
    puis envoie les notifications (nouvelle commande, alerte de stock).
    """
    commandes, alertes = _creer_commandes(client, panier, donnees_livraison)

    for commande in commandes:
        notifier(
            commande.entreprise.user, 'order', 'Nouvelle commande',
            f"Commande {commande.numero_commande} de {client.user.username} : "
            f"{commande.montant_total} Ar.",
            lien=f'/entreprise/orders/{commande.id}',
        )
    for produit, stock_avant in alertes:
        _alerte_stock(produit, stock_avant)
    return commandes


LIBELLES_STATUT = dict(Commande.STATUS_CHOICES)


@transaction.atomic
def changer_statut(commande, nouveau_statut):
    """
    Change le statut d'une commande en respectant les transitions autorisées.
    - annulation : le stock est remis en vente ;
    - livraison : date de livraison réelle + statistiques de l'entreprise ;
    - le client est notifié.
    """
    commande = Commande.objects.select_for_update().get(pk=commande.pk)
    if nouveau_statut == commande.status:
        return commande

    if nouveau_statut not in commande.statuts_suivants():
        raise ValidationError({
            'status': f"Passage impossible de « {LIBELLES_STATUT.get(commande.status)} » "
                      f"à « {LIBELLES_STATUT.get(nouveau_statut, nouveau_statut)} »."
        })

    if nouveau_statut == 'cancelled':
        for ligne in commande.lignes.all():
            produit = Produit.objects.select_for_update().get(pk=ligne.produit_id)
            produit.stock += ligne.quantite
            produit.nombre_ventes = max(0, produit.nombre_ventes - ligne.quantite)
            produit.save(update_fields=['stock', 'nombre_ventes', 'updated_at'])

    if nouveau_statut == 'delivered' and not commande.date_livraison_reelle:
        commande.date_livraison_reelle = timezone.localdate()

    commande.status = nouveau_statut
    commande.save()

    if nouveau_statut in ('delivered', 'refunded'):
        recalculer_ventes_entreprise(commande.entreprise_id)

    notifier(
        commande.client.user, 'order_status',
        f"Commande {commande.numero_commande} : {LIBELLES_STATUT.get(nouveau_statut)}",
        f"Le statut de votre commande {commande.numero_commande} est maintenant "
        f"« {LIBELLES_STATUT.get(nouveau_statut)} ».",
        lien=f'/profile/orders/{commande.id}',
    )
    return commande
