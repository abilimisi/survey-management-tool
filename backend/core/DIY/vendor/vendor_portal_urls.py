
from django.urls import path

from .vendor_portal_views import (
    VendorPortalAdminApplicationsView,
    VendorPortalRegisterView,
    VendorPortalLoginView,
    VendorPortalMeView,
    VendorPortalProfileView,
    VendorPortalSubmitView,
)

urlpatterns = [
    path("register/", VendorPortalRegisterView.as_view(), name="vendor-portal-register"),
    path("login/", VendorPortalLoginView.as_view(), name="vendor-portal-login"),
    path("me/", VendorPortalMeView.as_view(), name="vendor-portal-me"),
    path("profile/", VendorPortalProfileView.as_view(), name="vendor-portal-profile"),
    path("submit/", VendorPortalSubmitView.as_view(), name="vendor-portal-submit"),
    path(
    "admin/applications/",
    VendorPortalAdminApplicationsView.as_view(),
    name="vendor-portal-admin-applications",
    ),
    path(
        "admin/applications/<int:application_id>/decision/",
        VendorPortalAdminApplicationsView.as_view(),
        name="vendor-portal-admin-decision",
    ),

]
