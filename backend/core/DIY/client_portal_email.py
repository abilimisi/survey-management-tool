
import hashlib
import secrets
from datetime import timedelta
from urllib.parse import urlencode

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from ..models import ClientPortalAuthToken


TOKEN_EXPIRY_MINUTES = 30


def create_client_auth_token(user, purpose):
    """
    Create a secure, single-use token.
    Only the SHA-256 hash is stored in the database.
    """

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    # Invalidate previous unused tokens of the same purpose.
    ClientPortalAuthToken.objects.filter(
        user=user,
        purpose=purpose,
        used_at__isnull=True,
    ).update(used_at=timezone.now())

    ClientPortalAuthToken.objects.create(
        user=user,
        purpose=purpose,
        token_hash=token_hash,
        expires_at=timezone.now() + timedelta(
            minutes=TOKEN_EXPIRY_MINUTES
        ),
    )

    return raw_token


def validate_client_auth_token(raw_token, purpose):
    if not raw_token:
        return None

    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    auth_token = (
        ClientPortalAuthToken.objects
        .select_related("user")
        .filter(
            token_hash=token_hash,
            purpose=purpose,
            used_at__isnull=True,
            expires_at__gt=timezone.now(),
            user__is_active=True,
        )
        .first()
    )

    return auth_token


def send_client_auth_email(user, purpose, raw_token):
    frontend_url = settings.CLIENT_PORTAL_FRONTEND_URL.rstrip("/")

    if purpose == "email_verification":
        page_url = f"{frontend_url}/client-portal/verify-email"
        subject = "Verify your Opinion Bunch client account"
        action = "Verify email address"
        message = (
            "Please verify your email address to activate "
            "your Opinion Bunch client portal account."
        )
    elif purpose == "password_reset":
        page_url = f"{frontend_url}/client-portal/reset-password"
        subject = "Reset your Opinion Bunch password"
        action = "Reset password"
        message = (
            "We received a request to reset your "
            "Opinion Bunch client portal password."
        )
    else:
        raise ValueError("Unsupported authentication email purpose.")

    link = f"{page_url}?{urlencode({'token': raw_token})}"

    body = (
        f"Hello {user.first_name},\n\n"
        f"{message}\n\n"
        f"{action}:\n{link}\n\n"
        f"This link expires in {TOKEN_EXPIRY_MINUTES} minutes.\n\n"
        "If you did not request this, you can ignore this email.\n\n"
        "Opinion Bunch"
    )

    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
