"""Gelistirme ayarlari."""

from .base import *  # noqa: F403
from .base import env

DEBUG = env.bool("DJANGO_DEBUG", default=True)

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]"]

# Gelistirmede .env olmadan da calissin diye makul varsayilanlar.
SECRET_KEY = env(
    "DJANGO_SECRET_KEY",
    default="dev-only-insecure-key-do-not-use-in-production",
)

VOTER_TOKEN_SALT = env("VOTER_TOKEN_SALT", default="dev-salt")

# Manifest storage collectstatic gerektirir; gelistirmede gereksiz.
STORAGES = {  # noqa: F405
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedStaticFilesStorage"},
}

# Testlerde sifre hash'i yavaslatmasin.
if env.bool("DJANGO_FAST_HASHING", default=False):
    PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
