"""Ziyaretci oy anahtari (voter_token) middleware'i (§4.4, §7).

Her istekte `request.voter_token` (UUID) hazir bulunur:
    1. `X-Voter-Token` basligi (frontend localStorage yedegi icin) gecerliyse o kullanilir.
    2. Yoksa `voter_token` cookie'si.
    3. Ikisi de yoksa yeni bir UUID4 uretilir ve yanitla birlikte cookie olarak set edilir.

Cookie `HttpOnly`: tarayici JS'i degistiremez, sadece istekle otomatik gider.
Cross-site (React ayri origin) calisabilmesi icin `SameSite=None; Secure`
gerekir; bu da HTTPS ister. Yerel gelistirmede (`DEBUG=True`, http) bunun
yerine `SameSite=Lax; Secure=False` kullanilir.
"""

import uuid

from django.conf import settings

COOKIE_NAME = "voter_token"
COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2  # 2 yil
HEADER_NAME = "HTTP_X_VOTER_TOKEN"


def _parse_uuid(value):
    if not value:
        return None
    try:
        return uuid.UUID(value)
    except (ValueError, AttributeError):
        return None


class VoterTokenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = _parse_uuid(request.META.get(HEADER_NAME)) or _parse_uuid(
            request.COOKIES.get(COOKIE_NAME)
        )
        is_new = token is None
        if is_new:
            token = uuid.uuid4()

        request.voter_token = token

        response = self.get_response(request)

        if is_new:
            response.set_cookie(
                COOKIE_NAME,
                str(token),
                max_age=COOKIE_MAX_AGE,
                httponly=True,
                samesite="Lax" if settings.DEBUG else "None",
                secure=not settings.DEBUG,
            )

        return response
