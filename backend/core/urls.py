from django.urls import path, include
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static
from .panel_campaign_views import *

from .views import (
    create_option,
    create_question,
    delete_option,
    delete_question,
    get_users,
    create_user,
    map_foreign_ids,
    project_questions,
    simple_process,
    start_survey_by_gid,
    update_option,
    update_question,
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
    
    client_projects,
    vendor_projects,
    screening_questions,
    submit_screening,
    recent_responses,
    
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


    path("survey/start/", start_survey_by_gid, name="start-survey-by-gid"),
    path("survey/start/<int:project_vendor_id>/", start_survey, name="start-survey"),
    path("simple-process/", simple_process, name="simple-process"),

    path("clients/<int:client_id>/projects/",client_projects,name="client-projects"),
    path("vendors/<int:vendor_id>/projects/",vendor_projects,name="vendor-projects",),

    path("map-foreign-ids/", map_foreign_ids, name="map-foreign-ids"),  

    path("projects/<int:project_id>/questions/",project_questions),
    path("projects/<int:project_id>/questions/create/",create_question),
    path("questions/<int:question_id>/update/",update_question),
    path("questions/<int:question_id>/delete/",delete_question),
    path("questions/<int:question_id>/options/create/",create_option,name="create-option"),

    path("options/<int:option_id>/update/",update_option),
    path("options/<int:option_id>/delete/",delete_option),

    path("screening/submit/", submit_screening, name="submit-screening"),
    path("screening/<str:respondent_id>/",screening_questions,name="screening-questions"),
    
    
    path("dashboard/recent_responses/", recent_responses),

    path("panel-campaigns/",panel_campaign_list),
    path("panel-campaigns/create/",create_panel_campaign),
    path("panel-campaigns/<int:pk>/",panel_campaign_detail),
    path("panel-campaigns/<int:pk>/update/",update_panel_campaign),
    path("panel-campaigns/<int:pk>/delete/",delete_panel_campaign),

    path(
    "panel-campaigns/<int:pk>/generate/",
    generate_campaign_recipients
    ),

    path(
        "panel-campaigns/<int:pk>/recipients/",
        campaign_recipients
    ),

    path(
        "panel-campaigns/<int:pk>/stats/",
        campaign_stats
    ),

    path(
        "panel-campaigns/<int:pk>/survey-links/",
        campaign_survey_links
    ),

    path(
        "panel/start/",
        panel_start,
        name="panel-start"
    ),
    path(
        "projects/<int:project_id>/vendors/",
        project_vendors_by_project
    ),
    path(
    "panel-campaigns/<int:pk>/send-emails/",
    send_campaign_invitations
),

    path(
    "panel-campaigns/<int:pk>/dashboard/",
    campaign_dashboard,
    name="campaign-dashboard",
),
    path(
    "panel-campaigns/<int:pk>/panel-summary/",
    campaign_panel_summary,
    name="campaign-panel-summary",
),
    path(
    "panel-campaigns/<int:pk>/respondents/",
    campaign_respondent_list,
),
    path(
    "respondents/<str:respondent_id>/journey/",
    respondent_redirect_journey,
),


]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 