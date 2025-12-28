# products/translation.py

from modeltranslation.translator import register, TranslationOptions
from .models import Categorie, Produit

@register(Categorie)
class CategorieTranslationOptions(TranslationOptions):
    fields = ('nom', 'description')

@register(Produit)
class ProduitTranslationOptions(TranslationOptions):
    fields = ('nom', 'description', 'description_courte')