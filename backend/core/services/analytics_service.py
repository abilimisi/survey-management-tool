from datetime import timedelta

from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone

from core.models import (
    Respondent,
    Vendor,
    Project,
)


def get_overview_analytics():

    today = timezone.localdate()

    total_projects = Project.objects.count()

    active_projects = Project.objects.filter(
        status__in=["running", "testing"]
    ).count()

    total_respondents = Respondent.objects.count()

    total_vendors = Vendor.objects.count()

    active_vendors = Vendor.objects.filter(
        status=True
    ).count()

    completes = Respondent.objects.filter(
        status="complete"
    ).count()

    total_hits = Respondent.objects.count()

    completion_rate = (
        round((completes / total_hits) * 100, 2)
        if total_hits
        else 0
    )

    today_hits = Respondent.objects.filter(
        started_at__date=today
    ).count()

    today_completes = Respondent.objects.filter(
        status="complete",
        completed_at__date=today,
    ).count()

    return {
        "total_projects": total_projects,
        "active_projects": active_projects,
        "total_respondents": total_respondents,
        "total_vendors": total_vendors,
        "active_vendors": active_vendors,
        "total_hits": total_hits,
        "today_hits": today_hits,
        "today_completes": today_completes,
        "completion_rate": completion_rate,
    }


def get_status_analytics():

    statuses = [
        "started",
        "complete",
        "terminate",
        "quota_full",
        "security_terminate",
    ]

    result = {}

    for status in statuses:

        result[status] = Respondent.objects.filter(
            status=status
        ).count()

    return result

def get_vendor_analytics():

    vendors = Vendor.objects.all()

    data = []

    for vendor in vendors:

        respondents = Respondent.objects.filter(
            vendor=vendor
        )

        total_hits = respondents.count()

        if total_hits == 0:
            continue

        completes = respondents.filter(
            status="complete"
        ).count()

        terminates = respondents.filter(
            status="terminate"
        ).count()

        quota_full = respondents.filter(
            status="quota_full"
        ).count()

        security = respondents.filter(
            status="security_terminate"
        ).count()

        started = respondents.filter(
            status="started"
        ).count()

        ir = round(
            (completes / total_hits) * 100,
            2
        )

        data.append({
            "vendor_id": vendor.id,
            "vendor_name": vendor.name,
            "hits": total_hits,
            "completes": completes,
            "terminates": terminates,
            "quota_full": quota_full,
            "security_terminate": security,
            "started": started,
            "ir": ir,
        })

    data.sort(
        key=lambda item: item["ir"],
        reverse=True
    )

    return data

def get_project_analytics():

    projects = Project.objects.all()

    data = []

    for project in projects:

        respondents = Respondent.objects.filter(
            project=project
        )

        total_hits = respondents.count()

        if total_hits == 0:
            continue

        completes = respondents.filter(
            status="complete"
        ).count()

        terminates = respondents.filter(
            status="terminate"
        ).count()

        quota_full = respondents.filter(
            status="quota_full"
        ).count()

        security = respondents.filter(
            status="security_terminate"
        ).count()

        started = respondents.filter(
            status="started"
        ).count()

        ir = round(
            (completes / total_hits) * 100,
            2
        )

        data.append({
            "project_id": project.id,
            "project_name": project.name,
            "status": project.status,
            "hits": total_hits,
            "completes": completes,
            "terminates": terminates,
            "quota_full": quota_full,
            "security_terminate": security,
            "started": started,
            "ir": ir,
        })

    data.sort(
        key=lambda item: item["ir"],
        reverse=True
    )

    return data

def get_project_analytics():

    projects = Project.objects.all()

    data = []

    for project in projects:

        respondents = Respondent.objects.filter(
            project=project
        )

        total_hits = respondents.count()

        if total_hits == 0:
            continue

        completes = respondents.filter(
            status="complete"
        ).count()

        terminates = respondents.filter(
            status="terminate"
        ).count()

        quota_full = respondents.filter(
            status="quota_full"
        ).count()

        security = respondents.filter(
            status="security_terminate"
        ).count()

        started = respondents.filter(
            status="started"
        ).count()

        ir = round(
            (completes / total_hits) * 100,
            2
        )

        data.append({
            "project_id": project.id,
            "project_name": project.name,
            "status": project.status,
            "hits": total_hits,
            "completes": completes,
            "terminates": terminates,
            "quota_full": quota_full,
            "security_terminate": security,
            "started": started,
            "ir": ir,
        })

    data.sort(
        key=lambda item: item["ir"],
        reverse=True
    )

    return data


def get_hits_trend():

    today = timezone.localdate()

    start_date = today - timedelta(days=6)

    queryset = (
        Respondent.objects
        .filter(
            started_at__date__gte=start_date
        )
        .annotate(
            day=TruncDate("started_at")
        )
        .values("day")
        .annotate(
            hits=Count("id")
        )
        .order_by("day")
    )

    trend_dict = {
        item["day"]: item["hits"]
        for item in queryset
    }

    trend = []

    for i in range(7):

        current_day = start_date + timedelta(days=i)

        trend.append({
            "date": current_day.isoformat(),
            "hits": trend_dict.get(
                current_day,
                0
            ),
        })

    return trend

def get_ai_analytics_context():

    overview = get_overview_analytics()

    status = get_status_analytics()

    vendors = get_vendor_analytics()

    projects = get_project_analytics()

    trend = get_hits_trend()

    return {
        "overview": overview,
        "status": status,
        "vendors": vendors,
        "projects": projects,
        "hits_trend": trend,
    }