
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import serializers

from ...models import VendorIndustry, VendorPortalUser, VendorApplication, VendorRespondentType, Project, ProjectVendor


class VendorPortalRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        min_length=8,
        max_length=128,
    )
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )

    def validate_email(self, value):
        value = value.strip().lower()

        if VendorPortalUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate_password(self, value):
        user = VendorPortalUser(
            email=self.initial_data.get("email", ""),
            first_name=self.initial_data.get("first_name", ""),
            last_name=self.initial_data.get("last_name", ""),
        )

        try:
            validate_password(value, user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))

        return value

    
    def create(self, validated_data):
        password = validated_data.pop("password")

        vendor_user = VendorPortalUser.objects.create(
            password=make_password(password),
            application_status="pending",
            **validated_data,
        )

        VendorApplication.objects.create(
            user=vendor_user,
            company_name="",
            contact_number="",
            address="",
            city="",
            zip_code="",
            country="",
            status="draft",
        )

        return vendor_user



class VendorPortalLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        password = attrs["password"]

        vendor_user = VendorPortalUser.objects.filter(
            email__iexact=email,
            is_active=True,
        ).first()

        if (
            vendor_user is None
            or not check_password(password, vendor_user.password)
        ):
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        attrs["vendor_user"] = vendor_user
        return attrs



class VendorPortalProfileSerializer(serializers.ModelSerializer):

    profile_submitted = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()
    admin_note = serializers.SerializerMethodField()

    industries = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=VendorIndustry.objects.filter(is_active=True),
        required=False,
    )

    respondent_types = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=VendorRespondentType.objects.filter(is_active=True),
        required=False,
    )

    available_industries = serializers.SerializerMethodField()
    available_respondent_types = serializers.SerializerMethodField()

    class Meta:
        model = VendorApplication
        fields = [
            "company_name",
            "abrv_name",
            "company_website",
            "registration_number",
            "contact_number",
            "invoice_email",
            "tax_id",
            "address",
            "invoicing_method",
            "payment_terms",
            "city",
            "zip_code",
            "country",
            "state",

            "complete_link",
            "terminate_link",
            "quota_full_link",
            "security_terminate_link",

            "industries",
            "respondent_types",
            "available_industries",
            "available_respondent_types",

            "status",
            "submitted_at",
            "profile_submitted",
            "application_status",
            "admin_note",
        ]

        read_only_fields = [
            "status",
            "submitted_at",
            "profile_submitted",
            "application_status",
            "admin_note",
            "available_industries",
            "available_respondent_types",
        ]

    def get_profile_submitted(self, obj):
        return obj.status in [
            "submitted",
            "under_review",
            "changes_requested",
            "approved",
            "rejected",
        ]

    def get_application_status(self, obj):
        return obj.status

    def get_admin_note(self, obj):
        latest_review = (
            obj.reviews.exclude(note="")
            .order_by("-created_at")
            .first()
        )
        return latest_review.note if latest_review else ""

    def get_available_industries(self, obj):
        return list(
            VendorIndustry.objects.filter(is_active=True)
            .values("id", "name")
        )

    def get_available_respondent_types(self, obj):
        return list(
            VendorRespondentType.objects.filter(is_active=True)
            .values("id", "name", "industry_id")
        )

class VendorPortalAssignedProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "study_type",
            "country",
            "language",
            "project_manager",
            "target",
            "max_completes",
            "loi",
            "ir",
            "reward_points",
            "supported_devices",
            "live_link",
            "test_link",
            "start_date",
            "end_date",
            "project_brief",
            "status",
        ]
        read_only_fields = fields


class VendorPortalProjectAssignmentSerializer(serializers.ModelSerializer):
    project = VendorPortalAssignedProjectSerializer(read_only=True)

    unread_messages_count = serializers.SerializerMethodField()

    def get_unread_messages_count(self, obj):
        return obj.messages.filter(
            sender_type="admin",
            is_read=False,
    ).count()

    class Meta:
        model = ProjectVendor
        fields = [
            "id",
            "project",
            "target",
            "vendor_cpc",
            "notes",
            "status",
            "response_status",
            "response_deadline",
            "responded_at",
            "created_at",
            "unread_messages_count",
        ]
        read_only_fields = fields