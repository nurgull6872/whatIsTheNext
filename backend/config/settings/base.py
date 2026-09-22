"""Ortak Django ayarlari.

Ortama ozgu olanlar dev.py ve prod.py icinde. Dogrudan bu modulu
DJANGO_SETTINGS_MODULE olarak kullanmayin.
"""

from pathlib import Path

import environ

# backend/config/settings/base.py -> backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    # Bos varsayilan: dev.py kendi degerini koyar, prod.py eksikse patlar.
    DJANGO_SECRET_KEY=(str, ""),
    DJANGO_DEBUG=(bool, False),
    DJANGO_ALLOWED_HOSTS=(list, []),
    CORS_ALLOWED_ORIGINS=(list, []),
    CSRF_TRUSTED_ORIGINS=(list, []),
    DATABASE_URL=(str, ""),
    VOTER_TOKEN_SALT=(str, ""),
)

# .env varsa okunur; yoksa gercek ortam degiskenleri kullanilir (Vercel boyle calisir).
env_file = BASE_DIR / ".env"
if env_file.exists():
    environ.Env.read_env(env_file)

SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = env("DJANGO_DEBUG")
ALLOWED_HOSTS = env("DJANGO_ALLOWED_HOSTS")


# --------------------------------------------------------------------------
# Uygulamalar
# --------------------------------------------------------------------------

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = []

LOCAL_APPS = [
    "accounts",
    "polls",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# --------------------------------------------------------------------------
# Veritabani
# --------------------------------------------------------------------------
# DATABASE_URL doluysa Supabase (PostgreSQL), bos ise yerel sqlite.
# Supabase'de transaction pooler adresi kullanilir: port 6543, 5432 degil.

if env("DATABASE_URL"):
    DATABASES = {"default": env.db("DATABASE_URL")}
    # Serverless'ta her istek yeni bir surec: baglantiyi acik tutmak
    # pooler'i tuketir. Bu yuzden 0.
    DATABASES["default"]["CONN_MAX_AGE"] = 0
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# --------------------------------------------------------------------------
# Kimlik dogrulama
# --------------------------------------------------------------------------

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# --------------------------------------------------------------------------
# Yerellestirme
# --------------------------------------------------------------------------

LANGUAGE_CODE = "tr"
TIME_ZONE = "Europe/Istanbul"
USE_I18N = True
USE_TZ = True


# --------------------------------------------------------------------------
# Statik dosyalar (yalnizca Django admin icin; uygulama arayuzu React tarafinda)
# --------------------------------------------------------------------------

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}


# --------------------------------------------------------------------------
# Uygulamaya ozel
# --------------------------------------------------------------------------

# Ziyaretci oylarinda IP adresi duz saklanmaz, bu tuzla hash'lenir.
VOTER_TOKEN_SALT = env("VOTER_TOKEN_SALT")

# Anket kurallari (§1.1). Serializer ve model dogrulamalari bunlari okur.
POLL_MIN_OPTIONS = 2
POLL_MAX_OPTIONS = 5
POLL_DEFAULT_DURATION_DAYS = 7
