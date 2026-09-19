# payments/serializers.py

from rest_framework import serializers

from orders.serializers import CommandeSerializer

from .models import Paiement


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
        read_only_fields = fields


class PaiementCreateSerializer(serializers.ModelSerializer):
    """
    Déclaration d'un paiement par le client (espèces à la livraison, virement,
    Mobile Money avec sa référence...). Le montant est toujours celui de la commande
    et le paiement reste « en attente » jusqu'à confirmation par le vendeur.
    """

    class Meta:
        model = Paiement
        fields = ['commande', 'methode', 'transaction_id']
        # L'unicité (un paiement par commande, sauf échec) est vérifiée dans validate_commande
        extra_kwargs = {'commande': {'validators': []}}

    def validate_commande(self, commande):
        request = self.context['request']
        client = getattr(request.user, 'client', None)
        if client is None or commande.client_id != client.id:
            raise serializers.ValidationError("Cette commande ne vous appartient pas.")
        if commande.status in ('cancelled', 'refunded'):
            raise serializers.ValidationError("Cette commande est annulée ou remboursée.")
        existant = Paiement.objects.filter(commande=commande).first()
        if existant and existant.status != 'failed':
            raise serializers.ValidationError("Un paiement existe déjà pour cette commande.")
        return commande

    def create(self, validated_data):
        commande = validated_data['commande']
        valeurs = {
            'montant': commande.montant_final,
            'methode': validated_data['methode'],
            'transaction_id': validated_data.get('transaction_id', ''),
            'status': 'pending',
            'error_message': '',
        }
        # Un paiement précédent échoué est relancé (un seul paiement par commande)
        paiement, _created = Paiement.objects.update_or_create(commande=commande, defaults=valeurs)
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
        read_only_fields = fields
