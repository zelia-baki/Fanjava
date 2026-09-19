from rest_framework import serializers

from products.serializers import ProduitSerializer, get_image_principale_id

from .models import Panier, PanierItem, Commande, LigneCommande


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
    produit_slug = serializers.CharField(source='produit.slug', read_only=True)
    image_principale_id = serializers.SerializerMethodField()

    class Meta:
        model = LigneCommande
        fields = [
            'id',
            'produit',
            'produit_slug',
            'image_principale_id',
            'nom_produit',
            'prix_unitaire',
            'quantite',
            'prix_total',
            'created_at'
        ]
        read_only_fields = ['nom_produit', 'prix_total', 'created_at']

    def get_image_principale_id(self, obj):
        return get_image_principale_id(obj.produit)


class CommandeSerializer(serializers.ModelSerializer):
    lignes = LigneCommandeSerializer(many=True, read_only=True)
    client_nom = serializers.SerializerMethodField()
    entreprise_nom = serializers.CharField(source='entreprise.nom_entreprise', read_only=True)
    statuts_suivants = serializers.SerializerMethodField()
    peut_annuler = serializers.SerializerMethodField()
    paiement_status = serializers.SerializerMethodField()
    paiement_methode = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = [
            'id',
            'numero_commande',
            'client',
            'client_nom',
            'entreprise',
            'entreprise_nom',
            'montant_total',
            'frais_livraison',
            'montant_final',
            'adresse_livraison',
            'ville_livraison',
            'code_postal_livraison',
            'pays_livraison',
            'telephone_livraison',
            'status',
            'statuts_suivants',
            'peut_annuler',
            'paiement_status',
            'paiement_methode',
            'numero_suivi',
            'note_client',
            'lignes',
            'created_at',
            'updated_at',
            'date_livraison_estimee',
            'date_livraison_reelle'
        ]
        # Tout est en lecture seule : les modifications passent par
        # CommandeUpdateSerializer (entreprise/admin) ou par l'action « cancel » (client).
        read_only_fields = fields

    def get_client_nom(self, obj):
        user = obj.client.user
        return user.get_full_name() or user.username

    def get_statuts_suivants(self, obj):
        return obj.statuts_suivants()

    def get_peut_annuler(self, obj):
        return obj.peut_etre_annulee_par_client()

    def _paiement(self, obj):
        return getattr(obj, 'paiement', None)

    def get_paiement_status(self, obj):
        paiement = self._paiement(obj)
        return paiement.status if paiement else None

    def get_paiement_methode(self, obj):
        paiement = self._paiement(obj)
        return paiement.methode if paiement else None


class CommandeUpdateSerializer(serializers.ModelSerializer):
    """Champs qu'une entreprise (ou un admin) peut modifier sur une commande"""

    class Meta:
        model = Commande
        fields = [
            'status',
            'numero_suivi',
            'frais_livraison',
            'date_livraison_estimee',
            'date_livraison_reelle',
        ]
        extra_kwargs = {
            'numero_suivi': {'allow_null': True, 'allow_blank': True, 'required': False},
            'frais_livraison': {'min_value': 0, 'required': False},
        }


class CommandeCreateSerializer(serializers.Serializer):
    """
    Données de livraison pour créer une commande depuis le panier.
    Les frais de livraison ne sont PAS fournis par le client : ils sont convenus
    avec le vendeur, qui les renseigne ensuite sur la commande.
    """
    adresse_livraison = serializers.CharField(max_length=500)
    ville_livraison = serializers.CharField(max_length=100)
    code_postal_livraison = serializers.CharField(max_length=10)
    pays_livraison = serializers.CharField(max_length=100)
    telephone_livraison = serializers.CharField(max_length=20)
    note_client = serializers.CharField(required=False, allow_blank=True)
