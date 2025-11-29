# notifications/serializers.py - CORRIGÉ SELON LE MODÈLE

from rest_framework import serializers
from .models import Notification
from users.models import CustomUser


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour afficher les notifications"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    type_display = serializers.CharField(source='get_type_notification_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 
            'user', 
            'user_username',
            'user_email',
            'titre', 
            'message', 
            'type_notification',
            'type_display',
            'lien', 
            'lue', 
            'date_lecture',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'date_lecture']


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une notification individuelle"""
    
    class Meta:
        model = Notification
        fields = ['user', 'titre', 'message', 'type_notification', 'lien']
    
    def validate(self, data):
        if not data.get('titre') or not data.get('titre').strip():
            raise serializers.ValidationError({'titre': 'Le titre est requis'})
        
        if not data.get('message') or not data.get('message').strip():
            raise serializers.ValidationError({'message': 'Le message est requis'})
        
        return data


class NotificationBulkCreateSerializer(serializers.Serializer):
    """Serializer pour créer des notifications en masse"""
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        help_text="Liste des IDs des utilisateurs à notifier"
    )
    titre = serializers.CharField(
        max_length=200, 
        required=True,
        help_text="Titre de la notification"
    )
    message = serializers.CharField(
        required=True,
        help_text="Contenu du message"
    )
    type_notification = serializers.ChoiceField(
        choices=[
            ('general', 'Général'),
            ('order', 'Nouvelle commande'),
            ('order_status', 'Changement de statut commande'),
            ('stock', 'Alerte stock'),
            ('payment', 'Paiement'),
            ('review', 'Nouvel avis'),
            ('account', 'Compte'),
        ],
        default='general',
        help_text="Type de notification"
    )
    lien = serializers.CharField(
        max_length=500, 
        required=False, 
        allow_blank=True,
        help_text="Lien optionnel vers une page spécifique"
    )
    
    def validate_user_ids(self, value):
        """Valider que les user_ids sont valides"""
        if not value:
            raise serializers.ValidationError("La liste des utilisateurs ne peut pas être vide")
        
        existing_users = CustomUser.objects.filter(id__in=value)
        existing_ids = set(existing_users.values_list('id', flat=True))
        invalid_ids = set(value) - existing_ids
        
        if invalid_ids:
            raise serializers.ValidationError(
                f"Les utilisateurs suivants n'existent pas : {list(invalid_ids)}"
            )
        
        return value
    
    def validate_titre(self, value):
        """Valider le titre"""
        if not value or not value.strip():
            raise serializers.ValidationError("Le titre ne peut pas être vide")
        return value.strip()
    
    def validate_message(self, value):
        """Valider le message"""
        if not value or not value.strip():
            raise serializers.ValidationError("Le message ne peut pas être vide")
        return value.strip()
    
    def create(self, validated_data):
        """Créer les notifications pour tous les utilisateurs"""
        user_ids = validated_data.pop('user_ids')
        users = CustomUser.objects.filter(id__in=user_ids)
        
        notifications = []
        for user in users:
            notification = Notification.objects.create(
                user=user,
                titre=validated_data.get('titre'),
                message=validated_data.get('message'),
                type_notification=validated_data.get('type_notification', 'general'),
                lien=validated_data.get('lien', '')
            )
            notifications.append(notification)
        
        return notifications