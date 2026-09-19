# products/validators.py

from PIL import Image, UnidentifiedImageError
from rest_framework.exceptions import ValidationError

FORMATS_AUTORISES = {'JPEG', 'PNG', 'WEBP', 'GIF'}
TAILLE_MAX_OCTETS = 10 * 1024 * 1024  # 10 Mo


def valider_image(fichier):
    """
    Vérifie qu'un fichier envoyé est réellement une image JPEG / PNG / WEBP / GIF
    et ne dépasse pas 10 Mo. Lève une ValidationError DRF sinon.
    Utilisable comme validateur de champ et pour les fichiers reçus directement.
    """
    if fichier.size > TAILLE_MAX_OCTETS:
        raise ValidationError(f"Image trop lourde ({fichier.size // (1024 * 1024)} Mo). Maximum : 10 Mo.")

    try:
        fichier.seek(0)
        image = Image.open(fichier)
        format_image = image.format
        image.verify()
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError):
        raise ValidationError("Le fichier envoyé n'est pas une image valide.")
    finally:
        fichier.seek(0)

    if format_image not in FORMATS_AUTORISES:
        raise ValidationError("Format d'image non autorisé (JPEG, PNG, WEBP ou GIF uniquement).")
    return fichier
