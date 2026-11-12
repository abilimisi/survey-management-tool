
from django.urls import path

from .client_portal_views import (
    ClientPortalRegisterView,
    ClientPortalLoginView,
    ClientPortalMeView,
    ClientPortalCompanyProfileView,
)

urlpatterns = [
    path("register/", ClientPortalRegisterView.as_view(), name="client-portal-register"),
    path("login/", ClientPortalLoginView.as_view(), name="client-portal-login"),
    path("me/", ClientPortalMeView.as_view(), name="client-portal-me"),
    path(
        "companies/<int:company_id>/profile/",
        ClientPortalCompanyProfileView.as_view(),
        name="client-portal-company-profile",
    ),
]
