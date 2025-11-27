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

class UserSerializer(serializers.ModelSerializer):
    client = ClientSerializer(required=False)
    entreprise = EntrepriseSerializer(required=False)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'user_type', 'phone', 
                  'preferred_language', 'client', 'entreprise']
        read_only_fields = ['id']

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