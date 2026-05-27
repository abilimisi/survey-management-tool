from django.contrib import admin
from .models import Client, Vendor, Project, ProjectVendor, Respondent, RedirectLog


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "company_name", "status", "created_at")
    search_fields = ("name", "company_name", "email")


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "cpc", "status", "created_at")
    search_fields = ("name", "email")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "client", "country", "target", "status", "created_at")
    search_fields = ("name", "country")


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