from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from products.image_response import image_file_response

from .emails import (
    email_verification_token,
    envoyer_email_verification,
    envoyer_reset_mot_de_passe,
    utilisateur_depuis_uid,
)
from .models import CustomUser, Entreprise
from .serializers import (
    ChangePasswordSerializer,
    EmailVerifySerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = RegisterSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    def put(self, request, *args, **kwargs):
        # Le frontend envoie des mises à jour partielles, y compris via PUT
        return self.partial_update(request, *args, **kwargs)


class EntrepriseLogoView(APIView):
    """Renvoie le logo d'une entreprise en binaire"""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, pk):
        entreprise = get_object_or_404(Entreprise, pk=pk)
        return image_file_response(entreprise.logo)


class ChangePasswordView(APIView):
    """Changer son mot de passe (utilisateur connecté)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save(update_fields=['password'])
        return Response({'detail': 'Mot de passe modifié.'})


class PasswordResetRequestView(APIView):
    """Demande de réinitialisation : répond toujours 200 (ne révèle pas si l'e-mail existe)"""
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        for user in CustomUser.objects.filter(email__iexact=email, is_active=True):
            envoyer_reset_mot_de_passe(user)
        return Response({'detail': "Si un compte existe pour cet e-mail, un lien de réinitialisation a été envoyé."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = utilisateur_depuis_uid(data['uid'])
        if user is None or not default_token_generator.check_token(user, data['token']):
            return Response({'detail': 'Lien invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(data['new_password'], user)
        except DjangoValidationError as exc:
            return Response({'new_password': list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(data['new_password'])
        user.save(update_fields=['password'])
        return Response({'detail': 'Mot de passe réinitialisé. Vous pouvez vous connecter.'})


class EmailVerifyView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = EmailVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = utilisateur_depuis_uid(data['uid'])
        if user is None or not email_verification_token.check_token(user, data['token']):
            return Response({'detail': 'Lien invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)

        user.email_verified = True
        user.save(update_fields=['email_verified'])
        return Response({'detail': 'Adresse e-mail confirmée.'})


class ResendVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.email_verified:
            return Response({'detail': 'Adresse e-mail déjà confirmée.'})
        envoyer_email_verification(request.user)
        return Response({'detail': 'E-mail de confirmation envoyé.'})
