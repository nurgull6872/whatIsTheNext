"""Kucuk yardimcilar: istemci IP'sini okuma ve tuzlu hash'leme (§4.4)."""

import hashlib

from django.conf import settings


def get_client_ip(request):
    """Vercel/ters proxy arkasinda X-Forwarded-For ilk IP'yi tasir."""
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def hash_ip(ip):
    if not ip:
        return ""
    salted = f"{ip}:{settings.VOTER_TOKEN_SALT}"
    return hashlib.sha256(salted.encode()).hexdigest()
