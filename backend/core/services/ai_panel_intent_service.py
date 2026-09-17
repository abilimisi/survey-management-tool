def detect_panel_intent(question):

    question = question.lower().strip()

    if (
        "how many panelists" in question
        or "total panelists" in question
        or "number of panelists" in question
    ):
        return "total_panelists"

    if (
        "active panelists" in question
        or "how many active" in question
    ):
        return "active_panelists"

    if (
        "verified panelists" in question
        or "email verified" in question
    ):
        return "verified_panelists"

    if (
        "registered this month" in question
        or "registration this month" in question
    ):
        return "registered_this_month"

    if "country" in question and "panelist" in question:
        return "panelists_by_country"

    if "industry" in question and "panelist" in question:
        return "panelists_by_industry"

    if "completed surveys" in question:
        return "panelist_completed_surveys"

    if "terminated surveys" in question:
        return "panelist_terminated_surveys"

    return "general_panel"