# products/views.py - SECTION CategorieViewSet MODIFIÉE

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend

from .models import Categorie, Produit, ImageProduit, Avis
from .serializers import (
    CategorieSerializer,
    ProduitSerializer,
    ProduitListSerializer,
    ProduitDetailSerializer,
    ProduitCreateUpdateSerializer,
    ImageProduitSerializer,
    AvisSerializer, 
    AvisCreateSerializer,
)
from .permissions import IsEntrepriseOwner, IsAdminUser


class CategorieViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les catégories
    """
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    lookup_field = 'slug'
    
    def get_permissions(self):
        """
        Les catégories sont publiques en lecture
        Seuls les admins peuvent créer/modifier/supprimer
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticatedOrReadOnly]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filtrer les catégories actives pour les utilisateurs normaux"""
        queryset = super().get_queryset()
        
        # ✅ Ajouter l'annotation du nombre de produits
        queryset = queryset.annotate(nombre_produits=Count('produits'))
        
        if self.request.user.is_authenticated:
            if (self.request.user.is_staff or 
                self.request.user.is_superuser or 
                getattr(self.request.user, 'user_type', None) == 'admin'):
                return queryset
        
        return queryset.filter(active=True)
    
    def destroy(self, request, *args, **kwargs):
        """
        ✅ NOUVELLE MÉTHODE: Empêcher la suppression si la catégorie contient des produits
        """
        categorie = self.get_object()
        
        # Compter le nombre de produits dans cette catégorie
        nombre_produits = categorie.produits.count()
        
        if nombre_produits > 0:
            return Response(
                {
                    'error': f'Impossible de supprimer cette catégorie car elle contient {nombre_produits} produit(s).',
                    'detail': 'Veuillez d\'abord déplacer ou supprimer tous les produits de cette catégorie.',
                    'nombre_produits': nombre_produits
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Si aucun produit, autoriser la suppression
        self.perform_destroy(categorie)
        return Response(
            {'message': 'Catégorie supprimée avec succès'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['get'])
    def produits(self, request, slug=None):
        """
        ✅ NOUVELLE ACTION: Récupérer tous les produits d'une catégorie
        Utile pour voir ce qui bloque la suppression
        """
        categorie = self.get_object()
        produits = categorie.produits.all()
        
        # Serializer simple pour la liste
        from .serializers import ProduitListSerializer
        serializer = ProduitListSerializer(produits, many=True, context={'request': request})
        
        return Response({
            'categorie': categorie.nom,
            'nombre_produits': produits.count(),
            'produits': serializer.data
        })


class ImageProduitViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les images de produits
    """
    queryset = ImageProduit.objects.all()
    serializer_class = ImageProduitSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """Filtrer par produit si spécifié"""
        queryset = super().get_queryset()
        produit_id = self.request.query_params.get('produit', None)
        if produit_id:
            queryset = queryset.filter(produit_id=produit_id)
        return queryset
    
    def perform_create(self, serializer):
        """Associer l'image au produit"""
        serializer.save()


class ProduitViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les produits avec upload d'images
    """
    queryset = Produit.objects.select_related('categorie', 'entreprise').prefetch_related('images')
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categorie', 'entreprise', 'status', 'en_promotion', 'en_vedette', 'actif']
    search_fields = ['nom', 'description', 'description_courte']
    ordering_fields = ['prix', 'created_at', 'nom', 'note_moyenne', 'nombre_ventes']
    ordering = ['-created_at']
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        """Utiliser des serializers différents selon l'action"""
        if self.action == 'list':
            return ProduitListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProduitCreateUpdateSerializer
        elif self.action == 'retrieve':
            return ProduitDetailSerializer
        return ProduitSerializer
    
    def get_queryset(self):
        """Filtres personnalisés"""
        queryset = super().get_queryset()
        
        # Filtrer par statut actif par défaut
        if self.action in ['list', 'retrieve']:
            queryset = queryset.filter(status='active')
        
        # Filtrer par prix min/max
        prix_min = self.request.query_params.get('prix_min', None)
        prix_max = self.request.query_params.get('prix_max', None)
        
        if prix_min:
            queryset = queryset.filter(prix__gte=prix_min)
        if prix_max:
            queryset = queryset.filter(prix__lte=prix_max)
        
        # Filtrer par stock disponible
        en_stock = self.request.query_params.get('en_stock', None)
        if en_stock == 'true':
            queryset = queryset.filter(stock__gt=0)
        
        # Filtrer par entreprise (pour le dashboard entreprise)
        if self.request.user.is_authenticated and hasattr(self.request.user, 'entreprise'):
            mes_produits = self.request.query_params.get('mes_produits', None)
            if mes_produits == 'true':
                queryset = queryset.filter(entreprise=self.request.user.entreprise)
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Incrémenter le nombre de vues lors de la consultation"""
        instance = self.get_object()
        instance.nombre_vues += 1
        instance.save(update_fields=['nombre_vues'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """
        Créer un produit avec gestion des images multiples
        """
        if not hasattr(request.user, 'entreprise'):
            raise PermissionDenied("Seules les entreprises peuvent créer des produits")
        
        # Extraire les images du request
        images = []
        image_index = 0
        while f'image_{image_index}' in request.FILES:
            images.append(request.FILES[f'image_{image_index}'])
            image_index += 1
        
        # Créer le produit
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        produit = serializer.save(entreprise=request.user.entreprise, status='active')
        
        # Créer les images
        for index, image_file in enumerate(images):
            ImageProduit.objects.create(
                produit=produit,
                image=image_file,
                est_principale=(index == 0),  # La première image est principale
                ordre=index
            )
        
        # Retourner le produit créé avec les images
        headers = self.get_success_headers(serializer.data)
        product_serializer = ProduitDetailSerializer(produit, context={'request': request})
        return Response(product_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """
        Mettre à jour un produit avec gestion des nouvelles images
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Vérifier les permissions
        if hasattr(request.user, 'entreprise') and instance.entreprise != request.user.entreprise:
            raise PermissionDenied("Vous ne pouvez pas modifier ce produit")
        
        # Extraire les nouvelles images
        images = []
        image_index = 0
        while f'image_{image_index}' in request.FILES:
            images.append(request.FILES[f'image_{image_index}'])
            image_index += 1
        
        # Mettre à jour le produit
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        produit = serializer.save()
        
        # Ajouter les nouvelles images
        if images:
            # Compter les images existantes pour l'ordre
            existing_count = produit.images.count()
            for index, image_file in enumerate(images):
                ImageProduit.objects.create(
                    produit=produit,
                    image=image_file,
                    est_principale=(existing_count == 0 and index == 0),
                    ordre=existing_count + index
                )
        
        # Retourner le produit mis à jour
        product_serializer = ProduitDetailSerializer(produit, context={'request': request})
        return Response(product_serializer.data)
    
    def perform_destroy(self, instance):
        """Vérifier que l'utilisateur est le propriétaire"""
        if hasattr(self.request.user, 'entreprise') and instance.entreprise != self.request.user.entreprise:
            raise PermissionDenied("Vous ne pouvez pas supprimer ce produit")
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def nouveautes(self, request):
        """Récupérer les nouveaux produits (20 derniers)"""
        produits = self.get_queryset().filter(actif=True, status='active')[:20]
        serializer = ProduitListSerializer(produits, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def promotions(self, request):
        """Récupérer les produits en promotion"""
        produits = self.get_queryset().filter(en_promotion=True, actif=True, status='active')
        serializer = ProduitListSerializer(produits, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vedette(self, request):
        """Récupérer les produits en vedette"""
        produits = self.get_queryset().filter(en_vedette=True, actif=True, status='active')
        serializer = ProduitListSerializer(produits, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def ajouter_image(self, request, slug=None):
        """Ajouter une image à un produit"""
        produit = self.get_object()
        
        # Vérifier que l'utilisateur est le propriétaire
        if not hasattr(request.user, 'entreprise') or produit.entreprise != request.user.entreprise:
            return Response(
                {'error': 'Vous ne pouvez pas modifier ce produit'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ImageProduitSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(produit=produit)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def supprimer_image(self, request, slug=None):
        """Supprimer une image d'un produit"""
        produit = self.get_object()
        image_id = request.data.get('image_id')
        
        # Vérifier que l'utilisateur est le propriétaire
        if not hasattr(request.user, 'entreprise') or produit.entreprise != request.user.entreprise:
            return Response(
                {'error': 'Vous ne pouvez pas modifier ce produit'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            image = ImageProduit.objects.get(id=image_id, produit=produit)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ImageProduit.DoesNotExist:
            return Response(
                {'error': 'Image non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def avis(self, request, slug=None):
        """Récupérer tous les avis d'un produit"""
        produit = self.get_object()
        avis = produit.avis.filter(approuve=True).select_related('client__user')
        serializer = AvisSerializer(avis, many=True, context={'request': request})
        return Response({
            'note_moyenne': produit.get_note_moyenne(),
            'nombre_avis': produit.get_nombre_avis(),
            'avis': serializer.data
        })


class AvisViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les avis produits
    """
    serializer_class = AvisSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filtrer les avis par produit et ne montrer que les avis approuvés"""
        queryset = Avis.objects.select_related('client__user', 'produit')
        
        # Filtrer par produit si demandé
        produit_id = self.request.query_params.get('produit', None)
        if produit_id:
            queryset = queryset.filter(produit_id=produit_id)
        
        # Les utilisateurs normaux ne voient que les avis approuvés
        if not self.request.user.is_staff:
            queryset = queryset.filter(approuve=True)
        
        return queryset
    
    def get_serializer_class(self):
        """Utiliser des serializers différents selon l'action"""
        if self.action == 'create':
            return AvisCreateSerializer
        return AvisSerializer
    
def perform_create(self, serializer):
    
    # DEBUG
    print("=" * 60)
    print("📥 DONNÉES REÇUES:", self.request.data)
    print("👤 User:", self.request.user)
    print("🔑 Has client:", hasattr(self.request.user, 'client'))
    print("=" * 60)
    
    if not hasattr(self.request.user, 'client'):
        raise PermissionDenied("Seuls les clients peuvent laisser des avis")
    
    # Tester la validation
    if not serializer.is_valid():
        print("❌ ERREURS VALIDATION:", serializer.errors)
    
    serializer.save(client=self.request.user.client)
    print("✅ AVIS CRÉÉ AVEC SUCCÈS")
    
    def update(self, request, *args, **kwargs):
        """Autoriser seulement la modification de son propre avis"""
        avis = self.get_object()
        if not hasattr(request.user, 'client') or avis.client != request.user.client:
            return Response(
                {'error': 'Vous ne pouvez modifier que vos propres avis'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Autoriser seulement la suppression de son propre avis"""
        avis = self.get_object()
        if not hasattr(request.user, 'client') or avis.client != request.user.client:
            return Response(
                {'error': 'Vous ne pouvez supprimer que vos propres avis'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mes_avis(self, request):
        """Récupérer tous les avis de l'utilisateur connecté"""
        if not hasattr(request.user, 'client'):
            return Response(
                {'error': 'Non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        avis = Avis.objects.filter(client=request.user.client)
        serializer = self.get_serializer(avis, many=True)
        return Response(serializer.data)