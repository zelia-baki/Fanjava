# products/image_response.py

import os

from django.http import FileResponse, Http404

# Seuls ces types sont servis « inline ». Tout le reste est forcé en téléchargement
# (une image ne doit jamais pouvoir être interprétée comme une page HTML par le navigateur).
TYPES_IMAGE = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
}


def image_file_response(field_file, max_age=86400):
    """
    Construit une réponse binaire (Content-Type de l'image, corps = octets)
    à partir d'un ImageField / FileField. Lève 404 si aucun fichier n'est disponible.
    """
    if not field_file:
        raise Http404("Aucune image")

    try:
        fichier = field_file.open('rb')
    except (FileNotFoundError, ValueError):
        raise Http404("Fichier image introuvable")

    extension = os.path.splitext(field_file.name)[1].lower()
    content_type = TYPES_IMAGE.get(extension)

    response = FileResponse(fichier, content_type=content_type or 'application/octet-stream')
    response['Cache-Control'] = f'public, max-age={max_age}'
    response['Content-Disposition'] = 'inline' if content_type else 'attachment'
    response['X-Content-Type-Options'] = 'nosniff'
    response['Content-Security-Policy'] = "default-src 'none'; sandbox"
    return response
