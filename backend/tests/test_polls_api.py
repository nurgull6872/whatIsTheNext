"""Anket olusturma, oylama ve yetki senaryolari (§5.2, §10.1)."""

import uuid

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from polls.models import Option, Poll, Vote

User = get_user_model()

POLLS_URL = "/api/v1/polls/"


def poll_detail_url(poll_id):
    return f"{POLLS_URL}{poll_id}/"


def poll_vote_url(poll_id):
    return f"{POLLS_URL}{poll_id}/vote/"


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def author(db):
    return User.objects.create_user(
        email="ayse@example.com", display_name="ayse", password="cok-gizli-123"
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        email="mert@example.com", display_name="mert", password="cok-gizli-123"
    )


@pytest.fixture
def auth_client(api, author):
    api.force_authenticate(user=author)
    return api


@pytest.fixture
def poll(author):
    poll = Poll.objects.create(question="Aksam ne yesek?", author=author)
    Option.objects.create(poll=poll, text="Pizza", order=0)
    Option.objects.create(poll=poll, text="Manti", order=1)
    return poll


# --------------------------------------------------------------------------
# Olusturma — yetki ve secenek sayisi kurallari
# --------------------------------------------------------------------------


def test_guest_cannot_create_a_poll(api, db):
    response = api.post(
        POLLS_URL,
        {"question": "Hafta sonu nereye?", "options": [{"text": "Sahil"}, {"text": "Dag"}]},
        format="json",
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_member_can_create_a_poll_with_valid_options(auth_client):
    response = auth_client.post(
        POLLS_URL,
        {
            "question": "Hafta sonu nereye?",
            "options": [{"text": "Sahil"}, {"text": "Dag"}, {"text": "Ev"}],
        },
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["question"] == "Hafta sonu nereye?"
    assert len(response.data["options"]) == 3
    assert response.data["author"]["display_name"] == "ayse"


def test_poll_with_a_single_option_is_rejected(auth_client):
    response = auth_client.post(
        POLLS_URL,
        {"question": "Tek secenek", "options": [{"text": "Sadece bu"}]},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_poll_with_six_options_is_rejected(auth_client):
    options = [{"text": f"Secenek {i}"} for i in range(6)]
    response = auth_client.post(
        POLLS_URL, {"question": "Cok secenekli", "options": options}, format="json"
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_poll_with_duplicate_option_text_is_rejected(auth_client):
    response = auth_client.post(
        POLLS_URL,
        {"question": "Ayni secenek", "options": [{"text": "Pizza"}, {"text": "pizza"}]},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# --------------------------------------------------------------------------
# Detay ve liste
# --------------------------------------------------------------------------


def test_anyone_can_view_poll_list(api, poll):
    response = api.get(POLLS_URL)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1


def test_anyone_can_view_poll_detail(api, poll):
    response = api.get(poll_detail_url(poll.id))
    assert response.status_code == status.HTTP_200_OK
    assert response.data["question"] == poll.question
    assert response.data["total_votes"] == 0
    assert response.data["my_vote"] is None


def test_list_can_be_filtered_by_status(api, poll):
    closed_poll = Poll.objects.create(question="Kapali anket", author=poll.author, status="closed")
    Option.objects.create(poll=closed_poll, text="A", order=0)
    Option.objects.create(poll=closed_poll, text="B", order=1)

    response = api.get(POLLS_URL, {"status": "closed"})

    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == str(closed_poll.id)


# --------------------------------------------------------------------------
# Oylama — §10.1 kritik senaryolar
# --------------------------------------------------------------------------


def test_guest_can_vote(api, poll):
    option = poll.options.first()
    response = api.post(poll_vote_url(poll.id), {"option_id": str(option.id)}, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["total_votes"] == 1
    assert Vote.objects.filter(poll=poll, option=option, user__isnull=True).exists()


def test_member_can_vote(auth_client, poll, other_user):
    api = auth_client
    api.force_authenticate(user=other_user)
    option = poll.options.first()

    response = api.post(poll_vote_url(poll.id), {"option_id": str(option.id)}, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert Vote.objects.filter(poll=poll, user=other_user).exists()


def test_member_cannot_vote_twice(api, poll, other_user):
    api.force_authenticate(user=other_user)
    option = poll.options.first()

    first = api.post(poll_vote_url(poll.id), {"option_id": str(option.id)}, format="json")
    second = api.post(poll_vote_url(poll.id), {"option_id": str(option.id)}, format="json")

    assert first.status_code == status.HTTP_201_CREATED
    assert second.status_code == status.HTTP_409_CONFLICT
    assert second.data["error"]["code"] == "ALREADY_VOTED"


def test_guest_cannot_vote_twice_with_the_same_browser(api, poll):
    """DRF test client cerezleri istekler arasinda korur; ayni voter_token kullanilir."""
    option = poll.options.first()

    first = api.post(poll_vote_url(poll.id), {"option_id": str(option.id)}, format="json")
    second = api.post(poll_vote_url(poll.id), {"option_id": str(option.id)}, format="json")

    assert first.status_code == status.HTTP_201_CREATED
    assert second.status_code == status.HTTP_409_CONFLICT


def test_different_guest_tokens_can_both_vote(poll):
    option = poll.options.first()

    first_client = APIClient()
    second_client = APIClient()

    first = first_client.post(poll_vote_url(poll.id), {"option_id": str(option.id)}, format="json")
    second = second_client.post(
        poll_vote_url(poll.id), {"option_id": str(option.id)}, format="json"
    )

    assert first.status_code == status.HTTP_201_CREATED
    assert second.status_code == status.HTTP_201_CREATED
    assert poll.votes.count() == 2


def test_voting_on_a_closed_poll_is_rejected(api, poll):
    poll.close()
    option = poll.options.first()

    response = api.post(poll_vote_url(poll.id), {"option_id": str(option.id)}, format="json")

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.data["error"]["code"] == "POLL_CLOSED"


def test_voting_on_an_expired_poll_is_rejected(api, poll):
    poll.closes_at = timezone.now() - timezone.timedelta(minutes=1)
    poll.save(update_fields=["closes_at"])
    option = poll.options.first()

    response = api.post(poll_vote_url(poll.id), {"option_id": str(option.id)}, format="json")

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_voting_for_an_option_from_another_poll_is_rejected(api, poll, author):
    other_poll = Poll.objects.create(question="Baska anket", author=author)
    other_option = Option.objects.create(poll=other_poll, text="X", order=0)

    response = api.post(poll_vote_url(poll.id), {"option_id": str(other_option.id)}, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_voting_on_a_member_only_poll_requires_authentication(api, author):
    poll = Poll.objects.create(question="Sadece uyeler", author=author, allow_guest_votes=False)
    option = Option.objects.create(poll=poll, text="Evet", order=0)
    Option.objects.create(poll=poll, text="Hayir", order=1)

    response = api.post(poll_vote_url(poll.id), {"option_id": str(option.id)}, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_my_vote_reflects_the_chosen_option(api, poll):
    option = poll.options.first()
    api.post(poll_vote_url(poll.id), {"option_id": str(option.id)}, format="json")

    response = api.get(poll_detail_url(poll.id))

    assert str(response.data["my_vote"]) == str(option.id)


def test_vote_with_unknown_option_id_returns_validation_error(api, poll):
    response = api.post(poll_vote_url(poll.id), {"option_id": str(uuid.uuid4())}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# --------------------------------------------------------------------------
# Kapatma ve silme — yalnizca sahibi
# --------------------------------------------------------------------------


def test_owner_can_close_their_poll(auth_client, poll):
    response = auth_client.patch(poll_detail_url(poll.id), {"status": "closed"}, format="json")

    assert response.status_code == status.HTTP_200_OK
    poll.refresh_from_db()
    assert poll.status == "closed"


def test_non_owner_cannot_close_a_poll(api, poll, other_user):
    api.force_authenticate(user=other_user)
    response = api.patch(poll_detail_url(poll.id), {"status": "closed"}, format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_guest_cannot_close_a_poll(api, poll):
    response = api.patch(poll_detail_url(poll.id), {"status": "closed"}, format="json")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_owner_can_delete_their_poll(auth_client, poll):
    response = auth_client.delete(poll_detail_url(poll.id))
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Poll.objects.filter(id=poll.id).exists()


def test_non_owner_cannot_delete_a_poll(api, poll, other_user):
    api.force_authenticate(user=other_user)
    response = api.delete(poll_detail_url(poll.id))
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Poll.objects.filter(id=poll.id).exists()


# --------------------------------------------------------------------------
# /polls/mine/
# --------------------------------------------------------------------------


def test_mine_requires_authentication(api, poll):
    response = api.get(f"{POLLS_URL}mine/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_mine_returns_only_the_authors_polls(auth_client, poll, other_user):
    other_poll = Poll.objects.create(question="Baskasinin anketi", author=other_user)
    Option.objects.create(poll=other_poll, text="A", order=0)
    Option.objects.create(poll=other_poll, text="B", order=1)

    response = auth_client.get(f"{POLLS_URL}mine/")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == str(poll.id)
