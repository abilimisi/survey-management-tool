from core.models import (
    PanelCampaign,
    PanelCampaignRecipient,
)


def get_campaign_overview():
    total_campaigns = PanelCampaign.objects.count()

    draft_campaigns = PanelCampaign.objects.filter(
        status="draft"
    ).count()

    running_campaigns = PanelCampaign.objects.filter(
        status="running"
    ).count()

    paused_campaigns = PanelCampaign.objects.filter(
        status="paused"
    ).count()

    completed_campaigns = PanelCampaign.objects.filter(
        status="completed"
    ).count()

    return {
        "total_campaigns": total_campaigns,
        "draft_campaigns": draft_campaigns,
        "running_campaigns": running_campaigns,
        "paused_campaigns": paused_campaigns,
        "completed_campaigns": completed_campaigns,
    }


def get_campaign_funnel():
    recipients = PanelCampaignRecipient.objects.all()

    total_recipients = recipients.count()

    email_sent = recipients.filter(
        email_sent=True
    ).count()

    clicked = recipients.filter(
        clicked=True
    ).count()

    started = recipients.filter(
        status="started"
    ).count()

    completed = recipients.filter(
        status="complete"
    ).count()

    terminated = recipients.filter(
        status="terminate"
    ).count()

    quota_full = recipients.filter(
        status="quota_full"
    ).count()

    security_terminated = recipients.filter(
        status="security_terminate"
    ).count()

    # ---------------------------------------------------------
    # Funnel rates
    # ---------------------------------------------------------

    send_rate = (
        round((email_sent / total_recipients) * 100, 2)
        if total_recipients
        else 0
    )

    click_rate = (
        round((clicked / total_recipients) * 100, 2)
        if total_recipients
        else 0
    )

    start_rate = (
        round((started / total_recipients) * 100, 2)
        if total_recipients
        else 0
    )

    completion_rate = (
        round((completed / total_recipients) * 100, 2)
        if total_recipients
        else 0
    )

    return {
        # -----------------------------------------------------
        # Funnel blocks
        # -----------------------------------------------------

        "total_recipients": total_recipients,
        "email_sent": email_sent,
        "clicked": clicked,
        "started": started,
        "completed": completed,

        # -----------------------------------------------------
        # Outcome blocks
        # -----------------------------------------------------

        "terminated": terminated,
        "quota_full": quota_full,
        "security_terminated": security_terminated,

        # -----------------------------------------------------
        # Funnel rates
        # -----------------------------------------------------

        "send_rate": send_rate,
        "click_rate": click_rate,
        "start_rate": start_rate,
        "completion_rate": completion_rate,
    }


def get_campaign_performance():
    campaigns = PanelCampaign.objects.all()

    data = []

    for campaign in campaigns:
        recipients = PanelCampaignRecipient.objects.filter(
            campaign=campaign
        )

        total_recipients = recipients.count()

        if total_recipients == 0:
            continue

        email_sent = recipients.filter(
            email_sent=True
        ).count()

        clicked = recipients.filter(
            clicked=True
        ).count()

        started = recipients.filter(
            status="started"
        ).count()

        completed = recipients.filter(
            status="complete"
        ).count()

        terminated = recipients.filter(
            status="terminate"
        ).count()

        quota_full = recipients.filter(
            status="quota_full"
        ).count()

        security_terminated = recipients.filter(
            status="security_terminate"
        ).count()

        # -----------------------------------------------------
        # Campaign-specific rates
        # -----------------------------------------------------

        send_rate = round(
            (email_sent / total_recipients) * 100,
            2,
        )

        click_rate = round(
            (clicked / total_recipients) * 100,
            2,
        )

        start_rate = round(
            (started / total_recipients) * 100,
            2,
        )

        completion_rate = round(
            (completed / total_recipients) * 100,
            2,
        )

        data.append(
            {
                "campaign_id": campaign.id,
                "status": campaign.status,

                "total_recipients": total_recipients,
                "email_sent": email_sent,
                "clicked": clicked,
                "started": started,
                "completed": completed,

                "terminated": terminated,
                "quota_full": quota_full,
                "security_terminated": security_terminated,

                "send_rate": send_rate,
                "click_rate": click_rate,
                "start_rate": start_rate,
                "completion_rate": completion_rate,
            }
        )

    return data


def get_campaign_ai_context():
    return {
        "overview": get_campaign_overview(),
        "funnel": get_campaign_funnel(),
        "performance": get_campaign_performance(),
    }