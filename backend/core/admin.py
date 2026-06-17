from django.contrib import admin
from .models import Client, CompanyContact, Vendor, Project, ProjectVendor, Respondent, RedirectLog


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "abrv_name",
        "company_type",
        "email",
        "country",
        "status",
        "created_at",
    )

    list_filter = (
        "company_type",
        "status",
        "check_proxy",
        "is_diy",
        "country",
    )

    search_fields = (
        "name",
        "abrv_name",
        "email",
        "contact_number",
        "city",
        "country",
    )


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "abrv_name",
        "email",
        "country",
        "cpc",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "check_proxy",
        "is_diy",
        "country",
        "invoicing_method",
    )

    search_fields = (
        "name",
        "abrv_name",
        "email",
        "contact_number",
        "city",
        "country",
        "s2s_token",
    )

    readonly_fields = (
        "s2s_token",
        "created_at",
        "updated_at",
    )


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "client",
        "study_type",
        "country",
        "target",
        "max_completes",
        "cpc",
        "loi",
        "ir",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "study_type",
        "country",
        "client",
    )

    search_fields = (
        "name",
        "client__name",
        "country",
        "project_manager",
        "sales_person",
    )


@admin.register(ProjectVendor)
class ProjectVendorAdmin(admin.ModelAdmin):
    list_display = ("id", "project", "vendor", "vendor_cpc", "target", "status")


@admin.register(Respondent)
class RespondentAdmin(admin.ModelAdmin):
    list_display = ("id", "respondent_id", "project", "vendor", "status", "started_at", "completed_at")
    search_fields = ("respondent_id", "vendor_panelist_id")
    list_filter = ("status", "project", "vendor")


@admin.register(RedirectLog)
class RedirectLogAdmin(admin.ModelAdmin):
    list_display = ("id", "respondent", "redirect_type", "created_at")
    list_filter = ("redirect_type",)

@admin.register(CompanyContact)
class CompanyContactAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "contact_type",
        "client",
        "contact_no",
        "email",
        "country",
        "username",
        "status",
    )

    list_filter = ("status", "contact_type", "country", "client")
    search_fields = ("first_name", "last_name", "email", "contact_no", "client__name")

    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name or ''}"