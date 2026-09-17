from .ai_question_normalizer import normalize_ai_question

def detect_ai_domain(question):
    question = normalize_ai_question(question)

    # ---------------------------------------------------------
    # Campaign-specific phrases
    # ---------------------------------------------------------
    campaign_phrases = [
        "campaign",
        "campaigns",
        "panel campaign",
        "panel campaigns",
        "campaign recipients",
        "campaign funnel",
        "campaign completion",
        "campaign click",
        "campaign start",
        "campaign email",
        "campaign invitation",
        "invitations were sent",
        "invitations sent",
        "emails were sent",
        "emails sent",
        "panelists were targeted",
        "panelists targeted",
        "targeted panelists",
        "panelists clicked",
        "panelists started",
        "panelists completed",
        "panelists were terminated",
        "panelists reached quota",
        "email send rate",
        "email send",
        "send rate",
        "what percentage were sent",
        "what percentage of emails were sent",
        "what percentage of invitations were sent",
    ]

    # ---------------------------------------------------------
    # Panelist-specific phrases
    # ---------------------------------------------------------
    panelist_keywords = [
        "panelist",
        "panelists",
        "panel member",
        "panel members",
    ]

    # ---------------------------------------------------------
    # Project-specific phrases
    # ---------------------------------------------------------
    project_keywords = [
        "project",
        "projects",
        "survey project",
        "survey projects",
    ]

    # ---------------------------------------------------------
    # Vendor-specific phrases
    # ---------------------------------------------------------
    vendor_keywords = [
        "vendor",
        "vendors",
        "supplier",
        "suppliers",
    ]

    # Campaign must be checked before generic panelist detection.
    if any(
        phrase in question
        for phrase in campaign_phrases
    ):
        return "campaign"

    if any(
        keyword in question
        for keyword in panelist_keywords
    ):
        return "panelist"

    if any(
        keyword in question
        for keyword in project_keywords
    ):
        return "project"

    if any(
        keyword in question
        for keyword in vendor_keywords
    ):
        return "vendor"

    return "analytics"