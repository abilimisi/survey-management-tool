from django.urls import path

from .diy_views import DIYStudyListCreateView, DIYStudySubmitView,DIYStudyReviewListView,DIYStudyReviewActionView, DIYStudyUpdateView

urlpatterns = [
    path(
        "studies/",
        DIYStudyListCreateView.as_view(),
        name="diy-study-list-create",
    ),
    path(
        "studies/<int:study_id>/submit/",
        DIYStudySubmitView.as_view(),
        name="diy-study-submit",
    ),
    path(
        "internal/studies/",
        DIYStudyReviewListView.as_view(),
        name="diy-study-review-list",
    ),
    path(
        "internal/studies/<int:study_id>/review/",
        DIYStudyReviewActionView.as_view(),
        name="diy-study-review-action",
    ),
    
    path(
        "studies/<int:study_id>/",
        DIYStudyUpdateView.as_view(),
        name="diy-study-update",
    ),

    path(
        "internal/studies/",
        DIYStudyReviewListView.as_view(),
        name="diy-internal-studies",
    ),
    
]
