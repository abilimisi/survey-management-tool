from django.urls import path, include
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static
# from .views import recent_projects_stats
from .views import (
    get_users,
    create_user,
    update_user,
    delete_user
)

from .views import (
    ClientViewSet,
    CompanyContactViewSet,
    VendorViewSet,
    ProjectViewSet,
    ProjectVendorViewSet,
    RespondentViewSet,
    RedirectLogViewSet,
    panelist_list,
    process_s2s,
    redirect_journey,
    reports_data,
    start_survey,
    handle_survey_result,
    sync_panelists,
    universal_result,
    dashboard_stats,
    project_report,
    supplier_statistics,
    respondent_hints,
    recent_projects,
    CompanyContactViewSet,
    
)

router = routers.DefaultRouter()
router.register("clients", ClientViewSet)
router.register("vendors", VendorViewSet)
router.register("projects", ProjectViewSet)
router.register("project-vendors", ProjectVendorViewSet)
router.register("respondents", RespondentViewSet)
router.register("redirect-logs", RedirectLogViewSet)
router.register("company-contacts", CompanyContactViewSet)

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
    path("reports/", reports_data, name="reports-data"),

    path("panelists/sync/", sync_panelists),
    path("panelists/", panelist_list),
    path("dashboard/recent_projects/",recent_projects,name="recent_projects"),
    
    path("users/",get_users),
    path("users/create/",create_user),
    path("users/<int:pk>/update/",update_user),
    path("users/<int:pk>/delete/",delete_user),
    path("users/create/",create_user,name="create-user"),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 