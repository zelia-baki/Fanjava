# users/admin_views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser, Client, Entreprise
from .serializers import UserSerializer, ClientSerializer, EntrepriseSerializer
from .permissions import IsAdminUser


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour la gestion admin de tous les utilisateurs
    Accessible uniquement aux admins
    """
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all()
    
    def list(self, request):
        """Récupérer tous les utilisateurs"""
        users = self.get_queryset()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Récupérer un utilisateur spécifique"""
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des utilisateurs"""
        total = CustomUser.objects.count()
        clients = CustomUser.objects.filter(user_type='client').count()
        entreprises = CustomUser.objects.filter(user_type='entreprise').count()
        admins = CustomUser.objects.filter(user_type='admin').count()
        
        return Response({
            'total': total,
            'clients': clients,
            'entreprises': entreprises,
            'admins': admins
        })


class AdminClientViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour la gestion admin des clients
    """
    permission_classes = [IsAdminUser]
    serializer_class = ClientSerializer
    queryset = Client.objects.all().select_related('user')


class AdminEntrepriseViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion admin des entreprises
    Permet d'approuver/rejeter/suspendre
    """
    permission_classes = [IsAdminUser]
    serializer_class = EntrepriseSerializer
    queryset = Entreprise.objects.all().select_related('user')
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approuver une entreprise"""
        entreprise = self.get_object()
        entreprise.status = 'approved'
        entreprise.verified = True
        from django.utils import timezone
        entreprise.verification_date = timezone.now()
        entreprise.save()
        
        serializer = self.get_serializer(entreprise)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Rejeter une entreprise"""
        entreprise = self.get_object()
        entreprise.status = 'rejected'
        entreprise.verified = False
        entreprise.save()
        
        serializer = self.get_serializer(entreprise)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspendre une entreprise"""
        entreprise = self.get_object()
        entreprise.status = 'suspended'
        entreprise.save()
        
        serializer = self.get_serializer(entreprise)
        return Response(serializer.data)