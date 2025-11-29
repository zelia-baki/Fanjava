# notifications/views.py - CORRIGÉ SELON LE MODÈLE

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import (
    NotificationSerializer, 
    NotificationCreateSerializer,
    NotificationBulkCreateSerializer
)
from users.permissions import IsAdminUser


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les notifications"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        """Filtrer les notifications selon le type d'utilisateur"""
        user = self.request.user
        
        # Admins voient toutes les notifications
        if user.is_staff or user.is_superuser or getattr(user, 'user_type', None) == 'admin':
            return Notification.objects.all().select_related('user').order_by('-created_at')
        
        # Les autres voient seulement leurs notifications
        return Notification.objects.filter(user=user).order_by('-created_at')
    
    def get_serializer_class(self):
        """Utiliser différents serializers selon l'action"""
        if self.action == 'create':
            return NotificationCreateSerializer
        elif self.action == 'bulk':
            return NotificationBulkCreateSerializer
        return NotificationSerializer
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def bulk(self, request):
        """
        Créer des notifications en masse
        POST /api/notifications/bulk/
        """
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            notifications = serializer.save()
            
            return Response({
                'message': f'{len(notifications)} notification(s) créée(s) avec succès',
                'count': len(notifications),
                'notifications': NotificationSerializer(notifications, many=True).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Marquer une notification comme lue"""
        notification = self.get_object()
        
        if notification.user != request.user:
            return Response(
                {'error': 'Vous ne pouvez pas marquer cette notification comme lue'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notification.marquer_comme_lue()
        
        return Response(NotificationSerializer(notification).data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Marquer toutes les notifications comme lues"""
        notifications = Notification.objects.filter(user=request.user, lue=False)
        
        count = 0
        for notif in notifications:
            notif.marquer_comme_lue()
            count += 1
        
        return Response({
            'message': f'{count} notification(s) marquée(s) comme lue(s)',
            'count': count
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Obtenir le nombre de notifications non lues"""
        count = Notification.objects.filter(user=request.user, lue=False).count()
        
        return Response({'count': count})