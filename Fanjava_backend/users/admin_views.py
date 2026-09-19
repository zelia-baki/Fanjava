# users/admin_views.py

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from notifications.services import notifier

from .models import CustomUser, Client, Entreprise
from .permissions import IsAdminUser
from .serializers import UserSerializer, AdminClientSerializer, EntrepriseSerializer


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Gestion admin de tous les utilisateurs (accessible uniquement aux admins).
    PATCH permet d'activer/désactiver un compte, de changer son type, etc.
    """
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all().select_related('client', 'entreprise')

    def list(self, request):
        """Récupérer tous les utilisateurs"""
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)

    def _garde_fou_auto_modification(self, request, user, data):
        """Un admin ne peut ni se désactiver, ni se rétrograder, ni se supprimer lui-même"""
        if user.pk != request.user.pk:
            return None
        if data.get('is_active') in (False, 'false', 'False', 0, '0'):
            return Response({'error': 'Vous ne pouvez pas désactiver votre propre compte.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if 'user_type' in data and data['user_type'] != user.user_type:
            return Response({'error': 'Vous ne pouvez pas modifier votre propre type de compte.'},
                            status=status.HTTP_400_BAD_REQUEST)
        return None

    def partial_update(self, request, pk=None):
        user = self.get_object()
        refus = self._garde_fou_auto_modification(request, user, request.data)
        if refus:
            return refus
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def update(self, request, pk=None):
        user = self.get_object()
        refus = self._garde_fou_auto_modification(request, user, request.data)
        if refus:
            return refus
        serializer = self.get_serializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        if self.get_object().pk == request.user.pk:
            return Response({'error': 'Vous ne pouvez pas supprimer votre propre compte.'},
                            status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des utilisateurs"""
        return Response({
            'total': CustomUser.objects.count(),
            'clients': CustomUser.objects.filter(user_type='client').count(),
            'entreprises': CustomUser.objects.filter(user_type='entreprise').count(),
            'admins': CustomUser.objects.filter(user_type='admin').count(),
        })


class AdminClientViewSet(viewsets.ReadOnlyModelViewSet):
    """Gestion admin des clients (lecture)"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminClientSerializer
    queryset = Client.objects.all().select_related('user')


class AdminEntrepriseViewSet(viewsets.ModelViewSet):
    """Gestion admin des entreprises : approuver / rejeter / suspendre"""
    permission_classes = [IsAdminUser]
    serializer_class = EntrepriseSerializer
    queryset = Entreprise.objects.all().select_related('user')

    def _changer_statut(self, entreprise, statut, verifiee, titre, message):
        entreprise.status = statut
        entreprise.verified = verifiee
        if statut == 'approved':
            entreprise.verification_date = timezone.now()
        entreprise.save()
        notifier(entreprise.user, 'account', titre, message, lien='/dashboard/entreprise')
        return Response(self.get_serializer(entreprise).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        return self._changer_statut(
            self.get_object(), 'approved', True,
            'Entreprise approuvée',
            "Votre entreprise a été approuvée. Vous pouvez maintenant publier vos produits.",
        )

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        return self._changer_statut(
            self.get_object(), 'rejected', False,
            'Entreprise rejetée',
            "Votre demande d'inscription en tant qu'entreprise a été rejetée.",
        )

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        entreprise = self.get_object()
        return self._changer_statut(
            entreprise, 'suspended', entreprise.verified,
            'Entreprise suspendue',
            "Votre entreprise a été suspendue. Contactez l'administration pour plus d'informations.",
        )
