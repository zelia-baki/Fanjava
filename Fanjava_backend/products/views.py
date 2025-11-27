from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import PermissionDenied
from .models import Categorie, Produit, ImageProduit, Avis
from .serializers import (
    CategorieSerializer,
    ProduitSerializer,
    ProduitListSerializer,
    ProduitCreateUpdateSerializer,
    ImageProduitSerializer,
    AvisSerializer, 
    AvisCreateSerializer
)


class CategorieViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les catégories
    """
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Filtrer les catégories parentes si demandé"""
        queryset = super().get_queryset()
        parent_only = self.request.query_params.get('parent_only', None)
        
        if parent_only == 'true':
            queryset = queryset.filter(parent__isnull=True)
        
        return queryset


class ProduitViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les produits
    """
    queryset = Produit.objects.select_related('categorie', 'entreprise').prefetch_related('images')
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categorie', 'entreprise', 'en_promotion', 'en_vedette', 'actif']
    search_fields = ['nom', 'description']
    ordering_fields = ['prix', 'created_at', 'nom']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Utiliser des serializers différents selon l'action"""
        if self.action == 'list':
            return ProduitListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProduitCreateUpdateSerializer
        return ProduitSerializer
    
    def get_queryset(self):
        """Filtres personnalisés"""
        queryset = super().get_queryset()
        
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
            if self.action in ['list', 'retrieve']:
                # Si c'est une entreprise, elle peut voir ses propres produits
                mes_produits = self.request.query_params.get('mes_produits', None)
                if mes_produits == 'true':
                    queryset = queryset.filter(entreprise=self.request.user.entreprise)
        
        return queryset
    
    def perform_create(self, serializer):
        """Associer automatiquement le produit à l'entreprise connectée"""
        if hasattr(self.request.user, 'entreprise'):
            serializer.save(entreprise=self.request.user.entreprise)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def nouveautes(self, request):
        """Récupérer les nouveaux produits (20 derniers)"""
        produits = self.get_queryset().filter(actif=True)[:20]
        serializer = ProduitListSerializer(produits, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def promotions(self, request):
        """Récupérer les produits en promotion"""
        produits = self.get_queryset().filter(en_promotion=True, actif=True)
        serializer = ProduitListSerializer(produits, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vedette(self, request):
        """Récupérer les produits en vedette"""
        produits = self.get_queryset().filter(en_vedette=True, actif=True)
        serializer = ProduitListSerializer(produits, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def ajouter_image(self, request, slug=None):
        """Ajouter une image à un produit"""
        produit = self.get_object()
        
        # Vérifier que l'utilisateur est le propriétaire
        if hasattr(request.user, 'entreprise') and produit.entreprise != request.user.entreprise:
            return Response(
                {'error': 'Vous ne pouvez pas modifier ce produit'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ImageProduitSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(produit=produit)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'])
    def supprimer_image(self, request, slug=None):
        """Supprimer une image d'un produit"""
        produit = self.get_object()
        image_id = request.data.get('image_id')
        
        # Vérifier que l'utilisateur est le propriétaire
        if hasattr(request.user, 'entreprise') and produit.entreprise != request.user.entreprise:
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
        """Associer automatiquement l'avis au client connecté"""
        if hasattr(self.request.user, 'client'):
            serializer.save(client=self.request.user.client)
        else:
            raise PermissionDenied("Seuls les clients peuvent laisser des avis")
    
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
    
    @action(detail=False, methods=['get'])
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


# Ajouter une action dans ProduitViewSet pour récupérer les avis d'un produit
# Ajoutez cette méthode dans la classe ProduitViewSet existante :

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