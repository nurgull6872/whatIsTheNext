"""Uretim ayarlari.

Tum gizli degerler ortam degiskenlerinden gelir; varsayilan yoktur.
Eksik bir degisken uygulamayi acilista dusurur - sessizce yanlis
yapilandirilmis calismasindan iyidir.
"""

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403
from .base import env

DEBUG = False

# Uretimde varsayilani olmayan, zorunlu degerler.
_REQUIRED = ["DJANGO_SECRET_KEY", "DATABASE_URL", "VOTER_TOKEN_SALT", "DJANGO_ALLOWED_HOSTS"]
_missing = [name for name in _REQUIRED if not env(name)]
if _missing:
    raise ImproperlyConfigured(f"Uretimde zorunlu ortam degiskenleri eksik: {', '.join(_missing)}")

# --- HTTPS / guvenlik basliklari ---
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 365  # 1 yil
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = env("CSRF_TRUSTED_ORIGINS")

# --- Statik dosyalar ---
# base.py'deki CompressedManifestStaticFilesStorage, `collectstatic`
# calismamissa (manifest dosyasi yoksa) her {% static %} kullaniminda
# sunucuyu 500 ile dusurur. Vercel build adiminda collectstatic'in
# calistigi garanti olmadigindan, uretimde manifest gerektirmeyen, daha
# hosgorulu depolamaya dusulur: eksik bir dosya sadece 404 verir, tum
# admin panelini kilitlemez. Admin panelinin CSS'i olmadan gorunmesi
# (Faz 7'de collectstatic build adimiyla cozulecek) urunun asil
# arayuzunu (React) etkilemez.
STORAGES = {  # noqa: F405
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedStaticFilesStorage"},
}

# --- Loglama ---
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {"format": "{levelname} {asctime} {name} {message}", "style": "{"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "verbose"},
    },
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "django.request": {"handlers": ["console"], "level": "ERROR", "propagate": False},
    },
}
