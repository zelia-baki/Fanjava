import logging

from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers

from products.validators import valider_image

from .models import CustomUser, Client, Entreprise

logger = logging.getLogger(__name__)


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'adresse_livraison', 'ville', 'code_postal', 'pays', 'newsletter']
        read_only_fields = ['id']


class AdminClientSerializer(serializers.ModelSerializer):
    """Client avec les informations de son compte (vue administrateur)"""
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Client
        fields = [
            'id', 'user_id', 'username', 'email', 'first_name', 'last_name',
            'adresse_livraison', 'ville', 'code_postal', 'pays', 'newsletter',
        ]
        read_only_fields = fields


class EntrepriseSerializer(serializers.ModelSerializer):
    has_logo = serializers.SerializerMethodField()

    class Meta:
        model = Entreprise
        fields = [
            'id',
            'nom_entreprise', 'description', 'logo', 'has_logo', 'siret', 'adresse',
            'ville', 'code_postal', 'pays', 'telephone', 'email_entreprise',
            'whatsapp', 'status', 'verified'
        ]
        read_only_fields = ['status', 'verified']
        extra_kwargs = {
            # Le logo n'est jamais renvoyé sous forme d'URL : il se récupère
            # en binaire via GET /api/users/entreprises/<id>/logo/
            'logo': {'write_only': True, 'validators': [valider_image]},
            # L'unicité est vérifiée dans validate_siret (compatible avec la mise à jour imbriquée)
            'siret': {'required': False, 'allow_null': True, 'allow_blank': True, 'validators': []},
        }

    def get_has_logo(self, obj):
        return bool(obj.logo)

    def _entreprise_courante(self):
        """Entreprise en cours de modification (directement ou via le UserSerializer parent)"""
        if self.instance is not None and hasattr(self.instance, 'pk'):
            return self.instance
        parent_instance = getattr(self.parent, 'instance', None)
        return getattr(parent_instance, 'entreprise', None)

    def validate_siret(self, value):
        value = (value or '').strip() or None
        if value:
            doublons = Entreprise.objects.filter(siret=value)
            courante = self._entreprise_courante()
            if courante is not None:
                doublons = doublons.exclude(pk=courante.pk)
            if doublons.exists():
                raise serializers.ValidationError("Ce numéro SIRET est déjà utilisé.")
        return value


class UserSerializer(serializers.ModelSerializer):
    """Sérialiseur complet d'un utilisateur (usage administrateur)"""
    client = ClientSerializer(required=False)
    entreprise = EntrepriseSerializer(required=False)

    is_client = serializers.SerializerMethodField()
    is_entreprise = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'user_type',
            'phone',
            'is_active',
            'email_verified',
            'created_at',
            'preferred_language',
            'is_client',
            'is_entreprise',
            'is_admin',
            'client',
            'entreprise'
        ]
        read_only_fields = ['created_at', 'email_verified']

    def get_is_client(self, obj):
        return obj.user_type == 'client'

    def get_is_entreprise(self, obj):
        return obj.user_type in ['entreprise', 'admin']

    def get_is_admin(self, obj):
        return obj.user_type == 'admin'

    def update(self, instance, validated_data):
        """Met à jour l'utilisateur ET ses profils client/entreprise imbriqués"""
        client_data = validated_data.pop('client', None)
        entreprise_data = validated_data.pop('entreprise', None)

        with transaction.atomic():
            instance = super().update(instance, validated_data)

            client = getattr(instance, 'client', None)
            if client_data and client is not None:
                for champ, valeur in client_data.items():
                    setattr(client, champ, valeur)
                client.save()

            entreprise = getattr(instance, 'entreprise', None)
            if entreprise_data and entreprise is not None:
                for champ, valeur in entreprise_data.items():
                    setattr(entreprise, champ, valeur)
                entreprise.save()

        return instance


class UserProfileSerializer(UserSerializer):
    """
    Profil de l'utilisateur connecté : il ne peut PAS modifier son rôle,
    l'état de son compte ni la vérification de son e-mail.
    """

    class Meta(UserSerializer.Meta):
        read_only_fields = [
            'created_at', 'user_type', 'is_active', 'email_verified',
            'is_client', 'is_entreprise', 'is_admin',
        ]

    def validate_email(self, value):
        doublons = CustomUser.objects.filter(email__iexact=value).exclude(pk=self.instance.pk)
        if value and doublons.exists():
            raise serializers.ValidationError("Un compte existe déjà avec cet e-mail.")
        return value

    def update(self, instance, validated_data):
        ancien_email = instance.email
        instance = super().update(instance, validated_data)

        if instance.email != ancien_email:
            # Un nouvel e-mail doit être re-vérifié
            instance.email_verified = False
            instance.save(update_fields=['email_verified'])
            from .emails import envoyer_email_verification
            envoyer_email_verification(instance)
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    # Seuls les comptes client et entreprise peuvent être créés publiquement.
    # Un compte administrateur ne se crée que depuis l'admin Django.
    user_type = serializers.ChoiceField(choices=[('client', 'Client'), ('entreprise', 'Entreprise')])
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    client = ClientSerializer(required=False)
    entreprise = EntrepriseSerializer(required=False)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password2', 'user_type',
                  'phone', 'preferred_language', 'client', 'entreprise']

    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Un compte existe déjà avec cet e-mail.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas"})

        if attrs['user_type'] == 'client' and 'client' not in attrs:
            raise serializers.ValidationError({"client": "Les informations client sont requises"})

        if attrs['user_type'] == 'entreprise' and 'entreprise' not in attrs:
            raise serializers.ValidationError({"entreprise": "Les informations entreprise sont requises"})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        client_data = validated_data.pop('client', None)
        entreprise_data = validated_data.pop('entreprise', None)

        with transaction.atomic():
            user = CustomUser.objects.create_user(**validated_data)

            if user.user_type == 'client' and client_data:
                Client.objects.create(user=user, **client_data)
            elif user.user_type == 'entreprise' and entreprise_data:
                Entreprise.objects.create(user=user, **entreprise_data)

        from .emails import envoyer_email_verification
        envoyer_email_verification(user)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect.")
        return value

    def validate_new_password(self, value):
        validate_password(value, self.context['request'].user)
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)


class EmailVerifySerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
