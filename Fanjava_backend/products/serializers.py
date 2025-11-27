from rest_framework import serializers
from .models import Categorie, Produit, ImageProduit, Avis


class CategorieSerializer(serializers.ModelSerializer):
    sous_categories = serializers.SerializerMethodField()
    
    class Meta:
        model = Categorie
        fields = [
            'id',
            'nom',
            'slug',
            'description',
            'image',
            'parent',
            'ordre',
            'active',
            'sous_categories',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']
    
    def get_sous_categories(self, obj):
        """Récupérer les sous-catégories actives"""
        if obj.sous_categories.exists():
            return CategorieSerializer(
                obj.sous_categories.filter(active=True),
                many=True,
                context=self.context
            ).data
        return []


class ImageProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageProduit
        fields = ['id', 'image', 'alt_text', 'est_principale', 'ordre', 'created_at']
        read_only_fields = ['created_at']


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
            'titre',
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
            raise serializers.ValidationError(
                "Le commentaire doit contenir au moins 10 caractères"
            )
        return value


class AvisCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un avis"""
    
    class Meta:
        model = Avis
        fields = ['produit', 'note', 'titre', 'commentaire']
    
    def validate_note(self, value):
        """Valider que la note est entre 1 et 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5")
        return value
    
    def validate_commentaire(self, value):
        """Valider que le commentaire n'est pas vide"""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Le commentaire doit contenir au moins 10 caractères"
            )
        return value
    
    def validate(self, data):
        """Vérifier que le client a acheté le produit"""
        request = self.context.get('request')
        if request and hasattr(request.user, 'client'):
            client = request.user.client
            produit = data['produit']
            
            # Vérifier si le client a déjà laissé un avis pour ce produit
            if Avis.objects.filter(client=client, produit=produit).exists():
                raise serializers.ValidationError(
                    "Vous avez déjà laissé un avis pour ce produit"
                )
            
            # Vérifier si le client a acheté ce produit
            try:
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
            except ImportError:
                # Si le module orders n'existe pas encore, on passe
                pass
        
        return data


class ProduitListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des produits (performance optimale)"""
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    entreprise_nom = serializers.CharField(source='entreprise.nom_entreprise', read_only=True)
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
            'nom',
            'slug',
            'description_courte',
            'prix',
            'prix_promo',
            'prix_final',
            'stock',
            'categorie_nom',
            'entreprise_nom',
            'image_principale',
            'note_moyenne',
            'en_vedette',
            'en_promotion',
            'status',
            'actif'
        ]
    
    def get_image_principale(self, obj):
        """Récupérer l'image principale du produit"""
        image = obj.images.filter(est_principale=True).first()
        if not image:
            image = obj.images.first()
        
        if image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image.image.url)
        return None


class ProduitDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un produit individuel"""
    images = ImageProduitSerializer(many=True, read_only=True)
    categorie = CategorieSerializer(read_only=True)
    entreprise_nom = serializers.CharField(source='entreprise.nom_entreprise', read_only=True)
    entreprise_id = serializers.IntegerField(source='entreprise.id', read_only=True)
    prix_final = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        source='get_prix_final'
    )
    note_moyenne = serializers.FloatField(source='get_note_moyenne', read_only=True)
    nombre_avis = serializers.IntegerField(source='get_nombre_avis', read_only=True)
    avis = AvisSerializer(many=True, read_only=True)
    
    class Meta:
        model = Produit
        fields = [
            'id',
            'entreprise_id',
            'entreprise_nom',
            'categorie',
            'nom',
            'slug',
            'description',
            'description_courte',
            'prix',
            'prix_promo',
            'prix_final',
            'stock',
            'seuil_alerte_stock',
            'poids',
            'status',
            'en_vedette',
            'en_promotion',
            'actif',
            'images',
            'note_moyenne',
            'nombre_avis',
            'nombre_vues',
            'nombre_ventes',
            'avis',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'slug',
            'note_moyenne',
            'nombre_avis',
            'nombre_vues',
            'nombre_ventes',
            'created_at',
            'updated_at'
        ]


class ProduitSerializer(serializers.ModelSerializer):
    """Serializer standard pour un produit"""
    images = ImageProduitSerializer(many=True, read_only=True)
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    entreprise_nom = serializers.CharField(source='entreprise.nom_entreprise', read_only=True)
    prix_final = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        source='get_prix_final'
    )
    note_moyenne = serializers.FloatField(source='get_note_moyenne', read_only=True)
    nombre_avis = serializers.IntegerField(source='get_nombre_avis', read_only=True)
    
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
            'note_moyenne',
            'nombre_avis',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'slug',
            'created_at',
            'updated_at',
            'prix_final',
            'note_moyenne',
            'nombre_avis'
        ]
    
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


class ProduitCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour créer/modifier un produit"""
    images = ImageProduitSerializer(many=True, required=False)
    
    class Meta:
        model = Produit
        fields = [
            'nom',
            'description',
            'description_courte',
            'prix',
            'prix_promo',
            'stock',
            'seuil_alerte_stock',
            'categorie',
            'poids',
            'status',
            'en_vedette',
            'en_promotion',
            'actif',
            'images'
        ]
    
    def validate_prix_promo(self, value):
        """Vérifier que le prix promo est inférieur au prix normal"""
        prix = self.initial_data.get('prix')
        if value and prix and value >= float(prix):
            raise serializers.ValidationError(
                "Le prix promotionnel doit être inférieur au prix normal"
            )
        return value
    
    def validate_stock(self, value):
        """Vérifier que le stock est positif"""
        if value < 0:
            raise serializers.ValidationError("Le stock ne peut pas être négatif")
        return value
    
    def validate(self, data):
        """Validation globale"""
        if data.get('en_promotion') and not data.get('prix_promo'):
            raise serializers.ValidationError(
                "Un prix promotionnel est requis si le produit est en promotion"
            )
        return data
    
    def create(self, validated_data):
        """Créer un produit avec ses images"""
        images_data = validated_data.pop('images', [])
        produit = Produit.objects.create(**validated_data)
        
        for image_data in images_data:
            ImageProduit.objects.create(produit=produit, **image_data)
        
        return produit
    
    def update(self, instance, validated_data):
        """Mettre à jour un produit"""
        images_data = validated_data.pop('images', None)
        
        # Mettre à jour les champs du produit
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Gérer les images si fournies
        if images_data is not None:
            # Optionnel : supprimer les anciennes images
            # instance.images.all().delete()
            for image_data in images_data:
                ImageProduit.objects.create(produit=instance, **image_data)
        
        return instance