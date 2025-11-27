from rest_framework import serializers
from .models import Categorie, Produit, ImageProduit, Avis
from users.serializers import UserSerializer

class CategorieSerializer(serializers.ModelSerializer):
    sous_categories = serializers.SerializerMethodField()
    
    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'slug', 'description', 'image', 'parent', 
                  'ordre', 'active', 'sous_categories']
    
    def get_sous_categories(self, obj):
        if obj.sous_categories.exists():
            return CategorieSerializer(obj.sous_categories.filter(active=True), many=True).data
        return []

class ImageProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageProduit
        fields = ['id', 'image', 'alt_text', 'est_principale', 'ordre']

class AvisSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.user.username', read_only=True)
    
    class Meta:
        model = Avis
        fields = ['id', 'produit', 'client', 'client_nom', 'note', 'titre', 
                  'commentaire', 'approuve', 'created_at']
        read_only_fields = ['client', 'approuve', 'created_at']

class ProduitListSerializer(serializers.ModelSerializer):
    image_principale = serializers.SerializerMethodField()
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    entreprise_nom = serializers.CharField(source='entreprise.nom_entreprise', read_only=True)
    prix_final = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='get_prix_final')
    
    class Meta:
        model = Produit
        fields = ['id', 'nom', 'slug', 'description_courte', 'prix', 'prix_promo', 
                  'prix_final', 'stock', 'categorie_nom', 'entreprise_nom', 
                  'image_principale', 'note_moyenne', 'en_vedette', 'status']
    
    def get_image_principale(self, obj):
        image = obj.images.filter(est_principale=True).first()
        if image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image.image.url)
        return None

class ProduitDetailSerializer(serializers.ModelSerializer):
    images = ImageProduitSerializer(many=True, read_only=True)
    categorie = CategorieSerializer(read_only=True)
    entreprise_nom = serializers.CharField(source='entreprise.nom_entreprise', read_only=True)
    entreprise_id = serializers.IntegerField(source='entreprise.id', read_only=True)
    prix_final = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='get_prix_final')
    avis = AvisSerializer(many=True, read_only=True)
    
    class Meta:
        model = Produit
        fields = '__all__'

class ProduitCreateUpdateSerializer(serializers.ModelSerializer):
    images = ImageProduitSerializer(many=True, required=False)
    
    class Meta:
        model = Produit
        fields = ['nom', 'description', 'description_courte', 'prix', 'prix_promo', 
                  'stock', 'seuil_alerte_stock', 'categorie', 'poids', 'status', 
                  'en_vedette', 'images']
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        produit = Produit.objects.create(**validated_data)
        
        for image_data in images_data:
            ImageProduit.objects.create(produit=produit, **image_data)
        
        return produit
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if images_data is not None:
            instance.images.all().delete()
            for image_data in images_data:
                ImageProduit.objects.create(produit=instance, **image_data)
        
        return instance