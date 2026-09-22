"""Model seviyesi kurallar.

Buradaki testler veritabani kisitlarini dogruluyor - serializer veya
view katmani devre disi olsa bile bu kurallarin tutmasi gerekir.
"""

import uuid

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils import timezone

from polls.models import Option, Poll, PollStatus, Vote

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="ayse@example.com", display_name="ayse", password="cok-gizli-123"
    )


@pytest.fixture
def poll(user):
    poll = Poll.objects.create(question="Aksam ne yesek?", author=user)
    Option.objects.create(poll=poll, text="Pizza", order=0)
    Option.objects.create(poll=poll, text="Manti", order=1)
    return poll


# --------------------------------------------------------------------------
# Kullanici
# --------------------------------------------------------------------------


def test_user_is_created_with_email_as_login(user):
    assert user.email == "ayse@example.com"
    assert user.check_password("cok-gizli-123")
    assert str(user) == "ayse"


def test_duplicate_email_is_rejected(user):
    with pytest.raises(IntegrityError):
        User.objects.create_user(
            email="ayse@example.com", display_name="baska", password="cok-gizli-123"
        )


def test_duplicate_display_name_is_rejected(user):
    with pytest.raises(IntegrityError):
        User.objects.create_user(
            email="baska@example.com", display_name="ayse", password="cok-gizli-123"
        )


def test_user_without_email_is_rejected(db):
    with pytest.raises(ValueError):
        User.objects.create_user(email="", display_name="kimse", password="cok-gizli-123")


# --------------------------------------------------------------------------
# Anket
# --------------------------------------------------------------------------


def test_poll_defaults_to_open_with_a_closing_date(poll):
    assert poll.status == PollStatus.OPEN
    assert poll.is_open
    assert poll.closes_at > timezone.now()


def test_expired_poll_is_not_open(poll):
    poll.closes_at = timezone.now() - timezone.timedelta(minutes=1)
    poll.save(update_fields=["closes_at"])
    assert poll.status == PollStatus.OPEN
    assert not poll.is_open


def test_closing_a_poll_sets_status(poll):
    poll.close()
    poll.refresh_from_db()
    assert poll.status == PollStatus.CLOSED
    assert not poll.is_open


def test_option_order_is_unique_within_a_poll(poll):
    with pytest.raises(IntegrityError):
        Option.objects.create(poll=poll, text="Salata", order=0)


# --------------------------------------------------------------------------
# Oy — mukerrer oy kisitlari (§4.4)
# --------------------------------------------------------------------------


def test_member_cannot_vote_twice_on_the_same_poll(poll, user):
    options = list(poll.options.all())
    Vote.objects.create(poll=poll, option=options[0], user=user)

    with pytest.raises(IntegrityError), transaction.atomic():
        Vote.objects.create(poll=poll, option=options[1], user=user)


def test_guest_token_cannot_vote_twice_on_the_same_poll(poll):
    token = uuid.uuid4()
    options = list(poll.options.all())
    Vote.objects.create(poll=poll, option=options[0], voter_token=token)

    with pytest.raises(IntegrityError), transaction.atomic():
        Vote.objects.create(poll=poll, option=options[1], voter_token=token)


def test_different_guests_can_vote_on_the_same_poll(poll):
    option = poll.options.first()
    Vote.objects.create(poll=poll, option=option, voter_token=uuid.uuid4())
    Vote.objects.create(poll=poll, option=option, voter_token=uuid.uuid4())
    assert poll.votes.count() == 2


def test_member_can_vote_on_two_different_polls(poll, user):
    other = Poll.objects.create(question="Hafta sonu nereye?", author=user)
    other_option = Option.objects.create(poll=other, text="Sahil", order=0)

    Vote.objects.create(poll=poll, option=poll.options.first(), user=user)
    Vote.objects.create(poll=other, option=other_option, user=user)

    assert Vote.objects.filter(user=user).count() == 2


def test_vote_without_any_identity_is_rejected(poll):
    with pytest.raises(IntegrityError), transaction.atomic():
        Vote.objects.create(poll=poll, option=poll.options.first())


def test_deleting_a_poll_removes_its_options_and_votes(poll, user):
    Vote.objects.create(poll=poll, option=poll.options.first(), user=user)
    poll_id = poll.id
    poll.delete()

    assert not Option.objects.filter(poll_id=poll_id).exists()
    assert not Vote.objects.filter(poll_id=poll_id).exists()
