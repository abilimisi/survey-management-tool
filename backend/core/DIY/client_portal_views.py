
from django.db import transaction
import uuid
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .client_portal_auth import ClientPortalJWTAuthentication
from .client_portal_serializers import (
    ClientPortalLoginSerializer,
    ClientPortalRegistrationSerializer,
    DIYCompanyProfileSerializer,
)
from ..models import ClientPortalAuthToken, DIYCompanyMembership, ClientPortalUser


from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone

from .client_portal_email import (
    create_client_auth_token,
    send_client_auth_email,
    validate_client_auth_token,
)


def client_token_response(client_user):
    from .client_portal_auth import ClientPortalAccessToken

    token = ClientPortalAccessToken.for_user(client_user)

    return {
        "access": str(token),
        "user": {
            "id": client_user.pk,
            "email": client_user.email,
            "first_name": client_user.first_name,
            "last_name": client_user.last_name,
        },
    }



class ClientPortalRegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ClientPortalRegistrationSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                client_user = serializer.save()

                raw_token = create_client_auth_token(
                    client_user,
                    "email_verification",
                )

                transaction.on_commit(
                    lambda: send_client_auth_email(
                        client_user,
                        "email_verification",
                        raw_token,
                    ),
                    robust=True,
                )

        except Exception:
            return Response(
                {
                    "error": (
                        "Registration could not be completed. "
                        "Please try again."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": (
                    "Your account has been created. "
                    "Please check your email to verify your account."
                ),
                "email": client_user.email,
                "email_verified": False,
            },
            status=status.HTTP_201_CREATED,
        )


class ClientPortalLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ClientPortalLoginSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        client_user = serializer.validated_data["client_user"]

        if not client_user.is_email_verified:
            return Response(
                {
                    "error": (
                        "Please verify your email address "
                        "before signing in."
                    ),
                    "email_verified": False,
                    "email": client_user.email,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            client_token_response(client_user),
            status=status.HTTP_200_OK,
        )


class ClientPortalVerifyEmailView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        raw_token = request.data.get("token", "")

        auth_token = validate_client_auth_token(
            raw_token,
            "email_verification",
        )

        if auth_token is None:
            return Response(
                {
                    "error": (
                        "This verification link is invalid or expired. "
                        "Please request a new verification email."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        client_user = auth_token.user

        client_user.is_email_verified = True
        client_user.save(update_fields=["is_email_verified", "updated_at"])

        auth_token.used_at = timezone.now()
        auth_token.save(update_fields=["used_at"])

        return Response(
            {
                "message": "Your email has been verified successfully.",
                "email_verified": True,
            },
            status=status.HTTP_200_OK,
        )


class ClientPortalResendVerificationView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response(
                {"error": "Email address is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client_user = ClientPortalUser.objects.filter(
            email__iexact=email,
            is_active=True,
        ).first()

        # Keep the response neutral to avoid exposing account existence.
        if client_user and not client_user.is_email_verified:
            raw_token = create_client_auth_token(
                client_user,
                "email_verification",
            )

            transaction.on_commit(
                lambda: send_client_auth_email(
                    client_user,
                    "email_verification",
                    raw_token,
                ),
                robust=True,
            )

        return Response(
            {
                "message": (
                    "If an unverified account exists for that email, "
                    "a verification link will be sent."
                )
            },
            status=status.HTTP_200_OK,
        )


class ClientPortalPasswordResetRequestView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response(
                {"error": "Email address is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client_user = ClientPortalUser.objects.filter(
            email__iexact=email,
            is_active=True,
            is_email_verified=True,
        ).first()

        if client_user:
            raw_token = create_client_auth_token(
                client_user,
                "password_reset",
            )

            transaction.on_commit(
                lambda: send_client_auth_email(
                    client_user,
                    "password_reset",
                    raw_token,
                ),
                robust=True,
            )

        return Response(
            {
                "message": (
                    "If an eligible account exists for that email, "
                    "a password reset link will be sent."
                )
            },
            status=status.HTTP_200_OK,
        )


class ClientPortalPasswordResetConfirmView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        raw_token = request.data.get("token", "")
        new_password = request.data.get("password", "")

        if not raw_token or not new_password:
            return Response(
                {"error": "Token and new password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        auth_token = validate_client_auth_token(
            raw_token,
            "password_reset",
        )

        if auth_token is None:
            return Response(
                {
                    "error": (
                        "This password reset link is invalid or expired. "
                        "Please request another link."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        client_user = auth_token.user

        try:
            validate_password(new_password, user=client_user)
        except DjangoValidationError as exc:
            return Response(
                {"password": list(exc.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        
        with transaction.atomic():
            client_user.password = make_password(new_password)

            # Rotate the token version to invalidate all previously
            # issued Client portal JWTs.
            client_user.token_version = uuid.uuid4()

            client_user.save(
                update_fields=[
                    "password",
                    "token_version",
                    "updated_at",
                ]
            )

            # Consume all outstanding password-reset links.
            ClientPortalAuthToken.objects.filter(
                user=client_user,
                purpose="password_reset",
                used_at__isnull=True,
            ).update(used_at=timezone.now())


        return Response(
            {
                "message": (
                    "Your password has been reset successfully. "
                    "Please sign in with your new password."
                )
            },
            status=status.HTTP_200_OK,
        )



class ClientPortalMeView(APIView):
    authentication_classes = [ClientPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        client_user = request.user

        memberships = (
            DIYCompanyMembership.objects.filter(
                user=client_user,
                is_active=True,
                company__is_active=True,
            )
            .select_related("company")
            .order_by("company__name")
        )

        companies = [
            {
                **DIYCompanyProfileSerializer(membership.company).data,
                "role": membership.role,
            }
            for membership in memberships
        ]

        return Response(
            {
                "user": {
                    "id": client_user.pk,
                    "email": client_user.email,
                    "first_name": client_user.first_name,
                    "last_name": client_user.last_name,
                },
                "companies": companies,
            },
            status=status.HTTP_200_OK,
        )


class ClientPortalCompanyProfileView(APIView):
    authentication_classes = [ClientPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_membership(self, request, company_id):
        return (
            DIYCompanyMembership.objects
            .select_related("company")
            .filter(
                user=request.user,
                company_id=company_id,
                is_active=True,
                company__is_active=True,
            )
            .first()
        )

    def get(self, request, company_id):
        membership = self.get_membership(request, company_id)

        if membership is None:
            return Response(
                {"error": "You do not have access to this company."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                **DIYCompanyProfileSerializer(
                    membership.company
                ).data,
                "role": membership.role,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request, company_id):
        membership = self.get_membership(request, company_id)

        if membership is None:
            return Response(
                {"error": "You do not have access to this company."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if membership.role != "owner":
            return Response(
                {"error": "Only the company owner can update the profile."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = DIYCompanyProfileSerializer(
            membership.company,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()

        return Response(
            {
                "message": "Company profile updated successfully.",
                "company": {
                    **serializer.data,
                    "role": membership.role,
                },
            },
            status=status.HTTP_200_OK,
        )
