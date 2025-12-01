# notifications/views.py - VERSION V2 - PERMISSIONS FIXED

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from django.db.models import Q

from .models import Notification, NotificationStatus
from .serializers import (
    NotificationSerializer,
    NotificationCreateSerializer,
    NotificationAdminSerializer,
    NotificationStatusSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les notifications V2
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        """
        Retourne les notifications pertinentes pour l'utilisateur connecté
        avec leurs statuts
        """
        user = self.request.user
        
        # Récupérer toutes les notifications actives destinées à l'utilisateur
        notifications = Notification.objects.filter(
            active=True
        ).order_by('-created_at')
        
        # Filtrer celles qui sont pour cet utilisateur
        result = []
        for notif in notifications:
            if notif.is_for_user(user):
                # Récupérer ou créer le statut pour cet utilisateur
                status_obj, created = NotificationStatus.objects.get_or_create(
                    notification=notif,
                    user=user
                )
                
                # Ne pas inclure si masquée
                if not status_obj.supprimee:
                    result.append(notif)
        
        return result
    
    def list(self, request, *args, **kwargs):
        """Liste des notifications avec leurs statuts"""
        notifications = self.get_queryset()
        
        # Préparer les données avec statuts
        data = []
        for notif in notifications:
            status_obj = NotificationStatus.objects.get(
                notification=notif,
                user=request.user
            )
            
            notif_data = NotificationSerializer(notif).data
            notif_data['lue'] = status_obj.lue
            notif_data['date_lecture'] = status_obj.date_lecture
            data.append(notif_data)
        
        return Response(data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_read(self, request, pk=None):
        """Marquer une notification comme lue"""
        try:
            notification = Notification.objects.get(pk=pk)
            
            # Vérifier que la notification est pour cet utilisateur
            if not notification.is_for_user(request.user):
                return Response(
                    {'error': 'Notification non autorisée'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Récupérer ou créer le statut
            status_obj, created = NotificationStatus.objects.get_or_create(
                notification=notification,
                user=request.user
            )
            
            # Marquer comme lue
            status_obj.marquer_comme_lue()
            
            return Response({'status': 'marked as read'})
            
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_unread(self, request, pk=None):
        """Marquer une notification comme non lue"""
        try:
            notification = Notification.objects.get(pk=pk)
            
            # Vérifier que la notification est pour cet utilisateur
            if not notification.is_for_user(request.user):
                return Response(
                    {'error': 'Notification non autorisée'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Récupérer le statut
            try:
                status_obj = NotificationStatus.objects.get(
                    notification=notification,
                    user=request.user
                )
                status_obj.lue = False
                status_obj.date_lecture = None
                status_obj.save()
                
                return Response({'status': 'marked as unread'})
            except NotificationStatus.DoesNotExist:
                return Response({'status': 'already unread'})
            
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_all_read(self, request):
        """Marquer toutes les notifications comme lues"""
        notifications = self.get_queryset()
        
        for notif in notifications:
            status_obj, created = NotificationStatus.objects.get_or_create(
                notification=notif,
                user=request.user
            )
            status_obj.marquer_comme_lue()
        
        return Response({
            'status': 'all marked as read',
            'count': len(notifications)
        })
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def hide(self, request, pk=None):
        """Masquer une notification (soft delete)"""
        try:
            notification = Notification.objects.get(pk=pk)
            
            # Vérifier que la notification est pour cet utilisateur
            if not notification.is_for_user(request.user):
                return Response(
                    {'error': 'Notification non autorisée'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Récupérer ou créer le statut
            status_obj, created = NotificationStatus.objects.get_or_create(
                notification=notification,
                user=request.user
            )
            
            # Masquer
            status_obj.masquer()
            
            return Response({'status': 'notification hidden'})
            
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def unread_count(self, request):
        """Nombre de notifications non lues"""
        notifications = self.get_queryset()
        
        unread = 0
        for notif in notifications:
            try:
                status_obj = NotificationStatus.objects.get(
                    notification=notif,
                    user=request.user
                )
                if not status_obj.lue:
                    unread += 1
            except NotificationStatus.DoesNotExist:
                # Si pas de statut, c'est non lu
                unread += 1
        
        return Response({'count': unread})
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def create_notification(self, request):
        """Créer une notification globale (Admin seulement)"""
        serializer = NotificationCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Créer la notification avec l'admin comme créateur
            notification = serializer.save(created_by=request.user)
            
            return Response(
                NotificationAdminSerializer(notification).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def list_admin(self, request):
        """Liste toutes les notifications créées par cet admin"""
        notifications = Notification.objects.filter(
            created_by=request.user
        ).order_by('-created_at')
        
        serializer = NotificationAdminSerializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAdminUser])
    def stats(self, request, pk=None):
        """Statistiques d'une notification"""
        try:
            notification = Notification.objects.get(pk=pk)
            
            # Vérifier que c'est bien le créateur
            if notification.created_by != request.user:
                return Response(
                    {'error': 'Non autorisé'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            recipient_count = notification.get_recipient_count()
            read_count = NotificationStatus.objects.filter(
                notification=notification,
                lue=True
            ).count()
            
            return Response({
                'recipient_count': recipient_count,
                'read_count': read_count,
                'unread_count': recipient_count - read_count,
                'read_percentage': (read_count / recipient_count * 100) if recipient_count > 0 else 0
            })
            
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def toggle_active(self, request, pk=None):
        """Activer/désactiver une notification"""
        try:
            notification = Notification.objects.get(pk=pk)
            
            # Vérifier que c'est bien le créateur
            if notification.created_by != request.user:
                return Response(
                    {'error': 'Non autorisé'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            notification.active = not notification.active
            notification.save()
            
            return Response({
                'status': 'active' if notification.active else 'inactive',
                'active': notification.active
            })
            
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )