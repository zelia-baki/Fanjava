# notifications/serializers.py - NOUVELLE ARCHITECTURE

from rest_framework import serializers
from .models import Notification, NotificationStatus
from users.models import CustomUser


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour afficher les notifications aux utilisateurs"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    type_display = serializers.CharField(source='get_type_notification_display', read_only=True)
    recipient_type_display = serializers.CharField(source='get_recipient_type_display', read_only=True)
    recipient_count = serializers.SerializerMethodField()
    
    # Statut pour l'utilisateur actuel
    lue = serializers.SerializerMethodField()
    date_lecture = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 
            'created_by',
            'created_by_username',
            'titre', 
            'message', 
            'type_notification',
            'type_display',
            'lien',
            'recipient_type',
            'recipient_type_display',
            'recipient_count',
            'active',
            'lue',
            'date_lecture',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']
    
    def get_recipient_count(self, obj):
        return obj.get_recipient_count()
    
    def get_lue(self, obj):
        """Récupérer le statut de lecture pour l'utilisateur actuel"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            status = NotificationStatus.objects.filter(
                notification=obj,
                user=request.user
            ).first()
            return status.lue if status else False
        return False
    
    def get_date_lecture(self, obj):
        """Récupérer la date de lecture pour l'utilisateur actuel"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            status = NotificationStatus.objects.filter(
                notification=obj,
                user=request.user
            ).first()
            return status.date_lecture if status else None
        return None


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une notification (admin)"""
    
    class Meta:
        model = Notification
        fields = [
            'titre',
            'message',
            'type_notification',
            'lien',
            'recipient_type',
            'specific_recipients'
        ]
    
    def validate(self, data):
        # Si envoi spécifique, vérifier que specific_recipients est fourni
        if data.get('recipient_type') == 'specific':
            if not data.get('specific_recipients'):
                raise serializers.ValidationError({
                    'specific_recipients': 'La liste des destinataires est requise pour un envoi spécifique'
                })
            
            # Vérifier que tous les IDs existent
            user_ids = data.get('specific_recipients', [])
            existing_count = CustomUser.objects.filter(id__in=user_ids).count()
            if existing_count != len(user_ids):
                raise serializers.ValidationError({
                    'specific_recipients': 'Certains utilisateurs n\'existent pas'
                })
        
        return data
    
    def create(self, validated_data):
        # Ajouter le créateur (admin)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)


class NotificationAdminSerializer(serializers.ModelSerializer):
    """Serializer pour l'admin (vue de toutes les notifications créées)"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    type_display = serializers.CharField(source='get_type_notification_display', read_only=True)
    recipient_type_display = serializers.CharField(source='get_recipient_type_display', read_only=True)
    recipient_count = serializers.SerializerMethodField()
    read_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'created_by',
            'created_by_username',
            'titre',
            'message',
            'type_notification',
            'type_display',
            'lien',
            'recipient_type',
            'recipient_type_display',
            'specific_recipients',
            'recipient_count',
            'read_count',
            'active',
            'created_at'
        ]
    
    def get_recipient_count(self, obj):
        return obj.get_recipient_count()
    
    def get_read_count(self, obj):
        """Nombre d'utilisateurs ayant lu la notification"""
        return NotificationStatus.objects.filter(
            notification=obj,
            lue=True
        ).count()


class NotificationStatusSerializer(serializers.ModelSerializer):
    """Serializer pour les statuts de notification"""
    notification_titre = serializers.CharField(source='notification.titre', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = NotificationStatus
        fields = [
            'id',
            'notification',
            'notification_titre',
            'user',
            'user_username',
            'lue',
            'date_lecture',
            'supprimee',
            'date_suppression',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'date_lecture', 'date_suppression']