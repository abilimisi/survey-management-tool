import uuid
from django.conf import settings

from django.shortcuts import get_object_or_404, redirect

from rest_framework.decorators import api_view
from rest_framework.response import Response
from core.views import get_client_ip

from django.db import transaction
from core.services.email_sender import send_campaign_emails
from django.db.models import Max
from django.db.models import Q
from .views import replace_tokens
from core.models import (
    PanelCampaign,
    PanelCampaignRecipient,
    Panelist,
    Respondent,
    RedirectLog
)

from core.serializers import (
    PanelCampaignSerializer,
    PanelCampaignDashboardSerializer,
)

@api_view(["GET"])
def panel_campaign_list(request):

    campaigns = PanelCampaign.objects.select_related(
        "project"
    ).order_by("-created_at")

    serializer = PanelCampaignSerializer(
        campaigns,
        many=True
    )

    return Response(serializer.data)


@api_view(["POST"])
def create_panel_campaign(request):

    serializer = PanelCampaignSerializer(
        data=request.data
    )

    if serializer.is_valid():

        serializer.save()

        return Response(
            serializer.data,
            status=201
        )

    return Response(
        serializer.errors,
        status=400
    )

@api_view(["GET"])
def panel_campaign_detail(request, pk):

    campaign = get_object_or_404(
        PanelCampaign,
        pk=pk
    )

    serializer = PanelCampaignSerializer(
        campaign
    )

    return Response(serializer.data)

@api_view(["PUT"])
def update_panel_campaign(request, pk):

    campaign = get_object_or_404(
        PanelCampaign,
        pk=pk
    )

    serializer = PanelCampaignSerializer(
        campaign,
        data=request.data
    )

    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data)

    return Response(
        serializer.errors,
        status=400
    )

@api_view(["DELETE"])
def delete_panel_campaign(request, pk):

    campaign = get_object_or_404(
        PanelCampaign,
        pk=pk
    )

    campaign.delete()

    return Response({
        "message": "Campaign deleted successfully."
    })

@api_view(["POST"])
def generate_campaign_recipients(request, pk):

    campaign = get_object_or_404(
        PanelCampaign,
        pk=pk
    )

    already_sent = PanelCampaignRecipient.objects.filter(
        campaign=campaign,
        email_sent = True
    ).exists()

    if already_sent:
        return Response(
            {
                "success": False,
                "message": "Recipients have already been invited."
            },
            status=400
        )

    PanelCampaignRecipient.objects.filter(
        campaign=campaign
    ).delete()

    country = campaign.country
    gender = campaign.gender
    industry = campaign.industry

    panelists = Panelist.objects.filter(
        is_active=True
    )

    if country:
        panelists = panelists.filter(
            country__iexact=country
        )

    if gender:
        panelists = panelists.filter(
            gender__iexact=gender
        )


    if industry:
        panelists = panelists.filter(
            industry__in=industry
        )

    created_count = 0

    with transaction.atomic():

        for panelist in panelists:

            obj, created = PanelCampaignRecipient.objects.get_or_create(

                campaign=campaign,

                panelist=panelist,

                defaults={

                    "survey_token": uuid.uuid4().hex,

                    "status": "pending"

                }

            )

            if created:
                created_count += 1
    return Response({

        "success": True,

        "campaign": campaign.name,

        "created_recipients": created_count

    })

@api_view(["GET"])
def campaign_recipients(request, pk):

    campaign = get_object_or_404(
        PanelCampaign,
        pk=pk
    )

    recipients = PanelCampaignRecipient.objects.select_related(
        "panelist"
    ).filter(
        campaign=campaign
    )

    data = []

    for recipient in recipients:

        data.append({

            "id": recipient.id,

            "panelist_id": recipient.panelist.id,

            "name":
                f"{recipient.panelist.fname} "
                f"{recipient.panelist.lname}",

            "email": recipient.panelist.email,

            "country": recipient.panelist.country,

            "gender": recipient.panelist.gender,

            "industry": recipient.panelist.industry,

            "status": recipient.status,

            "email_sent": recipient.email_sent,

            "clicked": recipient.clicked,

            "survey_token": recipient.survey_token

        })

    return Response(data)

@api_view(["GET"])
def campaign_stats(request, pk):

    campaign = get_object_or_404(
        PanelCampaign,
        pk=pk
    )

    recipients = PanelCampaignRecipient.objects.filter(
        campaign=campaign
    )

    total = recipients.count()

    sent = recipients.filter(
        email_sent=True
    ).count()

    clicked = recipients.filter(
        clicked=True
    ).count()

    started = recipients.filter(
        status="started"
    ).count()

    complete = recipients.filter(
        status="complete"
    ).count()

    terminate = recipients.filter(
        status="terminate"
    ).count()

    quota_full = recipients.filter(
        status="quota_full"
    ).count()

    return Response({

        "campaign": campaign.name,

        "total": total,

        "sent": sent,

        "clicked": clicked,

        "started": started,

        "complete": complete,

        "terminate": terminate,

        "quota_full": quota_full

    })

@api_view(["GET"])
def campaign_survey_links(request, pk):

    campaign = get_object_or_404(
        PanelCampaign,
        pk=pk
    )

    recipients = PanelCampaignRecipient.objects.select_related(
        "panelist"
    ).filter(
        campaign=campaign
    )

    data = []

    for recipient in recipients:

        survey_link = (
            f"{settings.PUBLIC_BACKEND_URL}"
            f"/api/panel/start/?token={recipient.survey_token}"
        )

        data.append({

            "recipient_id": recipient.id,

            "panelist": (
                f"{recipient.panelist.fname} "
                f"{recipient.panelist.lname}"
            ),

            "email": recipient.panelist.email,

            "survey_token": recipient.survey_token,

            "survey_link": survey_link

        })

    return Response(data)

def panel_start(request):

    token = request.GET.get("token")

    recipient = get_object_or_404(
        PanelCampaignRecipient,
        survey_token=token
    )
    

    recipient.clicked = True
    recipient.save(update_fields=["clicked"])

    if recipient.respondent:
        respondent = recipient.respondent

    else:

        campaign = recipient.campaign

        project_vendor = campaign.project_vendor

        respondent = Respondent.objects.create(

            respondent_id=uuid.uuid4().hex[:12].upper(),

            project=campaign.project,

            vendor=project_vendor.vendor,

            project_vendor=project_vendor,

            email=recipient.panelist.email,

            ip_address=get_client_ip(request),

            user_agent=request.META.get("HTTP_USER_AGENT", ""),

            status="started"

        )
        recipient.respondent = respondent
        recipient.save(update_fields=["respondent"])

    survey_link = replace_tokens(
    respondent.project.live_link,
    respondent
    )

    return redirect(survey_link)

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import ProjectVendor
from .serializers import ProjectVendorSerializer


@api_view(["GET"])
def project_vendors_by_project(request, project_id):

    vendors = ProjectVendor.objects.filter(
        project_id=project_id
    ).select_related(
        "vendor"
    )

    serializer = ProjectVendorSerializer(
        vendors,
        many=True
    )

    return Response(serializer.data)


@api_view(["POST"])
def send_campaign_invitations(request, pk):

    campaign = get_object_or_404(
        PanelCampaign,
        pk=pk
    )

    sent = send_campaign_emails(campaign)

    return Response({

        "success": True,

        "emails_sent": sent

    })

@api_view(["GET"])
def campaign_dashboard(request, pk):

    campaign = get_object_or_404(
        PanelCampaign,
        pk=pk
    )

    serializer = PanelCampaignDashboardSerializer(
        campaign
    )

    recipients = PanelCampaignRecipient.objects.filter(
        campaign=campaign
    )

    hits = recipients.count()

    completed = recipients.filter(
        status="complete"
    ).count()

    terminate = recipients.filter(
        status="terminate"
    ).count()

    quota = recipients.filter(
        status="quota_full"
    ).count()

    security = recipients.filter(
        status="security_terminate"
    ).count()

    pending = recipients.filter(
        status="pending"
    ).count()

    ir = round(
        (completed / hits) * 100,
        2
    ) if hits else 0

    last_completed = recipients.filter(
        completed_at__isnull=False
    ).aggregate(
        last=Max("completed_at")
    )["last"]

    return Response({

        "campaign": serializer.data,

        "stats": {

            "hits": hits,

            "completed": completed,

            "terminate": terminate,

            "quota_full": quota,

            "security_term": security,

            "pending": pending,

            "ir": ir,

            "last_completed": last_completed

        }

    })

@api_view(["GET"])
def campaign_panel_summary(request, pk):

    campaign = get_object_or_404(
        PanelCampaign,
        pk=pk
    )

    recipients = PanelCampaignRecipient.objects.filter(
        campaign=campaign
    )

    generated = recipients.count()

    hits = recipients.filter(
        clicked=True
    ).count()

    completed = recipients.filter(
        status="complete"
    ).count()

    terminate = recipients.filter(
        status="terminate"
    ).count()

    quota = recipients.filter(
        status="quota_full"
    ).count()

    security = recipients.filter(
        status="security_terminate"
    ).count()

    last_completed = recipients.filter(
        status="complete"
    ).order_by("-completed_at").first()

    if hits > 0:
        ir = round((completed / hits) * 100, 2)
    else:
        ir = 0

    data = [

        {

            "id": campaign.project_vendor.id,

            "panel": campaign.project_vendor.vendor.name,

            "status": campaign.status,

            "generated": generated,

            "hits": hits,

            "completed": completed,

            "target": campaign.target,

            "terminate": terminate,

            "quota_full": quota,

            "security_term": security,

            "ir": ir,

            "last_completed": (
                last_completed.completed_at
                if last_completed
                else None
            )

            

        }

    ]

    return Response(data)

@api_view(["GET"])
def campaign_respondent_list(request, pk):

    campaign = get_object_or_404(
        PanelCampaign,
        pk=pk
    )

    status = request.GET.get("status")

    recipients = PanelCampaignRecipient.objects.select_related(
        "respondent",
        "panelist"
    ).filter(
        campaign=campaign,
        respondent__isnull=False
    )

    if status == "complete":
        recipients = recipients.filter(status="complete")

    elif status == "terminate":
        recipients = recipients.filter(status="terminate")

    elif status == "quota_full":
        recipients = recipients.filter(status="quota_full")

    elif status == "security":
        recipients = recipients.filter(
            respondent__status="security_terminate"
        )

    data = []

    for recipient in recipients:

        respondent = recipient.respondent

        data.append({

            "respondent_id": respondent.respondent_id,

            "email": recipient.panelist.email,

            "project": respondent.project.name,

            "vendor": respondent.vendor.name,

            "country": respondent.detected_country,

            "status": respondent.status,

            "previous_status": respondent.previous_status,

            "ip": respondent.ip_address,

            "browser": respondent.user_agent,

            "started_at": respondent.started_at,

            "completed_at": respondent.completed_at,

        })

    return Response(data)

@api_view(["GET"])
def respondent_redirect_journey(request, respondent_id):

    respondent = get_object_or_404(
        Respondent,
        respondent_id=respondent_id
    )

    logs = RedirectLog.objects.filter(
        respondent=respondent
    ).order_by("created_at")

    data = {

        "respondent":{

            "respondent_id": respondent.respondent_id,

            "status": respondent.status,

            "previous_status": respondent.previous_status,

            "project": respondent.project.name,

            "vendor": respondent.vendor.name,

            "started_at": respondent.started_at,

            "completed_at": respondent.completed_at,

            "ip": respondent.ip_address,

            "browser": respondent.user_agent,

        },

        "journey":[

            {

                "id":log.id,

                "type":log.redirect_type,

                "url":log.redirect_url,

                "created_at":log.created_at

            }

            for log in logs

        ]

    }

    return Response(data)