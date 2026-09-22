"""Kok URL yapilandirmasi.

API tabani /api/v1/ (§5). Her app kendi urls.py'sini tanimlar.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("accounts.urls")),
    # polls.urls Faz 3'te eklenir.
]
