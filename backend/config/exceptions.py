"""Butun API hatalarini tek bir govdeye cevirir (§5.3).

    { "error": { "code": "ALREADY_VOTED", "message": "..." } }

Gorunumler (views) `APIError` alt siniflarini firlatir; DRF'in
kendi hatalari (ValidationError, NotAuthenticated, Throttled, ...) da
burada ayni sekle donusturulur.
"""

from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler


class APIError(APIException):
    """Uygulamaya ozel hatalarin temel sinifi. `code` alt sinifi belirler."""

    code = "ERROR"
    default_message = "Bir hata olustu."

    def __init__(self, message=None, code=None):
        self.message = message or self.default_message
        if code:
            self.code = code
        super().__init__(detail=self.message)


class ValidationAPIError(APIError):
    status_code = 400
    code = "VALIDATION_ERROR"
    default_message = "Gonderilen veri gecersiz."


class AlreadyVotedError(APIError):
    status_code = 409
    code = "ALREADY_VOTED"
    default_message = "Bu ankete zaten oy verdiniz."


class PollClosedError(APIError):
    status_code = 403
    code = "POLL_CLOSED"
    default_message = "Bu anket artik oy kabul etmiyor."


class RateLimitedError(APIError):
    status_code = 429
    code = "RATE_LIMITED"
    default_message = "Cok fazla istek gonderdiniz, birazdan tekrar deneyin."


# DRF'in kendi exception siniflarini bizim koda esler.
_STATUS_TO_CODE = {
    400: "VALIDATION_ERROR",
    401: "NOT_AUTHENTICATED",
    403: "PERMISSION_DENIED",
    404: "NOT_FOUND",
    405: "METHOD_NOT_ALLOWED",
    409: "CONFLICT",
    429: "RATE_LIMITED",
}


def _flatten_detail(detail):
    """DRF hata govdesini tek bir okunabilir mesaja indirger."""
    if isinstance(detail, dict):
        parts = []
        for field, messages in detail.items():
            text = _flatten_detail(messages)
            # DRF'in genel sarmalayici alanlari; gercek bir form alani degiller.
            parts.append(text if field in ("detail", "non_field_errors") else f"{field}: {text}")
        return " ".join(parts)
    if isinstance(detail, list):
        return " ".join(_flatten_detail(item) for item in detail)
    return str(detail)


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    if isinstance(exc, APIError):
        code = exc.code
    else:
        code = _STATUS_TO_CODE.get(response.status_code, "ERROR")

    message = _flatten_detail(response.data)
    response.data = {"error": {"code": code, "message": message}}
    return response


def error_response(code, message, status_code=400):
    """Custom view'lerde exception firlatmadan hata donmek icin yardimci."""
    return Response({"error": {"code": code, "message": message}}, status=status_code)
