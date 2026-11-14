
from django.db.models import Q

from rest_framework import generics, serializers
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import BasePermission, IsAuthenticated

from .jwt_authentication import RevocableJWTAuthentication
from .models import (
    ClientPortalUser,
    DIYCompanyMembership,
    VendorPortalUser,
    VendorApplication,
)


# ============================================================
# ADMIN PERMISSION
# ============================================================

class IsInternalSuperuser(BasePermission):
    """
    Only authenticated internal superusers can access
    the DIY client and vendor registration directories.

    External client/vendor portal accounts cannot access
    these admin APIs.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


# ============================================================
# PAGINATION
# ============================================================

class RegistrationDirectoryPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


# ============================================================
# REGISTERED CLIENT SERIALIZER
# ============================================================

class RegisteredClientSerializer(serializers.ModelSerializer):

    companies = serializers.SerializerMethodField()

    class Meta:
        model = ClientPortalUser

        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "is_active",
            "is_email_verified",
            "created_at",
            "companies",
        ]

    def get_companies(self, obj):

        memberships = (
            DIYCompanyMembership.objects
            .filter(
                user=obj,
                is_active=True,
                company__is_active=True,
            )
            .select_related("company")
        )

        return [
            {
                "id": membership.company_id,
                "name": membership.company.name,
                "role": membership.role,
            }
            for membership in memberships
        ]


# ============================================================
# REGISTERED VENDOR SERIALIZER
# ============================================================

class RegisteredVendorSerializer(serializers.ModelSerializer):

    company_name = serializers.SerializerMethodField()
    contact_number = serializers.SerializerMethodField()
    country = serializers.SerializerMethodField()

    application_status = serializers.SerializerMethodField()
    profile_submitted = serializers.SerializerMethodField()
    submitted_at = serializers.SerializerMethodField()
    vendor_id = serializers.SerializerMethodField()

    class Meta:
        model = VendorPortalUser

        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "is_active",
            "created_at",
            "company_name",
            "contact_number",
            "country",
            "application_status",
            "profile_submitted",
            "submitted_at",
            "vendor_id",
        ]

    def get_application(self, obj):
        """
        Safely retrieve the linked VendorApplication.

        A vendor account can exist even if its application
        record is missing.
        """

        return getattr(obj, "application", None)

    def get_application_status(self, obj):

        application = self.get_application(obj)

        if application is None:
            return "not_created"

        return application.status

    def get_company_name(self, obj):

        application = self.get_application(obj)

        if application and application.company_name:
            return application.company_name

        return obj.company_name or ""

    def get_contact_number(self, obj):

        application = self.get_application(obj)

        if application and application.contact_number:
            return application.contact_number

        return obj.contact_number or ""

    def get_country(self, obj):

        application = self.get_application(obj)

        if application and application.country:
            return application.country

        return obj.country or ""

    def get_profile_submitted(self, obj):

        application = self.get_application(obj)

        if application is None:
            return False

        return application.status != "draft"

    def get_submitted_at(self, obj):

        application = self.get_application(obj)

        if application is None:
            return None

        return application.submitted_at

    def get_vendor_id(self, obj):

        application = self.get_application(obj)

        if application and application.vendor_id:
            return application.vendor_id

        return obj.vendor_id


# ============================================================
# REGISTERED CLIENT LIST API
# ============================================================

class RegisteredClientListView(generics.ListAPIView):

    authentication_classes = [
        RevocableJWTAuthentication,
    ]

    permission_classes = [
        IsAuthenticated,
        IsInternalSuperuser,
    ]

    serializer_class = RegisteredClientSerializer
    pagination_class = RegistrationDirectoryPagination

    def get_queryset(self):

        queryset = (
            ClientPortalUser.objects
            .all()
            .order_by("-created_at")
        )

        # Search by client name, email or company name.
        search = self.request.query_params.get(
            "search", ""
        ).strip()

        if search:

            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
                | Q(
                    diycompanymembership__company__name__icontains=search
                )
            ).distinct()

        # Filter by account status.
        status_filter = self.request.query_params.get("status")

        if status_filter == "active":
            queryset = queryset.filter(is_active=True)

        elif status_filter == "inactive":
            queryset = queryset.filter(is_active=False)

        return queryset


# ============================================================
# REGISTERED VENDOR LIST API
# ============================================================

class RegisteredVendorListView(generics.ListAPIView):

    authentication_classes = [
        RevocableJWTAuthentication,
    ]

    permission_classes = [
        IsAuthenticated,
        IsInternalSuperuser,
    ]

    serializer_class = RegisteredVendorSerializer
    pagination_class = RegistrationDirectoryPagination

    def get_queryset(self):

        queryset = (
            VendorPortalUser.objects
            .select_related("application")
            .all()
            .order_by("-created_at")
        )

        # Search by vendor name, email, company,
        # contact number or country.
        search = self.request.query_params.get(
            "search", ""
        ).strip()

        if search:

            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
                | Q(company_name__icontains=search)
                | Q(application__company_name__icontains=search)
                | Q(contact_number__icontains=search)
                | Q(country__icontains=search)
                | Q(application__contact_number__icontains=search)
                | Q(application__country__icontains=search)
            ).distinct()

        # Filter by vendor account status.
        account_status = self.request.query_params.get("status")

        if account_status == "active":
            queryset = queryset.filter(is_active=True)

        elif account_status == "inactive":
            queryset = queryset.filter(is_active=False)

        # Filter by actual VendorApplication status.
        application_status = self.request.query_params.get(
            "application_status"
        )

        if application_status:

            valid_statuses = {
                choice[0]
                for choice in VendorApplication.STATUS_CHOICES
            }

            if application_status in valid_statuses:

                queryset = queryset.filter(
                    application__status=application_status
                )

            else:

                queryset = queryset.none()

        return queryset
