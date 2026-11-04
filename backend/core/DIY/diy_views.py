
import re
import unicodedata
from django.core.mail import send_mail
from django.conf import settings

from rest_framework import status,serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (
    Client,
    Project,
    DIYStudy,
    DIYCompanyMembership,
    DIYProjectReference,
    DIYSampleRequirement,
    DIYStudyQuotation,
    DIYNotification,
)
from .client_portal_auth import ClientPortalJWTAuthentication
from .diy_serializers import DIYStudySerializer,DIYStudyQuotationSerializer
from django.db import transaction

from django.utils import timezone
from rest_framework.permissions import IsAdminUser

from core.DIY.diy_helpers import (
    find_matching_clients,
    find_matching_projects,
)

from decimal import Decimal, InvalidOperation
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from core.DIY.diy_notifications import notify_client, notify_admins

class DIYStudyListCreateView(APIView):
    """
    Client portal API:
    - List studies belonging to the authenticated client's companies.
    - Create draft studies only for companies the client belongs to.
    """

    authentication_classes = [ClientPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        company_ids = DIYCompanyMembership.objects.filter(
            user=request.user,
            is_active=True,
            company__is_active=True,
        ).values_list("company_id", flat=True)

        studies = (
            DIYStudy.objects.filter(company_id__in=company_ids)
            .select_related("company", "project")
            .order_by("-created_at")
        )

        serializer = DIYStudySerializer(studies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        company_id = request.data.get("company_id")

        if not company_id:
            return Response(
                {"company_id": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership = (
            DIYCompanyMembership.objects.filter(
                user=request.user,
                company_id=company_id,
                is_active=True,
                company__is_active=True,
            )
            .select_related("company")
            .first()
        )

        if membership is None:
            return Response(
                {"error": "You do not have access to this DIY company."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = DIYStudySerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        study = serializer.save(
            company=membership.company,
            created_by=request.user,
            status="draft",
        )

        return Response(
            DIYStudySerializer(study).data,
            status=status.HTTP_201_CREATED,
        )


class DIYStudyUpdateView(APIView):
    """
    Allow clients to view their accessible studies.
    Allow editing only drafts and studies returned for changes.
    """

    authentication_classes = [ClientPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_accessible_study(self, request, study_id):
        company_ids = DIYCompanyMembership.objects.filter(
            user=request.user,
            is_active=True,
            company__is_active=True,
        ).values_list("company_id", flat=True)

        return (
            DIYStudy.objects
            .filter(
                id=study_id,
                company_id__in=company_ids,
            )
            .select_related("company", "project")
            .first()
        )

    def get(self, request, study_id):
        study = self.get_accessible_study(request, study_id)

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DIYStudySerializer(study)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request, study_id):
        study = self.get_accessible_study(request, study_id)

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if study.status not in ["draft", "changes_requested"]:
            return Response(
                {
                    "error": (
                        "Only draft or studies returned for changes "
                        "can be edited."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = DIYStudySerializer(
            study,
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
            DIYStudySerializer(study).data,
            status=status.HTTP_200_OK,
        )




class DIYStudySubmitView(APIView):

    authentication_classes = [ClientPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, study_id):

        company_ids = DIYCompanyMembership.objects.filter(
            user=request.user,
            is_active=True,
            company__is_active=True,
        ).values_list("company_id", flat=True)

        study = DIYStudy.objects.filter(
            id=study_id,
            company_id__in=company_ids,
        ).first()

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only drafts and studies returned for changes
        # can be submitted.
        if study.status not in ["draft", "changes_requested"]:
            return Response(
                {
                    "error": (
                        "Only draft or studies returned for changes "
                        "can be submitted for review."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate basic study information.
        errors = {}

        if not study.name.strip():
            errors["name"] = "Study name is required."

        if not study.country.strip():
            errors["country"] = "Country is required."

        if study.target_completes <= 0:
            errors["target_completes"] = (
                "Target completes must be greater than zero."
            )

        if study.survey_length <= 0:
            errors["survey_length"] = (
                "Survey length must be greater than zero."
            )

        # A sample requirement record must exist before submission.
        if not DIYSampleRequirement.objects.filter(
            study=study
        ).exists():
            errors["sample_requirement"] = (
                "Please complete the target audience requirements "
                "before submitting the study."
            )

        if errors:
            return Response(
                errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Submit the study.
        study.status = "submitted"
        study.submitted_at = timezone.now()

        # Clear previous review details when resubmitting.
        study.reviewed_by = None
        study.reviewed_at = None
        study.review_notes = ""

        study.save(
            update_fields=[
                "status",
                "submitted_at",
                "reviewed_by",
                "reviewed_at",
                "review_notes",
                "updated_at",
            ]
        )

        notify_admins(
            study=study,
            event_type="study_submitted",
            title="New DIY Study Submitted",
            message=(
                f'The client has submitted the study '
                f'"{study.name}" for review.'
            ),
        )

        return Response(
            DIYStudySerializer(study).data,
            status=status.HTTP_200_OK,
        )



class DIYStudyReviewListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        studies = (
            DIYStudy.objects
            .filter(status="submitted")
            .select_related(
                "company",
                "created_by",
                "reviewed_by",
                "project",
            )
            .order_by("-created_at")
        )

        serializer = DIYStudySerializer(
            studies,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class DIYAllStudiesAdminView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        studies = (
            DIYStudy.objects
            .select_related(
                "company",
                "created_by",
                "reviewed_by",
                "project",
            )
            .order_by("-created_at")
        )

        serializer = DIYStudySerializer(studies, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)



def normalize_name(value):
    value = unicodedata.normalize("NFKC", value or "")
    value = re.sub(r"\s+", " ", value).strip()
    return value.casefold() 


class DIYStudyReviewActionView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def post(self, request, study_id):

        study = (
            DIYStudy.objects.select_for_update()
            .select_related("company", "project")
            .filter(id=study_id)
            .first()
        )

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if study.status not in ["submitted", "under_review"]:
            return Response(
                {
                    "error": (
                        "Only submitted or under-review "
                        "studies can be reviewed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        action = request.data.get("action")

        review_notes = (
            request.data.get("review_notes") or ""
        ).strip()

        # Direct approval is disabled.
        # Project creation is allowed only through
        # the quotation acceptance conversion workflow.

        if action != "reject":
            return Response(
                {
                    "action": [
                        "Direct approval is disabled. "
                        "Use manual assessment, quotation, "
                        "client acceptance, and Project conversion."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Return study to client for changes
        if not review_notes:
            return Response(
                {
                    "review_notes": [
                        "Please provide a reason or requested changes."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        study.status = "changes_requested"
        study.reviewed_by = request.user
        study.reviewed_at = timezone.now()
        study.review_notes = review_notes

        study.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "review_notes",
                "updated_at",
            ]
        )

        notify_client(
            study=study,
            event_type="study_changes_requested",
            title="Changes Requested for Your Study",
            message=(
                f'The admin has requested changes to your study '
                f'"{study.name}". '
                f"Review notes: {review_notes}"
            ),
        )

        return Response(
            {
                "message": (
                    "Study returned to the client for changes."
                ),
                "study": DIYStudySerializer(study).data,
            },
            status=status.HTTP_200_OK,
        )


class DIYStudyAssessmentView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def post(self, request, study_id):
        study = (
            DIYStudy.objects.select_for_update()
            .filter(id=study_id)
            .first()
        )

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if study.status not in ["submitted", "under_review"]:
            return Response(
                {
                    "error": (
                        "Only submitted or under-review studies "
                        "can be assessed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        assessment_status = request.data.get("assessment_status")
        proposed_completes = request.data.get("proposed_completes")
        estimated_timeline_days = request.data.get(
            "estimated_timeline_days"
        )
        estimated_budget = request.data.get("estimated_budget")
        assessment_notes = (
            request.data.get("assessment_notes") or ""
        ).strip()

        valid_assessments = [
            "feasible",
            "feasible_with_conditions",
            "not_feasible",
        ]

        if assessment_status not in valid_assessments:
            return Response(
                {
                    "assessment_status": [
                        "Choose feasible, feasible_with_conditions, "
                        "or not_feasible."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate proposed completes
        if proposed_completes is not None:
            try:
                proposed_completes = int(proposed_completes)
                if proposed_completes <= 0:
                    raise ValueError
            except (ValueError, TypeError):
                return Response(
                    {
                        "proposed_completes": [
                            "Proposed completes must be a positive integer."
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Validate estimated timeline
        if estimated_timeline_days is not None:
            try:
                estimated_timeline_days = int(
                    estimated_timeline_days
                )
                if estimated_timeline_days <= 0:
                    raise ValueError
            except (ValueError, TypeError):
                return Response(
                    {
                        "estimated_timeline_days": [
                            "Timeline must be a positive number of days."
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Validate estimated budget
        if estimated_budget is not None:
            try:
                estimated_budget = Decimal(str(estimated_budget))
                if estimated_budget < 0:
                    raise ValueError
            except (InvalidOperation, ValueError, TypeError):
                return Response(
                    {
                        "estimated_budget": [
                            "Enter a valid non-negative budget."
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Not feasible assessments require an explanation
        if assessment_status == "not_feasible" and not assessment_notes:
            return Response(
                {
                    "assessment_notes": [
                        "Please explain why this study is not feasible."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        study.assessment_status = assessment_status
        study.proposed_completes = proposed_completes
        study.estimated_timeline_days = estimated_timeline_days
        study.estimated_budget = estimated_budget
        study.assessment_notes = assessment_notes

        study.status = "under_review"
        study.reviewed_by = request.user
        study.reviewed_at = timezone.now()

        study.save(
            update_fields=[
                "assessment_status",
                "proposed_completes",
                "estimated_timeline_days",
                "estimated_budget",
                "assessment_notes",
                "status",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": "Manual assessment saved successfully.",
                "study": DIYStudySerializer(study).data,
            },
            status=status.HTTP_200_OK,
        )

class DIYStudySurveyLinkReviewView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def post(self, request, study_id):
        study = (
            DIYStudy.objects.select_for_update()
            .filter(id=study_id)
            .first()
        )

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if study.status not in [
            "client_accepted",
            "project_created",
        ]:
            return Response(
                {
                    "error": (
                        "Survey links can only be reviewed "
                        "after the client accepts the quotation."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        action = request.data.get("action")

        if action not in ["validate", "request_changes"]:
            return Response(
                {
                    "action": [
                        "Choose validate or request_changes."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not study.confirmed_survey_link:
            return Response(
                {
                    "error": (
                        "The client has not submitted a survey URL yet."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if action == "validate":
            validator = URLValidator()

            try:
                validator(study.confirmed_survey_link)
            except ValidationError:
                return Response(
                    {
                        "error": (
                            "The submitted survey URL is not valid."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            study.survey_link_status = "validated"
            study.survey_link_reviewed_by = request.user

        else:
            study.survey_link_status = "changes_requested"
            study.survey_link_reviewed_by = None

        study.save(
            update_fields=[
                "survey_link_status",
                "survey_link_reviewed_by",
                "updated_at",
            ]
        )

        if action == "validate":
            notify_client(
                study=study,
                event_type="survey_link_validated",
                title="Survey URL Validated",
                message=(
                    f'The admin has successfully validated the survey URL '
                    f'for study "{study.name}".'
                ),
            )
        else:
            notify_client(
                study=study,
                event_type="survey_link_changes_requested",
                title="Survey URL Changes Requested",
                message=(
                    f'The admin has requested changes to the survey URL '
                    f'for study "{study.name}". '
                    "Please log in to your client portal and submit "
                    "a corrected URL."
                ),
            )

        return Response(
            {
                "message": (
                    "Survey URL validated successfully."
                    if action == "validate"
                    else "Survey URL changes requested."
                ),
                "confirmed_survey_link": study.confirmed_survey_link,
                "survey_link_status": study.survey_link_status,
            },
            status=status.HTTP_200_OK,
        )


class DIYStudyQuotationCreateView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def post(self, request, study_id):

        study = (
            DIYStudy.objects.select_for_update()
            .filter(id=study_id)
            .first()
        )

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only assessed studies can receive quotations
        if study.status != "under_review":
            return Response(
                {
                    "error": (
                        "Only studies under review can receive "
                        "a quotation."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if study.assessment_status not in [
            "feasible",
            "feasible_with_conditions",
        ]:
            return Response(
                {
                    "error": (
                        "Only feasible or conditionally feasible "
                        "studies can receive quotations."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Use the admin's assessed sample size and timeline
        proposed_completes = study.proposed_completes
        estimated_timeline_days = study.estimated_timeline_days

        if not proposed_completes or not estimated_timeline_days:
            return Response(
                {
                    "error": (
                        "Please complete proposed completes and "
                        "estimated timeline in the assessment first."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate quotation amount
        quoted_amount = request.data.get("quoted_amount")

        try:
            quoted_amount = Decimal(str(quoted_amount))

            if quoted_amount <= 0:
                raise ValueError

        except (InvalidOperation, ValueError, TypeError):
            return Response(
                {
                    "quoted_amount": [
                        "Enter a valid amount greater than zero."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        currency = (
            request.data.get("currency") or "INR"
        ).strip().upper()

        if not currency or len(currency) > 10:
            return Response(
                {
                    "currency": [
                        "Enter a valid currency."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        notes = (
            request.data.get("notes") or ""
        ).strip()

        # Generate the next quotation version
        previous_quotations = (
            DIYStudyQuotation.objects
            .select_for_update()
            .filter(study=study)
        )

        latest_version = (
            previous_quotations
            .order_by("-version")
            .values_list("version", flat=True)
            .first()
        )

        next_version = (latest_version or 0) + 1

        # Mark previous draft quotations as superseded
        previous_quotations.filter(
            status="draft"
        ).update(status="superseded")

        quotation = DIYStudyQuotation.objects.create(
            study=study,
            version=next_version,
            quoted_amount=quoted_amount,
            currency=currency,
            proposed_completes=proposed_completes,
            estimated_timeline_days=estimated_timeline_days,
            notes=notes,
            status="draft",
            created_by=request.user,
        )

        return Response(
            {
                "message": "Quotation draft created successfully.",
                "quotation": DIYStudyQuotationSerializer(
                    quotation
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )


class DIYStudyQuotationSendView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def post(self, request, study_id, quotation_id):

        study = (
            DIYStudy.objects.select_for_update()
            .filter(id=study_id)
            .first()
        )

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        quotation = (
            DIYStudyQuotation.objects.select_for_update()
            .filter(id=quotation_id, study=study)
            .first()
        )

        if quotation is None:
            return Response(
                {"error": "Quotation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if quotation.status != "draft":
            return Response(
                {"error": "Only draft quotations can be sent."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if study.status != "under_review":
            return Response(
                {"error": "Study is not ready for quotation."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        recipient_email = study.created_by.email

        if not recipient_email:
            return Response(
                {"error": "Client email address is missing."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject = f"Quotation for your study: {study.name}"

        message = f"""
Dear {study.created_by.first_name},

Your quotation for the study "{study.name}" is ready.

Quotation Details
-----------------
Quotation Version: {quotation.version}
Study Name: {study.name}
Quoted Amount: {quotation.currency} {quotation.quoted_amount}
Proposed Completes: {quotation.proposed_completes}
Estimated Timeline: {quotation.estimated_timeline_days} days

Additional Notes:
{quotation.notes or "No additional notes."}

Please log in to your client portal to review and respond
to this quotation.

Regards,
Survey Management Team
"""

        try:
            email_sent = send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )

            if email_sent != 1:
                raise Exception("Email was not accepted by the email backend.")

        except Exception:
            return Response(
                {
                    "error": (
                        "Unable to send quotation email. "
                        "Please check your email configuration."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        quotation.status = "sent"
        quotation.sent_at = timezone.now()
        quotation.save(
            update_fields=["status", "sent_at"]
        )

        study.status = "quote_sent"
        study.save(update_fields=["status", "updated_at"])

        notify_client(
            study=study,
            event_type="quotation_sent",
            title="New Quotation Received",
            message=(
                f'A quotation for your study "{study.name}" '
                f'has been sent. '
                f"Quotation Version: {quotation.version}. "
                f"Amount: {quotation.currency} "
                f"{quotation.quoted_amount}. "
                "Please log in to your client portal to review it."
            ),
        )

        return Response(
            {
                "message": "Quotation sent successfully.",
                "recipient": recipient_email,
                "quotation": DIYStudyQuotationSerializer(
                    quotation
                ).data,
                "study_status": study.status,
            },
            status=status.HTTP_200_OK,
        )

class DIYClientQuotationListView(APIView):
    """
    Allow clients to view quotation history
    for studies belonging to their companies.
    """

    authentication_classes = [ClientPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, study_id):

        company_ids = DIYCompanyMembership.objects.filter(
            user=request.user,
            is_active=True,
            company__is_active=True,
        ).values_list("company_id", flat=True)

        study = DIYStudy.objects.filter(
            id=study_id,
            company_id__in=company_ids,
        ).first()

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        quotations = (
            DIYStudyQuotation.objects
            .filter(study=study)
            .order_by("-version")
        )

        serializer = DIYStudyQuotationSerializer(
            quotations,
            many=True,
        )

        return Response(
            {
                "study_id": study.id,
                "study_name": study.name,
                "study_status": study.status,
                "quotations": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

class DIYClientQuotationRespondView(APIView):
    """
    Allow an authorized client to accept or decline
    the latest sent quotation and confirm their survey URL.
    """

    authentication_classes = [ClientPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, study_id, quotation_id):

        # Lock the study to prevent simultaneous responses
        company_ids = DIYCompanyMembership.objects.filter(
            user=request.user,
            is_active=True,
            company__is_active=True,
        ).values_list("company_id", flat=True)

        study = (
            DIYStudy.objects.select_for_update()
            .filter(
                id=study_id,
                company_id__in=company_ids,
            )
            .first()
        )

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        quotation = (
            DIYStudyQuotation.objects.select_for_update()
            .filter(
                id=quotation_id,
                study=study,
            )
            .first()
        )

        if quotation is None:
            return Response(
                {"error": "Quotation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the latest quotation version can receive a response
        latest_version = (
            DIYStudyQuotation.objects
            .filter(study=study)
            .order_by("-version")
            .values_list("version", flat=True)
            .first()
        )

        if quotation.version != latest_version:
            return Response(
                {
                    "error": (
                        "You can only respond to the latest quotation."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quotation.status != "sent":
            return Response(
                {
                    "error": (
                        "Only sent quotations can be accepted or declined."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if study.status != "quote_sent":
            return Response(
                {
                    "error": (
                        "This study is not awaiting a quotation response."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        action = request.data.get("action")

        if action not in ["accept", "decline"]:
            return Response(
                {
                    "action": [
                        "Choose either 'accept' or 'decline'."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ACCEPT QUOTATION
        if action == "accept":

            survey_choice = request.data.get(
                "survey_link_choice"
            )

            if survey_choice not in [
                "confirm_existing",
                "update_link",
                "provide_later",
            ]:
                return Response(
                    {
                        "survey_link_choice": [
                            "Choose confirm_existing, update_link, "
                            "or provide_later."
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Client confirms the original survey URL
            if survey_choice == "confirm_existing":

                if not study.survey_link:
                    return Response(
                        {
                            "survey_link": [
                                "No original survey URL exists. "
                                "Please update the URL or choose "
                                "to provide it later."
                            ]
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                study.confirmed_survey_link = study.survey_link
                study.survey_link_status = "pending_validation"

            # Client provides an updated survey URL
            elif survey_choice == "update_link":

                new_survey_link = (
                    request.data.get("confirmed_survey_link") or ""
                ).strip()

                if not new_survey_link:
                    return Response(
                        {
                            "confirmed_survey_link": [
                                "Please provide the updated survey URL."
                            ]
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                try:
                    URLValidator()(new_survey_link)
                except ValidationError:
                    return Response(
                        {
                            "confirmed_survey_link": [
                                "Enter a valid survey URL."
                            ]
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                study.confirmed_survey_link = new_survey_link
                study.survey_link_status = "pending_validation"

            # Client accepts quotation but will provide URL later
            else:
                study.confirmed_survey_link = None
                study.survey_link_status = "pending_confirmation"

            # A new client confirmation requires fresh admin validation
            study.survey_link_reviewed_by = None

            quotation.status = "accepted"
            study.status = "client_accepted"

        # DECLINE QUOTATION
        else:
            quotation.status = "declined"
            study.status = "client_declined"

        quotation.responded_at = timezone.now()

        quotation.save(
            update_fields=[
                "status",
                "responded_at",
            ]
        )

        study.save(
            update_fields=[
                "status",
                "confirmed_survey_link",
                "survey_link_status",
                "survey_link_reviewed_by",
                "updated_at",
            ]
        )

        if action == "accept":
            notify_admins(
                study=study,
                event_type="quotation_accepted",
                title="Quotation Accepted by Client",
                message=(
                    f'The client has accepted the quotation '
                    f'for study "{study.name}". '
                    f"Quotation Version: {quotation.version}."
                ),
            )
        else:
            notify_admins(
                study=study,
                event_type="quotation_declined",
                title="Quotation Declined by Client",
                message=(
                    f'The client has declined the quotation '
                    f'for study "{study.name}". '
                    f"Quotation Version: {quotation.version}."
                ),
            )

        return Response(
            {
                "message": (
                    "Quotation accepted successfully."
                    if action == "accept"
                    else "Quotation declined successfully."
                ),
                "quotation": DIYStudyQuotationSerializer(
                    quotation
                ).data,
                "study_status": study.status,
                "confirmed_survey_link": study.confirmed_survey_link,
                "survey_link_status": study.survey_link_status,
            },
            status=status.HTTP_200_OK,
        )

class DIYClientSurveyLinkSubmitView(APIView):
    """
    Allow an authorized client to submit or update
    their survey URL after quotation acceptance.
    """

    authentication_classes = [ClientPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, study_id):

        # Check the client's active company memberships
        company_ids = DIYCompanyMembership.objects.filter(
            user=request.user,
            is_active=True,
            company__is_active=True,
        ).values_list("company_id", flat=True)

        study = (
            DIYStudy.objects.select_for_update()
            .filter(
                id=study_id,
                company_id__in=company_ids,
            )
            .first()
        )

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only accepted quotations can have their survey URL updated
        if study.status not in [
            "client_accepted",
            "project_created",
        ]:
            return Response(
                {
                    "error": (
                        "You can submit a survey URL only "
                        "after accepting the quotation."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Allow submission when the URL is missing or changes were requested
        if study.survey_link_status not in [
            "pending_confirmation",
            "changes_requested",
        ]:
            return Response(
                {
                    "error": (
                        "Your survey URL is not currently awaiting "
                        "submission or correction."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        survey_link = (
            request.data.get("confirmed_survey_link") or ""
        ).strip()

        if not survey_link:
            return Response(
                {
                    "confirmed_survey_link": [
                        "Please provide your survey URL."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            URLValidator()(survey_link)
        except ValidationError:
            return Response(
                {
                    "confirmed_survey_link": [
                        "Enter a valid survey URL."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        study.confirmed_survey_link = survey_link
        study.survey_link_status = "pending_validation"
        study.survey_link_reviewed_by = None

        study.save(
            update_fields=[
                "confirmed_survey_link",
                "survey_link_status",
                "survey_link_reviewed_by",
                "updated_at",
            ]
        )

        notify_admins(
            study=study,
            event_type="survey_link_submitted",
            title="Survey URL Submitted by Client",
            message=(
                f'The client has submitted or updated the survey URL '
                f'for study "{study.name}". '
                "The URL is awaiting admin validation."
            ),
        )

        return Response(
            {
                "message": "Survey URL submitted successfully. Awaiting admin validation.",
                "confirmed_survey_link": study.confirmed_survey_link,
                "survey_link_status": study.survey_link_status,
                "study_status": study.status,
            },
            status=status.HTTP_200_OK,
        )
    
class DIYStudyProjectConversionView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def post(self, request, study_id):

        study = (
            DIYStudy.objects.select_for_update()
            .select_related("company", "project")
            .filter(id=study_id)
            .first()
        )

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Prevent duplicate conversion
        if study.project_id:
            return Response(
                {
                    "error": "This study is already linked to a Project.",
                    "project_id": study.project_id,
                },
                status=status.HTTP_409_CONFLICT,
            )

        # Conversion is allowed only after client acceptance
        if study.status != "client_accepted":
            return Response(
                {
                    "error": (
                        "The client must accept the quotation "
                        "before Project creation."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find the latest accepted quotation
        quotation = (
            DIYStudyQuotation.objects.select_for_update()
            .filter(
                study=study,
                status="accepted",
            )
            .order_by("-version")
            .first()
        )

        if quotation is None:
            return Response(
                {
                    "error": "No accepted quotation was found."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        latest_version = (
            DIYStudyQuotation.objects
            .filter(study=study)
            .order_by("-version")
            .values_list("version", flat=True)
            .first()
        )

        if quotation.version != latest_version:
            return Response(
                {
                    "error": (
                        "The accepted quotation is not the latest version."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate company and study information
        if not study.company:
            return Response(
                {"error": "This study has no company assigned."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        company_name = (study.company.name or "").strip()
        study_name = (study.name or "").strip()

        if not company_name or not study_name:
            return Response(
                {
                    "error": (
                        "Company name and study name are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Map DIY study type to internal Project study type
        valid_project_types = {
            value for value, label in Project.STUDY_TYPES
        }

        study_type_mapping = {
            "online_survey": "B2C",
        }

        diy_study_type = (study.study_type or "").strip()

        mapped_study_type = study_type_mapping.get(
            diy_study_type,
            diy_study_type,
        )

        if mapped_study_type not in valid_project_types:
            return Response(
                {
                    "error": (
                        "This DIY study type has no approved mapping "
                        "to an internal Project study type."
                    ),
                    "diy_study_type": diy_study_type,
                    "valid_project_types": sorted(valid_project_types),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        normalized_company = normalize_name(company_name)
        normalized_study = normalize_name(study_name)

        # Find matching internal Clients
        matching_clients = []

        clients = Client.objects.select_for_update().all()

        for client in clients:
            if normalize_name(client.name) == normalized_company:
                matching_clients.append(client)

        if len(matching_clients) > 1:
            return Response(
                {
                    "error": (
                        "Multiple Clients match this company name. "
                        "Resolve them before conversion."
                    ),
                    "matching_client_ids": [
                        client.id for client in matching_clients
                    ],
                },
                status=status.HTTP_409_CONFLICT,
            )

        # Reuse an existing Client or create one
        if matching_clients:
            internal_client = matching_clients[0]
        else:
            internal_client = Client.objects.create(
                name=company_name,
                company_type="client",
                country=study.country or None,
                is_diy=True,
                client_source="diy_portal",
            )

        # Different DIY studies may have the same name.
        # Each study receives its own Project.
        # Duplicate conversion of the same study is prevented
        # by checking study.project_id above.
        
        # Generate unique DIY reference
        reference_sequence = DIYProjectReference.objects.create()

        external_reference = f"OB{reference_sequence.pk:02d}"

        # Create operational Project using accepted quotation
        project = Project.objects.create(
            name=study_name,
            study_type=mapped_study_type,
            country=study.country,
            language=study.language,
            client=internal_client,
            target=quotation.proposed_completes,
            max_completes=quotation.proposed_completes,
            loi=study.survey_length,
            ir=int(study.incidence_rate or 0),
            live_link=None,
            test_link=None,
            status="bidding",
            project_brief=study.description or "",
            project_source="diy_portal",
            external_reference=external_reference,
        )

        # Link Project and mark study as converted
        study.project = project
        study.status = "project_created"
        study.converted_at = timezone.now()

        study.save(
            update_fields=[
                "project",
                "status",
                "converted_at",
                "updated_at",
            ]
        )

        notify_client(
            study=study,
            event_type="project_created",
            title="Your Project Has Been Created",
            message=(
                f'Your study "{study.name}" has been converted '
                f"into an operational Project. "
                f"Project Reference: {project.external_reference}. "
                "The Project is currently in bidding status. "
                "Fieldwork has not started."
            ),
        )

        return Response(
            {
                "message": "DIY study converted into Project successfully.",
                "study": DIYStudySerializer(study).data,
                "project_id": project.id,
                "project_reference": project.external_reference,
                "internal_client_id": internal_client.id,
                "quotation_id": quotation.id,
            },
            status=status.HTTP_201_CREATED,
        )

class DIYStudyQuotationListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, study_id):

        study = DIYStudy.objects.filter(
            id=study_id
        ).first()

        if study is None:
            return Response(
                {"error": "Study not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        quotations = (
            DIYStudyQuotation.objects
            .filter(study=study)
            .order_by("-version")
        )

        serializer = DIYStudyQuotationSerializer(
            quotations,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

class DIYClientNotificationListView(APIView):
    authentication_classes = [ClientPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memberships = DIYCompanyMembership.objects.filter(
            user=request.user,
            is_active=True,
            company__is_active=True,
        ).values_list("company_id", flat=True)

        notifications = DIYNotification.objects.filter(
            client_recipient=request.user,
            study__company_id__in=memberships,
        ).order_by("-created_at")

        unread_count = notifications.filter(is_read=False).count()

        data = [
            {
                "id": notification.id,
                "study_id": notification.study_id,
                "study_name": notification.study.name,
                "event_type": notification.event_type,
                "title": notification.title,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at,
            }
            for notification in notifications
        ]

        return Response(
            {
                "unread_count": unread_count,
                "notifications": data,
            },
            status=status.HTTP_200_OK,
        )

class DIYAdminNotificationListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        notifications = DIYNotification.objects.filter(
            admin_recipient=request.user,
        ).select_related(
            "study",
        ).order_by("-created_at")

        unread_count = notifications.filter(is_read=False).count()

        data = [
            {
                "id": notification.id,
                "study_id": notification.study_id,
                "study_name": notification.study.name,
                "event_type": notification.event_type,
                "title": notification.title,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at,
            }
            for notification in notifications
        ]

        return Response(
            {
                "unread_count": unread_count,
                "notifications": data,
            },
            status=status.HTTP_200_OK,
        )
    
class DIYClientNotificationMarkReadView(APIView):
    authentication_classes = [ClientPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        memberships = DIYCompanyMembership.objects.filter(
            user=request.user,
            is_active=True,
            company__is_active=True,
        ).values_list("company_id", flat=True)

        notification = DIYNotification.objects.filter(
            id=notification_id,
            client_recipient=request.user,
            study__company_id__in=memberships,
        ).first()

        if not notification:
            return Response(
                {"error": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])

        return Response(
            {
                "message": "Notification marked as read.",
                "notification_id": notification.id,
                "is_read": notification.is_read,
            },
            status=status.HTTP_200_OK,
        )

class DIYAdminNotificationMarkReadView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, notification_id):
        notification = DIYNotification.objects.filter(
            id=notification_id,
            admin_recipient=request.user,
        ).first()

        if not notification:
            return Response(
                {"error": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])

        return Response(
            {
                "message": "Notification marked as read.",
                "notification_id": notification.id,
                "is_read": notification.is_read,
            },
            status=status.HTTP_200_OK,
        )

class DIYAdminNotificationMarkAllReadView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        updated_count = DIYNotification.objects.filter(
            admin_recipient=request.user,
            is_read=False,
        ).update(is_read=True)

        return Response(
            {
                "message": "All notifications marked as read.",
                "updated_count": updated_count,
            },
            status=status.HTTP_200_OK,
        )