from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategorieViewSet, ProduitViewSet, AvisViewSet,
    CategorieListView, ProduitListView, ProduitDetailView,
    ProduitCreateView, ProduitUpdateView, ProduitDeleteView,
    ImageProduitUploadView, AvisCreateView
)

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'categories', CategorieViewSet, basename='categorie')
router.register(r'produits', ProduitViewSet, basename='produit')
router.register(r'avis', AvisViewSet, basename='avis')

urlpatterns = [
    # URLs du router (approche ViewSet)
    path('', include(router.urls)),
    
    # URLs traditionnelles (approche Class-Based Views)
    path('categories/list/', CategorieListView.as_view(), name='categorie-list'),
    path('produits/list/', ProduitListView.as_view(), name='produit-list'),
    path('produits/create/', ProduitCreateView.as_view(), name='produit-create'),
    path('produits/<slug:slug>/', ProduitDetailView.as_view(), name='produit-detail'),
    path('produits/<int:pk>/update/', ProduitUpdateView.as_view(), name='produit-update'),
    path('produits/<int:pk>/delete/', ProduitDeleteView.as_view(), name='produit-delete'),
    path('images/upload/', ImageProduitUploadView.as_view(), name='image-upload'),
    path('avis/create/', AvisCreateView.as_view(), name='avis-create'),
]