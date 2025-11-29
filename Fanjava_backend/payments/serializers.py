# payments/serializers.py

from rest_framework import serializers
from .models import Paiement
from orders.serializers import CommandeSerializer


class PaiementSerializer(serializers.ModelSerializer):
    """Serializer pour les paiements"""
    
    commande_numero = serializers.CharField(source='commande.numero_commande', read_only=True)
    client_nom = serializers.CharField(source='commande.client.user.username', read_only=True)
    entreprise_nom = serializers.CharField(source='commande.entreprise.nom_entreprise', read_only=True)
    methode_label = serializers.CharField(source='get_methode_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Paiement
        fields = [
            'id',
            'commande',
            'commande_numero',
            'client_nom',
            'entreprise_nom',
            'montant',
            'methode',
            'methode_label',
            'status',
            'status_label',
            'transaction_id',
            'provider_response',
            'error_message',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PaiementCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un paiement"""
    
    class Meta:
        model = Paiement
        fields = [
            'commande',
            'montant',
            'methode',
            'transaction_id',
            'provider_response'
        ]
    
    def validate(self, data):
        """Vérifier que le montant correspond à la commande"""
        commande = data['commande']
        if data['montant'] != commande.montant_final:
            raise serializers.ValidationError(
                f"Le montant doit être égal au montant de la commande ({commande.montant_final})"
            )
        return data
    
    def create(self, validated_data):
        """Créer le paiement et mettre à jour le statut de la commande"""
        paiement = Paiement.objects.create(
            status='completed',
            **validated_data
        )
        
        # Mettre à jour le statut de la commande
        commande = paiement.commande
        commande.status = 'confirmed'
        commande.save()
        
        return paiement


class PaiementDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un paiement"""
    
    commande = CommandeSerializer(read_only=True)
    methode_label = serializers.CharField(source='get_methode_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Paiement
        fields = [
            'id',
            'commande',
            'montant',
            'methode',
            'methode_label',
            'status',
            'status_label',
            'transaction_id',
            'provider_response',
            'error_message',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']