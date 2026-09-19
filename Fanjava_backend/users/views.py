from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, UserSerializer
from .models import Entreprise
from products.image_response import image_file_response

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user

class EntrepriseLogoView(APIView):
    """Renvoie le logo d'une entreprise en binaire"""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, pk):
        entreprise = get_object_or_404(Entreprise, pk=pk)
        return image_file_response(entreprise.logo)
