from rest_framework import serializers
from .models import Categorie, Produit, ImageProduit, Avis
from .validators import valider_image


def get_image_principale_id(produit):
    """ID de l'image principale (ou de la première image) d'un produit.

    Le contenu binaire s'obtient via GET /api/products/images/<id>/blob/.
    """
    # Utilise le prefetch 'images' quand il est présent (évite une requête par produit)
    images = list(produit.images.all())
    if not images:
        return None
    principale = next((img for img in images if img.est_principale), images[0])
    return principale.id


class CategorieSerializer(serializers.ModelSerializer):
    sous_categories = serializers.SerializerMethodField()
    has_image = serializers.SerializerMethodField()
    nombre_produits = serializers.IntegerField(read_only=True, default=0)
    
    class Meta:
        model = Categorie
        fields = [
            'id',
            'nom',
            'slug',
            'description',
            'image',
            'has_image',
            'nombre_produits',
            'parent',
            'ordre',
            'active',
            'created_at',
            'sous_categories'
        ]
        read_only_fields = ['slug', 'created_at']  # Le slug est généré automatiquement
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'image': {'required': False, 'allow_null': True, 'write_only': True, 'validators': [valider_image]},
            'parent': {'required': False, 'allow_null': True},
            'ordre': {'required': False, 'default': 0},
        }
    
    def get_has_image(self, obj):
        """Indique si l'image existe (contenu via /products/categories/<slug>/image/)"""
        return bool(obj.image)

    def get_sous_categories(self, obj):
        """Récupérer les sous-catégories actives"""
        if hasattr(obj, 'sous_categories') and obj.sous_categories.exists():
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
        # Le fichier n'est jamais renvoyé sous forme d'URL : il se récupère
        # en binaire via GET /api/products/images/<id>/blob/
        extra_kwargs = {'image': {'write_only': True, 'validators': [valider_image]}}


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


class AvisUpdateSerializer(serializers.ModelSerializer):
    """Modification de son propre avis (le produit et le client ne changent jamais)"""

    class Meta:
        model = Avis
        fields = ['note', 'titre', 'commentaire']

    def validate_note(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5")
        return value

    def validate_commentaire(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Le commentaire doit contenir au moins 10 caractères")
        return value


class AvisModerationSerializer(serializers.ModelSerializer):
    """Approbation / rejet d'un avis (administrateur ou entreprise concernée)"""

    class Meta:
        model = Avis
        fields = ['approuve']


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
    image_principale_id = serializers.SerializerMethodField()
    
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
            'image_principale_id',
            'note_moyenne',
            'en_vedette',
            'en_promotion',
            'status',
            'actif'
        ]
    
    def get_image_principale_id(self, obj):
        return get_image_principale_id(obj)


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
    avis = serializers.SerializerMethodField()
    image_principale_id = serializers.SerializerMethodField()
    
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
            'image_principale_id',
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

    def get_image_principale_id(self, obj):
        return get_image_principale_id(obj)

    def get_avis(self, obj):
        """Seuls les avis approuvés sont publics"""
        avis = obj.avis.filter(approuve=True).select_related('client__user')
        return AvisSerializer(avis, many=True, context=self.context).data


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
    image_principale_id = serializers.SerializerMethodField()
    
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
            'image_principale_id',
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

    def get_image_principale_id(self, obj):
        return get_image_principale_id(obj)
    
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
    
    def validate_stock(self, value):
        """Vérifier que le stock est positif"""
        if value < 0:
            raise serializers.ValidationError("Le stock ne peut pas être négatif")
        return value
    
    def validate(self, data):
        """Cohérence prix / promotion (fonctionne aussi pour les mises à jour partielles)"""
        instance = self.instance
        prix = data.get('prix', getattr(instance, 'prix', None))
        prix_promo = data.get('prix_promo', getattr(instance, 'prix_promo', None))

        if prix_promo is not None and prix is not None and prix_promo >= prix:
            raise serializers.ValidationError(
                {'prix_promo': "Le prix promotionnel doit être inférieur au prix normal"}
            )

        if data.get('en_promotion') and prix_promo is None:
            raise serializers.ValidationError(
                {'prix_promo': "Un prix promotionnel est requis si le produit est en promotion"}
            )

        # « En promotion » découle du prix promo : les deux ne peuvent plus se contredire
        if 'prix_promo' in data or 'en_promotion' in data:
            data['en_promotion'] = prix_promo is not None
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