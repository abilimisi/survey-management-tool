import re

from django.contrib.auth.models import User

from django.conf import settings
from rest_framework import serializers 
from .models import Client, CompanyContact, Vendor, Project, ProjectVendor, Respondent, RedirectLog,  UserProfile

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        data["is_superuser"] = self.user.is_superuser

        return data


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

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "password",
            "role"
        ]

        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):

        role = validated_data.pop("role")

        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"]
        )

        UserProfile.objects.create(
            user=user,
            role=role
        )

        return user