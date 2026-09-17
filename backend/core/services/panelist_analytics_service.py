from django.db.models import Count, Sum
from django.utils import timezone

from core.models import Panelist


# ---------------------------------------------------------
# Panelist Overview
# ---------------------------------------------------------

def get_panelist_overview():
    today = timezone.localdate()
    month_start = today.replace(day=1)

    total_panelists = Panelist.objects.count()

    active_panelists = Panelist.objects.filter(
        is_active=True
    ).count()

    inactive_panelists = Panelist.objects.filter(
        is_active=False
    ).count()

    verified_panelists = Panelist.objects.filter(
        email_verified=True
    ).count()

    unverified_panelists = Panelist.objects.filter(
        email_verified=False
    ).count()

    registered_this_month = Panelist.objects.filter(
        registered_at__date__gte=month_start
    ).count()

    return {
        "total_panelists": total_panelists,
        "active_panelists": active_panelists,
        "inactive_panelists": inactive_panelists,
        "verified_panelists": verified_panelists,
        "unverified_panelists": unverified_panelists,
        "registered_this_month": registered_this_month,
    }


# ---------------------------------------------------------
# Panelist Survey Statistics
# ---------------------------------------------------------

def get_panelist_survey_statistics():
    stats = Panelist.objects.aggregate(
        total_survey_participations=Sum("total_surveys"),
        completed_surveys=Sum("completed_surveys"),
        terminated_surveys=Sum("terminated_surveys"),
        quota_full_surveys=Sum("quota_full_surveys"),
        security_terminated_surveys=Sum(
            "security_terminated_surveys"
        ),
    )

    return {
        key: value or 0
        for key, value in stats.items()
    }


# ---------------------------------------------------------
# Panelist Completion Rate
# ---------------------------------------------------------

def get_panelist_completion_rate(survey_statistics):
    total_surveys = survey_statistics.get(
        "total_survey_participations",
        0
    )

    completed_surveys = survey_statistics.get(
        "completed_surveys",
        0
    )

    if total_surveys == 0:
        return 0

    return round(
        (completed_surveys / total_surveys) * 100,
        2
    )


# ---------------------------------------------------------
# Panelists by Country
# ---------------------------------------------------------

def get_panelist_country_distribution():
    queryset = (
        Panelist.objects
        .exclude(country__isnull=True)
        .exclude(country__exact="")
        .values("country")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    return list(queryset)


# ---------------------------------------------------------
# Panelists by Industry
# ---------------------------------------------------------

def get_panelist_industry_distribution():
    queryset = (
        Panelist.objects
        .exclude(industry__isnull=True)
        .exclude(industry__exact="")
        .values("industry")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    return list(queryset)


# ---------------------------------------------------------
# Complete Panelist AI Context
# ---------------------------------------------------------

def get_panelist_ai_context():
    overview = get_panelist_overview()

    survey_statistics = get_panelist_survey_statistics()

    completion_rate = get_panelist_completion_rate(
        survey_statistics
    )

    return {
        "overview": overview,

        "survey_activity": {
            **survey_statistics,
            "completion_rate": completion_rate,
        },

        "country_distribution": (
            get_panelist_country_distribution()
        ),

        "industry_distribution": (
            get_panelist_industry_distribution()
        ),
    }