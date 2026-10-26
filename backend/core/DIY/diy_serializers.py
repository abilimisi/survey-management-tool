
from rest_framework import serializers

from ..models import DIYStudy


class DIYStudySerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(
        source="company.name",
        read_only=True,
        allow_null=True,
    )
    project_reference = serializers.CharField(
        source="project.external_reference",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = DIYStudy
        fields = [
            "id",
            "company",
            "company_name",
            "project_reference",
            "name",
            "study_type",
            "country",
            "language",
            "survey_link",
            "target_completes",
            "survey_length",
            "incidence_rate",
            "description",
            "status",
            "project",
            "reviewed_by",
            "reviewed_at",
            "review_notes",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "company",
            "company_name",
            "project_reference",
            "status",
            "project",
            "reviewed_by",
            "reviewed_at",
            "review_notes",
            "created_at",
            "updated_at",
        ]
