# orders/management/commands/create_test_data.py
# Place ce fichier dans: orders/management/commands/create_test_data.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Client, Entreprise
from products.models import Categorie, Produit
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Crée des données de test pour le marketplace'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('🚀 Création des données de test...'))
        
        # 1. Créer un client
        self.stdout.write('📝 Création du client...')
        client_user, created = User.objects.get_or_create(
            username='client_test',
            defaults={
                'email': 'client@test.com',
                'first_name': 'Jean',
                'last_name': 'Dupont',
                'user_type': 'client'
            }
        )
        if created:
            client_user.set_password('password123')
            client_user.save()
        
        client, created = Client.objects.get_or_create(
            user=client_user,
            defaults={
                'telephone': '0123456789',
                'adresse': '123 Rue Test',
                'ville': 'Paris',
                'code_postal': '75001',
                'pays': 'France'
            }
        )
        self.stdout.write(self.style.SUCCESS(f'✅ Client créé: {client_user.username}'))
        
        # 2. Créer 2 entreprises
        self.stdout.write('📝 Création des entreprises...')
        
        entreprise1_user, created = User.objects.get_or_create(
            username='entreprise1',
            defaults={
                'email': 'entreprise1@test.com',
                'first_name': 'Tech',
                'last_name': 'Store',
                'user_type': 'entreprise'
            }
        )
        if created:
            entreprise1_user.set_password('password123')
            entreprise1_user.save()
        
        entreprise1, created = Entreprise.objects.get_or_create(
            user=entreprise1_user,
            defaults={
                'nom_entreprise': 'Tech Store',
                'siret': '12345678900001',
                'telephone': '0111111111',
                'adresse': '1 Avenue Tech',
                'ville': 'Paris',
                'code_postal': '75002',
                'pays': 'France'
            }
        )
        self.stdout.write(self.style.SUCCESS(f'✅ Entreprise créée: {entreprise1.nom_entreprise}'))
        
        entreprise2_user, created = User.objects.get_or_create(
            username='entreprise2',
            defaults={
                'email': 'entreprise2@test.com',
                'first_name': 'Fashion',
                'last_name': 'Shop',
                'user_type': 'entreprise'
            }
        )
        if created:
            entreprise2_user.set_password('password123')
            entreprise2_user.save()
        
        entreprise2, created = Entreprise.objects.get_or_create(
            user=entreprise2_user,
            defaults={
                'nom_entreprise': 'Fashion Shop',
                'siret': '98765432100001',
                'telephone': '0122222222',
                'adresse': '2 Boulevard Mode',
                'ville': 'Lyon',
                'code_postal': '69001',
                'pays': 'France'
            }
        )
        self.stdout.write(self.style.SUCCESS(f'✅ Entreprise créée: {entreprise2.nom_entreprise}'))
        
        # 3. Créer des catégories
        self.stdout.write('📝 Création des catégories...')
        
        cat_tech, created = Categorie.objects.get_or_create(
            nom='Électronique',
            defaults={
                'description': 'Produits électroniques et high-tech',
                'active': True
            }
        )
        
        cat_mode, created = Categorie.objects.get_or_create(
            nom='Mode',
            defaults={
                'description': 'Vêtements et accessoires',
                'active': True
            }
        )
        
        cat_maison, created = Categorie.objects.get_or_create(
            nom='Maison',
            defaults={
                'description': 'Articles pour la maison',
                'active': True
            }
        )
        self.stdout.write(self.style.SUCCESS('✅ Catégories créées'))
        
        # 4. Créer des produits pour entreprise1
        self.stdout.write('📝 Création des produits...')
        
        produits_entreprise1 = [
            {
                'nom': 'iPhone 15',
                'description': 'Dernier iPhone avec toutes les fonctionnalités',
                'description_courte': 'Smartphone Apple dernière génération',
                'prix': Decimal('999.99'),
                'stock': 50,
                'categorie': cat_tech,
                'entreprise': entreprise1,
                'status': 'active',
                'actif': True
            },
            {
                'nom': 'MacBook Pro',
                'description': 'Ordinateur portable puissant pour professionnels',
                'description_courte': 'Laptop haute performance',
                'prix': Decimal('2499.99'),
                'stock': 30,
                'categorie': cat_tech,
                'entreprise': entreprise1,
                'status': 'active',
                'actif': True
            },
            {
                'nom': 'AirPods Pro',
                'description': 'Écouteurs sans fil avec réduction de bruit',
                'description_courte': 'Écouteurs premium',
                'prix': Decimal('249.99'),
                'prix_promo': Decimal('199.99'),
                'stock': 100,
                'categorie': cat_tech,
                'entreprise': entreprise1,
                'status': 'active',
                'actif': True,
                'en_promotion': True
            },
        ]
        
        # 5. Créer des produits pour entreprise2
        produits_entreprise2 = [
            {
                'nom': 'T-Shirt Premium',
                'description': 'T-shirt en coton bio de haute qualité',
                'description_courte': 'Vêtement confortable',
                'prix': Decimal('29.99'),
                'stock': 200,
                'categorie': cat_mode,
                'entreprise': entreprise2,
                'status': 'active',
                'actif': True
            },
            {
                'nom': 'Jean Slim',
                'description': 'Jean moderne coupe slim',
                'description_courte': 'Pantalon tendance',
                'prix': Decimal('79.99'),
                'stock': 150,
                'categorie': cat_mode,
                'entreprise': entreprise2,
                'status': 'active',
                'actif': True
            },
            {
                'nom': 'Sac à Main Cuir',
                'description': 'Sac à main en cuir véritable',
                'description_courte': 'Accessoire élégant',
                'prix': Decimal('149.99'),
                'prix_promo': Decimal('119.99'),
                'stock': 50,
                'categorie': cat_mode,
                'entreprise': entreprise2,
                'status': 'active',
                'actif': True,
                'en_promotion': True,
                'en_vedette': True
            },
        ]
        
        # Créer tous les produits
        for produit_data in produits_entreprise1 + produits_entreprise2:
            produit, created = Produit.objects.get_or_create(
                nom=produit_data['nom'],
                defaults=produit_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✅ Produit créé: {produit.nom}'))
        
        self.stdout.write(self.style.SUCCESS('\n🎉 Données de test créées avec succès!'))
        self.stdout.write(self.style.WARNING('\n📋 IDENTIFIANTS DE TEST:'))
        self.stdout.write(f'  Client: username="client_test", password="password123"')
        self.stdout.write(f'  Entreprise 1: username="entreprise1", password="password123"')
        self.stdout.write(f'  Entreprise 2: username="entreprise2", password="password123"')