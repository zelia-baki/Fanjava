from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed, PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from products.models import Produit
from users.permissions import is_admin

from .models import Panier, PanierItem, Commande
from .serializers import (
    PanierSerializer,
    CommandeSerializer,
    CommandeCreateSerializer,
    CommandeUpdateSerializer,
)
from .services import changer_statut, creer_commandes_depuis_panier


def _client_de(request):
    """Profil client de l'utilisateur connecté (403 propre pour les autres types de compte)"""
    client = getattr(request.user, 'client', None)
    if client is None:
        raise PermissionDenied("Cette action est réservée aux clients.")
    return client


def _quantite_valide(valeur):
    """Convertit la quantité reçue en entier >= 1 (400 sinon)"""
    try:
        quantite = int(valeur)
    except (TypeError, ValueError):
        raise ValidationError({'quantite': "La quantité doit être un nombre entier."})
    if quantite < 1:
        raise ValidationError({'quantite': "La quantité doit être d'au moins 1."})
    return quantite


def _erreur(message, code=status.HTTP_400_BAD_REQUEST):
    return Response({'error': message}, status=code)


class PanierViewSet(viewsets.ViewSet):
    """ViewSet pour gérer le panier du client"""
    permission_classes = [IsAuthenticated]

    def _panier(self, request):
        panier, _created = Panier.objects.get_or_create(client=_client_de(request))
        return panier

    def _reponse(self, panier):
        return Response(PanierSerializer(panier).data)

    def list(self, request):
        """Récupérer le panier de l'utilisateur connecté"""
        return self._reponse(self._panier(request))

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Ajouter un produit au panier"""
        panier = self._panier(request)
        quantite = _quantite_valide(request.data.get('quantite', 1))

        produit = Produit.objects.filter(
            id=request.data.get('produit_id') or 0,
            status='active', actif=True, entreprise__status='approved',
        ).first()
        if produit is None:
            return _erreur('Produit non trouvé', status.HTTP_404_NOT_FOUND)

        item = PanierItem.objects.filter(panier=panier, produit=produit).first()
        nouvelle_quantite = quantite + (item.quantite if item else 0)
        if produit.stock < nouvelle_quantite:
            return _erreur(f'Stock insuffisant. Stock disponible: {produit.stock}')

        if item is None:
            PanierItem.objects.create(panier=panier, produit=produit, quantite=quantite)
        else:
            item.quantite = nouvelle_quantite
            item.save()
        return self._reponse(panier)

    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        """Modifier la quantité d'un article du panier"""
        panier = self._panier(request)
        quantite = _quantite_valide(request.data.get('quantite'))
        item = get_object_or_404(PanierItem, id=request.data.get('item_id') or 0, panier=panier)

        if item.produit.stock < quantite:
            return _erreur(f'Stock insuffisant. Stock disponible: {item.produit.stock}')

        item.quantite = quantite
        item.save()
        return self._reponse(panier)

    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """Supprimer un article du panier"""
        panier = self._panier(request)
        item = get_object_or_404(PanierItem, id=request.data.get('item_id') or 0, panier=panier)
        item.delete()
        return self._reponse(panier)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Vider le panier"""
        panier = self._panier(request)
        panier.items.all().delete()
        return self._reponse(panier)


class CommandeViewSet(viewsets.ModelViewSet):
    """
    Commandes : lecture, mise à jour par l'entreprise/admin, annulation par le client.
    Pas de création directe (uniquement `create_from_cart`) ni de suppression.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CommandeSerializer
    http_method_names = ['get', 'patch', 'put', 'post', 'head', 'options']

    def get_queryset(self):
        """
        - Client : ses propres commandes
        - Entreprise : commandes reçues
        - Admin : toutes (filtrables par ?client_id= / ?entreprise_id=)
        """
        user = self.request.user
        params = self.request.query_params
        base = Commande.objects.select_related('client__user', 'entreprise').prefetch_related(
            'lignes__produit__images'
        )

        if hasattr(user, 'client'):
            return base.filter(client=user.client)
        if hasattr(user, 'entreprise'):
            return base.filter(entreprise=user.entreprise)
        if is_admin(user):
            if params.get('client_id'):
                base = base.filter(client_id=params['client_id'])
            if params.get('entreprise_id'):
                base = base.filter(entreprise_id=params['entreprise_id'])
            return base
        return Commande.objects.none()

    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed('POST')

    def update(self, request, *args, **kwargs):
        """
        L'entreprise de la commande (ou un admin) met à jour le statut, le suivi,
        les frais de livraison et les dates. Les changements de statut suivent
        les transitions autorisées.
        """
        commande = self.get_object()
        user = request.user

        entreprise = getattr(user, 'entreprise', None)
        if entreprise is not None:
            if commande.entreprise_id != entreprise.id:
                return _erreur('Vous ne pouvez pas modifier cette commande', status.HTTP_403_FORBIDDEN)
        elif not is_admin(user):
            return _erreur('Non autorisé', status.HTTP_403_FORBIDDEN)

        serializer = CommandeUpdateSerializer(commande, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        donnees = dict(serializer.validated_data)
        nouveau_statut = donnees.pop('status', None)

        if 'frais_livraison' in donnees and commande.status not in ('pending', 'confirmed', 'processing'):
            return _erreur("Les frais de livraison ne peuvent plus être modifiés à ce stade.")

        for champ, valeur in donnees.items():
            setattr(commande, champ, valeur)
        if donnees:
            commande.save()

        if nouveau_statut:
            commande = changer_statut(commande, nouveau_statut)

        commande = self.get_queryset().get(pk=commande.pk)
        return Response(CommandeSerializer(commande).data)

    def partial_update(self, request, *args, **kwargs):
        """Permettre les mises à jour partielles (PATCH)"""
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Le client annule sa commande tant qu'elle n'est pas en préparation (le stock est remis en vente)"""
        commande = self.get_object()
        client = getattr(request.user, 'client', None)
        if client is None or commande.client_id != client.id:
            return _erreur('Seul le client de la commande peut l\'annuler', status.HTTP_403_FORBIDDEN)
        if not commande.peut_etre_annulee_par_client():
            return _erreur("Cette commande ne peut plus être annulée (déjà en préparation ou expédiée).")

        commande = changer_statut(commande, 'cancelled')
        commande = self.get_queryset().get(pk=commande.pk)
        return Response(CommandeSerializer(commande).data)

    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        """Créer une ou plusieurs commandes depuis le panier (une par entreprise)"""
        client = _client_de(request)
        panier = Panier.objects.filter(client=client).first()

        if panier is None or not panier.items.exists():
            return _erreur('Le panier est vide')

        donnees = CommandeCreateSerializer(data=request.data)
        if not donnees.is_valid():
            return Response(donnees.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            commandes = creer_commandes_depuis_panier(client, panier, donnees.validated_data)
        except ValidationError as exc:
            detail = exc.detail
            message = detail[0] if isinstance(detail, list) else detail
            return _erreur(str(message))

        commandes = self.get_queryset().filter(pk__in=[c.pk for c in commandes])
        return Response({
            'message': f'{len(commandes)} commande(s) créée(s) avec succès',
            'commandes': CommandeSerializer(commandes, many=True).data,
        }, status=status.HTTP_201_CREATED)
