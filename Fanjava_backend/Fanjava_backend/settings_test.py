"""Réglages de test : base SQLite en mémoire, e-mails en mémoire, hachage rapide."""
import os

os.environ.setdefault('DJANGO_SECRET_KEY', 'cle-de-test-uniquement')
os.environ.setdefault('DJANGO_DEBUG', 'False')

from .settings import *  # noqa: E402,F401,F403

DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
FRONTEND_URL = 'http://testserver'
