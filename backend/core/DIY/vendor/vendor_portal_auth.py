
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

from ...models import VendorPortalUser


class VendorPortalAccessToken(AccessToken):
    token_type = "vendor_access"

    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        token["vendor_portal_user_id"] = str(user.pk)
        return token


class VendorPortalJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.headers.get("Authorization", "")

        if not header:
            return None

        parts = header.split()

        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise AuthenticationFailed("Invalid authorization header.")

        try:
            token = VendorPortalAccessToken(parts[1])
        except TokenError:
            raise AuthenticationFailed(
                "Invalid or expired vendor portal token."
            )

        vendor_user_id = token.get("vendor_portal_user_id")

        if not vendor_user_id:
            raise AuthenticationFailed(
                "Vendor portal token is missing its user identifier."
            )

        try:
            vendor_user = VendorPortalUser.objects.get(
                pk=vendor_user_id,
                is_active=True,
            )
        except VendorPortalUser.DoesNotExist:
            raise AuthenticationFailed(
                "Vendor account is inactive or does not exist."
            )

        return (vendor_user, token)

    def authenticate_header(self, request):
        return "Bearer"
