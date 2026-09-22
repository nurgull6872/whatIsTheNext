"""Anket, secenek ve oy modelleri (§4.2-§4.4)."""

import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


def default_closes_at():
    return timezone.now() + timedelta(days=settings.POLL_DEFAULT_DURATION_DAYS)


class PollStatus(models.TextChoices):
    OPEN = "open", _("acik")
    CLOSED = "closed", _("kapali")


class PollQuerySet(models.QuerySet):
    def open(self):
        return self.filter(status=PollStatus.OPEN)

    def with_vote_counts(self):
        return self.annotate(total_votes=models.Count("votes", distinct=True))


class Poll(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.CharField(_("soru"), max_length=200)
    description = models.TextField(_("aciklama"), max_length=500, blank=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="polls",
        verbose_name=_("olusturan"),
    )
    status = models.CharField(
        _("durum"),
        max_length=8,
        choices=PollStatus.choices,
        default=PollStatus.OPEN,
    )
    created_at = models.DateTimeField(_("olusturulma"), default=timezone.now, editable=False)
    closes_at = models.DateTimeField(_("kapanis"), null=True, blank=True, default=default_closes_at)
    allow_guest_votes = models.BooleanField(
        _("ziyaretci oyuna acik"),
        default=True,
        help_text=_("Kapatilirsa yalnizca uyeler oy verebilir."),
    )

    objects = PollQuerySet.as_manager()

    class Meta:
        verbose_name = _("anket")
        verbose_name_plural = _("anketler")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["status", "-created_at"]),
        ]

    def __str__(self):
        return self.question

    @property
    def is_expired(self):
        return self.closes_at is not None and self.closes_at <= timezone.now()

    @property
    def is_open(self):
        """Suresi dolmus anket kayit kapali olmasa da oy kabul etmez."""
        return self.status == PollStatus.OPEN and not self.is_expired

    def close(self):
        if self.status != PollStatus.CLOSED:
            self.status = PollStatus.CLOSED
            self.save(update_fields=["status"])


class Option(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    poll = models.ForeignKey(
        Poll,
        on_delete=models.CASCADE,
        related_name="options",
        verbose_name=_("anket"),
    )
    text = models.CharField(_("secenek"), max_length=120)
    order = models.PositiveSmallIntegerField(_("sira"), default=0)

    class Meta:
        verbose_name = _("secenek")
        verbose_name_plural = _("secenekler")
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(fields=["poll", "order"], name="uniq_option_order_per_poll"),
        ]

    def __str__(self):
        return self.text


class Vote(models.Model):
    """Tek bir oy.

    Uye oyunda `user` dolu, ziyaretci oyunda `voter_token` dolu olur;
    ikisi birden bos olamaz (§4.4). `poll` alani `option.poll` ile ayni
    veriyi tutar ama benzersizlik kisiti ve sayim icin denormalize edilmistir.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    poll = models.ForeignKey(
        Poll,
        on_delete=models.CASCADE,
        related_name="votes",
        verbose_name=_("anket"),
    )
    option = models.ForeignKey(
        Option,
        on_delete=models.CASCADE,
        related_name="votes",
        verbose_name=_("secenek"),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="votes",
        null=True,
        blank=True,
        verbose_name=_("uye"),
    )
    voter_token = models.UUIDField(_("ziyaretci anahtari"), null=True, blank=True)
    ip_hash = models.CharField(_("ip ozeti"), max_length=64, blank=True)
    created_at = models.DateTimeField(_("olusturulma"), default=timezone.now, editable=False)

    class Meta:
        verbose_name = _("oy")
        verbose_name_plural = _("oylar")
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["poll", "user"],
                condition=models.Q(user__isnull=False),
                name="uniq_vote_per_user",
            ),
            models.UniqueConstraint(
                fields=["poll", "voter_token"],
                condition=models.Q(voter_token__isnull=False),
                name="uniq_vote_per_token",
            ),
            models.CheckConstraint(
                condition=models.Q(user__isnull=False) | models.Q(voter_token__isnull=False),
                name="vote_has_identity",
            ),
        ]
        indexes = [
            models.Index(fields=["poll", "created_at"]),
            models.Index(fields=["ip_hash", "created_at"]),
        ]

    def __str__(self):
        who = self.user.display_name if self.user else "ziyaretci"
        return f"{who} -> {self.option.text}"
