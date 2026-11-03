
from datetime import timedelta

from django.utils import timezone
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from .models import RevokedAccessToken, ActiveLoginSession


IDLE_TIMEOUT = timedelta(minutes=5)
ABSOLUTE_SESSION_TIMEOUT = timedelta(hours=8)


class RevocableJWTAuthentication(JWTAuthentication):

    def authenticate(self, request):
        result = super().authenticate(request)

        if result is None:
            return None

        user, validated_token = result

        token_jti = validated_token.get("jti")

        if not token_jti:
            raise AuthenticationFailed("Invalid token.")

        if RevokedAccessToken.objects.filter(jti=token_jti).exists():
            raise AuthenticationFailed("Token has been revoked.")

        session_id = validated_token.get("session_id")

        if not session_id:
            raise AuthenticationFailed("Invalid login session.")

        active_session = ActiveLoginSession.objects.filter(
            user=user,
            session_id=session_id
        ).first()

        if not active_session:
            raise AuthenticationFailed(
                "Your login session is no longer active. Please log in again."
            )

        now = timezone.now()

        # Check the absolute eight-hour session lifetime.
        if now >= active_session.created_at + ABSOLUTE_SESSION_TIMEOUT:
            active_session.delete()
            raise AuthenticationFailed(
                "Your session has expired. Please log in again."
            )

        # Check the five-minute inactivity timeout.
        if now >= active_session.last_seen_at + IDLE_TIMEOUT:
            active_session.delete()
            raise AuthenticationFailed(
                "Your session expired due to inactivity. Please log in again."
            )

        return user, validated_token
