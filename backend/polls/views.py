"""Anket ve oylama gorunumleri (§5.2, §5.3)."""

from datetime import timedelta

from django.db import IntegrityError, transaction
from django.db.models import Case, Count, IntegerField, Prefetch, Value, When
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from config.exceptions import AlreadyVotedError, PollClosedError, ValidationAPIError

from .models import Option, Poll, Vote
from .permissions import IsOwnerOrReadOnly
from .serializers import PollCloseSerializer, PollCreateSerializer, PollSerializer, VoteSerializer
from .utils import get_client_ip, hash_ip

HOT_WINDOW = timedelta(days=7)


class VoteThrottle(ScopedRateThrottle):
    """Oy uctan oy spamini sinirlar (§7)."""

    scope = "vote"


class PollViewSet(viewsets.ModelViewSet):
    """`/polls/` altindaki tum uc noktalar (liste, detay, olustur, kapat, sil, oyla, mine)."""

    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    lookup_field = "id"

    def get_queryset(self):
        queryset = (
            Poll.objects.with_vote_counts()
            .select_related("author")
            .prefetch_related(
                Prefetch(
                    "options",
                    queryset=Option.objects.annotate(vote_count=Count("votes")).order_by("order"),
                ),
                "votes",
            )
        )

        status_param = self.request.query_params.get("status")
        if status_param in ("open", "closed"):
            queryset = queryset.filter(status=status_param)

        return self._sorted(queryset)

    def _sorted(self, queryset):
        sort = self.request.query_params.get("sort", "new")
        if sort == "top":
            return queryset.order_by("-total_votes", "-created_at")
        if sort == "hot":
            cutoff = timezone.now() - HOT_WINDOW
            return queryset.annotate(
                is_recent=Case(
                    When(created_at__gte=cutoff, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            ).order_by("-is_recent", "-total_votes", "-created_at")
        return queryset.order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "create":
            return PollCreateSerializer
        if self.action == "partial_update":
            return PollCloseSerializer
        return PollSerializer

    def get_permissions(self):
        if self.action == "vote":
            # Oy vermek herkese acik (§1.1); throttle ayri olarak siki tutulur.
            return [permissions.AllowAny()]
        if self.action == "mine":
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_throttles(self):
        if self.action == "vote":
            return [VoteThrottle()]
        return super().get_throttles()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        poll = serializer.save()

        poll = self.get_queryset().get(pk=poll.pk)
        return Response(
            PollSerializer(poll, context=self.get_serializer_context()).data, status=201
        )

    def partial_update(self, request, *args, **kwargs):
        poll = self.get_object()
        serializer = self.get_serializer(poll, data=request.data)
        serializer.is_valid(raise_exception=True)
        poll = serializer.save()

        poll = self.get_queryset().get(pk=poll.pk)
        return Response(PollSerializer(poll, context=self.get_serializer_context()).data)

    def update(self, request, *args, **kwargs):
        # Tam guncelleme (PUT) desteklenmiyor; yalnizca PATCH ile kapatma var.
        raise ValidationAPIError("Sadece kismi guncelleme (PATCH) desteklenir.")

    @action(detail=True, methods=["post"])
    def vote(self, request, id=None):
        poll = self.get_object()

        if not poll.is_open:
            raise PollClosedError

        serializer = VoteSerializer(data=request.data, context={"poll": poll})
        serializer.is_valid(raise_exception=True)
        option_id = serializer.validated_data["option_id"]

        vote_kwargs = {"poll": poll, "option_id": option_id}
        if request.user.is_authenticated:
            # Uyeler ziyaretci oyuna kapali anketlerde de her zaman oy verebilir.
            vote_kwargs["user"] = request.user
        else:
            if not poll.allow_guest_votes:
                raise ValidationAPIError(
                    "Bu ankete oy vermek icin uye olman gerekiyor.", code="MEMBERS_ONLY"
                )
            vote_kwargs["voter_token"] = request.voter_token

        ip = get_client_ip(request)
        vote_kwargs["ip_hash"] = hash_ip(ip)

        try:
            with transaction.atomic():
                Vote.objects.create(**vote_kwargs)
        except IntegrityError as exc:
            raise AlreadyVotedError from exc

        poll = self.get_queryset().get(pk=poll.pk)
        return Response(
            PollSerializer(poll, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"])
    def mine(self, request):
        queryset = self._sorted(self.get_queryset().filter(author=request.user))
        page = self.paginate_queryset(queryset)
        serializer = PollSerializer(page, many=True, context=self.get_serializer_context())
        return self.get_paginated_response(serializer.data)
