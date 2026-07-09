from django.shortcuts import redirect, get_object_or_404, render
from django.utils import timezone
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import uuid
from django.db.models import Count, Max, Q
from django.conf import settings
import requests
from user_agents import parse

from .models import Client, CompanyContact, Vendor, Project, ProjectVendor, Respondent, RedirectLog, Panelist, Respondent, UserProfile

from django.contrib.auth.models import User

from .serializers import (
    ClientSerializer,
    CompanyContactSerializer,
    VendorSerializer,
    ProjectSerializer,
    ProjectVendorSerializer,
    RespondentSerializer,
    RedirectLogSerializer,
    UserSerializer,
)

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import permission_classes

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by("-id")
    serializer_class = ClientSerializer
    
    def destroy(self, request, *args, **kwargs):

        if not request.user.is_superuser:
            return Response(
                {"error": "Only Superuser can delete."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs)

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all().order_by("-id")
    serializer_class = VendorSerializer
    
    def destroy(self, request, *args, **kwargs):

        if not request.user.is_superuser:
            return Response(
                {"error": "Only Superuser can delete."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by("-id")
    serializer_class = ProjectSerializer
    
    def destroy(self, request, *args, **kwargs):

        if not request.user.is_superuser:
            return Response(
                {"error": "Only Superuser can delete."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs)


class ProjectVendorViewSet(viewsets.ModelViewSet):
    queryset = ProjectVendor.objects.all().order_by("-id")
    serializer_class = ProjectVendorSerializer
    
    def destroy(self, request, *args, **kwargs):

        if not request.user.is_superuser:
            return Response(
                {"error": "Only Superuser can delete."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs)


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

    vendor = respondent.vendor
    project = respondent.project
    client = project.client if project else None

    respondent_id = respondent.respondent_id
    vendor_pid = respondent.vendor_panelist_id or ""
    passthru = respondent.panel_misc_data or ""
    reconnect_id = respondent.reconnect_id or ""

    replacements = {
        # Our respondent ID / client-facing ID
        "{{ID}}": respondent_id,
        "{ID}": respondent_id,
        "{{id}}": respondent_id,
        "{id}": respondent_id,

        "{{OBID}}": respondent_id,
        "{OBID}": respondent_id,
        "{{obid}}": respondent_id,
        "{obid}": respondent_id,

        "{{RID}}": respondent_id,
        "{RID}": respondent_id,
        "{{rid}}": respondent_id,
        "{rid}": respondent_id,

        # Pass through / client targeted user ID
        "{{PASSTHRU}}": passthru,
        "{PASSTHRU}": passthru,
        "{{passthru}}": passthru,
        "{passthru}": passthru,

        "{{PANEL MISC DATA}}": passthru,
        "{PANEL MISC DATA}": passthru,
        "{{PANEL_MISC_DATA}}": passthru,
        "{PANEL_MISC_DATA}": passthru,

        "{{LID}}": passthru,
        "{LID}": passthru,
        "{{Lid}}": passthru,
        "{Lid}": passthru,

        # Reconnect
        "{{RECONNECTID}}": reconnect_id,
        "{RECONNECTID}": reconnect_id,
        "{{reconnectID}}": reconnect_id,
        "{reconnectID}": reconnect_id,
        "{{reconnect_id}}": reconnect_id,
        "{reconnect_id}": reconnect_id,

        # Vendor panelist ID
        "{{panellist_id}}": vendor_pid,
        "{panellist_id}": vendor_pid,

        "{{panelist_id}}": vendor_pid,
        "{panelist_id}": vendor_pid,

        "{{panellist_list}}": vendor_pid,
        "{panellist_list}": vendor_pid,

        "{{PANELIST IDENTIFIER}}": vendor_pid,
        "{PANELIST IDENTIFIER}": vendor_pid,
        "{{PANELIST_IDENTIFIER}}": vendor_pid,
        "{PANELIST_IDENTIFIER}": vendor_pid,

        # Demographics / optional fields
        "{{Email}}": getattr(respondent, "email", "") or "",
        "{Email}": getattr(respondent, "email", "") or "",
        "{{EMAIL}}": getattr(respondent, "email", "") or "",
        "{EMAIL}": getattr(respondent, "email", "") or "",

        "{{Zip}}": getattr(respondent, "zip_code", "") or "",
        "{Zip}": getattr(respondent, "zip_code", "") or "",
        "{{ZIP}}": getattr(respondent, "zip_code", "") or "",
        "{ZIP}": getattr(respondent, "zip_code", "") or "",

        "{{Age}}": getattr(respondent, "age", "") or "",
        "{Age}": getattr(respondent, "age", "") or "",
        "{{AGE}}": getattr(respondent, "age", "") or "",
        "{AGE}": getattr(respondent, "age", "") or "",

        "{{Gender}}": getattr(respondent, "gender", "") or "",
        "{Gender}": getattr(respondent, "gender", "") or "",
        "{{GENDER}}": getattr(respondent, "gender", "") or "",
        "{GENDER}": getattr(respondent, "gender", "") or "",

        # S2S/Auth token
        "{{authToken}}": vendor.s2s_token if vendor and vendor.s2s_token else "",
        "{authToken}": vendor.s2s_token if vendor and vendor.s2s_token else "",
        "{{AUTHTOKEN}}": vendor.s2s_token if vendor and vendor.s2s_token else "",
        "{AUTHTOKEN}": vendor.s2s_token if vendor and vendor.s2s_token else "",

        # Client key
        "{{CLIENTKEY}}": str(client.id) if client else "",
        "{CLIENTKEY}": str(client.id) if client else "",
    }

    for token, value in replacements.items():
        url = url.replace(token, str(value))

    return url

def get_first_query_value(request, keys):
    for key in keys:
        value = request.GET.get(key)
        if value:
            return value
    return None


# new_update-------------------------------------------
def start_survey(request, project_vendor_id):
    project_vendor = get_object_or_404(
        ProjectVendor,
        id=project_vendor_id
    )

    return create_respondent_and_redirect(request, project_vendor)

# new_update-------------------------------------------
def start_survey_by_gid(request):
    gid = request.GET.get("gid")

    if not gid:
        return render(request, "landing/error.html", {
            "error_message": "Missing GID."
        })

    project_vendor = get_object_or_404(
        ProjectVendor,
        gid=gid
    )

    return create_respondent_and_redirect(request, project_vendor)

#new_update-------------------------------------------
def create_respondent_and_redirect(request, project_vendor):
    vendor = project_vendor.vendor
    project = project_vendor.project
    client = project.client


    if not client.status:
        return render(
            request,
            "landing/error.html",
            {
                "error_message":
                "This client is currently inactive."
            }
        )
    
    
    if not vendor.status:
        return render(
            request,
            "landing/error.html",
            {
                "error_message":
                "This vendor is currently inactive."
            }
        )


    project_status = (project.status or "").strip().lower()

    if project_status not in ["running", "testing"]:
        return render(request, "landing/error.html", {
            "error_message": "This survey is currently not available."
        })

    if project_vendor.status != "active":
        return render(request, "landing/error.html", {
            "error_message": "This supplier link is currently inactive."
        })
    
    respondent_code = uuid.uuid4().hex[:12].upper()

    respondent = Respondent.objects.create(
        respondent_id=respondent_code,
        project=project_vendor.project,
        vendor=project_vendor.vendor,
        project_vendor=project_vendor,

        vendor_panelist_id=get_first_query_value(
            request,
            [
                "pid",
                "PID",
                "panelist_id",
                "panellist_id",
                "panelistid",
                "panellistid",
                "PANELIST IDENTIFIER",
                "PANELIST_IDENTIFIER",
                "panelist_identifier",
                "uid",
                "UID",
                "subid",
                "sub_id",
                "respondent_id",
                "rid",
                "Lid",
                "lid",
            ],
        ),

        panel_misc_data=get_first_query_value(
            request,
            [
                "ext",
                "misc",
                "extra",
                "data",
                "PANEL MISC DATA",
                "PANEL_MISC_DATA",
                "panel_misc_data",
                "PASSTHRU",
                "passthru",
                "subid",
                "sub_id",
            ],
        ),

        reconnect_id=get_first_query_value(
            request,
            [
                "reconnectID",
                "RECONNECTID",
                "reconnect_id",
                "reconnectid",
                "re_connect_id",
                "reconnect",
            ],
        ),

        email=get_first_query_value(
            request,
            ["email", "Email", "EMAIL"]
        ),

        zip_code=get_first_query_value(
            request,
            ["zip", "Zip", "ZIP", "zipcode", "zip_code"]
        ),

        age=get_first_query_value(
            request,
            ["age", "Age", "AGE"]
        ),

        gender=get_first_query_value(
            request,
            ["gender", "Gender", "GENDER"]
        ),

        ip_address=get_client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", ""),
        status="started",
    )

    # TARGET CAP CHECK
    completed_count = Respondent.objects.filter(
        project_vendor=project_vendor,
        status="complete"
    ).count()

    if project_vendor.target and completed_count >= project_vendor.target:
        respondent.previous_status = respondent.status
        respondent.status = "quota_full"
        respondent.completed_at = timezone.now()
        respondent.save()

        quota_link = replace_tokens(
            project_vendor.quota_full_link,
            respondent
        )

        RedirectLog.objects.create(
            respondent=respondent,
            redirect_type="quota_full",
            redirect_url=quota_link or "landing/quota_full.html",
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

    # COUNTRY VALIDATION
    test_country = request.GET.get("country")

    detected_country = (
        test_country
        or get_country_from_ip(respondent.ip_address)
    )

    required_country = project_vendor.project.country

    respondent.detected_country = detected_country

    if required_country and detected_country.strip().lower() != required_country.strip().lower():
        respondent.previous_status = respondent.status
        respondent.status = "terminate"
        respondent.country_validation_passed = False
        respondent.completed_at = timezone.now()
        respondent.save()

        terminate_link = replace_tokens(
            project_vendor.terminate_link,
            respondent
        )

        RedirectLog.objects.create(
            respondent=respondent,
            redirect_type="country_terminate",
            redirect_url=terminate_link or "landing/terminate.html",
        )

        if terminate_link:
            return redirect(terminate_link)

        return render(
            request,
            "landing/terminate.html",
            {
                "respondent": respondent,
                "status": "terminate",
                "reason": "Country mismatch",
            }
        )

    respondent.country_validation_passed = True
    respondent.save()

    # REDIRECT TO CLIENT SURVEY
    client_live_link = project_vendor.project.live_link

    final_client_link = replace_tokens(
        client_live_link,
        respondent
    )

    RedirectLog.objects.create(
        respondent=respondent,
        redirect_type="client_survey_start",
        redirect_url=final_client_link,
    )

    return redirect(final_client_link)

#new_update-------------------------------------------
def simple_process(request):
    status = request.GET.get("status")
    pid = request.GET.get("pid")

    if not pid:
        return render(
            request,
            "landing/error.html",
            {"message": "Missing pid."},
            status=400
        )

    status_map = {
        "1": "complete",
        "2": "terminate",
        "3": "quota_full",
        "4": "security_terminate",
    }

    result_type = status_map.get(str(status))

    if not result_type:
        return render(
            request,
            "landing/error.html",
            {"message": "Invalid status."},
            status=400
        )

    request.GET = request.GET.copy()
    request.GET["id"] = pid

    return handle_survey_result(request, result_type)

def handle_survey_result(request, result_type):
    respondent_id = (
        request.GET.get("id")
        or request.GET.get("rid")
        or request.GET.get("pid")
        or request.GET.get("OBID")
        or request.GET.get("obid")
    )

    if not respondent_id:
        return render(
            request,
            "landing/error.html",
            {"message": "Missing respondent ID."},
            status=400
        )

    respondent = get_object_or_404(
        Respondent,
        respondent_id=respondent_id
    )

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


from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Project


@api_view(["GET"])
def dashboard_stats(request):
    today = timezone.localdate()
    now = timezone.now()

    def calculate_stats(queryset):
        total_hits = queryset.count()
        completes = queryset.filter(status="complete").count()
        terminates = queryset.filter(status="terminate").count()
        quota_full = queryset.filter(status="quota_full").count()
        security_terminates = queryset.filter(status="security_terminate").count()

        ir = round((completes / total_hits) * 100, 2) if total_hits > 0 else 0

        return {
            "total_hits": total_hits,
            "completes": completes,
            "terminates": terminates,
            "quota_full": quota_full,
            "security_terminates": security_terminates,
            "ir": ir,
        }

    overall_qs = Respondent.objects.all()

    today_qs = Respondent.objects.filter(
        started_at__date=today
    )

    monthly_qs = Respondent.objects.filter(
        started_at__year=now.year,
        started_at__month=now.month
    )

    return Response({
        "overall": calculate_stats(overall_qs),
        "today": calculate_stats(today_qs),
        "monthly": calculate_stats(monthly_qs),
    })


@api_view(["GET"])
def project_report(request, project_id):
    respondents = Respondent.objects.filter(project_id=project_id)
    project = get_object_or_404(Project, id=project_id)

    total_hits = respondents.count()
    completes = respondents.filter(status="complete").count()
    terminates = respondents.filter(status="terminate").count()
    quota_full = respondents.filter(status="quota_full").count()
    security_terminates = respondents.filter(status="security_terminate").count()

    ir = 0
    if total_hits > 0:
        ir = round((completes / total_hits) * 100, 2)

    return Response({
        "project_id": project.id,
        "project_name": project.name,
        "client_name": project.client.name if project.client else "-",
        "country": project.country or "-",
        "status": project.status or "-",
        "loi": project.loi or 0,
        "ir": ir,

        "total_hits": total_hits,
        "completes": completes,
        "terminates": terminates,
        "quota_full": quota_full,
        "security_terminates": security_terminates,
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

            "status": pv.status,
            "max_redirects": pv.max_redirects,
            "notes": pv.notes,

            "s2s_token": pv.s2s_token,

            "s2s_link": (
                f"{settings.PUBLIC_BACKEND_URL}"
                f"/api/s2s/process/"
                f"?pid={{OBID}}"
                f"&status_id={{status}}"
                f"&token={pv.s2s_token}"
            ),


            "gid": pv.gid,
            "supplier_parameter_template": pv.supplier_parameter_template,
            "supplier_link": (
                f"{settings.PUBLIC_BACKEND_URL}"
                f"/api/survey/start/"
                f"?gid={pv.gid}"
                f"&{pv.supplier_parameter_template}"
            ),
        })

    return Response(data)

@api_view(["GET"])
def respondent_hints(request, project_vendor_id):
    project_vendor = get_object_or_404(ProjectVendor, id=project_vendor_id)

    status = request.GET.get("status")

    respondents = Respondent.objects.filter(
        project_vendor=project_vendor
    ).select_related(
        "project", "vendor", "project_vendor"
    )

    if status:
        respondents = respondents.filter(status=status)

    respondents = respondents.order_by("-id")

    data = []

    for respondent in respondents:
        ua_string = respondent.user_agent or ""
        ua = parse(ua_string)

        browser = ua.browser.family
        os_name = ua.os.family

        if ua.is_mobile:
            device = "Mobile"
        elif ua.is_tablet:
            device = "Tablet"
        elif ua.is_pc:
            device = "Desktop"
        else:
            device = "Unknown"

        time_taken = None

        if respondent.started_at and respondent.completed_at:
            diff = respondent.completed_at - respondent.started_at

            total_seconds = int(diff.total_seconds())

            minutes = total_seconds // 60
            seconds = total_seconds % 60

            time_taken = f"{minutes}m {seconds}s"

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
            "browser": browser,
            "os": os_name,
            "device": device,
            "time_taken": time_taken,
        })

    return Response({
        "project_vendor_id": project_vendor.id,
        "project_name": project_vendor.project.name,
        "vendor_name": project_vendor.vendor.name,
        "filter_status": status or "all",
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


@api_view(["GET", "POST"])
def process_s2s(request):
    pid = request.GET.get("pid") or request.data.get("pid")
    status_id = request.GET.get("status_id") or request.data.get("status_id")
    token = request.GET.get("token") or request.data.get("token")

    if not pid:
        return Response({"error": "Missing pid"}, status=400)

    if not status_id:
        return Response({"error": "Missing status_id"}, status=400)

    respondent = get_object_or_404(Respondent, respondent_id=pid)

    project_vendor = respondent.project_vendor

    if project_vendor.s2s_token and token != project_vendor.s2s_token:
        return Response({"error": "Invalid S2S token"}, status=403)

    status_map = {
        "1": "complete",
        "2": "terminate",
        "3": "quota_full",
        "4": "security_terminate",
    }

    result_type = status_map.get(str(status_id))

    if not result_type:
        return Response({"error": "Invalid status_id"}, status=400)

    respondent.previous_status = respondent.status
    respondent.status = result_type
    respondent.s2s_status = True
    respondent.completed_at = timezone.now()
    respondent.save()

    RedirectLog.objects.create(
        respondent=respondent,
        redirect_type=f"s2s_{result_type}",
        redirect_url=request.build_absolute_uri(),
    )

    return Response({
        "message": "S2S status updated successfully",
        "respondent_id": respondent.respondent_id,
        "status": respondent.status,
        "s2s_status": respondent.s2s_status,
    })


@api_view(["GET"])
def reports_data(request):
    project_report = []

    for project in Project.objects.all():
        respondents = Respondent.objects.filter(project=project)

        hits = respondents.count()
        completes = respondents.filter(status="complete").count()
        terminates = respondents.filter(status="terminate").count()
        quota_full = respondents.filter(status="quota_full").count()
        security_term = respondents.filter(status="security_terminate").count()

        ir = round((completes / hits) * 100, 2) if hits > 0 else 0

        project_report.append({
            "id": project.id,
            "name": project.name,
            "client": project.client.name if project.client else "-",
            "country": project.country,
            "hits": hits,
            "completes": completes,
            "terminates": terminates,
            "quota_full": quota_full,
            "security_term": security_term,
            "ir": ir,
            "loi": project.loi,
            "status": project.status,
        })

    vendor_report = []

    for vendor in Vendor.objects.all():
        respondents = Respondent.objects.filter(vendor=vendor)

        hits = respondents.count()
        completes = respondents.filter(status="complete").count()
        terminates = respondents.filter(status="terminate").count()
        quota_full = respondents.filter(status="quota_full").count()
        security_term = respondents.filter(status="security_terminate").count()

        ir = round((completes / hits) * 100, 2) if hits > 0 else 0

        vendor_report.append({
            "id": vendor.id,
            "name": vendor.name,
            "assigned_projects": ProjectVendor.objects.filter(vendor=vendor).count(),
            "hits": hits,
            "completes": completes,
            "terminates": terminates,
            "quota_full": quota_full,
            "security_term": security_term,
            "ir": ir,
            "cpc": vendor.cpc,
        })

    respondent_report = []

    for respondent in Respondent.objects.select_related("project", "vendor").order_by("-started_at")[:200]:
        respondent_report.append({
            "id": respondent.id,
            "respondent_id": respondent.respondent_id,
            "project": respondent.project.name,
            "vendor": respondent.vendor.name,
            "vendor_panelist_id": respondent.vendor_panelist_id,
            "status": respondent.status,
            "previous_status": respondent.previous_status,
            "s2s_status": respondent.s2s_status,
            "ip_address": respondent.ip_address,
            "started_at": respondent.started_at,
            "completed_at": respondent.completed_at,
        })

    return Response({
        "project_report": project_report,
        "vendor_report": vendor_report,
        "respondent_report": respondent_report,
    })

@api_view(["GET", "POST"])
def sync_panelists(request):

    response = requests.get(
        "https://ob-panel.com/api/users.php",
        headers={
            "X-API-KEY": "OB_PANEL_SYNC_2026@StrongKey"
        }
    )

    data = response.json()

    users = data["users"]

    created = 0
    updated = 0

    for user in users:

        obj, is_created = Panelist.objects.update_or_create(
            external_id=user["id"],
            defaults={
                "fname": user["fname"],
                "lname": user["lname"],
                "email": user["email"],
                "gender": user["gender"],
                "dob": user["dob"],
                "country": user["country"],
                "industry": user["industry"],
                "code": user["code"],
                "registered_at": user["created_at"],
            }
        )

        if is_created:
            created += 1
        else:
            updated += 1

    return Response({
        "created": created,
        "updated": updated
    })



@api_view(["GET"])
def panelist_list(request):

    panelists = Panelist.objects.all().order_by("-registered_at")

    data = []

    for p in panelists:
        data.append({
            "id": p.id,
            "fname": p.fname,
            "lname": p.lname,
            "email": p.email,
            "gender": p.gender,
            "country": p.country,
            "industry": p.industry,
            "registered_at": p.registered_at,
        })

    return Response(data)

def get_country_from_ip(ip_address):
    if not ip_address:
        return "Unknown"

    if ip_address in ["127.0.0.1", "localhost", "::1"]:                 
        return "India"

    try:
        token = "d65bc3c122892d"

        response = requests.get(
            f"https://api.ipinfo.io/lite/{ip_address}?token={token}",
            timeout=5
        )

        data = response.json()

        # print("IPINFO Response:", data)

        country_code = data.get("country")

        country_map = {
            "IN": "India",
            "GB": "England",
            "US": "USA",
            "CA": "Canada",
            "AU": "Australia",
        }

        return country_map.get(
            country_code,
            country_code or "Unknown"
        )

    except Exception as e:
        print("IPINFO Error:", e)
        return "Unknown"
    


@api_view(["GET"])
def recent_projects(request):

    projects = Project.objects.order_by("-created_at")[:5]

    data = []

    for project in projects:

        hits = Respondent.objects.filter(
            project_vendor__project=project
        ).count()

        completes = Respondent.objects.filter(
            project_vendor__project=project,
            status="complete"
        ).count()

        terminates = Respondent.objects.filter(
            project_vendor__project=project,
            status="terminate"
        ).count()

        quota_full = Respondent.objects.filter(
            project_vendor__project=project,
            status="quota_full"
        ).count()

        security_term = Respondent.objects.filter(
            project_vendor__project=project,
            status="security_terminate"
        ).count()

        ir = round((completes / hits) * 100, 2) if hits else 0

        data.append({
            "id": project.id,
            "name": project.name,
            "country": project.country,
            "status": project.status,
            "target": project.target,
            "hits": hits,
            "completes": completes,
            "terminates": terminates,
            "quota_full": quota_full,
            "security_term": security_term,
            "ir": ir,
        })

    return Response(data)

class CompanyContactViewSet(viewsets.ModelViewSet):
    queryset = CompanyContact.objects.all().order_by("-id")
    serializer_class = CompanyContactSerializer
    
    def destroy(self, request, *args, **kwargs):

        if not request.user.is_superuser:
            return Response(
                {"error": "Only Superuser can delete."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs) 
    
    
@api_view(["GET"])
def get_users(request):

    users = User.objects.all()

    data = []

    for user in users:

        role = "No Role"

        if hasattr(user, "userprofile"):
            role = user.userprofile.role

        data.append({
            "id": user.id,
            "username": user.username,
            "role": role,
            "is_active": user.is_active,
        })

    return Response(data)

    
@api_view(["PUT"])
@permission_classes([IsAdminUser])
def update_user(request, pk):

    try:
        user = User.objects.get(id=pk)

    except User.DoesNotExist:

        return Response(
            {"error": "User not found"},
            status=404
        )

    user.username = request.data.get(
        "username",
        user.username
    )
    password = request.data.get("password")

    if password:
        user.set_password(password)

    user.save()

    role = request.data.get("role")

    if role:

        profile, created = UserProfile.objects.get_or_create(
            user=user
        )

        profile.role = role
        profile.save()

    return Response({
        "message": "User updated successfully"
    })
    
@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def delete_user(request, pk):

    try:
        user = User.objects.get(id=pk)

    except User.DoesNotExist:

        return Response(
            {"error": "User not found"},
            status=404
        )

    user.delete()

    return Response({
        "message": "User deleted successfully"
    })
    
    
@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_user(request):

    username = request.data.get("username")
    password = request.data.get("password")
    role = request.data.get("role")

    user = User.objects.create_user(
        username=username,
        password=password
    )

    UserProfile.objects.create(
        user=user,
        role=role
    )

    return Response({
        "message": "User created"
    })
    
    
# reportsection
@api_view(["GET"])
def client_projects(request, client_id):

    projects = Project.objects.filter(
        client_id=client_id
    )

    data = [
        {
            "id": project.id,
            "name": project.name,
        }
        for project in projects
    ]

    return Response(data)

@api_view(["GET"])
def vendor_projects(request, vendor_id):

    projects = (
        ProjectVendor.objects
        .filter(vendor_id=vendor_id)
        .select_related("project")
    )

    unique_projects = {}

    for item in projects:
        unique_projects[item.project.id] = {
            "id": item.project.id,
            "name": item.project.name,
        }

    return Response(list(unique_projects.values()))


@api_view(["POST"])
def map_foreign_ids(request):
    raw_ids = request.data.get("redirect_ids", "")

    redirect_ids = [
        item.strip()
        for item in raw_ids.replace(",", "\n").splitlines()
        if item.strip()
    ]

    respondents = Respondent.objects.filter(
        respondent_id__in=redirect_ids
    ).select_related("project", "vendor", "project_vendor")

    data = []

    for respondent in respondents:
        data.append({
            "redirect_id": respondent.respondent_id,
            "foreign_id": respondent.vendor_panelist_id or "-",
            "ext": respondent.panel_misc_data or "-",
            "reconnect_id": respondent.reconnect_id or "-",
            "status": respondent.status,
            "loi": respondent.project.loi,
            "project_id": respondent.project.id,
            "project_name": respondent.project.name,
            "vendor_name": respondent.vendor.name,
            "vendor_cpi": respondent.project_vendor.vendor_cpc,
            "entrant_time": respondent.started_at,
            "completed_time": respondent.completed_at,
            "country": respondent.project.country,
        })

    return Response(data)