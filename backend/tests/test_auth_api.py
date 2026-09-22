"""Kayit / giris / token yenileme / profil uctan uca senaryolari (§5.1)."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()

REGISTER_URL = "/api/v1/auth/register/"
LOGIN_URL = "/api/v1/auth/login/"
REFRESH_URL = "/api/v1/auth/refresh/"
LOGOUT_URL = "/api/v1/auth/logout/"
ME_URL = "/api/v1/auth/me/"


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def existing_user(db):
    return User.objects.create_user(
        email="mert@example.com", display_name="mert", password="cok-gizli-123"
    )


# --------------------------------------------------------------------------
# Kayit
# --------------------------------------------------------------------------


def test_register_creates_user_and_returns_tokens(api, db):
    response = api.post(
        REGISTER_URL,
        {
            "email": "yeni@example.com",
            "display_name": "yeni_kullanici",
            "password": "cok-gizli-123",
        },
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["user"]["display_name"] == "yeni_kullanici"
    assert "access" in response.data
    assert "refresh" in response.data
    assert User.objects.filter(email="yeni@example.com").exists()


def test_register_rejects_duplicate_email(api, existing_user):
    response = api.post(
        REGISTER_URL,
        {"email": "mert@example.com", "display_name": "baska_ad", "password": "cok-gizli-123"},
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["error"]["code"] == "VALIDATION_ERROR"


def test_register_rejects_duplicate_display_name(api, existing_user):
    response = api.post(
        REGISTER_URL,
        {"email": "baska@example.com", "display_name": "mert", "password": "cok-gizli-123"},
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_register_rejects_weak_password(api, db):
    response = api.post(
        REGISTER_URL,
        {"email": "zayif@example.com", "display_name": "zayif_sifre", "password": "1234"},
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_register_rejects_invalid_display_name_format(api, db):
    response = api.post(
        REGISTER_URL,
        {"email": "gecersiz@example.com", "display_name": "a b!", "password": "cok-gizli-123"},
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


# --------------------------------------------------------------------------
# Giris
# --------------------------------------------------------------------------


def test_login_with_correct_credentials_returns_tokens(api, existing_user):
    response = api.post(LOGIN_URL, {"email": "mert@example.com", "password": "cok-gizli-123"})

    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data
    assert "refresh" in response.data
    assert response.data["user"]["display_name"] == "mert"


def test_login_with_wrong_password_is_rejected(api, existing_user):
    response = api.post(LOGIN_URL, {"email": "mert@example.com", "password": "yanlis-sifre"})

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_with_unknown_email_is_rejected(api, db):
    response = api.post(LOGIN_URL, {"email": "yok@example.com", "password": "her-sey-123"})

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# --------------------------------------------------------------------------
# Token yenileme ve cikis
# --------------------------------------------------------------------------


def test_refresh_returns_a_new_access_token(api, existing_user):
    login = api.post(LOGIN_URL, {"email": "mert@example.com", "password": "cok-gizli-123"})
    refresh_token = login.data["refresh"]

    response = api.post(REFRESH_URL, {"refresh": refresh_token})

    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data


def test_refresh_with_invalid_token_is_rejected(api, db):
    response = api.post(REFRESH_URL, {"refresh": "gecersiz-token"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_logout_blacklists_refresh_token(api, existing_user):
    login = api.post(LOGIN_URL, {"email": "mert@example.com", "password": "cok-gizli-123"})
    access_token, refresh_token = login.data["access"], login.data["refresh"]

    api.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    logout_response = api.post(LOGOUT_URL, {"refresh": refresh_token})
    assert logout_response.status_code == status.HTTP_204_NO_CONTENT

    # Kara listeye alinmis token bir daha yenileme icin kullanilamaz.
    api.credentials()
    refresh_response = api.post(REFRESH_URL, {"refresh": refresh_token})
    assert refresh_response.status_code == status.HTTP_401_UNAUTHORIZED


def test_logout_requires_authentication(api, existing_user):
    response = api.post(LOGOUT_URL, {"refresh": "herhangi-bir-sey"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# --------------------------------------------------------------------------
# Profil
# --------------------------------------------------------------------------


def test_me_requires_authentication(api, db):
    response = api.get(ME_URL)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_me_returns_current_user(api, existing_user):
    login = api.post(LOGIN_URL, {"email": "mert@example.com", "password": "cok-gizli-123"})
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    response = api.get(ME_URL)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["display_name"] == "mert"
    assert response.data["email"] == "mert@example.com"


def test_me_can_update_display_name(api, existing_user):
    login = api.post(LOGIN_URL, {"email": "mert@example.com", "password": "cok-gizli-123"})
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    response = api.patch(ME_URL, {"display_name": "yeni_ad"})

    assert response.status_code == status.HTTP_200_OK
    existing_user.refresh_from_db()
    assert existing_user.display_name == "yeni_ad"


def test_me_cannot_update_email(api, existing_user):
    login = api.post(LOGIN_URL, {"email": "mert@example.com", "password": "cok-gizli-123"})
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    response = api.patch(ME_URL, {"email": "baska@example.com"})

    assert response.status_code == status.HTTP_200_OK
    existing_user.refresh_from_db()
    assert existing_user.email == "mert@example.com"


def test_me_rejects_taken_display_name(api, existing_user):
    User.objects.create_user(
        email="baska@example.com", display_name="baska_ad", password="x123456789"
    )
    login = api.post(LOGIN_URL, {"email": "mert@example.com", "password": "cok-gizli-123"})
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    response = api.patch(ME_URL, {"display_name": "baska_ad"})

    assert response.status_code == status.HTTP_400_BAD_REQUEST
