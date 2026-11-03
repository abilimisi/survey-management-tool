
from django.urls import path

from .diy_views import (
    DIYClientQuotationListView,
    DIYClientQuotationRespondView,
    DIYClientSurveyLinkSubmitView,
    DIYStudyListCreateView,
    DIYStudyProjectConversionView,
    DIYStudyQuotationSendView,
    DIYStudySubmitView,
    DIYStudyReviewListView,
    DIYStudyReviewActionView,
    DIYStudyUpdateView,
    DIYAllStudiesAdminView,
    DIYStudyAssessmentView,
    DIYStudySurveyLinkReviewView,
    DIYStudyQuotationCreateView,
    DIYStudyQuotationListView,
    DIYClientNotificationListView,
    DIYAdminNotificationListView,
    DIYClientNotificationMarkReadView,
    DIYAdminNotificationMarkReadView,

)

urlpatterns = [
    # Client portal: list and create studies
    path(
        "studies/",
        DIYStudyListCreateView.as_view(),
        name="diy-study-list-create",
    ),

    # Client portal: submit a study
    path(
        "studies/<int:study_id>/submit/",
        DIYStudySubmitView.as_view(),
        name="diy-study-submit",
    ),

    # Client portal: view or edit one study
    path(
        "studies/<int:study_id>/",
        DIYStudyUpdateView.as_view(),
        name="diy-study-update",
    ),

    # Admin: ALL studies, including drafts and completed reviews
    path(
        "internal/studies/",
        DIYAllStudiesAdminView.as_view(),
        name="diy-internal-all-studies",
    ),

    # Admin: only studies awaiting review
    path(
        "internal/studies/reviews/",
        DIYStudyReviewListView.as_view(),
        name="diy-study-review-list",
    ),

    # Admin: approve or reject a study
    path(
        "internal/studies/<int:study_id>/review/",
        DIYStudyReviewActionView.as_view(),
        name="diy-study-review-action",
    ),

    path(
        "internal/studies/<int:study_id>/assessment/",
        DIYStudyAssessmentView.as_view(),
        name="diy-study-assessment",
    ),

    path(
        "internal/studies/<int:study_id>/survey-link-review/",
        DIYStudySurveyLinkReviewView.as_view(),
        name="diy-study-survey-link-review",
    ),

    path(
        "internal/studies/<int:study_id>/quotations/",
        DIYStudyQuotationCreateView.as_view(),
        name="diy-study-quotation-create",
    ),

    path(
        "internal/studies/<int:study_id>/quotations/history/",
        DIYStudyQuotationListView.as_view(),
        name="diy-study-quotation-list",
    ),

    path(
        "internal/studies/<int:study_id>/quotations/<int:quotation_id>/send/",
        DIYStudyQuotationSendView.as_view(),
        name="diy-study-quotation-send",
    ),

    path(
        "studies/<int:study_id>/quotations/",
        DIYClientQuotationListView.as_view(),
        name="diy-client-quotation-list",
    ),

    path(
        "studies/<int:study_id>/quotations/<int:quotation_id>/respond/",
        DIYClientQuotationRespondView.as_view(),
        name="diy-client-quotation-respond",
    ),

    path(
        "studies/<int:study_id>/survey-link/",
        DIYClientSurveyLinkSubmitView.as_view(),
        name="diy-client-survey-link-submit",
    ),

    path(
        "internal/studies/<int:study_id>/convert/",
        DIYStudyProjectConversionView.as_view(),
        name="diy-study-project-conversion",
    ),

    path(
        "notifications/",
        DIYClientNotificationListView.as_view(),
        name="diy-client-notifications",
    ),

    path(
        "internal/notifications/",
        DIYAdminNotificationListView.as_view(),
        name="diy-admin-notifications",
    ),

    path(
        "notifications/<int:notification_id>/read/",
        DIYClientNotificationMarkReadView.as_view(),
        name="diy-client-notification-mark-read",
    ),

    path(
        "internal/notifications/<int:notification_id>/read/",
        DIYAdminNotificationMarkReadView.as_view(),
        name="diy-admin-notification-mark-read",
    ),

    
]
