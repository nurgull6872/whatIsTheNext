from django.contrib import admin
from django.db.models import Count
from django.utils.translation import gettext_lazy as _

from .models import Option, Poll, Vote


class OptionInline(admin.TabularInline):
    model = Option
    extra = 2
    max_num = 5
    fields = ("order", "text")
    ordering = ("order",)


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ("question", "author", "status", "vote_count", "created_at", "closes_at")
    list_filter = ("status", "allow_guest_votes", "created_at")
    search_fields = ("question", "description", "author__display_name", "author__email")
    autocomplete_fields = ("author",)
    date_hierarchy = "created_at"
    readonly_fields = ("id", "created_at")
    inlines = [OptionInline]
    actions = ["close_polls"]

    def get_queryset(self, request):
        return (
            super().get_queryset(request).select_related("author").annotate(_votes=Count("votes"))
        )

    @admin.display(description=_("oy"), ordering="_votes")
    def vote_count(self, obj):
        return obj._votes

    @admin.action(description=_("Secili anketleri kapat"))
    def close_polls(self, request, queryset):
        updated = queryset.update(status="closed")
        self.message_user(request, f"{updated} anket kapatildi.")


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ("text", "poll", "order")
    search_fields = ("text", "poll__question")
    autocomplete_fields = ("poll",)
    readonly_fields = ("id",)


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ("poll", "option", "voter", "created_at")
    list_filter = ("created_at",)
    search_fields = ("poll__question", "user__display_name")
    readonly_fields = ("id", "poll", "option", "user", "voter_token", "ip_hash", "created_at")

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("poll", "option", "user")

    @admin.display(description=_("oy veren"))
    def voter(self, obj):
        return obj.user.display_name if obj.user else _("ziyaretci")

    def has_add_permission(self, request):
        # Oylar yalnizca API uzerinden olusur; elle eklemek benzersizlik
        # kisitlarini ve sayimlari bozar.
        return False
