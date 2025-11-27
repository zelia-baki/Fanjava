from django.urls import path
from .views import (
    CategorieListView, ProduitListView, ProduitDetailView,
    ProduitCreateView, ProduitUpdateView, ProduitDeleteView,
    ImageProduitUploadView, AvisCreateView
)

urlpatterns = [
    path('categories/', CategorieListView.as_view(), name='categorie-list'),
    path('produits/', ProduitListView.as_view(), name='produit-list'),
    path('produits/create/', ProduitCreateView.as_view(), name='produit-create'),
    path('produits/<slug:slug>/', ProduitDetailView.as_view(), name='produit-detail'),
    path('produits/<int:pk>/update/', ProduitUpdateView.as_view(), name='produit-update'),
    path('produits/<int:pk>/delete/', ProduitDeleteView.as_view(), name='produit-delete'),
    path('images/upload/', ImageProduitUploadView.as_view(), name='image-upload'),
    path('avis/create/', AvisCreateView.as_view(), name='avis-create'),
]