import uuid

from django.db import IntegrityError, transaction
from django.db import transaction
from rest_framework.permissions import IsAdminUser
from ...permissions import HasDIYAdminAccess

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
    VendorPortalProjectAssignmentSerializer,
)

import uuid

from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from .vendor_portal_email import (
    create_vendor_auth_token,
    send_vendor_auth_email,
    validate_vendor_auth_token,
)

from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .vendor_portal_serializers import VendorPortalProfileSerializer

from ...models import (
    Vendor,
    VendorPortalUser,
    VendorApplication,
    VendorApplicationReview,
    ProjectVendor,
    ProjectVendorMessage,
    VendorPortalNotification,
    VendorPortalAuthToken
)
from .vendor_portal_notifications import notify_admins, notify_vendor



def vendor_token_response(vendor_user):
    token = VendorPortalAccessToken.for_user(vendor_user)
    application = vendor_user.application

    return {
        "access": str(token),
        "user": {
            "id": vendor_user.pk,
            "email": vendor_user.email,
            "first_name": vendor_user.first_name,
            "last_name": vendor_user.last_name,
            "application_status": application.status,
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

                raw_token = create_vendor_auth_token(
                    vendor_user,
                    "email_verification",
                )

                transaction.on_commit(
                    lambda: send_vendor_auth_email(
                        vendor_user,
                        "email_verification",
                        raw_token,
                    ),
                    robust=True,
                )

        except IntegrityError:
            return Response(
                {
                    "error": (
                        "An account with this email may already exist."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": (
                    "Vendor account created successfully. "
                    "Please verify your email address before signing in."
                ),
                "email": vendor_user.email,
                "email_verified": False,
                "application_status": vendor_user.application_status,
            },
            status=status.HTTP_201_CREATED,
        )


class VendorPortalLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VendorPortalLoginSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        vendor_user = serializer.validated_data["vendor_user"]

        if not vendor_user.is_email_verified:
            return Response(
                {
                    "error": (
                        "Please verify your email address "
                        "before signing in."
                    ),
                    "email_verified": False,
                    "email": vendor_user.email,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            vendor_token_response(vendor_user),
            status=status.HTTP_200_OK,
        )

class VendorPortalVerifyEmailView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        raw_token = request.data.get("token", "")

        auth_token = validate_vendor_auth_token(
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

        vendor_user = auth_token.user

        vendor_user.is_email_verified = True
        vendor_user.save(
            update_fields=["is_email_verified", "updated_at"]
        )

        auth_token.used_at = timezone.now()
        auth_token.save(update_fields=["used_at"])

        return Response(
            {
                "message": "Your email has been verified successfully.",
                "email_verified": True,
            },
            status=status.HTTP_200_OK,
        )


class VendorPortalResendVerificationView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response(
                {"error": "Email address is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        vendor_user = VendorPortalUser.objects.filter(
            email__iexact=email,
            is_active=True,
        ).first()

        if vendor_user and not vendor_user.is_email_verified:
            raw_token = create_vendor_auth_token(
                vendor_user,
                "email_verification",
            )

            transaction.on_commit(
                lambda: send_vendor_auth_email(
                    vendor_user,
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


class VendorPortalPasswordResetRequestView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response(
                {"error": "Email address is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        vendor_user = VendorPortalUser.objects.filter(
            email__iexact=email,
            is_active=True,
            is_email_verified=True,
        ).first()

        if vendor_user:
            raw_token = create_vendor_auth_token(
                vendor_user,
                "password_reset",
            )

            transaction.on_commit(
                lambda: send_vendor_auth_email(
                    vendor_user,
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


class VendorPortalPasswordResetConfirmView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        raw_token = request.data.get("token", "")
        new_password = request.data.get("password", "")

        if not raw_token or not new_password:
            return Response(
                {
                    "error": (
                        "Token and new password are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        auth_token = validate_vendor_auth_token(
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

        vendor_user = auth_token.user

        try:
            validate_password(
                new_password,
                user=vendor_user,
            )
        except DjangoValidationError as exc:
            return Response(
                {"password": list(exc.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            vendor_user.password = make_password(new_password)

            # Invalidate all previously issued Vendor JWTs.
            vendor_user.token_version = uuid.uuid4()

            vendor_user.save(
                update_fields=[
                    "password",
                    "token_version",
                    "updated_at",
                ]
            )

            VendorPortalAuthToken.objects.filter(
                user=vendor_user,
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


class VendorPortalMeView(APIView):
    authentication_classes = [VendorPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendor_user = request.user
        application = vendor_user.application

        latest_review = (
            application.reviews
            .exclude(note="")
            .order_by("-created_at")
            .first()
        )

        admin_note = latest_review.note if latest_review else ""

        return Response(
            {
                "user": {
                    "id": vendor_user.pk,
                    "email": vendor_user.email,
                    "first_name": vendor_user.first_name,
                    "last_name": vendor_user.last_name,
                    "application_status": application.status,
                    "company_name": application.company_name,
                    "profile_submitted": application.status in [
                        "submitted",
                        "under_review",
                        "changes_requested",
                        "approved",
                        "rejected",
                    ],
                    "admin_note": admin_note,
                },
                "application_id": application.pk,
                "vendor_id": application.vendor_id,
            },
            status=status.HTTP_200_OK,
        )



class VendorPortalProfileView(APIView):
    authentication_classes = [VendorPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        application = request.user.application
        serializer = VendorPortalProfileSerializer(application)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        application = request.user.application

        # Applications can only be edited while in draft
        # or when the admin has requested changes.
        if application.status not in ["draft", "changes_requested"]:
            return Response(
                {
                    "error": (
                        "Your application cannot currently be edited. "
                        "You can edit it when it is in draft or "
                        "changes requested status."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = VendorPortalProfileSerializer(
            application,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "Vendor application saved successfully.",
                "profile": serializer.data,
            },
            status=status.HTTP_200_OK,
        )



class VendorPortalSubmitView(APIView):
    authentication_classes = [VendorPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        vendor_user = request.user
        application = vendor_user.application

        previous_status = application.status

        if previous_status not in ["draft", "changes_requested"]:
            return Response(
                {
                    "error": (
                        "Your application cannot be submitted "
                        "in its current status."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        required_fields = {
            "company_name": "Company name",
            "contact_number": "Contact number",
            "address": "Address",
            "city": "City",
            "zip_code": "ZIP/postal code",
            "country": "Country",
        }

        missing = [
            label
            for field, label in required_fields.items()
            if not (getattr(application, field, "") or "").strip()
        ]

        if missing:
            return Response(
                {
                    "error": "Complete all required company profile fields.",
                    "missing_fields": missing,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_resubmission = previous_status == "changes_requested"

        with transaction.atomic():
            application.status = "submitted"
            application.submitted_at = timezone.now()
            application.save(
                update_fields=[
                    "status",
                    "submitted_at",
                    "updated_at",
                ]
            )

            VendorApplicationReview.objects.create(
                application=application,
                action=(
                    "resubmitted" if is_resubmission else "submitted"
                ),
                note="Vendor resubmitted the application."
                if is_resubmission
                else "Vendor submitted the application.",
            )

            notify_admins(
                event_type=(
                    "application_resubmitted"
                    if is_resubmission
                    else "application_submitted"
                ),
                title=(
                    "Vendor application resubmitted"
                    if is_resubmission
                    else "New vendor application submitted"
                ),
                message=(
                    f"{application.company_name} "
                    f"{'resubmitted' if is_resubmission else 'submitted'} "
                    "their vendor application for review."
                ),
                application=application,
            )

        return Response(
            {
                "message": (
                    "Vendor application resubmitted successfully."
                    if is_resubmission
                    else "Vendor application submitted successfully."
                ),
                "status": application.status,
            },
            status=status.HTTP_200_OK,
        )


class VendorPortalAdminApplicationsView(APIView):
    permission_classes = [IsAuthenticated, HasDIYAdminAccess]

    def check_superuser(self, request):
        if not (
            request.user.is_superuser
            or HasDIYAdminAccess().has_permission(request, self)
        ):
            return Response(
                {"error": "You do not have permission to review vendor applications."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    def get(self, request, application_id=None):
        denied = self.check_superuser(request)
        if denied:
            return denied

        applications = (
            VendorApplication.objects
            .select_related("user", "vendor")
            .prefetch_related(
                "reviews",
                "industries",
                "respondent_types",
            )
            .order_by("-submitted_at", "-created_at")
        )

        if application_id:
            applications = applications.filter(pk=application_id)

        results = []

        for application in applications:
            latest_review = application.reviews.order_by(
                "-created_at"
            ).first()

            results.append({
                "id": application.pk,
                "user_id": application.user_id,
                "email": application.user.email,
                "first_name": application.user.first_name,
                "last_name": application.user.last_name,
                "company_name": application.company_name,
                "abrv_name": application.abrv_name,
                "company_website": application.company_website,
                "registration_number": application.registration_number,
                "contact_number": application.contact_number,
                "invoice_email": application.invoice_email,
                "tax_id": application.tax_id,
                "address": application.address,
                "city": application.city,
                "state": application.state,
                "zip_code": application.zip_code,
                "country": application.country,
                "invoicing_method": application.invoicing_method,
                "payment_terms": application.payment_terms,
                "status": application.status,
                "submitted_at": application.submitted_at,
                "reviewed_at": application.reviewed_at,
                "admin_note": latest_review.note if latest_review else "",
                "vendor_id": application.vendor_id,
                "reviews": [
                    {
                        "action": review.action,
                        "note": review.note,
                        "created_at": review.created_at,
                    }
                    for review in application.reviews.all()
                ],
                "complete_link": application.complete_link,
                "terminate_link": application.terminate_link,
                "quota_full_link": application.quota_full_link,
                "security_terminate_link": application.security_terminate_link,

                "industries": [
                    {"id": industry.id, "name": industry.name}
                    for industry in application.industries.all()
                ],

                "respondent_types": [
                    {
                        "id": respondent_type.id,
                        "name": respondent_type.name,
                        "industry_id": respondent_type.industry_id,
                    }
                    for respondent_type in application.respondent_types.all()
                ],
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
        note = str(request.data.get("admin_note") or "").strip()

        if action not in ("approve", "request_changes", "reject"):
            return Response(
                {
                    "error": (
                        "Action must be approve, request_changes "
                        "or reject."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if action in ("request_changes", "reject") and not note:
            return Response(
                {"error": "Please provide a reason or instructions."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            application = (
                VendorApplication.objects
                .select_for_update()
                .select_related("user")
                .filter(pk=application_id)
                .first()
            )

            if application is None:
                return Response(
                    {"error": "Vendor application not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if application.status not in ("submitted", "under_review"):
                return Response(
                    {
                        "error": (
                            "Only submitted or under-review "
                            "applications can be reviewed."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if action == "approve":
                if application.vendor_id:
                    return Response(
                        {"error": "This application already has a vendor."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                vendor = Vendor.objects.create(
                    name=application.company_name,
                    abrv_name=application.abrv_name or None,
                    contact_number=application.contact_number or None,
                    email=application.user.email,
                    invoice_email=application.invoice_email or None,
                    tax_id=application.tax_id or None,
                    address=application.address or None,
                    invoicing_method=application.invoicing_method or None,
                    payment_terms=application.payment_terms or None,
                    city=application.city or None,
                    zip_code=application.zip_code or None,
                    country=application.country or None,
                    state=application.state or None,

                    # Vendor redirect links
                    complete_link=application.complete_link or None,
                    terminate_link=application.terminate_link or None,
                    quota_full_link=application.quota_full_link or None,
                    security_terminate_link=(
                        application.security_terminate_link or None
                    ),

                    status=True,
                    is_diy=True,
                )

                # Copy the vendor's selected capabilities
                vendor.industries.set(application.industries.all())
                vendor.respondent_types.set(application.respondent_types.all())

                application.vendor = vendor
                application.status = "approved"
                application.reviewed_at = timezone.now()
                application.save(
                    update_fields=[
                        "vendor",
                        "status",
                        "reviewed_at",
                        "updated_at",
                    ]
                )

                # Link the approved vendor to the vendor portal account
                application.user.vendor = vendor
                application.user.application_status = "approved"

                application.user.save(
                    update_fields=[
                        "vendor",
                        "application_status",
                        "updated_at",
                    ]
                )

                review_action = "approved"
                review_note = note or "Vendor application approved."
            elif action == "request_changes":
                application.status = "changes_requested"
                application.reviewed_at = timezone.now()
                application.save(
                    update_fields=["status", "reviewed_at", "updated_at"]
                )

                review_action = "changes_requested"
                review_note = note

            else:
                application.status = "rejected"
                application.reviewed_at = timezone.now()
                application.save(
                    update_fields=["status", "reviewed_at", "updated_at"]
                )

                application.user.application_status = "rejected"
                application.user.save(
                    update_fields=["application_status", "updated_at"]
                )

                review_action = "rejected"
                review_note = note

            VendorApplicationReview.objects.create(
                application=application,
                reviewed_by=request.user,
                action=review_action,
                note=review_note,
            )

            notify_vendor(
                application=application,
                vendor_user=application.user,
                event_type={
                    "approve": "application_approved",
                    "request_changes": "application_changes_requested",
                    "reject": "application_rejected",
                }[action],
                title={
                    "approve": "Vendor application approved",
                    "request_changes": "Changes requested on your application",
                    "reject": "Vendor application rejected",
                }[action],
                message={
                    "approve": "Your vendor application has been approved.",
                    "request_changes": f"The admin requested changes to your application: {note}",
                    "reject": f"Your vendor application has been rejected: {note}",
                }[action],
            )

        return Response(
            {
                "message": (
                    "Vendor application approved."
                    if action == "approve"
                    else "Changes requested from vendor."
                    if action == "request_changes"
                    else "Vendor application rejected."
                ),
                "status": application.status,
                "vendor_id": application.vendor_id,
            },
            status=status.HTTP_200_OK,
        )

class VendorPortalProjectsView(APIView):
    authentication_classes = [VendorPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendor_user = request.user

        if (
            not vendor_user.is_active
            or vendor_user.application_status != "approved"
            or not vendor_user.vendor_id
            or not vendor_user.vendor.is_diy
        ):
            return Response(
                {"error": "Your approved vendor account is required to view projects."},
                status=status.HTTP_403_FORBIDDEN,
            )

        assignments = (
            ProjectVendor.objects
            .filter(vendor_id=vendor_user.vendor_id)
            .select_related("project", "vendor")
            .order_by("-created_at")
        )

        serializer = VendorPortalProjectAssignmentSerializer(
            assignments,
            many=True,
        )

        return Response(serializer.data, status=status.HTTP_200_OK)

class VendorPortalProjectResponseView(APIView):
    authentication_classes = [VendorPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        vendor_user = request.user

        # Only approved, active DIY vendor accounts can respond.
        if (
            not vendor_user.is_active
            or vendor_user.application_status != "approved"
            or not vendor_user.vendor_id
            or not vendor_user.vendor.is_diy
        ):
            return Response(
                {"error": "Your approved vendor account is required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        action = request.data.get("action")
        message_text = (request.data.get("message") or "").strip()

        if action not in ["accept", "decline", "clarification"]:
            raise ValidationError({
                "action": "Choose accept, decline, or clarification."
            })

        if action in ["decline", "clarification"] and not message_text:
            field = "reason" if action == "decline" else "message"
            raise ValidationError({
                field: "This field is required."
            })

        with transaction.atomic():
            try:
                assignment = (
                    ProjectVendor.objects
                    .select_for_update()
                    .get(
                        pk=assignment_id,
                        vendor_id=vendor_user.vendor_id,
                        vendor__is_diy=True,
                    )
                )
            except ProjectVendor.DoesNotExist:
                return Response(
                    {"error": "Project assignment not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if assignment.status != "active":
                return Response(
                    {"error": "This project assignment is not active."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if assignment.response_status not in [
                "pending",
                "clarification_requested",
            ]:
                return Response(
                    {
                        "error": (
                            "You have already responded to this project "
                            "assignment."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if action == "accept":
                assignment.response_status = "accepted"
                assignment.responded_at = timezone.now()
                assignment.decline_reason = None

            elif action == "decline":
                assignment.response_status = "declined"
                assignment.responded_at = timezone.now()
                assignment.decline_reason = message_text

                ProjectVendorMessage.objects.create(
                    project_vendor=assignment,
                    sender_type="vendor",
                    message_type="response",
                    message=message_text,
                )

            elif action == "clarification":
                assignment.response_status = "clarification_requested"
                assignment.responded_at = timezone.now()

                ProjectVendorMessage.objects.create(
                    project_vendor=assignment,
                    sender_type="vendor",
                    message_type="clarification",
                    message=message_text,
                )

            assignment.save(
                update_fields=[
                    "response_status",
                    "responded_at",
                    "decline_reason",
                ]
            )

            notification_details = {
                "accept": {
                    "event_type": "project_accepted",
                    "title": "Vendor accepted a project",
                    "message": (
                        f"{vendor_user.vendor.name} accepted the project "
                        f"'{assignment.project.name}'."
                    ),
                },
                "decline": {
                    "event_type": "project_declined",
                    "title": "Vendor declined a project",
                    "message": (
                        f"{vendor_user.vendor.name} declined the project "
                        f"'{assignment.project.name}'. "
                        f"Reason: {message_text}"
                    ),
                },
                "clarification": {
                    "event_type": "clarification_requested",
                    "title": "Vendor requested clarification",
                    "message": (
                        f"{vendor_user.vendor.name} requested clarification "
                        f"for the project '{assignment.project.name}': "
                        f"{message_text}"
                    ),
                },
            }

            notification = notification_details[action]

            notify_admins(
                event_type=notification["event_type"],
                title=notification["title"],
                message=notification["message"],
                project_vendor=assignment,
            )

        serializer = VendorPortalProjectAssignmentSerializer(assignment)

        return Response(
            {
                "message": "Your response has been submitted.",
                "assignment": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

class VendorPortalProjectMessagesView(APIView):
    authentication_classes = [VendorPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_assignment(self, request, assignment_id):
        vendor_user = request.user

        if (
            not vendor_user.is_active
            or vendor_user.application_status != "approved"
            or not vendor_user.vendor_id
            or not vendor_user.vendor.is_diy
        ):
            return None

        try:
            return ProjectVendor.objects.get(
                pk=assignment_id,
                vendor_id=vendor_user.vendor_id,
                vendor__is_diy=True,
            )
        except ProjectVendor.DoesNotExist:
            return None

    def get(self, request, assignment_id):
        assignment = self.get_assignment(request, assignment_id)

        if assignment is None:
            return Response(
                {"error": "Project assignment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        messages = assignment.messages.order_by("created_at")

        # Mark unread admin messages as read.
        messages.filter(
            sender_type="admin",
            is_read=False,
        ).update(is_read=True)

        return Response(
            [
                {
                    "id": message.id,
                    "sender_type": message.sender_type,
                    "message_type": message.message_type,
                    "message": message.message,
                    "created_at": message.created_at,
                    "is_read": message.is_read,
                }
                for message in messages
            ],
            status=status.HTTP_200_OK,
        )

    def post(self, request, assignment_id):
        assignment = self.get_assignment(request, assignment_id)

        if assignment is None:
            return Response(
                {"error": "Project assignment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        message_text = (request.data.get("message") or "").strip()

        if not message_text:
            return Response(
                {"error": "Message cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = ProjectVendorMessage.objects.create(
            project_vendor=assignment,
            sender_type="vendor",
            message_type="general",
            message=message_text,
        )

        notify_admins(
            event_type="vendor_message",
            title="New message from vendor",
            message=(
                f"{request.user.vendor.name} sent a message about "
                f"the project '{assignment.project.name}'."
            ),
            project_vendor=assignment,
        )

        return Response(
            {
                "id": message.id,
                "sender_type": message.sender_type,
                "message_type": message.message_type,
                "message": message.message,
                "created_at": message.created_at,
                "is_read": message.is_read,
            },
            status=status.HTTP_201_CREATED,
        )

class VendorPortalNotificationsView(APIView):
    authentication_classes = [VendorPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = VendorPortalNotification.objects.filter(
            vendor_recipient=request.user
        ).select_related(
            "application",
            "project_vendor__project",
        ).order_by("-created_at")

        unread_count = notifications.filter(is_read=False).count()

        results = [
            {
                "id": notification.id,
                "event_type": notification.event_type,
                "title": notification.title,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at,
                "application_id": notification.application_id,
                "project_vendor_id": notification.project_vendor_id,
                "project_name": (
                    notification.project_vendor.project.name
                    if notification.project_vendor_id
                    else None
                ),
            }
            for notification in notifications
        ]

        return Response({
            "unread_count": unread_count,
            "notifications": results,
        }, status=status.HTTP_200_OK)


class VendorPortalNotificationReadView(APIView):
    authentication_classes = [VendorPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        updated = VendorPortalNotification.objects.filter(
            pk=notification_id,
            vendor_recipient=request.user,
            is_read=False,
        ).update(is_read=True)

        if not updated and not VendorPortalNotification.objects.filter(
            pk=notification_id,
            vendor_recipient=request.user,
        ).exists():
            return Response(
                {"error": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"message": "Notification marked as read."},
            status=status.HTTP_200_OK,
        )


class VendorPortalMarkAllNotificationsReadView(APIView):
    authentication_classes = [VendorPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        VendorPortalNotification.objects.filter(
            vendor_recipient=request.user,
            is_read=False,
        ).update(is_read=True)

        return Response(
            {"message": "All notifications marked as read."},
            status=status.HTTP_200_OK,
        )


class VendorPortalAdminNotificationsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        notifications = VendorPortalNotification.objects.filter(
            admin_recipient=request.user
        ).select_related(
            "application",
            "application__user",
            "application__vendor",
            "project_vendor__project",
            "project_vendor__vendor",
        ).order_by("-created_at")

        unread_count = notifications.filter(is_read=False).count()

        results = [
            {
                "id": notification.id,
                "event_type": notification.event_type,
                "title": notification.title,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at,
                "application_id": notification.application_id,
                "application_company": (
                    notification.application.company_name
                    if notification.application_id
                    else None
                ),
                "vendor_email": (
                    notification.application.user.email
                    if notification.application_id
                    else None
                ),
                "vendor_id": (
                    notification.application.vendor_id
                    if notification.application_id
                    else (
                        notification.project_vendor.vendor_id
                        if notification.project_vendor_id
                        else None
                    )
                ),
                "project_vendor_id": notification.project_vendor_id,
                "project_name": (
                    notification.project_vendor.project.name
                    if notification.project_vendor_id
                    else None
                ),
                "project_id": (
                    notification.project_vendor.project_id
                    if notification.project_vendor_id
                    else None
                ),
            }
            for notification in notifications
        ]

        return Response({
            "unread_count": unread_count,
            "notifications": results,
        }, status=status.HTTP_200_OK)

class VendorPortalAdminNotificationReadView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, notification_id):
        updated = VendorPortalNotification.objects.filter(
            pk=notification_id,
            admin_recipient=request.user,
            is_read=False,
        ).update(is_read=True)

        if not updated and not VendorPortalNotification.objects.filter(
            pk=notification_id,
            admin_recipient=request.user,
        ).exists():
            return Response(
                {"error": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"message": "Notification marked as read."},
            status=status.HTTP_200_OK,
        )


class VendorPortalAdminMarkAllNotificationsReadView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        VendorPortalNotification.objects.filter(
            admin_recipient=request.user,
            is_read=False,
        ).update(is_read=True)

        return Response(
            {"message": "All notifications marked as read."},
            status=status.HTTP_200_OK,
        )