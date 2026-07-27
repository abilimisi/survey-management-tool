from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction

from core.models import (
    PanelCampaignRecipient,
    CampaignEmailTemplate,
)


def send_panel_invitation(recipient):

    survey_link = (
        f"{settings.PUBLIC_BACKEND_URL}"
        f"/api/panel/start/?token={recipient.survey_token}"
    )

    template, created = CampaignEmailTemplate.objects.get_or_create(
        campaign=recipient.campaign
    )

    subject = template.subject

    subject = subject.replace(
        "{{first_name}}",
        recipient.panelist.fname or ""
    )

    subject = subject.replace(
        "{{campaign_name}}",
        recipient.campaign.name
    )

    subject = subject.replace(
        "{{project_name}}",
        recipient.campaign.project.name
    )

    message = template.body

    message = message.replace(
        "{{first_name}}",
        recipient.panelist.fname or ""
    )

    message = message.replace(
        "{{survey_link}}",
        survey_link
    )

    message = message.replace(
        "{{campaign_name}}",
        recipient.campaign.name
    )

    message = message.replace(
        "{{project_name}}",
        recipient.campaign.project.name
    )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient.panelist.email],
        fail_silently=False,
    )

    recipient.email_sent = True
    recipient.save(update_fields=["email_sent"])





def send_campaign_emails(campaign):

    recipients = PanelCampaignRecipient.objects.filter(
        campaign=campaign,
        email_sent=False
    )

    sent = 0

    with transaction.atomic():

        for recipient in recipients:

            send_panel_invitation(recipient)

            sent += 1

    return sent