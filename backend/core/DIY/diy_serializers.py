
from django.db import transaction
from rest_framework import serializers

from ..models import (
    DIYStudy,
    DIYSampleRequirement,
    DIYQuota,
    DIYStudyQuotation,
)


class DIYSampleRequirementSerializer(serializers.ModelSerializer):

    class Meta:
        model = DIYSampleRequirement
        fields = [
            "min_age",
            "max_age",
            "gender",
            "industry",
            "profession",
            "additional_criteria",
        ]

    def validate(self, attrs):
        min_age = attrs.get("min_age")
        max_age = attrs.get("max_age")

        # For partial updates, consider existing values too.
        if self.instance:
            if "min_age" not in attrs:
                min_age = self.instance.min_age
            if "max_age" not in attrs:
                max_age = self.instance.max_age

        if (
            min_age is not None
            and max_age is not None
            and min_age > max_age
        ):
            raise serializers.ValidationError({
                "max_age": "Maximum age must be greater than or equal to minimum age."
            })

        return attrs


class DIYQuotaSerializer(serializers.ModelSerializer):

    class Meta:
        model = DIYQuota
        fields = [
            "id",
            "attribute",
            "category",
            "target_completes",
        ]
        read_only_fields = ["id"]

    def validate_target_completes(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Quota target must be greater than zero."
            )
        return value


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

    sample_requirement = DIYSampleRequirementSerializer(
        required=False,
    )

    quotas = DIYQuotaSerializer(
        many=True,
        required=False,
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
            "confirmed_survey_link",
            "survey_link_status",
            "survey_link_reviewed_by",
            "target_completes",
            "survey_length",
            "incidence_rate",
            "description",
            "sample_requirement",
            "quotas",
            "status",
            "project",
            "reviewed_by",
            "reviewed_at",
            "review_notes",
            "submitted_at",
            "converted_at",
            "created_at",
            "updated_at",
            "assessment_status",
            "proposed_completes",
            "estimated_timeline_days",
            "estimated_budget",
            "assessment_notes",
        ]

        read_only_fields = [
            "id",
            "company",
            "company_name",
            "project_reference",
            "status",
            "confirmed_survey_link",
            "survey_link_status",
            "survey_link_reviewed_by",
            "project",
            "reviewed_by",
            "reviewed_at",
            "review_notes",
            "submitted_at",
            "converted_at",
            "created_at",
            "updated_at",
            "assessment_status",
            "proposed_completes",
            "estimated_timeline_days",
            "estimated_budget",
            "assessment_notes",
        ]

    def validate_quotas(self, value):
        seen = set()

        for quota in value:
            key = (
                quota["attribute"],
                quota["category"].strip().casefold(),
            )

            if key in seen:
                raise serializers.ValidationError(
                    "Duplicate quota categories are not allowed."
                )

            seen.add(key)

        return value

    @transaction.atomic
    def create(self, validated_data):

        sample_data = validated_data.pop(
            "sample_requirement", None
        )

        quotas_data = validated_data.pop(
            "quotas", []
        )

        study = DIYStudy.objects.create(**validated_data)

        if sample_data is not None:
            DIYSampleRequirement.objects.create(
                study=study,
                **sample_data,
            )

        for quota_data in quotas_data:
            DIYQuota.objects.create(
                study=study,
                **quota_data,
            )

        return study

    @transaction.atomic
    def update(self, instance, validated_data):

        sample_data = validated_data.pop(
            "sample_requirement", None
        )

        quotas_data = validated_data.pop(
            "quotas", None
        )

        # Update basic study fields.
        instance = super().update(
            instance,
            validated_data,
        )

        # Update or create sample requirements only
        # when sample_requirement is included in the request.
        if sample_data is not None:

            requirement, created = (
                DIYSampleRequirement.objects.get_or_create(
                    study=instance
                )
            )

            for field, value in sample_data.items():
                setattr(requirement, field, value)

            requirement.save()

        # Replace the quota collection only when the
        # request explicitly includes the quotas field.
        if quotas_data is not None:

            instance.quotas.all().delete()

            for quota_data in quotas_data:
                DIYQuota.objects.create(
                    study=instance,
                    **quota_data,
                )

        return instance


class DIYStudyQuotationSerializer(serializers.ModelSerializer):

    class Meta:
        model = DIYStudyQuotation
        fields = [
            "id",
            "study",
            "version",
            "quoted_amount",
            "currency",
            "proposed_completes",
            "estimated_timeline_days",
            "notes",
            "status",
            "sent_at",
            "responded_at",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "study",
            "version",
            "status",
            "sent_at",
            "responded_at",
            "created_at",
        ]

    def validate_quoted_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Quoted amount must be greater than zero."
            )
        return value

    def validate_proposed_completes(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Proposed completes must be greater than zero."
            )
        return value

    def validate_estimated_timeline_days(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Timeline must be greater than zero."
            )
        return value