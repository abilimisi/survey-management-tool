import re

from django.contrib.auth.models import User

from django.conf import settings
from rest_framework import serializers 
from .models import Client, CompanyContact, Vendor, Project, ProjectVendor, Respondent, RedirectLog,  UserProfile,ScreeningQuestion,ScreeningOption,RespondentAnswer,PanelCampaign,PanelCampaignRecipient,CampaignEmailTemplate
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken
import uuid

from django.db import transaction
from rest_framework.exceptions import AuthenticationFailed
from .models import ActiveLoginSession
from datetime import timedelta
from django.utils import timezone

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        with transaction.atomic():
            data = super().validate(attrs)

            data["is_superuser"] = self.user.is_superuser

            if self.user.is_superuser:
                data["role"] = "Admin"
            else:
                profile = getattr(self.user, "userprofile", None)
                data["role"] = (
                    profile.role if profile and profile.role else "User"
                )

            return data
        
    @classmethod
    def get_token(cls, user):
        with transaction.atomic():
            locked_user = User.objects.select_for_update().get(pk=user.pk)

            now = timezone.now()

            active_session = ActiveLoginSession.objects.filter(
                user=locked_user
            ).first()

            if active_session:
                absolute_expired = (
                    now >= active_session.created_at + timedelta(hours=8)
                )

                idle_expired = (
                    now >= active_session.last_seen_at + timedelta(minutes=5)
                )

                if absolute_expired or idle_expired:
                    active_session.delete()
                else:
                    raise AuthenticationFailed(
                        "This account is already logged in on another device. "
                        "Please log out from that device first."
                    )

            session_id = uuid.uuid4()

            token = super().get_token(locked_user)
            token["session_id"] = str(session_id)

            ActiveLoginSession.objects.create(
                user=locked_user,
                session_id=session_id
            )

            return token
   
class CustomTokenRefreshSerializer(TokenRefreshSerializer):

    def validate(self, attrs):
        try:
            refresh = RefreshToken(attrs["refresh"])

            session_id = refresh.get("session_id")

            if not session_id:
                raise AuthenticationFailed("Invalid login session.")

            active_session = ActiveLoginSession.objects.filter(
                user_id=refresh["user_id"],
                session_id=session_id
            ).first()

            if not active_session:
                raise AuthenticationFailed(
                    "Your login session is no longer active. Please log in again."
                )

            now = timezone.now()

            absolute_expired = (
                now >= active_session.created_at + timedelta(hours=8)
            )

            idle_expired = (
                now >= active_session.last_seen_at + timedelta(minutes=5)
            )

            if absolute_expired or idle_expired:
                active_session.delete()

                raise AuthenticationFailed(
                    "Your session has expired. Please log in again."
                )

            return super().validate(attrs)

        except AuthenticationFailed:
            raise
        
class ClientSerializer(serializers.ModelSerializer):

    def validate_contact_number(self, value):
        if not value:
            return value

        value = value.strip()

        if not re.fullmatch(r"\d{10}", value):
            raise serializers.ValidationError(
                "Contact number must be exactly 10 digits."
            )

        return value

    class Meta:
        model = Client
        fields = "__all__"


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)

    hits = serializers.SerializerMethodField()
    completes = serializers.SerializerMethodField()
    quota_full_count = serializers.SerializerMethodField()
    ir_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = [
            "project_source",
            "external_reference",
        ]

    def get_hits(self, obj):
        return obj.respondents.count()

    def get_completes(self, obj):
        return obj.respondents.filter(status="complete").count()

    def get_quota_full_count(self, obj):
        return obj.respondents.filter(status="quota_full").count()

    def get_ir_percentage(self, obj):
        hits = obj.respondents.count()
        completes = obj.respondents.filter(status="complete").count()

        if hits == 0:
            return 0

        return round((completes / hits) * 100, 2)


class ProjectVendorSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    supplier_link = serializers.SerializerMethodField()

    class Meta:
        model = ProjectVendor
        fields = "__all__"

    def get_supplier_link(self, obj):
        base_url = settings.PUBLIC_BACKEND_URL
        template = obj.supplier_parameter_template or "pid={{PANELIST IDENTIFIER}}"

        return f"{base_url}/api/survey/start/?gid={obj.gid}&{template}"


class RespondentSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)

    class Meta:
        model = Respondent
        fields = "__all__"


class RedirectLogSerializer(serializers.ModelSerializer):
    respondent_code = serializers.CharField(source="respondent.respondent_id", read_only=True)

    class Meta:
        model = RedirectLog
        fields = "__all__"

class CompanyContactSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CompanyContact
        fields = "__all__"

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name or ''}".strip()
    
    

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True)
    dob = serializers.DateField(
        required=False,
        allow_null=True
    )
    joining_date = serializers.DateField(
        required=False,
        allow_null=True
    )
    email = serializers.EmailField(
        required=False,
        allow_blank=True
    )
    mobile = serializers.CharField(
        required=False,
        allow_blank=True
    )
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "password",
            "role",
            "dob",
            "joining_date",
            "email",
            "mobile",
            "is_active",
        ]
        extra_kwargs = {
            "password": {
                "write_only": True,
                "required": False,
            }
        }

    def create(self, validated_data):
        role = validated_data.pop("role")
        dob = validated_data.pop("dob", None)
        joining_date = validated_data.pop("joining_date", None)
        email = validated_data.pop("email", "")
        mobile = validated_data.pop("mobile", "")
        validated_data.pop("is_active", None)

        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=email,
        )

        UserProfile.objects.create(
            user=user,
            role=role,
            dob=dob,
            joining_date=joining_date,
            email=email,
            mobile=mobile,
        )

        return user

    
class ScreeningOptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = ScreeningOption
        fields = "__all__"
        read_only_fields = ["question"]

class ScreeningQuestionSerializer(serializers.ModelSerializer):

    options = ScreeningOptionSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = ScreeningQuestion
        fields = "__all__"
        read_only_fields = ["project"]

class RespondentAnswerSerializer(serializers.ModelSerializer):

    class Meta:
        model = RespondentAnswer
        fields = "__all__"

class PanelCampaignSerializer(serializers.ModelSerializer):

    project_name = serializers.CharField(
        source="project.name",
        read_only=True
    )

    hits = serializers.SerializerMethodField()
    completes = serializers.SerializerMethodField()
    ir = serializers.SerializerMethodField()

    def get_hits(self, obj):
        return obj.recipients.filter(clicked=True).count()

    def get_completes(self, obj):
        return obj.recipients.filter(status="complete").count()

    def get_ir(self, obj):
        hits = self.get_hits(obj)
        completes = self.get_completes(obj)

        return round((completes / hits) * 100, 2) if hits else 0

    class Meta:
        model = PanelCampaign
        fields = "__all__"


class PanelCampaignDashboardSerializer(serializers.ModelSerializer):

    project_name = serializers.CharField(
        source="project.name",
        read_only=True
    )

    vendor_name = serializers.CharField(
        source="project_vendor.vendor.name",
        read_only=True
    )

    class Meta:
        model = PanelCampaign

        fields = [
            "id",
            "name",
            "project_name",
            "vendor_name",
            "status",
            "target",
            "country",
            "gender",
            "industry",
        ]

class CampaignEmailTemplateSerializer(serializers.ModelSerializer):

    campaign_name = serializers.CharField(
        source="campaign.name",
        read_only=True
    )

    class Meta:
        model = CampaignEmailTemplate
        fields = [
            "id",
            "campaign",
            "campaign_name",
            "subject",
            "body",
            "updated_at",
        ]

