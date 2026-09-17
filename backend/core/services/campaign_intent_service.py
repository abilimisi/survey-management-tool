import re
from .ai_question_normalizer import normalize_ai_question


def contains_any(question, phrases):
    for phrase in phrases:
        pattern = rf"\b{re.escape(phrase)}\b"

        if re.search(pattern, question):
            return True

    return False


def detect_campaign_intent(question):
    question = normalize_ai_question(question)
    # ---------------------------------------------------------
    # Campaign counts
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "total campaigns",
            "total campaign",
            "how many campaigns",
            "how many campaign",
            "campaign count",
            "number of campaigns",
        ],
    ):
        return "total_campaigns"

    if contains_any(
        question,
        [
            "running campaigns",
            "running campaign",
            "how many running campaigns",
        ],
    ):
        return "running_campaigns"

    if contains_any(
        question,
        [
            "draft campaigns",
            "draft campaign",
            "how many draft campaigns",
        ],
    ):
        return "draft_campaigns"

    if contains_any(
        question,
        [
            "paused campaigns",
            "paused campaign",
            "how many paused campaigns",
        ],
    ):
        return "paused_campaigns"

    if contains_any(
        question,
        [
            "completed campaigns",
            "completed campaign",
            "how many completed campaigns",
        ],
    ):
        return "completed_campaigns"

    # ---------------------------------------------------------
    # Full funnel
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "campaign funnel",
            "panel campaign funnel",
            "show campaign funnel",
            "campaign journey",
            "campaign performance",
        ],
    ):
        return "campaign_funnel"

    # ---------------------------------------------------------
    # Total recipients / panelists targeted
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "total recipients",
            "total recipient",
            "how many recipients",
            "campaign recipients",
            "number of recipients",
            "panelists targeted",
            "panelists were targeted",
            "targeted panelists",
            "how many panelists were targeted",
        ],
    ):
        return "total_recipients"

    # ---------------------------------------------------------
    # Emails / invitations sent
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "emails sent",
            "email sent",
            "emails were sent",
            "recipients were sent",
            "how many were sent",
            "how many emails were sent",
            "how many invitations were sent",
            "invitations sent",
            "invitations were sent",
            "survey invitations sent",
        ],
    ):
        return "email_sent"

    # ---------------------------------------------------------
    # Clicked
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "recipients clicked",
            "panelists clicked",
            "how many clicked",
            "how many recipients clicked",
            "how many panelists clicked",
            "clicked the survey link",
            "survey link clicks",
        ],
    ):
        return "clicked"

    # ---------------------------------------------------------
    # Started
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "how many started",
            "recipients started",
            "panelists started",
            "how many recipients started",
            "how many panelists started",
            "started the survey",
        ],
    ):
        return "started"

    # ---------------------------------------------------------
    # Completed
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "how many completed",
            "recipients completed",
            "panelists completed",
            "how many recipients completed",
            "how many panelists completed",
            "completed the survey",
        ],
    ):
        return "completed"

    # ---------------------------------------------------------
    # Terminated
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "how many terminated",
            "recipients terminated",
            "panelists terminated",
            "how many recipients were terminated",
            "how many panelists were terminated",
            "terminated surveys",
        ],
    ):
        return "terminated"

    # ---------------------------------------------------------
    # Quota full
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "how many quota full",
            "quota full recipients",
            "quota full panelists",
            "how many recipients reached quota",
            "how many panelists reached quota",
        ],
    ):
        return "quota_full"

    # ---------------------------------------------------------
    # Security termination
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "security terminations",
            "security terminated",
            "security terminated recipients",
            "security terminated panelists",
            "how many security terminations",
        ],
    ):
        return "security_terminated"

    # ---------------------------------------------------------
    # Send rate
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "email send rate",
            "email send",
            "send rate",
            "what percentage were sent",
            "what percentage of emails were sent",
            "what percentage of invitations were sent",
        ],
    ):
        return "email_send_rate"

    # ---------------------------------------------------------
    # Click rate
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "campaign click rate",
            "recipient click rate",
            "panelist click rate",
            "click rate",
        ],
    ):
        return "click_rate"

    # ---------------------------------------------------------
    # Start rate
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "campaign start rate",
            "recipient start rate",
            "panelist start rate",
            "start rate",
        ],
    ):
        return "start_rate"

    # ---------------------------------------------------------
    # Completion rate
    # ---------------------------------------------------------

    if contains_any(
        question,
        [
            "campaign completion rate",
            "campaign completion",
            "recipient completion rate",
            "panelist completion rate",
        ],
    ):
        return "completion_rate"

    # ---------------------------------------------------------
    # Default
    # ---------------------------------------------------------

    return "general_campaign"