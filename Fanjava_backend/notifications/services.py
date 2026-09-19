# notifications/services.py
"""Création des notifications automatiques (commande, stock, avis, compte...)."""

import logging

from .models import Notification

logger = logging.getLogger(__name__)


def notifier(utilisateurs, type_notification, titre, message, lien=''):
    """
    Envoie une notification ciblée à un ou plusieurs utilisateurs.
    Ne lève jamais d'exception : une notification ratée ne doit pas casser l'action principale.
    """
    if utilisateurs is None:
        return
    if not hasattr(utilisateurs, '__iter__'):
        utilisateurs = [utilisateurs]

    for utilisateur in utilisateurs:
        if utilisateur is None or not getattr(utilisateur, 'is_active', True):
            continue
        try:
            Notification.objects.create(
                created_by=None,
                type_notification=type_notification,
                titre=titre[:200],
                message=message,
                lien=lien,
                recipient_type='user',
                destinataire=utilisateur,
            )
        except Exception:
            logger.exception("Échec de création de notification pour l'utilisateur %s", utilisateur.pk)
