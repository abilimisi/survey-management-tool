
import re
import unicodedata

from rest_framework import status,serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Client, Project, DIYStudy, DIYCompanyMembership, DIYProjectReference
from .client_portal_auth import ClientPortalJWTAuthentication
from .diy_serializers import DIYStudySerializer
from django.db import transaction

from django.utils import timezone
from rest_framework.permissions import IsAdminUser

from core.DIY.diy_helpers import (
    find_matching_clients,
    find_matching_projects,
)


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
    Allow clients to edit their own draft studies only.
    """

    authentication_classes = [ClientPortalJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, study_id):
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

        if study.status != "draft":
            return Response(
                {
                    "error": (
                        "Only draft studies can be edited. "
                        "Submitted studies cannot be changed."
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

        if study.status != "draft":
            return Response(
                {"error": "Only draft studies can be submitted for review."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        study.status = "submitted"
        study.save(update_fields=["status", "updated_at"])

        return Response(
            DIYStudySerializer(study).data,
            status=status.HTTP_200_OK,
        )




class DIYStudyReviewListView(APIView):
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

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )



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
                {"error": "Only submitted studies can be reviewed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        action = request.data.get("action")
        review_notes = (
            request.data.get("review_notes") or ""
        ).strip()

        if action not in ["approve", "reject"]:
            return Response(
                {"action": ["Choose either 'approve' or 'reject'."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # REJECT STUDY
        if action == "reject":
            if not review_notes:
                return Response(
                    {
                        "review_notes": [
                            "Please provide a reason for rejection."
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            study.status = "rejected"
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

            return Response(
                {
                    "message": "Study rejected.",
                    "study": DIYStudySerializer(study).data,
                },
                status=status.HTTP_200_OK,
            )

        # VALIDATE COMPANY
        if not study.company:
            return Response(
                {"error": "This study has no company assigned."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        company_name = (study.company.name or "").strip()
        study_name = (study.name or "").strip()

        if not company_name:
            return Response(
                {"error": "The DIY company must have a name."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not study_name:
            return Response(
                {"error": "The study must have a name."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if study.project_id:
            return Response(
                {
                    "error": "This study is already linked to a Project.",
                    "project_id": study.project_id,
                },
                status=status.HTTP_409_CONFLICT,
            )

        # MAP DIY STUDY TYPE TO PROJECT STUDY TYPE
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

        # STEP 1: CHECK OTHER PENDING DIY STUDIES FIRST.
        # Do this before creating a Client.
        other_studies = (
            DIYStudy.objects.select_for_update()
            .select_related("company")
            .filter(status__in=["submitted", "under_review"])
            .exclude(id=study.id)
        )

        duplicate_study_ids = []

        for other in other_studies:
            other_company_name = (
                other.company.name if other.company else ""
            )

            if (
                normalize_name(other_company_name) == normalized_company
                and normalize_name(other.name) == normalized_study
            ):
                duplicate_study_ids.append(other.id)

        if duplicate_study_ids:
            return Response(
                {
                    "error": (
                        "Another pending DIY study has the same company "
                        "and study name. Review it before approving."
                    ),
                    "matching_study_ids": duplicate_study_ids,
                },
                status=status.HTTP_409_CONFLICT,
            )

        # STEP 2: FIND AN EXISTING CLIENT.
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
                        "Resolve them before approving this study."
                    ),
                    "matching_client_ids": [
                        client.id for client in matching_clients
                    ],
                },
                status=status.HTTP_409_CONFLICT,
            )

        # STEP 3: REUSE THE CLIENT OR CREATE ONE.
        if len(matching_clients) == 1:
            internal_client = matching_clients[0]
        else:
            internal_client = Client.objects.create(
                name=company_name,
                company_type="client",
                country=study.country or None,
                is_diy=True,
                client_source="diy_portal",
            )

        # STEP 4: CHECK FOR AN EXISTING PROJECT WITH THIS NAME.
        existing_projects = []

        projects = Project.objects.select_for_update().filter(
            client=internal_client
        )

        for existing_project in projects:
            if normalize_name(existing_project.name) == normalized_study:
                existing_projects.append(existing_project)

        if existing_projects:
            return Response(
                {
                    "error": (
                        "A Project with this name already exists for "
                        "this Client. Review it before approving."
                    ),
                    "client_id": internal_client.id,
                    "matching_project_ids": [
                        project.id for project in existing_projects
                    ],
                },
                status=status.HTTP_409_CONFLICT,
            )

        # STEP 5: GENERATE A UNIQUE DIY REFERENCE.
        reference_sequence = DIYProjectReference.objects.create()
        external_reference = f"OB{reference_sequence.pk:02d}"

        # STEP 6: CREATE THE PROJECT.
        project = Project.objects.create(
            name=study_name,
            study_type=mapped_study_type,
            country=study.country,
            language=study.language,
            client=internal_client,
            target=study.target_completes,
            max_completes=study.target_completes,
            loi=study.survey_length,
            ir=int(study.incidence_rate or 0),
            live_link=study.survey_link or None,
            status="bidding",
            project_brief=study.description or "",
            project_source="diy_portal",
            external_reference=external_reference,
        )

        # STEP 7: LINK PROJECT AND APPROVE THE STUDY.
        study.project = project
        study.status = "approved"
        study.reviewed_by = request.user
        study.reviewed_at = timezone.now()
        study.review_notes = review_notes

        study.save(
            update_fields=[
                "project",
                "status",
                "reviewed_by",
                "reviewed_at",
                "review_notes",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": "Study approved and Project created.",
                "study": DIYStudySerializer(study).data,
                "project_id": project.id,
                "project_reference": project.external_reference,
                "internal_client_id": internal_client.id,
            },
            status=status.HTTP_201_CREATED,
        )
