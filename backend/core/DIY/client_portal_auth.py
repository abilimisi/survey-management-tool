
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

from ..models import ClientPortalUser


class ClientPortalAccessToken(AccessToken):
    """
    Token type dedicated to client portal accounts.

    Internal staff JWT authentication expects a standard access
    token, so it will reject this client-specific token type.
    """

    token_type = "client_access"

    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)

        token["client_portal_user_id"] = str(user.pk)

        # Include the token version when one has been assigned.
        if user.token_version:
            token["client_token_version"] = str(
                user.token_version
            )

        return token


class ClientPortalJWTAuthentication(BaseAuthentication):
    """
    Authenticate external clients without using Django's internal User model.
    """

    def authenticate(self, request):
        header = request.headers.get("Authorization", "")

        if not header:
            return None

        parts = header.split()

        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise AuthenticationFailed(
                "Invalid authorization header."
            )

        raw_token = parts[1]

        try:
            token = ClientPortalAccessToken(raw_token)
        except TokenError:
            raise AuthenticationFailed(
                "Invalid or expired client portal token."
            )

        client_user_id = token.get("client_portal_user_id")

        if not client_user_id:
            raise AuthenticationFailed(
                "Client portal token is missing its user identifier."
            )

        try:
            client_user = ClientPortalUser.objects.get(
                pk=client_user_id,
                is_active=True,
            )
        except ClientPortalUser.DoesNotExist:
            raise AuthenticationFailed(
                "Client portal account is inactive or does not exist."
            )

        # Reject tokens issued before the most recent password reset.
        if client_user.token_version is not None:
            token_version = token.get("client_token_version")

            if token_version != str(client_user.token_version):
                raise AuthenticationFailed(
                    "Your session is no longer valid. Please sign in again."
                )

        return (client_user, token)

    def authenticate_header(self, request):
        return "Bearer"
