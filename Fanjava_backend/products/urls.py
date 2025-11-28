from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategorieViewSet, ProduitViewSet, AvisViewSet

router = DefaultRouter()
router.register(r'categories', CategorieViewSet, basename='categorie')
router.register(r'produits', ProduitViewSet, basename='produit')
router.register(r'avis', AvisViewSet, basename='avis')

urlpatterns = [
    path('', include(router.urls)),
]