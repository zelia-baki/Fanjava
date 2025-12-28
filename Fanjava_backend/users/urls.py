# users/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView  # ← AJOUTER
from .views import RegisterView, UserProfileView
from .admin_views import AdminUserViewSet, AdminClientViewSet, AdminEntrepriseViewSet

# Router pour les endpoints admin
admin_router = DefaultRouter()
admin_router.register(r'users', AdminUserViewSet, basename='admin-users')
admin_router.register(r'clients', AdminClientViewSet, basename='admin-clients')
admin_router.register(r'entreprises', AdminEntrepriseViewSet, basename='admin-entreprises')

urlpatterns = [
    # Auth endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Admin endpoints
    path('admin/', include(admin_router.urls)),
]