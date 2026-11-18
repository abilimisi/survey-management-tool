
from django.urls import path

from .client_portal_views import (
    ClientPortalRegisterView,
    ClientPortalLoginView,
    ClientPortalMeView,
    ClientPortalCompanyProfileView,
    ClientPortalVerifyEmailView,
    ClientPortalResendVerificationView,
    ClientPortalPasswordResetRequestView,
    ClientPortalPasswordResetConfirmView,
)

urlpatterns = [
    path("register/", ClientPortalRegisterView.as_view(), name="client-portal-register"),
    path("login/", ClientPortalLoginView.as_view(), name="client-portal-login"),
    path("me/", ClientPortalMeView.as_view(), name="client-portal-me"),
    path(
        "verify-email/",
        ClientPortalVerifyEmailView.as_view(),
        name="client-portal-verify-email",
    ),
    path(
        "resend-verification/",
        ClientPortalResendVerificationView.as_view(),
        name="client-portal-resend-verification",
    ),
    path(
        "password-reset/request/",
        ClientPortalPasswordResetRequestView.as_view(),
        name="client-portal-password-reset-request",
    ),
    path(
        "password-reset/confirm/",
        ClientPortalPasswordResetConfirmView.as_view(),
        name="client-portal-password-reset-confirm",
    ),

    path(
        "companies/<int:company_id>/profile/",
        ClientPortalCompanyProfileView.as_view(),
        name="client-portal-company-profile",
    ),
]
