
from django.db import transaction

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .client_portal_auth import ClientPortalJWTAuthentication
from .client_portal_serializers import (
    ClientPortalLoginSerializer,
    ClientPortalRegistrationSerializer,
)
from ..models import DIYCompanyMembership


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
        print("CONTENT LENGTH:", request.META.get("CONTENT_LENGTH"))
        print("RAW BODY:", request.body.decode("utf-8", errors="replace"))
        print("PARSED DATA:", request.data)
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
        except Exception:
            # Log the exception server-side in production.
            # Avoid returning internal database details to clients.
            return Response(
                {"error": "Registration could not be completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Account created successfully.",
                **client_token_response(client_user),
                "email_verified": client_user.is_email_verified,
            },
            status=status.HTTP_201_CREATED,
        )


class ClientPortalLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ClientPortalLoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        client_user = serializer.validated_data["client_user"]

        return Response(
            client_token_response(client_user),
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
                "id": membership.company_id,
                "name": membership.company.name,
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
