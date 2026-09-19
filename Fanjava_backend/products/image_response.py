# products/image_response.py

import mimetypes

from django.http import FileResponse, Http404


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

    content_type, _ = mimetypes.guess_type(field_file.name)
    response = FileResponse(fichier, content_type=content_type or 'application/octet-stream')
    response['Cache-Control'] = f'public, max-age={max_age}'
    response['Content-Disposition'] = 'inline'
    return response
