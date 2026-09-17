import re


def contains_any(question, phrases):
    """
    Return True if any complete phrase exists in the question.
    Uses word boundaries to avoid partial-word matches.
    """

    for phrase in phrases:
        pattern = rf"\b{re.escape(phrase)}\b"

        if re.search(pattern, question):
            return True

    return False


def detect_panelist_intent(question):
    """
    Detect the user's Panelist-related analytics intent.

    This function only identifies the requested metric.
    It does NOT query the database and does NOT calculate results.
    """

    question = question.lower().strip()

    # -----------------------------------------------------
    # Inactive Panelists
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "inactive panelists",
            "inactive panelist",
            "how many inactive",
            "number of inactive",
        ],
    ):
        return "inactive_panelists"

    # -----------------------------------------------------
    # Unverified Panelists
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "unverified panelists",
            "unverified panelist",
            "how many unverified",
            "number of unverified",
        ],
    ):
        return "unverified_panelists"

    # -----------------------------------------------------
    # Active Panelists
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "active panelists",
            "active panelist",
            "how many active",
            "number of active",
        ],
    ):
        return "active_panelists"

    # -----------------------------------------------------
    # Verified Panelists
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "verified panelists",
            "verified panelist",
            "how many verified",
            "number of verified",
        ],
    ):
        return "verified_panelists"

    # -----------------------------------------------------
    # Registered This Month
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "registered this month",
            "panelists registered this month",
            "new panelists this month",
            "panelists joined this month",
        ],
    ):
        return "registered_this_month"

    # -----------------------------------------------------
    # Top Country
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "which country has the most panelists",
            "country has the most panelists",
            "country with the most panelists",
            "largest panelist country",
            "top country for panelists",
            "most panelists are from",
        ],
    ):
        return "top_panelist_country"

    # -----------------------------------------------------
    # Country Distribution
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "panelists by country",
            "panelist by country",
            "country distribution",
            "countries do panelists come from",
            "panelists country",
            "panelist countries",
            "show countries",
        ],
    ):
        return "panelists_by_country"

    # -----------------------------------------------------
    # Top Industry
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "which industry has the most panelists",
            "industry has the most panelists",
            "industry with the most panelists",
            "largest panelist industry",
            "top industry for panelists",
            "most panelists work in",
        ],
    ):
        return "top_panelist_industry"

    # -----------------------------------------------------
    # Industry Distribution
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "panelists by industry",
            "panelist by industry",
            "industry distribution",
            "panelists industry",
            "panelist industries",
            "show industries",
        ],
    ):
        return "panelists_by_industry"

    # -----------------------------------------------------
    # Total Survey Participations
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "total survey participations",
            "total survey participation",
            "how many survey participations",
            "panelist survey participations",
            "total panelist surveys",
            "total surveys by panelists",
            "how many surveys have panelists taken",
            "how many surveys have panelists participated",
        ],
    ):
        return "panelist_survey_participations"

    # -----------------------------------------------------
    # Completed Surveys
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "completed surveys",
            "completed survey",
            "surveys completed by panelists",
            "panelist completed surveys",
            "panelists completed surveys",
            "how many surveys did panelists complete",
            "how many surveys have panelists completed",
            "number of completed surveys",
        ],
    ):
        return "panelist_completed_surveys"

    # -----------------------------------------------------
    # Terminated Surveys
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "terminated surveys",
            "terminated survey",
            "surveys terminated by panelists",
            "panelist terminated surveys",
            "panelists terminated surveys",
            "how many surveys were terminated",
        ],
    ):
        return "panelist_terminated_surveys"

    # -----------------------------------------------------
    # Quota Full Surveys
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "quota full surveys",
            "quota full survey",
            "quota full",
            "panelist quota full",
            "how many quota full surveys",
        ],
    ):
        return "panelist_quota_full_surveys"

    # -----------------------------------------------------
    # Security Terminations
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "security terminations",
            "security termination",
            "security terminated surveys",
            "security terminated survey",
            "panelist security terminations",
            "how many security terminations",
        ],
    ):
        return "panelist_security_terminations"

    # -----------------------------------------------------
    # Panelist Completion Rate
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "panelist completion rate",
            "panelist completion percentage",
            "completion rate of panelists",
            "what percentage of panelist surveys were completed",
            "panelist survey completion rate",
        ],
    ):
        return "panelist_completion_rate"

    # -----------------------------------------------------
    # Total Panelists
    # -----------------------------------------------------

    if contains_any(
        question,
        [
            "total panelists",
            "total panelist",
            "how many panelists do we have",
            "how many panelists are there",
            "number of panelists",
            "panelist count",
            "panelist total",
        ],
    ):
        return "total_panelists"

    # -----------------------------------------------------
    # General Panelist Question
    # -----------------------------------------------------

    return "general_panel"