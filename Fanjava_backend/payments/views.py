# payments/views.py
"""
Suivi des paiements (sans passerelle automatique) :
- le client DÉCLARE son paiement (POST /payments/) → « en attente » ;
- l'entreprise de la commande (ou un admin) le CONFIRME ou le MARQUE comme échoué ;
- un admin peut REMBOURSER.
Aucun prestataire externe (Mvola, Orange Money, Stripe...) n'est branché : il faudra
un contrat et des identifiants pour cela.
"""

from django.db import transaction
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from notifications.services import notifier
from orders.services import changer_statut
from users.permissions import IsAdminUser, is_admin

from .models import Paiement
from .serializers import PaiementCreateSerializer, PaiementDetailSerializer, PaiementSerializer


class PaiementViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = Paiement.objects.select_related('commande__client__user', 'commande__entreprise')
        if hasattr(user, 'client'):
            return base.filter(commande__client=user.client)
        if hasattr(user, 'entreprise'):
            return base.filter(commande__entreprise=user.entreprise)
        if is_admin(user):
            return base
        return base.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return PaiementCreateSerializer
        if self.action == 'retrieve':
            return PaiementDetailSerializer
        return PaiementSerializer

    def create(self, request, *args, **kwargs):
        if not hasattr(request.user, 'client'):
            raise PermissionDenied("Seul le client d'une commande peut déclarer son paiement.")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        paiement = serializer.save()

        commande = paiement.commande
        notifier(
            commande.entreprise.user, 'payment', 'Paiement déclaré',
            f"Le client a déclaré un paiement ({paiement.get_methode_display()}) "
            f"pour la commande {commande.numero_commande}.",
            lien=f'/entreprise/orders/{commande.id}',
        )
        return Response(PaiementSerializer(paiement).data, status=status.HTTP_201_CREATED)

    def _paiement_gerable(self):
        """Paiement de l'entreprise connectée (ou n'importe lequel pour un admin)"""
        paiement = self.get_object()
        user = self.request.user
        entreprise = getattr(user, 'entreprise', None)
        if not (is_admin(user) or (entreprise and paiement.commande.entreprise_id == entreprise.id)):
            raise PermissionDenied("Vous ne pouvez pas gérer ce paiement.")
        return paiement

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirmer la réception du paiement (le montant suit d'éventuels frais de livraison ajoutés)"""
        paiement = self._paiement_gerable()
        if paiement.status not in ('pending', 'failed'):
            return Response({'error': 'Ce paiement ne peut plus être confirmé.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            paiement.montant = paiement.commande.montant_final
            paiement.status = 'completed'
            paiement.error_message = ''
            paiement.save()
            if paiement.commande.status == 'pending':
                changer_statut(paiement.commande, 'confirmed')

        notifier(
            paiement.commande.client.user, 'payment', 'Paiement confirmé',
            f"Votre paiement pour la commande {paiement.commande.numero_commande} a été confirmé.",
            lien=f'/profile/orders/{paiement.commande_id}',
        )
        return Response(PaiementSerializer(paiement).data)

    @action(detail=True, methods=['post'])
    def fail(self, request, pk=None):
        """Marquer le paiement comme échoué / non reçu"""
        paiement = self._paiement_gerable()
        if paiement.status != 'pending':
            return Response({'error': 'Seul un paiement en attente peut être refusé.'}, status=status.HTTP_400_BAD_REQUEST)

        paiement.status = 'failed'
        paiement.error_message = request.data.get('error_message', '')
        paiement.save()

        notifier(
            paiement.commande.client.user, 'payment', 'Paiement non reçu',
            f"Votre paiement pour la commande {paiement.commande.numero_commande} n'a pas pu être validé. "
            "Vous pouvez le déclarer à nouveau.",
            lien=f'/profile/orders/{paiement.commande_id}',
        )
        return Response(PaiementSerializer(paiement).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def refund(self, request, pk=None):
        """Rembourser un paiement (admin) ; une commande livrée passe en « remboursée »"""
        paiement = self.get_object()
        if paiement.status != 'completed':
            return Response({'error': 'Seul un paiement complété peut être remboursé.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            paiement.status = 'refunded'
            paiement.save()
            if paiement.commande.status == 'delivered':
                changer_statut(paiement.commande, 'refunded')

        notifier(
            paiement.commande.client.user, 'payment', 'Paiement remboursé',
            f"Votre paiement pour la commande {paiement.commande.numero_commande} a été remboursé.",
            lien=f'/profile/orders/{paiement.commande_id}',
        )
        return Response(PaiementSerializer(paiement).data)
