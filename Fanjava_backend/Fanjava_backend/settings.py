import os
from pathlib import Path
from datetime import timedelta
from django.core.exceptions import ImproperlyConfigured
from django.utils.translation import gettext_lazy as _

# =========================
# BASE
# =========================
BASE_DIR = Path(__file__).resolve().parent.parent


def _load_env_file(path):
    """Charge un fichier .env (KEY=VALUE) sans écraser les variables déjà définies."""
    if not path.is_file():
        return
    for ligne in path.read_text(encoding='utf-8').splitlines():
        ligne = ligne.strip()
        if not ligne or ligne.startswith('#') or '=' not in ligne:
            continue
        cle, _sep, valeur = ligne.partition('=')
        os.environ.setdefault(cle.strip(), valeur.strip().strip('"').strip("'"))


_load_env_file(BASE_DIR / '.env')


def _env_bool(nom, defaut=False):
    return os.environ.get(nom, str(defaut)).strip().lower() in ('1', 'true', 'yes', 'on')


# =========================
# SECURITY
# =========================
# La clé secrète signe aussi les jetons JWT : elle ne doit JAMAIS être dans le dépôt.
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', '')
if not SECRET_KEY:
    raise ImproperlyConfigured(
        "Variable d'environnement DJANGO_SECRET_KEY manquante "
        "(voir .env.example : copiez-le en .env et renseignez les valeurs)."
    )

DEBUG = _env_bool('DJANGO_DEBUG', False)

ALLOWED_HOSTS = [
    "fanjava.mg",
    "www.fanjava.mg",
    "217.76.57.41",
    "localhost",
    "127.0.0.1",
]

CSRF_TRUSTED_ORIGINS = [
    "https://fanjava.mg",
    "https://www.fanjava.mg",
]

# Cookies (session admin Django, CSRF) uniquement en HTTPS hors mode debug
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# =========================
# APPLICATIONS
# =========================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Tiers
    'django_filters',
    'modeltranslation',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Apps
    'users.apps.UsersConfig',
    'products.apps.ProductsConfig',
    'orders.apps.OrdersConfig',
    'payments.apps.PaymentsConfig',
    'notifications.apps.NotificationsConfig',
]

# =========================
# MIDDLEWARE
# =========================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',

    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',

    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# =========================
# CORS / HTTPS
# =========================
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "https://fanjava.mg",
    "http://fanjava.mg",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# =========================
# URLS / TEMPLATES
# =========================
ROOT_URLCONF = 'Fanjava_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Fanjava_backend.wsgi.application'

# =========================
# DATABASE
# =========================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME', 'marketplace_db'),
        'USER': os.environ.get('DB_USER', 'django_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '3306'),
    }
}

# =========================
# INTERNATIONALIZATION
# =========================
LANGUAGE_CODE = 'fr'

LANGUAGES = [
    ('fr', _('Français')),
    ('en', _('English')),
    ('mg', _('Malagasy')),
    ('es', _('Español')),
    ('de', _('Deutsch')),
]

TIME_ZONE = 'Indian/Antananarivo'

USE_I18N = True
USE_TZ = True

LOCALE_PATHS = [BASE_DIR / 'locale']

# =========================
# STATIC / MEDIA
# =========================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# =========================
# AUTH
# =========================
AUTH_USER_MODEL = 'users.CustomUser'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# =========================
# E-MAIL (réinitialisation de mot de passe, vérification d'e-mail)
# =========================
# Sans EMAIL_HOST, les e-mails sont simplement écrits dans les logs (aucun envoi réel).
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
EMAIL_BACKEND = (
    'django.core.mail.backends.smtp.EmailBackend'
    if EMAIL_HOST
    else 'django.core.mail.backends.console.EmailBackend'
)
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = _env_bool('EMAIL_USE_TLS', True)
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'Fanjava <no-reply@fanjava.mg>')

# URL publique du frontend (liens envoyés par e-mail)
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://fanjava.mg').rstrip('/')

# =========================
# DJANGO REST FRAMEWORK
# =========================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS':
        'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
}

# =========================
# JWT
# =========================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# =========================
# LOGGING (PROD SAFE)
# =========================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
