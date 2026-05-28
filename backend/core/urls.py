from django.urls import path, include
from rest_framework import routers

from .views import (
    ClientViewSet,
    VendorViewSet,
    ProjectViewSet,
    ProjectVendorViewSet,
    RespondentViewSet,
    RedirectLogViewSet,
    process_s2s,
    redirect_journey,
    start_survey,
    handle_survey_result,
    universal_result,
    dashboard_stats,
    project_report,
    supplier_statistics,
    respondent_hints,
    
)

router = routers.DefaultRouter()
router.register("clients", ClientViewSet)
router.register("vendors", VendorViewSet)
router.register("projects", ProjectViewSet)
router.register("project-vendors", ProjectVendorViewSet)
router.register("respondents", RespondentViewSet)
router.register("redirect-logs", RedirectLogViewSet)

urlpatterns = [
    path("", include(router.urls)),

    path("survey/start/<int:project_vendor_id>/", start_survey, name="start-survey"),

    path("complete/", lambda request: handle_survey_result(request, "complete"), name="complete"),
    path("terminate/", lambda request: handle_survey_result(request, "terminate"), name="terminate"),
    path("quota-full/", lambda request: handle_survey_result(request, "quota_full"), name="quota-full"),
    path("security-terminate/", lambda request: handle_survey_result(request, "security_terminate"), name="security-terminate"),

    path("survey/result/", universal_result, name="universal-result"),

    path("dashboard/stats/", dashboard_stats, name="dashboard-stats"),
    path("projects/<int:project_id>/report/", project_report, name="project-report"),
    path("projects/<int:project_id>/supplier-stats/", supplier_statistics, name="supplier-statistics"),
    path("project-vendors/<int:project_vendor_id>/hints/",respondent_hints,name="respondent-hints"),
    path("respondents/<str:respondent_id>/journey/",redirect_journey,name="redirect-journey"),

    path("s2s/process/", process_s2s, name="process-s2s"),
]