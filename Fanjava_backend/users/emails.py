# users/emails.py

import logging

from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator, default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from .models import CustomUser

logger = logging.getLogger(__name__)


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """Jeton de vérification d'e-mail : invalidé si l'e-mail change ou est déjà vérifié"""
    key_salt = 'users.EmailVerificationTokenGenerator'

    def _make_hash_value(self, user, timestamp):
        return f"{user.pk}{user.email}{user.email_verified}{timestamp}"


email_verification_token = EmailVerificationTokenGenerator()


def encoder_uid(user):
    return urlsafe_base64_encode(force_bytes(user.pk))


def utilisateur_depuis_uid(uid):
    """Retourne l'utilisateur correspondant à l'uid encodé, ou None"""
    try:
        return CustomUser.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        return None


def _envoyer(user, sujet, corps):
    if not user.email:
        return False
    try:
        send_mail(sujet, corps, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
        return True
    except Exception:  # l'envoi d'e-mail ne doit jamais bloquer l'action principale
        logger.exception("Échec d'envoi d'e-mail à l'utilisateur %s", user.pk)
        return False


def envoyer_email_verification(user):
    lien = f"{settings.FRONTEND_URL}/verify-email/{encoder_uid(user)}/{email_verification_token.make_token(user)}"
    corps = (
        f"Bonjour {user.first_name or user.username},\n\n"
        "Merci de vous être inscrit sur Fanjava. Confirmez votre adresse e-mail en cliquant sur ce lien :\n"
        f"{lien}\n\n"
        "Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message."
    )
    return _envoyer(user, "Confirmez votre adresse e-mail - Fanjava", corps)


def envoyer_reset_mot_de_passe(user):
    lien = f"{settings.FRONTEND_URL}/reset-password/{encoder_uid(user)}/{default_token_generator.make_token(user)}"
    corps = (
        f"Bonjour {user.first_name or user.username},\n\n"
        "Vous avez demandé la réinitialisation de votre mot de passe Fanjava. "
        "Choisissez-en un nouveau en cliquant sur ce lien :\n"
        f"{lien}\n\n"
        "Ce lien est valable 3 jours. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message."
    )
    return _envoyer(user, "Réinitialisation de votre mot de passe - Fanjava", corps)
