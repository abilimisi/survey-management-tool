from django.shortcuts import redirect, get_object_or_404, render
from django.utils import timezone
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
import uuid
from django.db.models import Count, Max, Q

from .models import Client, Vendor, Project, ProjectVendor, Respondent, RedirectLog
from .serializers import (
    ClientSerializer,
    VendorSerializer,
    ProjectSerializer,
    ProjectVendorSerializer,
    RespondentSerializer,
    RedirectLogSerializer,
)


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by("-id")
    serializer_class = ClientSerializer


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all().order_by("-id")
    serializer_class = VendorSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by("-id")
    serializer_class = ProjectSerializer


class ProjectVendorViewSet(viewsets.ModelViewSet):
    queryset = ProjectVendor.objects.all().order_by("-id")
    serializer_class = ProjectVendorSerializer


class RespondentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Respondent.objects.all().order_by("-id")
    serializer_class = RespondentSerializer


class RedirectLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RedirectLog.objects.all().order_by("-id")
    serializer_class = RedirectLogSerializer


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if x_forwarded_for:
        return x_forwarded_for.split(",")[0]

    return request.META.get("REMOTE_ADDR")


def replace_tokens(url, respondent):
    if not url:
        return ""

    replacements = {
        "{{ID}}": respondent.respondent_id,
        "{ID}": respondent.respondent_id,

        "{{RID}}": respondent.respondent_id,
        "{RID}": respondent.respondent_id,
        "{rid}": respondent.respondent_id,

        "{{PASSTHRU}}": respondent.respondent_id,
        "{PASSTHRU}": respondent.respondent_id,

        "{{PID}}": respondent.respondent_id,
        "{PID}": respondent.respondent_id,

        "{{panelist_id}}": respondent.vendor_panelist_id or "",
        "{panelist_id}": respondent.vendor_panelist_id or "",

        "{{reconnect_id}}": respondent.reconnect_id or "",
        "{reconnect_id}": respondent.reconnect_id or "",
    }

    for token, value in replacements.items():
        url = url.replace(token, str(value))

    return url


def start_survey(request, project_vendor_id):
    project_vendor = get_object_or_404(ProjectVendor, id=project_vendor_id, status=True)

    respondent_code = "RID-" + uuid.uuid4().hex[:12].upper()

    respondent = Respondent.objects.create(
        respondent_id=respondent_code,
        project=project_vendor.project,
        vendor=project_vendor.vendor,
        project_vendor=project_vendor,
        vendor_panelist_id=request.GET.get("panelist_id"),
        panel_misc_data=request.GET.get("misc"),
        reconnect_id=request.GET.get("reconnect_id"),
        ip_address=get_client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", ""),
        status="started",
    )

    completed_count = Respondent.objects.filter(
        project_vendor=project_vendor,
        status="complete"
    ).count()

    if project_vendor.target and completed_count >= project_vendor.target:
        respondent.previous_status = respondent.status
        respondent.status = "quota_full"
        respondent.completed_at = timezone.now()
        respondent.save()

        quota_link = replace_tokens(project_vendor.quota_full_link, respondent)

        RedirectLog.objects.create(
            respondent=respondent,
            redirect_type="quota_full",
            redirect_url=quota_link,
        )

        if quota_link:
            return redirect(quota_link)

        return render(
            request,
            "landing/quota_full.html",
            {
                "respondent": respondent,
                "status": "quota_full",
            }
        )

    client_live_link = project_vendor.project.live_link
    final_client_link = replace_tokens(client_live_link, respondent)

    RedirectLog.objects.create(
        respondent=respondent,
        redirect_type="client_survey_start",
        redirect_url=final_client_link,
    )

    return redirect(final_client_link)

def handle_survey_result(request, result_type):
    respondent_id = request.GET.get("id") or request.GET.get("rid")

    if not respondent_id:
        return render(
            request,
            "landing/error.html",
            {
                "message": "Missing respondent ID."
            },
            status=400
        )

    respondent = get_object_or_404(Respondent, respondent_id=respondent_id)

    respondent.previous_status = respondent.status
    respondent.status = result_type
    respondent.completed_at = timezone.now()
    respondent.save()

    project_vendor = respondent.project_vendor

    if result_type == "complete":
        final_vendor_link = project_vendor.complete_link
        fallback_template = "landing/complete.html"

    elif result_type == "terminate":
        final_vendor_link = project_vendor.terminate_link
        fallback_template = "landing/terminate.html"

    elif result_type == "quota_full":
        final_vendor_link = project_vendor.quota_full_link
        fallback_template = "landing/quota_full.html"

    elif result_type == "security_terminate":
        final_vendor_link = project_vendor.security_terminate_link
        fallback_template = "landing/security_terminate.html"

    else:
        return HttpResponse("Invalid result type", status=400)

    if final_vendor_link:
        final_vendor_link = replace_tokens(final_vendor_link, respondent)

        RedirectLog.objects.create(
            respondent=respondent,
            redirect_type=result_type,
            redirect_url=final_vendor_link,
        )

        return redirect(final_vendor_link)

    RedirectLog.objects.create(
        respondent=respondent,
        redirect_type=result_type,
        redirect_url=fallback_template,
    )

    return render(
        request,
        fallback_template,
        {
            "respondent": respondent,
            "status": result_type,
        }
    )

def universal_result(request):
    respondent_id = request.GET.get("id") or request.GET.get("rid")
    status = request.GET.get("status")

    valid_statuses = ["complete", "terminate", "quota_full", "security_terminate"]

    if not respondent_id:
        return HttpResponse("Missing respondent id", status=400)

    if status not in valid_statuses:
        return HttpResponse("Invalid or missing status", status=400)

    return handle_survey_result(request, status)


@api_view(["GET"])
def dashboard_stats(request):
    total_hits = Respondent.objects.count()
    completes = Respondent.objects.filter(status="complete").count()
    terminates = Respondent.objects.filter(status="terminate").count()
    quota_full = Respondent.objects.filter(status="quota_full").count()
    security_terminates = Respondent.objects.filter(status="security_terminate").count()

    ir = 0
    if total_hits > 0:
        ir = round((completes / total_hits) * 100, 2)

    return Response({
        "total_hits": total_hits,
        "completes": completes,
        "terminates": terminates,
        "quota_full": quota_full,
        "security_terminates": security_terminates,
        "ir": ir,
    })


@api_view(["GET"])
def project_report(request, project_id):
    respondents = Respondent.objects.filter(project_id=project_id)

    total_hits = respondents.count()
    completes = respondents.filter(status="complete").count()
    terminates = respondents.filter(status="terminate").count()
    quota_full = respondents.filter(status="quota_full").count()
    security_terminates = respondents.filter(status="security_terminate").count()

    ir = 0
    if total_hits > 0:
        ir = round((completes / total_hits) * 100, 2)

    return Response({
        "project_id": project_id,
        "total_hits": total_hits,
        "completes": completes,
        "terminates": terminates,
        "quota_full": quota_full,
        "security_terminates": security_terminates,
        "ir": ir,
    })


@api_view(["GET"])
def supplier_statistics(request, project_id):
    project_vendors = ProjectVendor.objects.filter(project_id=project_id).select_related(
        "project", "vendor"
    )

    data = []

    for pv in project_vendors:
        respondents = Respondent.objects.filter(project_vendor=pv)

        hits = respondents.count()
        completes = respondents.filter(status="complete").count()
        terminates = respondents.filter(status="terminate").count()
        quota_full = respondents.filter(status="quota_full").count()
        security_terms = respondents.filter(status="security_terminate").count()

        ir = 0
        if hits > 0:
            ir = round((completes / hits) * 100, 2)

        last_completed = respondents.filter(status="complete").aggregate(
            last_completed=Max("completed_at")
        )["last_completed"]

        data.append({
            "project_vendor_id": pv.id,
            "project_name": pv.project.name,
            "vendor_id": pv.vendor.id,
            "vendor_name": pv.vendor.name,
            "vendor_cpc": pv.vendor_cpc,
            "target": pv.target,
            "hits": hits,
            "completed": completes,
            "terminated": terminates,
            "quota_full": quota_full,
            "security_term": security_terms,
            "ir": ir,
            "last_completed": last_completed,
            "complete_link": pv.complete_link,
            "terminate_link": pv.terminate_link,
            "quota_full_link": pv.quota_full_link,
            "security_terminate_link": pv.security_terminate_link,
            # "supplier_link": request.build_absolute_uri(
            #     f"/api/survey/start/{pv.id}/"
            # ),
            "supplier_link": f"https://backwater-muster-repayment.ngrok-free.dev/api/survey/start/{pv.id}/",
        })

    return Response(data)

@api_view(["GET"])
def respondent_hints(request, project_vendor_id):
    project_vendor = get_object_or_404(ProjectVendor, id=project_vendor_id)

    respondents = Respondent.objects.filter(
        project_vendor=project_vendor
    ).select_related(
        "project", "vendor", "project_vendor"
    ).order_by("-id")

    data = []

    for respondent in respondents:
        data.append({
            "respondent_id": respondent.respondent_id,
            "project": respondent.project.name,
            "country": respondent.project.country,
            "vendor": respondent.vendor.name,
            "vendor_cpc": respondent.project_vendor.vendor_cpc,
            "status": respondent.status,
            "previous_status": respondent.previous_status,
            "s2s_status": respondent.s2s_status,
            "vendor_panelist_id": respondent.vendor_panelist_id,
            "panel_misc_data": respondent.panel_misc_data,
            "reconnect_id": respondent.reconnect_id,
            "ip_address": respondent.ip_address,
            "user_agent": respondent.user_agent,
            "started_at": respondent.started_at,
            "completed_at": respondent.completed_at,
        })

    return Response({
        "project_vendor_id": project_vendor.id,
        "project_name": project_vendor.project.name,
        "vendor_name": project_vendor.vendor.name,
        "total_respondents": respondents.count(),
        "respondents": data
    })


@api_view(["GET"])
def redirect_journey(request, respondent_id):
    respondent = get_object_or_404(
        Respondent.objects.select_related("project", "vendor", "project_vendor"),
        respondent_id=respondent_id
    )

    logs = RedirectLog.objects.filter(
        respondent=respondent
    ).order_by("created_at")

    journey = []

    for log in logs:
        journey.append({
            "redirect_type": log.redirect_type,
            "redirect_url": log.redirect_url,
            "created_at": log.created_at,
        })

    return Response({
        "respondent_id": respondent.respondent_id,
        "project": respondent.project.name,
        "vendor": respondent.vendor.name,
        "status": respondent.status,
        "previous_status": respondent.previous_status,
        "started_at": respondent.started_at,
        "completed_at": respondent.completed_at,
        "total_redirects": logs.count(),
        "journey": journey,
    })