from rest_framework import serializers
from .models import Categorie, Produit, ImageProduit, Avis


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = [
            'id',
            'nom',
            'slug',
            'description',
            'image',
            'parent',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']


class ImageProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageProduit
        fields = ['id', 'image', 'alt_text', 'ordre', 'created_at']
        read_only_fields = ['created_at']


class ProduitSerializer(serializers.ModelSerializer):
    images = ImageProduitSerializer(many=True, read_only=True)
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    entreprise_nom = serializers.CharField(source='entreprise.nom', read_only=True)
    prix_final = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        source='get_prix_final'
    )
    
    class Meta:
        model = Produit
        fields = [
            'id',
            'entreprise',
            'entreprise_nom',
            'categorie',
            'categorie_nom',
            'nom',
            'slug',
            'description',
            'prix',
            'prix_promo',
            'prix_final',
            'stock',
            'en_promotion',
            'en_vedette',
            'actif',
            'images',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at', 'prix_final']
    
    def validate_prix_promo(self, value):
        """Vérifier que le prix promo est inférieur au prix normal"""
        if value and value >= self.initial_data.get('prix', 0):
            raise serializers.ValidationError(
                "Le prix promotionnel doit être inférieur au prix normal"
            )
        return value
    
    def validate_stock(self, value):
        """Vérifier que le stock est positif"""
        if value < 0:
            raise serializers.ValidationError("Le stock ne peut pas être négatif")
        return value


class ProduitListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des produits (performance)"""
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    entreprise_nom = serializers.CharField(source='entreprise.nom', read_only=True)
    prix_final = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        source='get_prix_final'
    )
    image_principale = serializers.SerializerMethodField()
    
    class Meta:
        model = Produit
        fields = [
            'id',
            'entreprise_nom',
            'categorie_nom',
            'nom',
            'slug',
            'prix',
            'prix_promo',
            'prix_final',
            'stock',
            'en_promotion',
            'en_vedette',
            'image_principale',
        ]
    
    def get_image_principale(self, obj):
        """Récupérer la première image du produit"""
        image = obj.images.first()
        if image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image.image.url)
        return None


class ProduitCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour créer/modifier un produit"""
    
    class Meta:
        model = Produit
        fields = [
            'categorie',
            'nom',
            'description',
            'prix',
            'prix_promo',
            'stock',
            'en_promotion',
            'en_vedette',
            'actif'
        ]
    
    def validate(self, data):
        """Validation globale"""
        if data.get('en_promotion') and not data.get('prix_promo'):
            raise serializers.ValidationError(
                "Un prix promotionnel est requis si le produit est en promotion"
            )
        return data
    
class AvisSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.user.username', read_only=True)
    client_prenom = serializers.CharField(source='client.user.first_name', read_only=True)
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    peut_modifier = serializers.SerializerMethodField()
    
    class Meta:
        model = Avis
        fields = [
            'id',
            'produit',
            'produit_nom',
            'client',
            'client_nom',
            'client_prenom',
            'note',
            'commentaire',
            'approuve',
            'created_at',
            'updated_at',
            'peut_modifier'
        ]
        read_only_fields = ['client', 'approuve', 'created_at', 'updated_at']
    
    def get_peut_modifier(self, obj):
        """Vérifier si l'utilisateur connecté peut modifier cet avis"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if hasattr(request.user, 'client'):
                return obj.client == request.user.client
        return False
    
    def validate_note(self, value):
        """Valider que la note est entre 1 et 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5")
        return value
    
    def validate_commentaire(self, value):
        """Valider que le commentaire n'est pas vide"""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Le commentaire doit contenir au moins 10 caractères")
        return value


class AvisCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un avis"""
    
    class Meta:
        model = Avis
        fields = ['produit', 'note', 'commentaire']
    
    def validate(self, data):
        """Vérifier que le client a acheté le produit"""
        request = self.context.get('request')
        if request and hasattr(request.user, 'client'):
            client = request.user.client
            produit = data['produit']
            
            # Vérifier si le client a acheté ce produit
            from orders.models import LigneCommande
            a_achete = LigneCommande.objects.filter(
                commande__client=client,
                produit=produit,
                commande__status='delivered'  # Seulement si la commande est livrée
            ).exists()
            
            if not a_achete:
                raise serializers.ValidationError(
                    "Vous devez avoir acheté ce produit pour laisser un avis"
                )
        
        return data


# Mettre à jour ProduitSerializer pour inclure les avis
# Modifiez la classe ProduitSerializer existante :
class ProduitSerializer(serializers.ModelSerializer):
    images = ImageProduitSerializer(many=True, read_only=True)
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    entreprise_nom = serializers.CharField(source='entreprise.nom', read_only=True)
    prix_final = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        source='get_prix_final'
    )
    note_moyenne = serializers.FloatField(source='get_note_moyenne', read_only=True)  # ← Ajoutez
    nombre_avis = serializers.IntegerField(source='get_nombre_avis', read_only=True)  # ← Ajoutez
    
    class Meta:
        model = Produit
        fields = [
            'id',
            'entreprise',
            'entreprise_nom',
            'categorie',
            'categorie_nom',
            'nom',
            'slug',
            'description',
            'prix',
            'prix_promo',
            'prix_final',
            'stock',
            'en_promotion',
            'en_vedette',
            'actif',
            'images',
            'note_moyenne',  # ← Ajoutez
            'nombre_avis',   # ← Ajoutez
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at', 'prix_final', 'note_moyenne', 'nombre_avis']