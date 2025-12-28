# products/management/commands/create_categories.py
# Place ce fichier dans: products/management/commands/create_categories.py

from django.core.management.base import BaseCommand
from products.models import Categorie


class Command(BaseCommand):
    help = 'Crée les catégories de base pour le marketplace'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('🚀 Création des catégories...'))
        
        categories = [
            {
                'nom': 'Électronique',
                'description': 'Smartphones, ordinateurs, tablettes et accessoires électroniques',
                'ordre': 1
            },
            {
                'nom': 'Mode',
                'description': 'Vêtements, chaussures et accessoires de mode',
                'ordre': 2
            },
            {
                'nom': 'Maison & Jardin',
                'description': 'Meubles, décoration, jardinage et bricolage',
                'ordre': 3
            },
            {
                'nom': 'Sports & Loisirs',
                'description': 'Équipements sportifs, jouets et activités de loisirs',
                'ordre': 4
            },
            {
                'nom': 'Beauté & Santé',
                'description': 'Cosmétiques, soins personnels et produits de santé',
                'ordre': 5
            },
            {
                'nom': 'Alimentation',
                'description': 'Produits alimentaires et boissons',
                'ordre': 6
            },
            {
                'nom': 'Livres & Médias',
                'description': 'Livres, films, musique et jeux vidéo',
                'ordre': 7
            },
            {
                'nom': 'Automobile',
                'description': 'Pièces auto, accessoires et équipements pour véhicules',
                'ordre': 8
            },
            {
                'nom': 'Enfants & Bébés',
                'description': 'Vêtements, jouets et accessoires pour enfants',
                'ordre': 9
            },
            {
                'nom': 'Autres',
                'description': 'Produits divers',
                'ordre': 10
            },
        ]
        
        created_count = 0
        for cat_data in categories:
            categorie, created = Categorie.objects.get_or_create(
                nom=cat_data['nom'],
                defaults={
                    'description': cat_data['description'],
                    'ordre': cat_data['ordre'],
                    'active': True
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✅ Catégorie créée: {categorie.nom}'))
                created_count += 1
            else:
                self.stdout.write(self.style.WARNING(f'  ⚠️  Catégorie existante: {categorie.nom}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n🎉 {created_count} catégorie(s) créée(s) !'))
        self.stdout.write(self.style.SUCCESS(f'📊 Total: {Categorie.objects.count()} catégories'))