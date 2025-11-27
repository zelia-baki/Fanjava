from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Categorie, Produit, ImageProduit, Avis
from .serializers import (
    CategorieSerializer, ProduitListSerializer, ProduitDetailSerializer,
    ProduitCreateUpdateSerializer, ImageProduitSerializer, AvisSerializer
)
from .permissions import IsEntrepriseOwnerOrReadOnly

class CategorieListView(generics.ListAPIView):
    queryset = Categorie.objects.filter(active=True, parent=None)
    serializer_class = CategorieSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ProduitListView(generics.ListAPIView):
    serializer_class = ProduitListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categorie', 'entreprise', 'status', 'en_vedette']
    search_fields = ['nom', 'description', 'description_courte']
    ordering_fields = ['prix', 'created_at', 'note_moyenne', 'nombre_ventes']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Produit.objects.filter(status='active')
        
        # Filtre par prix
        prix_min = self.request.query_params.get('prix_min')
        prix_max = self.request.query_params.get('prix_max')
        if prix_min:
            queryset = queryset.filter(prix__gte=prix_min)
        if prix_max:
            queryset = queryset.filter(prix__lte=prix_max)
        
        # Filtre par disponibilité
        en_stock = self.request.query_params.get('en_stock')
        if en_stock == 'true':
            queryset = queryset.filter(stock__gt=0)
        
        return queryset

class ProduitDetailView(generics.RetrieveAPIView):
    queryset = Produit.objects.all()
    serializer_class = ProduitDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.nombre_vues += 1
        instance.save(update_fields=['nombre_vues'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class ProduitCreateView(generics.CreateAPIView):
    serializer_class = ProduitCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def perform_create(self, serializer):
        if self.request.user.user_type != 'entreprise':
            raise PermissionError("Seules les entreprises peuvent créer des produits")
        serializer.save(entreprise=self.request.user.entreprise)

class ProduitUpdateView(generics.UpdateAPIView):
    queryset = Produit.objects.all()
    serializer_class = ProduitCreateUpdateSerializer
    permission_classes = [IsAuthenticated, IsEntrepriseOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

class ProduitDeleteView(generics.DestroyAPIView):
    queryset = Produit.objects.all()
    permission_classes = [IsAuthenticated, IsEntrepriseOwnerOrReadOnly]

class ImageProduitUploadView(generics.CreateAPIView):
    serializer_class = ImageProduitSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

class AvisCreateView(generics.CreateAPIView):
    serializer_class = AvisSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        if self.request.user.user_type != 'client':
            raise PermissionError("Seuls les clients peuvent laisser des avis")
        serializer.save(client=self.request.user.client)