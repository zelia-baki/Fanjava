# notifications/views.py

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.permissions import IsAdminUser

from .models import Notification, NotificationStatus
from .serializers import (
    NotificationSerializer,
    NotificationCreateSerializer,
    NotificationAdminSerializer,
)

ACTIONS_ADMIN = {'create', 'create_notification', 'bulk', 'list_admin', 'stats', 'toggle_active'}


def notifications_visibles(user):
    """
    Notifications actives destinées à l'utilisateur et non masquées par lui,
    sous forme de liste de couples (notification, statut ou None).
    Un statut absent signifie « non lue ».
    """
    types = ['all']
    if user.user_type == 'client':
        types.append('clients')
    elif user.user_type == 'entreprise':
        types.append('entreprises')

    notifications = (
        Notification.objects.filter(active=True)
        .filter(
            Q(recipient_type__in=types)
            | Q(recipient_type='user', destinataire=user)
            | Q(recipient_type='specific')
        )
        .exclude(created_by=user)
        .select_related('created_by')
        .order_by('-created_at')
    )
    notifications = [n for n in notifications if n.is_for_user(user)]

    statuts = {
        s.notification_id: s
        for s in NotificationStatus.objects.filter(
            user=user, notification_id__in=[n.id for n in notifications]
        )
    }
    return [
        (n, statuts.get(n.id))
        for n in notifications
        if not (statuts.get(n.id) and statuts[n.id].supprimee)
    ]


class NotificationViewSet(viewsets.GenericViewSet):
    """Notifications : lecture pour tous les utilisateurs, création réservée aux administrateurs"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def get_permissions(self):
        if self.action in ACTIONS_ADMIN:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def _notification_pour_utilisateur(self, pk):
        """Notification `pk` si elle est bien destinée à l'utilisateur connecté (sinon 404)"""
        notification = get_object_or_404(Notification, pk=pk)
        if not notification.is_for_user(self.request.user):
            return None
        return notification

    def _refus(self):
        return Response({'error': 'Notification non autorisée'}, status=status.HTTP_403_FORBIDDEN)

    # ---------- Lecture (tous les utilisateurs connectés)

    def list(self, request, *args, **kwargs):
        """Liste des notifications de l'utilisateur avec leur état de lecture"""
        visibles = notifications_visibles(request.user)
        data = []
        for notification, statut in visibles:
            item = NotificationSerializer(notification, context={'request': request}).data
            item['lue'] = statut.lue if statut else False
            item['date_lecture'] = statut.date_lecture if statut else None
            data.append(item)
        return Response(data)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Nombre de notifications non lues"""
        non_lues = sum(1 for _n, statut in notifications_visibles(request.user) if not (statut and statut.lue))
        return Response({'count': non_lues})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self._notification_pour_utilisateur(pk)
        if notification is None:
            return self._refus()
        statut, _created = NotificationStatus.objects.get_or_create(notification=notification, user=request.user)
        statut.marquer_comme_lue()
        return Response({'status': 'marked as read'})

    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        notification = self._notification_pour_utilisateur(pk)
        if notification is None:
            return self._refus()
        statut = NotificationStatus.objects.filter(notification=notification, user=request.user).first()
        if statut is None:
            return Response({'status': 'already unread'})
        statut.lue = False
        statut.date_lecture = None
        statut.save()
        return Response({'status': 'marked as unread'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        visibles = notifications_visibles(request.user)
        for notification, statut in visibles:
            if statut is None:
                statut = NotificationStatus.objects.create(notification=notification, user=request.user)
            statut.marquer_comme_lue()
        return Response({'status': 'all marked as read', 'count': len(visibles)})

    @action(detail=True, methods=['delete'])
    def hide(self, request, pk=None):
        """Masquer une notification pour l'utilisateur (suppression douce)"""
        notification = self._notification_pour_utilisateur(pk)
        if notification is None:
            return self._refus()
        statut, _created = NotificationStatus.objects.get_or_create(notification=notification, user=request.user)
        statut.masquer()
        return Response({'status': 'notification hidden'})

    # ---------- Administration

    def _creer(self, request):
        serializer = NotificationCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        notification = serializer.save(created_by=request.user)
        return Response(NotificationAdminSerializer(notification).data, status=status.HTTP_201_CREATED)

    def create(self, request, *args, **kwargs):
        """POST /notifications/ : créer une notification (admin)"""
        return self._creer(request)

    @action(detail=False, methods=['post'])
    def create_notification(self, request):
        """Créer une notification globale (admin)"""
        return self._creer(request)

    @action(detail=False, methods=['post'])
    def bulk(self, request):
        """Envoi groupé (admin) : même logique que la création, avec destinataires spécifiques possibles"""
        return self._creer(request)

    @action(detail=False, methods=['get'])
    def list_admin(self, request):
        """Liste des notifications créées par cet admin"""
        notifications = Notification.objects.filter(created_by=request.user).order_by('-created_at')
        return Response(NotificationAdminSerializer(notifications, many=True).data)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Statistiques d'une notification"""
        notification = get_object_or_404(Notification, pk=pk)
        if notification.created_by != request.user:
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)

        recipient_count = notification.get_recipient_count()
        read_count = NotificationStatus.objects.filter(notification=notification, lue=True).count()
        return Response({
            'recipient_count': recipient_count,
            'read_count': read_count,
            'unread_count': recipient_count - read_count,
            'read_percentage': (read_count / recipient_count * 100) if recipient_count > 0 else 0,
        })

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        """Activer/désactiver une notification"""
        notification = get_object_or_404(Notification, pk=pk)
        if notification.created_by != request.user:
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)

        notification.active = not notification.active
        notification.save()
        return Response({
            'status': 'active' if notification.active else 'inactive',
            'active': notification.active,
        })
