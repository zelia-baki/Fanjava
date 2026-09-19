# products/management/commands/recalculer_stats.py

from django.core.management.base import BaseCommand
from django.db.models import Sum

from orders.models import LigneCommande
from products.models import Produit
from products.signals import recalculer_notes
from users.models import Entreprise


class Command(BaseCommand):
    help = (
        "Recalcule les statistiques stockées : notes moyennes des produits/entreprises "
        "et nombre de ventes des entreprises (commandes livrées). Idempotent."
    )

    def handle(self, *args, **options):
        produits = Produit.objects.values_list('id', flat=True)
        for produit_id in produits:
            recalculer_notes(produit_id)
        self.stdout.write(f"Notes recalculées pour {len(produits)} produit(s).")

        for entreprise in Entreprise.objects.all():
            ventes = (
                LigneCommande.objects.filter(commande__entreprise=entreprise, commande__status='delivered')
                .aggregate(total=Sum('quantite'))['total'] or 0
            )
            Entreprise.objects.filter(pk=entreprise.pk).update(nombre_ventes=ventes)
        self.stdout.write(f"Ventes recalculées pour {Entreprise.objects.count()} entreprise(s).")
