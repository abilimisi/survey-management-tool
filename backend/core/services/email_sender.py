from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction

from core.models import PanelCampaignRecipient


def send_panel_invitation(recipient):

    survey_link = (
        f"{settings.PUBLIC_BACKEND_URL}"
        f"/api/panel/start/?token={recipient.survey_token}"
    )

    subject = recipient.campaign.name

    message = f"""
Hello {recipient.panelist.fname},

You have been invited to participate in a survey.

Survey Link

{survey_link}

Thank you.

Opinion Bunch
"""

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