"""Fabriques d'objets pour les tests."""
import io

from PIL import Image

from products.models import Categorie, Produit
from users.models import Client, CustomUser, Entreprise

MOT_DE_PASSE = 'Motdepasse!2026x'


def creer_client(username='cli'):
    user = CustomUser.objects.create_user(
        username=username, password=MOT_DE_PASSE, user_type='client', email=f'{username}@test.mg')
    Client.objects.create(user=user, adresse_livraison='Lot 1', ville='Tana', code_postal='101')
    return user


def creer_entreprise(username='ent', approuvee=True):
    user = CustomUser.objects.create_user(
        username=username, password=MOT_DE_PASSE, user_type='entreprise', email=f'{username}@test.mg')
    Entreprise.objects.create(
        user=user, nom_entreprise=f'Boutique {username}', adresse='Lot 2', ville='Tana',
        code_postal='101', telephone='+261340000000', email_entreprise=f'{username}@boutique.mg',
        status='approved' if approuvee else 'pending', verified=approuvee)
    return user


def creer_admin(username='adm'):
    return CustomUser.objects.create_user(
        username=username, password=MOT_DE_PASSE, user_type='admin', email=f'{username}@test.mg')


def creer_produit(entreprise_user, nom='Produit', prix=1000, stock=10, **kwargs):
    categorie, _ = Categorie.objects.get_or_create(nom='Categorie test')
    return Produit.objects.create(
        entreprise=entreprise_user.entreprise, categorie=categorie, nom=nom,
        description='Description', prix=prix, stock=stock, **kwargs)


def png_bytes():
    tampon = io.BytesIO()
    Image.new('RGB', (4, 4), 'red').save(tampon, 'PNG')
    return tampon.getvalue()
