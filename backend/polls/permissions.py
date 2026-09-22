from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Sadece anketin sahibi yazabilir; herkes okuyabilir (§5.2)."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author_id == request.user.id
