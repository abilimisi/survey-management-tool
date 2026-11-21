from rest_framework.permissions import BasePermission
from django.utils import timezone
from django.db.models import Q
from core.models import DIYAdminAccessGrant

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )
        
class HasDIYAdminAccess(BasePermission):
    """
    Allows access to:
    1. Permanent Django Super Admins
    2. Internal users with an active DIY Admin access grant

    Does not modify permanent user roles or superuser status.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Permanent Super Admin always has access
        if user.is_superuser:
            return True

        now = timezone.now()

        # Check for an active, non-revoked, non-expired DIY Admin grant
        return DIYAdminAccessGrant.objects.filter(
            user=user,
            is_active=True,
            revoked_at__isnull=True
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=now)
        ).exists()