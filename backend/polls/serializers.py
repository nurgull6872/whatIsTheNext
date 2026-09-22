"""Anket, secenek ve oy serializer'lari (§5.2, §5.4)."""

from django.conf import settings
from django.utils import timezone
from rest_framework import serializers

from accounts.serializers import PublicAuthorSerializer

from .models import Option, Poll


class PollSerializer(serializers.ModelSerializer):
    """Liste ve detay yanitlarinda kullanilan okuma serializer'i (§5.4)."""

    author = PublicAuthorSerializer(read_only=True)
    total_votes = serializers.SerializerMethodField()
    options = serializers.SerializerMethodField()
    my_vote = serializers.SerializerMethodField()
    is_open = serializers.BooleanField(read_only=True)

    class Meta:
        model = Poll
        fields = [
            "id",
            "question",
            "description",
            "author",
            "status",
            "is_open",
            "created_at",
            "closes_at",
            "allow_guest_votes",
            "total_votes",
            "my_vote",
            "options",
        ]
        read_only_fields = fields

    def get_total_votes(self, obj):
        return getattr(obj, "total_votes", None) or obj.votes.count()

    def get_options(self, obj):
        total = self.get_total_votes(obj)
        result = []
        for option in obj.options.all():
            vote_count = getattr(option, "vote_count", None)
            if vote_count is None:
                vote_count = option.votes.count()
            percentage = round(vote_count / total * 100, 1) if total else 0.0
            result.append(
                {
                    "id": option.id,
                    "text": option.text,
                    "order": option.order,
                    "vote_count": vote_count,
                    "percentage": percentage,
                }
            )
        return result

    def get_my_vote(self, obj):
        request = self.context.get("request")
        if request is None:
            return None

        if request.user.is_authenticated:
            vote = next((v for v in obj.votes.all() if v.user_id == request.user.id), None)
        else:
            token = getattr(request, "voter_token", None)
            vote = (
                next((v for v in obj.votes.all() if v.voter_token == token), None)
                if token
                else None
            )

        return vote.option_id if vote else None


class OptionInputSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=120, allow_blank=False, trim_whitespace=True)


class PollCreateSerializer(serializers.ModelSerializer):
    """POST /polls/ govdesi. Cikti icin PollSerializer'a cevrilir (§5.2)."""

    options = OptionInputSerializer(many=True)

    class Meta:
        model = Poll
        fields = ["question", "description", "options", "closes_at"]

    def validate_options(self, value):
        min_n, max_n = settings.POLL_MIN_OPTIONS, settings.POLL_MAX_OPTIONS
        if not (min_n <= len(value) <= max_n):
            raise serializers.ValidationError(
                f"Bir anket en az {min_n}, en fazla {max_n} secenege sahip olmalidir."
            )

        texts = [item["text"].strip().lower() for item in value]
        if len(set(texts)) != len(texts):
            raise serializers.ValidationError("Secenekler birbirinden farkli olmalidir.")

        return value

    def validate_closes_at(self, value):
        if value is not None and value <= timezone.now():
            raise serializers.ValidationError("Kapanis tarihi gelecekte olmalidir.")
        return value

    def create(self, validated_data):
        options_data = validated_data.pop("options")
        request = self.context["request"]

        poll = Poll.objects.create(author=request.user, **validated_data)
        Option.objects.bulk_create(
            [
                Option(poll=poll, text=item["text"].strip(), order=index)
                for index, item in enumerate(options_data)
            ]
        )
        return poll


class PollCloseSerializer(serializers.Serializer):
    """PATCH /polls/{id}/ govdesi. Yalnizca kapatmaya izin verir (§5.2)."""

    status = serializers.ChoiceField(choices=["closed"])

    def save(self):
        self.instance.close()
        return self.instance


class VoteSerializer(serializers.Serializer):
    option_id = serializers.UUIDField()

    def validate_option_id(self, value):
        poll = self.context["poll"]
        if not poll.options.filter(id=value).exists():
            raise serializers.ValidationError("Bu secenek bu ankete ait degil.")
        return value
