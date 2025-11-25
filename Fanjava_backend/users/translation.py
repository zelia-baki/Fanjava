# users/translation.py

from modeltranslation.translator import register, TranslationOptions
from .models import Entreprise

@register(Entreprise)
class EntrepriseTranslationOptions(TranslationOptions):
    fields = ('description',)