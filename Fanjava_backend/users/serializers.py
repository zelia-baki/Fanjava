from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, Client, Entreprise

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['adresse_livraison', 'ville', 'code_postal', 'pays', 'newsletter']

class EntrepriseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entreprise
        fields = ['nom_entreprise', 'description', 'logo', 'siret', 'adresse', 
                  'ville', 'code_postal', 'pays', 'telephone', 'email_entreprise', 
                  'whatsapp', 'status', 'verified']
        read_only_fields = ['status', 'verified']

# users/serializers.py
class UserSerializer(serializers.ModelSerializer):
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
            'created_at',
            'preferred_language', 
            'is_client',
            'is_entreprise',
            'is_admin',
            'client', 
            'entreprise'
        ]
        read_only_fields = ['created_at']
    
    def get_is_client(self, obj):
        return obj.user_type == 'client'
    
    def get_is_entreprise(self, obj):
        return obj.user_type in ['entreprise', 'admin']
    
    def get_is_admin(self, obj):
        return obj.user_type == 'admin'
    
    def update(self, instance, validated_data):
        # Extraire les données nested
        client_data = validated_data.pop('client', None)
        entreprise_data = validated_data.pop('entreprise', None)
        
        # Mettre à jour l'utilisateur
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Mettre à jour le profil client si présent
        if client_data and hasattr(instance, 'client'):
            client = instance.client
            for attr, value in client_data.items():
                setattr(client, attr, value)
            client.save()
        
        # Mettre à jour le profil entreprise si présent
        if entreprise_data and hasattr(instance, 'entreprise'):
            entreprise = instance.entreprise
            for attr, value in entreprise_data.items():
                setattr(entreprise, attr, value)
            entreprise.save()
        
        return instance    
    
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    client = ClientSerializer(required=False)
    entreprise = EntrepriseSerializer(required=False)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password2', 'user_type', 
                  'phone', 'preferred_language', 'client', 'entreprise']
    
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
        
        user = CustomUser.objects.create_user(**validated_data)
        
        if user.user_type == 'client' and client_data:
            Client.objects.create(user=user, **client_data)
        elif user.user_type == 'entreprise' and entreprise_data:
            Entreprise.objects.create(user=user, **entreprise_data)
        
        return user