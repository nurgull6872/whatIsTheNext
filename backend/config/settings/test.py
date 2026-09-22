"""Test ayarlari.

.env icinde DATABASE_URL Supabase'e isaret etse bile testler HER ZAMAN
sqlite kullanir: hizli, izole ve Supabase'de "test_postgres" gibi
kalinti veritabani birakmaz. pytest bu modulu kullanir (pyproject.toml).
"""

from .base import *  # noqa: F403
from .base import BASE_DIR

DEBUG = False
SECRET_KEY = "test-only-insecure-key-that-is-long-enough-for-hmac-sha256"
VOTER_TOKEN_SALT = "test-salt"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "test_db.sqlite3",
    }
}

# Sifre hash'i testlerde en yavas adimlardan biri; MD5'e dusurulur.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}
