from rest_framework import serializers
from .models import Client, Vendor, Project, ProjectVendor, Respondent, RedirectLog


class ClientSerializer(serializers.ModelSerializer):
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

    # def get_supplier_link(self, obj):
    #     request = self.context.get("request")
    #     path = f"/api/survey/start/{obj.id}/"

    #     if request:
    #         return request.build_absolute_uri(path)

    #     return path

    def get_supplier_link(self, obj):
        public_base_url = "https://backwater-muster-repayment.ngrok-free.dev"
        return f"{public_base_url}/api/survey/start/{obj.id}/"


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