
from django.db import IntegrityError, transaction
from django.db import transaction
from rest_framework.permissions import IsAdminUser

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .vendor_portal_auth import (
    VendorPortalAccessToken,
    VendorPortalJWTAuthentication,
)
from .vendor_portal_serializers import (
    VendorPortalLoginSerializer,
    VendorPortalRegistrationSerializer,
)

from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .vendor_portal_serializers import VendorPortalProfileSerializer

from ...models import Vendor, VendorPortalUser


def vendor_token_response(vendor_user):
    token = VendorPortalAccessToken.for_user(vendor_user)

    return {
        "access": str(token),
        "user": {
            "id": vendor_user.pk,
            "email": vendor_user.email,
            "first_name": vendor_user.first_name,
            "last_name": vendor_user.last_name,
            "application_status": vendor_user.application_status,
        },
    }


class VendorPortalRegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VendorPortalRegistrationSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                vendor_user = serializer.save()
        except IntegrityError:
            return Response(
                {"error": "An account with this email may already exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Vendor account created. Complete your profile "
                           "and submit it for admin approval.",
                **vendor_token_response(vendor_user),
            },
            status=status.HTTP_201_CREATED,
        )


class VendorPortalLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VendorPortalLoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        vendor_user = serializer.validated_data["vendor_user"]

        return Response(
            vendor_token_response(vendor_user),
            status=status.HTTP_200_OK,
        )


class VendorPortalMeView(APIView):
    authentication_classes = [VendorPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendor_user = request.user

        return Response(
            {
                "user": {
                    "id": vendor_user.pk,
                    "email": vendor_user.email,
                    "first_name": vendor_user.first_name,
                    "last_name": vendor_user.last_name,
                    "application_status": vendor_user.application_status,
                },
                "vendor_id": vendor_user.vendor_id,
            },
            status=status.HTTP_200_OK,
        )



class VendorPortalProfileView(APIView):
    authentication_classes = [VendorPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = VendorPortalProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        vendor_user = request.user

        # Only rejected applications can be edited after submission.
        if (
            vendor_user.profile_submitted
            and vendor_user.application_status != "rejected"
        ):
            return Response(
                {
                    "error": (
                        "Your submitted profile is read-only. "
                        "You can edit it only if the administrator "
                        "has rejected your application."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = VendorPortalProfileSerializer(
            vendor_user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "Vendor profile saved successfully.",
                "profile": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class VendorPortalSubmitView(APIView):
    authentication_classes = [VendorPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        vendor_user = request.user

        is_initial_submission = (
            vendor_user.application_status == "pending"
            and not vendor_user.profile_submitted
        )

        is_resubmission = (
            vendor_user.application_status == "rejected"
            and vendor_user.profile_submitted
        )

        if not (is_initial_submission or is_resubmission):
            return Response(
                {
                    "error": (
                        "This application cannot be submitted again "
                        "in its current status."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        required_fields = {
            "company_name": "Company name",
            "contact_number": "Contact number",
            "invoice_email": "Invoice email",
            "address": "Address",
            "invoicing_method": "Invoicing method",
            "payment_terms": "Payment terms",
            "city": "City",
            "zip_code": "ZIP/postal code",
            "country": "Country",
            "state": "State",
        }

        missing = [
            label
            for field, label in required_fields.items()
            if not (getattr(vendor_user, field, "") or "").strip()
        ]

        if missing:
            return Response(
                {
                    "error": "Complete all required profile fields.",
                    "missing_fields": missing,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        vendor_user.profile_submitted = True
        vendor_user.application_status = "pending"
        vendor_user.submitted_at = timezone.now()
        vendor_user.admin_note = ""

        vendor_user.save(
            update_fields=[
                "profile_submitted",
                "application_status",
                "submitted_at",
                "admin_note",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": (
                    "Vendor profile resubmitted for admin approval."
                    if is_resubmission
                    else "Vendor profile submitted for admin approval."
                ),
                "application_status": vendor_user.application_status,
                "profile_submitted": vendor_user.profile_submitted,
            },
            status=status.HTTP_200_OK,
        )

class VendorPortalAdminApplicationsView(APIView):
    permission_classes = [IsAdminUser]

    def check_superuser(self, request):
        if not request.user.is_superuser:
            return Response(
                {"error": "Only superusers can review vendor applications."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    def get(self, request, application_id=None):
        denied = self.check_superuser(request)
        if denied:
            return denied

        applications = (
            VendorPortalUser.objects
            .filter(profile_submitted=True)
            .select_related("vendor")
            .order_by("-submitted_at")
        )

        results = []

        for application in applications:
            results.append({
                "id": application.pk,
                "email": application.email,
                "first_name": application.first_name,
                "last_name": application.last_name,
                "company_name": application.company_name,
                "abrv_name": application.abrv_name,
                "contact_number": application.contact_number,
                "invoice_email": application.invoice_email,
                "tax_id": application.tax_id,
                "address": application.address,
                "invoicing_method": application.invoicing_method,
                "payment_terms": application.payment_terms,
                "city": application.city,
                "state": application.state,
                "zip_code": application.zip_code,
                "country": application.country,
                "submitted_at": application.submitted_at,
                "application_status": application.application_status,
                "admin_note": application.admin_note,
                "vendor_id": application.vendor_id,
            })

        return Response(results, status=status.HTTP_200_OK)

    def post(self, request, application_id=None):
        denied = self.check_superuser(request)
        if denied:
            return denied

        if application_id is None:
            return Response(
                {"error": "Application ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        action = request.data.get("action")

        if action not in ("approve", "reject"):
            return Response(
                {"error": "Action must be 'approve' or 'reject'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rejection_note = str(
            request.data.get("admin_note") or ""
        ).strip()

        if action == "reject" and not rejection_note:
            return Response(
                {
                    "error": (
                        "Please provide a rejection reason "
                        "so the vendor knows what to correct."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            application = (
                VendorPortalUser.objects
                .select_for_update()
                .filter(pk=application_id)
                .first()
            )

            if application is None:
                return Response(
                    {"error": "Vendor application not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if (
                application.application_status != "pending"
                or not application.profile_submitted
            ):
                return Response(
                    {
                        "error": (
                            "This application is not awaiting approval."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if application.vendor_id:
                return Response(
                    {
                        "error": (
                            "Application is already linked to a vendor."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if action == "reject":
                application.application_status = "rejected"
                application.admin_note = rejection_note

                application.save(update_fields=[
                    "application_status",
                    "admin_note",
                    "updated_at",
                ])

                return Response({
                    "message": "Vendor application rejected.",
                    "admin_note": application.admin_note,
                }, status=status.HTTP_200_OK)

            vendor = Vendor.objects.create(
                name=application.company_name,
                abrv_name=application.abrv_name or None,
                contact_number=application.contact_number or None,
                email=application.email,
                invoice_email=application.invoice_email or None,
                tax_id=application.tax_id or None,
                address=application.address or None,
                invoicing_method=application.invoicing_method or None,
                payment_terms=application.payment_terms or None,
                city=application.city or None,
                zip_code=application.zip_code or None,
                country=application.country or None,
                state=application.state or None,
                status=True,
                is_diy=True,
            )

            application.vendor = vendor
            application.application_status = "approved"
            application.admin_note = ""

            application.save(update_fields=[
                "vendor",
                "application_status",
                "admin_note",
                "updated_at",
            ])

        return Response({
            "message": "Vendor application approved.",
            "vendor_id": vendor.pk,
        }, status=status.HTTP_200_OK)
