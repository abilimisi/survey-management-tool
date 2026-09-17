from datetime import timedelta

from django.db.models import Count
from django.utils import timezone

from core.models import Panelist

from django.db.models import Sum


def get_panelist_ai_context():

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
        "overview": {
            "total_panelists": total_panelists,
            "active_panelists": active_panelists,
            "inactive_panelists": inactive_panelists,
            "verified_panelists": verified_panelists,
            "unverified_panelists": unverified_panelists,
            "registered_this_month": registered_this_month,
        },

        "country_distribution": (
            get_panelist_country_distribution()
        ),

        "industry_distribution": (
            get_panelist_industry_distribution()
        ),
    }

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