from rest_framework import serializers
from .models import Panier, PanierItem, Commande, LigneCommande
from products.serializers import ProduitSerializer


class PanierItemSerializer(serializers.ModelSerializer):
    produit = ProduitSerializer(read_only=True)
    produit_id = serializers.IntegerField(write_only=True)
    prix_total = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True,
        source='get_prix_total'
    )
    
    class Meta:
        model = PanierItem
        fields = [
            'id', 
            'produit', 
            'produit_id', 
            'quantite', 
            'prix_total',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PanierSerializer(serializers.ModelSerializer):
    items = PanierItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True,
        source='get_total'
    )
    nombre_items = serializers.IntegerField(read_only=True, source='get_nombre_items')
    
    class Meta:
        model = Panier
        fields = [
            'id', 
            'client', 
            'items', 
            'total', 
            'nombre_items',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['client', 'created_at', 'updated_at']


class LigneCommandeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LigneCommande
        fields = [
            'id',
            'produit',
            'nom_produit',
            'prix_unitaire',
            'quantite',
            'prix_total',
            'created_at'
        ]
        read_only_fields = ['nom_produit', 'prix_total', 'created_at']


class CommandeSerializer(serializers.ModelSerializer):
    lignes = LigneCommandeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Commande
        fields = [
            'id',
            'numero_commande',
            'client',
            'entreprise',
            'montant_total',
            'frais_livraison',
            'montant_final',
            'adresse_livraison',
            'ville_livraison',
            'code_postal_livraison',
            'pays_livraison',
            'telephone_livraison',
            'status',
            'numero_suivi',
            'note_client',
            'lignes',
            'created_at',
            'updated_at',
            'date_livraison_estimee',
            'date_livraison_reelle'
        ]
        read_only_fields = [
            'numero_commande',
            'montant_final',
            'client',
            'entreprise',
            'montant_total',
            'frais_livraison', 
            'created_at',
            'updated_at'
        ]


# ✅ NOUVEAU SERIALIZER POUR ACCEPTER LES ITEMS DU PANIER
class CartItemSerializer(serializers.Serializer):
    """Serializer pour un item du panier frontend"""
    produit_id = serializers.IntegerField()
    quantite = serializers.IntegerField(min_value=1)


class CommandeCreateSerializer(serializers.Serializer):
    """Serializer pour créer une commande depuis le panier"""
    # Adresse de livraison
    adresse_livraison = serializers.CharField(max_length=500)
    ville_livraison = serializers.CharField(max_length=100)
    code_postal_livraison = serializers.CharField(max_length=10)
    pays_livraison = serializers.CharField(max_length=100)
    telephone_livraison = serializers.CharField(max_length=20)
    note_client = serializers.CharField(required=False, allow_blank=True)
    frais_livraison = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00
    )
    
    # ✅ AJOUT : Items du panier
    items = CartItemSerializer(many=True)