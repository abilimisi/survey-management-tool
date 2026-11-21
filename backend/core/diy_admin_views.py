
from django.db.models import Q

from rest_framework import generics, serializers
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import BasePermission, IsAuthenticated
from .permissions import HasDIYAdminAccess
from .jwt_authentication import RevocableJWTAuthentication
from .models import (
    ClientPortalUser,
    DIYCompanyMembership,
    VendorPortalUser,
    VendorApplication,
    DIYAdminAccessGrant,
)
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

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
# DIY ADMIN ACCESS GRANT SERIALIZER
# ============================================================

class DIYAdminAccessGrantSerializer(serializers.ModelSerializer):

    user_id = serializers.IntegerField(write_only=True)

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    user_email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    granted_by_username = serializers.CharField(
        source="granted_by.username",
        read_only=True
    )

    revoked_by_username = serializers.CharField(
        source="revoked_by.username",
        read_only=True
    )

    class Meta:
        model = DIYAdminAccessGrant

        fields = [
            "id",
            "user_id",
            "username",
            "user_email",
            "granted_by_username",
            "is_active",
            "granted_at",
            "expires_at",
            "revoked_at",
            "revoked_by_username",
            "notes",
        ]

        read_only_fields = [
            "id",
            "username",
            "user_email",
            "granted_by_username",
            "is_active",
            "granted_at",
            "revoked_at",
            "revoked_by_username",
        ]

    def validate_user_id(self, value):

        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                "Internal user does not exist."
            )

        return value

    def validate_expires_at(self, value):

        if value and value <= timezone.now():
            raise serializers.ValidationError(
                "Expiry date must be in the future."
            )

        return value

    def create(self, validated_data):

        user_id = validated_data.pop("user_id")
        expires_at = validated_data.get("expires_at")
        notes = validated_data.get("notes", "")

        target_user = User.objects.get(id=user_id)

        # Do not create DIY grants for permanent Super Admins.
        if target_user.is_superuser:
            raise serializers.ValidationError(
                "Permanent Super Admins already have DIY Admin access."
            )

        # Revoke any currently active grants for this user.
        DIYAdminAccessGrant.objects.filter(
            user=target_user,
            is_active=True,
            revoked_at__isnull=True,
        ).update(
            is_active=False,
            revoked_at=timezone.now(),
            revoked_by=self.context["request"].user,
        )

        # Create a new grant record for audit history.
        grant = DIYAdminAccessGrant.objects.create(
            user=target_user,
            granted_by=self.context["request"].user,
            is_active=True,
            expires_at=expires_at,
            notes=notes,
        )

        return grant
    
 # ============================================================
# DIY ADMIN ACCESS GRANT MANAGEMENT API
# SUPER ADMIN ONLY
# ============================================================

class DIYAdminAccessGrantListCreateView(
    generics.ListCreateAPIView
):

    authentication_classes = [
        RevocableJWTAuthentication,
    ]

    permission_classes = [
        IsAuthenticated,
        IsInternalSuperuser,
    ]

    serializer_class = DIYAdminAccessGrantSerializer

    queryset = (
        DIYAdminAccessGrant.objects
        .select_related(
            "user",
            "granted_by",
            "revoked_by",
        )
        .all()
    )

    def get_queryset(self):

        queryset = super().get_queryset()

        # Optional filter: active grants only
        active_filter = self.request.query_params.get("active")

        if active_filter == "true":
            queryset = queryset.filter(
                is_active=True,
                revoked_at__isnull=True,
            ).filter(
                Q(expires_at__isnull=True)
                | Q(expires_at__gt=timezone.now())
            )

        elif active_filter == "false":
            queryset = queryset.filter(
                is_active=False,
            )

        return queryset

    def perform_create(self, serializer):

        serializer.save()
        
        
# ============================================================
# DIY ADMIN ACCESS CHECK API
# ============================================================

class DIYAdminAccessCheckView(APIView):

    authentication_classes = [
        RevocableJWTAuthentication,
    ]

    permission_classes = [
        IsAuthenticated,
        HasDIYAdminAccess,
    ]

    def get(self, request):

        if request.user.is_superuser:
            return Response(
                {
                    "has_access": True,
                    "is_superuser": True,
                    "expires_at": None,
                    "access_type": "permanent",
                },
                status=status.HTTP_200_OK,
            )

        grant = (
            DIYAdminAccessGrant.objects
            .filter(
                user=request.user,
                is_active=True,
                revoked_at__isnull=True,
            )
            .filter(
                Q(expires_at__isnull=True)
                | Q(expires_at__gt=timezone.now())
            )
            .order_by("-granted_at")
            .first()
        )

        return Response(
            {
                "has_access": True,
                "is_superuser": False,
                "expires_at": grant.expires_at if grant else None,
                "access_type": (
                    "permanent"
                    if grant and grant.expires_at is None
                    else "temporary"
                ),
            },
            status=status.HTTP_200_OK,
        )
        
 # ============================================================
# REVOKE DIY ADMIN ACCESS API
# SUPER ADMIN ONLY
# ============================================================

class DIYAdminAccessGrantRevokeView(APIView):

    authentication_classes = [
        RevocableJWTAuthentication,
    ]

    permission_classes = [
        IsAuthenticated,
        IsInternalSuperuser,
    ]

    def post(self, request, grant_id):

        try:
            grant = DIYAdminAccessGrant.objects.get(
                id=grant_id
            )

        except DIYAdminAccessGrant.DoesNotExist:
            return Response(
                {
                    "detail": "DIY Admin access grant not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not grant.is_active or grant.revoked_at is not None:

            return Response(
                {
                    "detail": "This access grant has already been revoked."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        grant.is_active = False
        grant.revoked_at = timezone.now()
        grant.revoked_by = request.user

        grant.save(
            update_fields=[
                "is_active",
                "revoked_at",
                "revoked_by",
            ]
        )

        return Response(
            {
                "detail": "DIY Admin access revoked successfully.",
                "grant_id": grant.id,
                "user_id": grant.user_id,
            },
            status=status.HTTP_200_OK,
        ) 

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
        HasDIYAdminAccess,
    ]

    serializer_class = RegisteredClientSerializer
    pagination_class = RegistrationDirectoryPagination

    def get_queryset(self):

        queryset = (
            ClientPortalUser.objects
            .prefetch_related("diy_company_memberships__company")
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
                | Q(diy_company_memberships__company__name__icontains=search)
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
        HasDIYAdminAccess,
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
