from django.db.models import Count
from django.utils import timezone

from datetime import timedelta
from django.db.models.functions import TruncDate

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Q
from django.db.models import Sum

from core.models import *

@api_view(["GET"])
def analytics_overview(request):

    today = timezone.localdate()

    total_projects = Project.objects.count()

    active_projects = Project.objects.filter(
        status__in=["running","testing"]
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

    ir = 0

    if total_hits > 0:
        ir = round(
            (completes / total_hits) * 100,
            2,
        )

    today_hits = Respondent.objects.filter(
        started_at__date=today
    ).count()

    today_completes = Respondent.objects.filter(
        status="complete",
        completed_at__date=today,
    ).count()

    return Response({

        "total_projects": total_projects,

        "active_projects": active_projects,

        "total_respondents": total_respondents,

        "active_vendors": active_vendors,

        "total_vendors": total_vendors,

        "total_hits": total_hits,

        "today_hits": today_hits,

        "today_completes": today_completes,

        "completion_rate": ir,

        "ir": ir,

    })

@api_view(["GET"])
def analytics_hits_chart(request):

    today = timezone.localdate()

    start_date = today - timedelta(days=6)

    queryset = (
        Respondent.objects.filter(
            started_at__date__gte=start_date
        )
        .annotate(day=TruncDate("started_at"))
        .values("day")
        .annotate(hits=Count("id"))
        .order_by("day")
    )

    hits_dict = {
        item["day"]: item["hits"]
        for item in queryset
    }

    data = []

    for i in range(7):

        current_day = start_date + timedelta(days=i)

        data.append({

            "day": current_day.strftime("%a"),

            "date": current_day.strftime("%Y-%m-%d"),

            "hits": hits_dict.get(current_day, 0),

        })

    return Response(data)

@api_view(["GET"])
def analytics_status_chart(request):

    queryset = (
        Respondent.objects
        .values("status")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    status_names = {
        "started": "Started",
        "complete": "Complete",
        "terminate": "Terminate",
        "quota_full": "Quota Full",
        "security_terminate": "Security Terminate",
    }

    colors = {
        "complete": "#22c55e",
        "terminate": "#ef4444",
        "quota_full": "#f59e0b",
        "security_terminate": "#8b5cf6",
        "started": "#3b82f6",
    }

    data = []

    for item in queryset:

        status = item["status"]

        data.append({

            "name": status_names.get(status, status),

            "status": status,

            "value": item["count"],

            "color": colors.get(status, "#94a3b8")

        })

    return Response(data)

@api_view(["GET"])
def analytics_vendor_performance(request):

    vendors = Vendor.objects.all()

    data = []

    for vendor in vendors:

        respondents = Respondent.objects.filter(
            vendor=vendor
        )

        if not respondents.exists():
            continue

        total_hits = respondents.count()

        completes = respondents.filter(
            status="complete"
        ).count()

        terminates = respondents.filter(
            status__in=["terminate", "security_terminate"]
        ).count()

        security = respondents.filter(
            status="security_terminate"
        ).count()

        quota_full = respondents.filter(
            status="quota_full"
        ).count()

        started = respondents.filter(
            status="started"
        ).count()

        ir = round(
            (completes / total_hits) * 100,
            2
        ) if total_hits else 0

        performance_score = (
            completes * 5
            + ir
            - terminates * 2
            - quota_full
            - security * 3
        )

        data.append({

            "vendor_id": vendor.id,

            "vendor_name": vendor.name,

            "hits": total_hits,

            "completes": completes,

            "terminate": terminates,

            "quota_full": quota_full,

            "security": security,

            "started": started,

            "ir": ir,

            "performance_score": performance_score,

        })


    data.sort(
        key=lambda x: x["performance_score"],
        reverse=True
    )

    for index, row in enumerate(data, start=1):

        row["rank"] = index

    return Response(data)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Project, Respondent


@api_view(["GET"])
def analytics_project_performance(request):

    project_id = request.GET.get("project")

    projects = Project.objects.all()

    if project_id:
        projects = projects.filter(id=project_id)

    data = []

    for project in projects:

        respondents = Respondent.objects.filter(
            project=project
        )

        total_hits = respondents.count()

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
        ) if total_hits else 0

        data.append({
            "id": project.id,
            "project_id": project.id,
            "project_name": project.name,
            "status": project.status,
            "total_hits": total_hits,
            "completes": completes,
            "terminate": terminates,
            "quota_full": quota_full,
            "security": security,
            "started": started,
            "ir": ir,
        })

    # Rank by IR desc, then total hits desc — was previously missing,
    # so ProjectPerformance.jsx's "#{project.rank}" rendered "#undefined".
    data.sort(key=lambda x: (x["ir"], x["total_hits"]), reverse=True)

    for index, row in enumerate(data, start=1):
        row["rank"] = index

    return Response(data)


from django.shortcuts import get_object_or_404


@api_view(["GET"])
def analytics_project_list(request):
    """
    Returns all active projects for the Project Analytics filter.
    """

    projects = Project.objects.select_related("client").all()

    data = []

    for project in projects:
        data.append({
            "id": project.id,
            "name": project.name,
            "client": project.client.name if project.client else "-",
            "country": project.country,
            "status": project.status,
        })

    return Response(data)


@api_view(["GET"])
def analytics_project_details(request, project_id):
    """
    Returns complete analytics for one selected project.
    """

    project = get_object_or_404(Project, id=project_id)

    respondents = Respondent.objects.filter(project=project)

    total_hits = respondents.count()

    completes = respondents.filter(
        status="complete"
    ).count()

    terminates = respondents.filter(
        status="terminate"
    ).count()

    quota = respondents.filter(
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
    ) if total_hits else 0

    # --- Daily trend (last 7 days) for THIS project ---
    today = timezone.localdate()
    start_date = today - timedelta(days=6)

    trend_qs = (
        respondents.filter(started_at__date__gte=start_date)
        .annotate(day=TruncDate("started_at"))
        .values("day")
        .annotate(hits=Count("id"))
        .order_by("day")
    )
    trend_dict = {item["day"]: item["hits"] for item in trend_qs}

    trend = []
    for i in range(7):
        current_day = start_date + timedelta(days=i)
        trend.append({
            "day": current_day.strftime("%a"),
            "date": current_day.strftime("%Y-%m-%d"),
            "hits": trend_dict.get(current_day, 0),
        })

    # --- Status breakdown (for donut) ---
    status_breakdown = [
        {"name": "Complete", "status": "complete", "value": completes, "color": "#22c55e"},
        {"name": "Terminate", "status": "terminate", "value": terminates, "color": "#ef4444"},
        {"name": "Quota Full", "status": "quota_full", "value": quota, "color": "#f59e0b"},
        {"name": "Security Terminate", "status": "security_terminate", "value": security, "color": "#8b5cf6"},
        {"name": "Started", "status": "started", "value": started, "color": "#3b82f6"},
    ]
    status_breakdown = [row for row in status_breakdown if row["value"] > 0]

    # --- Vendor split (who is delivering this project) ---
    vendor_split_qs = (
        respondents.values("vendor__id", "vendor__name")
        .annotate(hits=Count("id"))
        .order_by("-hits")[:8]
    )
    vendor_split = [
        {
            "vendor_id": row["vendor__id"],
            "vendor_name": row["vendor__name"] or "Unknown",
            "hits": row["hits"],
        }
        for row in vendor_split_qs
    ]

    return Response({

        "project": {
            "id": project.id,
            "name": project.name,
            "client": project.client.name,
            "country": project.country,
            "status": project.status,
            "loi": project.loi,
            "target": project.target,
        },

        "summary": {
            "hits": total_hits,
            "started": started,
            "complete": completes,
            "terminate": terminates,
            "quota_full": quota,
            "security": security,
            "ir": ir,
        },

        "trend": trend,

        "status_breakdown": status_breakdown,

        "vendor_split": vendor_split,

    })


@api_view(["GET"])
def analytics_funnel(request):
    """
    Real respondent funnel: Started -> Complete / Terminate / Quota Full / Security Terminate.
    Replaces the old hardcoded funnel placeholder on the Dashboard.
    """

    total_hits = Respondent.objects.count()

    complete = Respondent.objects.filter(status="complete").count()
    terminate = Respondent.objects.filter(status="terminate").count()
    quota_full = Respondent.objects.filter(status="quota_full").count()
    security = Respondent.objects.filter(status="security_terminate").count()
    started_only = Respondent.objects.filter(status="started").count()

    stages = [
        {"stage": "Total Hits", "value": total_hits, "color": "#2563eb"},
        {"stage": "Complete", "value": complete, "color": "#22c55e"},
        {"stage": "Terminate", "value": terminate, "color": "#ef4444"},
        {"stage": "Quota Full", "value": quota_full, "color": "#f59e0b"},
        {"stage": "Security Terminate", "value": security, "color": "#8b5cf6"},
    ]

    for stage in stages:
        stage["percent"] = (
            round((stage["value"] / total_hits) * 100, 1)
            if total_hits else 0
        )

    return Response({
        "stages": stages,
        "in_progress": started_only,
    })


@api_view(["GET"])
def analytics_vendor_list(request):
    """
    Returns all vendors for the Vendor Analytics filter dropdown.
    """

    vendors = Vendor.objects.all()

    data = []

    for vendor in vendors:
        data.append({
            "id": vendor.id,
            "name": vendor.name,
            "status": "Active" if vendor.status else "Inactive",
        })

    return Response(data)


@api_view(["GET"])
def analytics_vendor_details(request, vendor_id):
    """
    Returns complete analytics for one selected vendor:
    summary cards, 7-day trend, status breakdown (donut),
    and a breakdown of which projects this vendor is delivering on.
    """

    vendor = get_object_or_404(Vendor, id=vendor_id)

    respondents = Respondent.objects.filter(vendor=vendor)

    total_hits = respondents.count()

    completes = respondents.filter(status="complete").count()
    terminates = respondents.filter(status="terminate").count()
    quota = respondents.filter(status="quota_full").count()
    security = respondents.filter(status="security_terminate").count()
    started = respondents.filter(status="started").count()

    ir = round((completes / total_hits) * 100, 2) if total_hits else 0

    today = timezone.localdate()
    start_date = today - timedelta(days=6)

    trend_qs = (
        respondents.filter(started_at__date__gte=start_date)
        .annotate(day=TruncDate("started_at"))
        .values("day")
        .annotate(hits=Count("id"))
        .order_by("day")
    )
    trend_dict = {item["day"]: item["hits"] for item in trend_qs}

    trend = []
    for i in range(7):
        current_day = start_date + timedelta(days=i)
        trend.append({
            "day": current_day.strftime("%a"),
            "date": current_day.strftime("%Y-%m-%d"),
            "hits": trend_dict.get(current_day, 0),
        })

    status_breakdown = [
        {"name": "Complete", "status": "complete", "value": completes, "color": "#22c55e"},
        {"name": "Terminate", "status": "terminate", "value": terminates, "color": "#ef4444"},
        {"name": "Quota Full", "status": "quota_full", "value": quota, "color": "#f59e0b"},
        {"name": "Security Terminate", "status": "security_terminate", "value": security, "color": "#8b5cf6"},
        {"name": "Started", "status": "started", "value": started, "color": "#3b82f6"},
    ]
    status_breakdown = [row for row in status_breakdown if row["value"] > 0]

    project_split_qs = (
        respondents.values("project__id", "project__name")
        .annotate(hits=Count("id"))
        .order_by("-hits")[:8]
    )
    project_split = [
        {
            "project_id": row["project__id"],
            "project_name": row["project__name"] or "Unknown",
            "hits": row["hits"],
        }
        for row in project_split_qs
    ]

    return Response({

        "vendor": {
            "id": vendor.id,
            "name": vendor.name,
            "status": "Active" if vendor.status else "Inactive",
            "email": vendor.email,
        },

        "summary": {
            "hits": total_hits,
            "started": started,
            "complete": completes,
            "terminate": terminates,
            "quota_full": quota,
            "security": security,
            "ir": ir,
        },

        "trend": trend,

        "status_breakdown": status_breakdown,

        "project_split": project_split,

    })