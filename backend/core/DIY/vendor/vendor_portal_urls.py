
from django.urls import path

from .vendor_portal_views import (
    VendorPortalAdminApplicationsView,
    VendorPortalRegisterView,
    VendorPortalLoginView,
    VendorPortalMeView,
    VendorPortalProfileView,
    VendorPortalSubmitView,
    VendorPortalProjectsView,
    VendorPortalProjectResponseView,
    VendorPortalProjectMessagesView,
    VendorPortalNotificationsView,
    VendorPortalNotificationReadView,
    VendorPortalMarkAllNotificationsReadView,
    VendorPortalAdminNotificationsView,
    VendorPortalAdminNotificationReadView,
    VendorPortalAdminMarkAllNotificationsReadView,
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
    path(
        "projects/",
        VendorPortalProjectsView.as_view(),
        name="vendor-portal-projects",
    ),
    path(
        "projects/<int:assignment_id>/response/",
        VendorPortalProjectResponseView.as_view(),
        name="vendor-portal-project-response",
    ),
    path(
        "projects/<int:assignment_id>/messages/",
        VendorPortalProjectMessagesView.as_view(),
        name="vendor-portal-project-messages",
    ),
        # Vendor notifications
    path(
        "notifications/",
        VendorPortalNotificationsView.as_view(),
        name="vendor-portal-notifications",
    ),
    path(
        "notifications/<int:notification_id>/read/",
        VendorPortalNotificationReadView.as_view(),
        name="vendor-portal-notification-read",
    ),
    path(
        "notifications/read-all/",
        VendorPortalMarkAllNotificationsReadView.as_view(),
        name="vendor-portal-notifications-read-all",
    ),

    # Admin notifications
    path(
        "admin/notifications/",
        VendorPortalAdminNotificationsView.as_view(),
        name="vendor-portal-admin-notifications",
    ),
    path(
        "admin/notifications/<int:notification_id>/read/",
        VendorPortalAdminNotificationReadView.as_view(),
        name="vendor-portal-admin-notification-read",
    ),
    path(
        "admin/notifications/read-all/",
        VendorPortalAdminMarkAllNotificationsReadView.as_view(),
        name="vendor-portal-admin-notifications-read-all",
    ),

]
