# products/utils.py

from django.utils.text import slugify


def unique_slugify(instance, valeur, champ='slug'):
    """
    Génère un slug unique pour `instance` à partir de `valeur`
    (ajoute -2, -3... en cas de doublon au lieu de provoquer une erreur d'unicité).
    """
    Modele = instance.__class__
    max_length = Modele._meta.get_field(champ).max_length
    base = slugify(valeur)[:max_length] or 'item'

    existants = Modele._default_manager.all()
    if instance.pk:
        existants = existants.exclude(pk=instance.pk)

    slug = base
    compteur = 2
    while existants.filter(**{champ: slug}).exists():
        suffixe = f'-{compteur}'
        slug = base[:max_length - len(suffixe)] + suffixe
        compteur += 1
    return slug
