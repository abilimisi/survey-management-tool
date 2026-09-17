def get_top_items(items, key):
    """
    Return all items tied for the highest value.
    """

    if not items:
        return None

    highest_value = max(
        item.get(key, 0)
        for item in items
    )

    top_items = [
        item
        for item in items
        if item.get(key, 0) == highest_value
    ]

    return top_items


def get_panel_deterministic_result(intent, context):
    overview = context.get("overview", {})
    survey_activity = context.get("survey_activity", {})
    country_distribution = context.get("country_distribution", [])
    industry_distribution = context.get("industry_distribution", [])

    if intent == "total_panelists":
        return {
            "intent": intent,
            "result": {
                "total_panelists": overview.get(
                    "total_panelists",
                    0,
                )
            },
        }

    if intent == "active_panelists":
        return {
            "intent": intent,
            "result": {
                "active_panelists": overview.get(
                    "active_panelists",
                    0,
                )
            },
        }

    if intent == "inactive_panelists":
        return {
            "intent": intent,
            "result": {
                "inactive_panelists": overview.get(
                    "inactive_panelists",
                    0,
                )
            },
        }

    if intent == "verified_panelists":
        return {
            "intent": intent,
            "result": {
                "verified_panelists": overview.get(
                    "verified_panelists",
                    0,
                )
            },
        }

    if intent == "unverified_panelists":
        return {
            "intent": intent,
            "result": {
                "unverified_panelists": overview.get(
                    "unverified_panelists",
                    0,
                )
            },
        }

    if intent == "registered_this_month":
        return {
            "intent": intent,
            "result": {
                "registered_this_month": overview.get(
                    "registered_this_month",
                    0,
                )
            },
        }

    if intent == "panelists_by_country":
        return {
            "intent": intent,
            "result": country_distribution,
        }

    if intent == "top_panelist_country":
        return {
            "intent": intent,
            "result": get_top_items(
                country_distribution,
                "count",
            ),
        }

    if intent == "panelists_by_industry":
        return {
            "intent": intent,
            "result": industry_distribution,
        }

    if intent == "top_panelist_industry":
        return {
            "intent": intent,
            "result": get_top_items(
                industry_distribution,
                "count",
            ),
        }

    if intent == "panelist_survey_participations":
        return {
            "intent": intent,
            "result": {
                "total_survey_participations": survey_activity.get(
                    "total_survey_participations",
                    0,
                )
            },
        }

    if intent == "panelist_completed_surveys":
        return {
            "intent": intent,
            "result": {
                "completed_surveys": survey_activity.get(
                    "completed_surveys",
                    0,
                )
            },
        }

    if intent == "panelist_terminated_surveys":
        return {
            "intent": intent,
            "result": {
                "terminated_surveys": survey_activity.get(
                    "terminated_surveys",
                    0,
                )
            },
        }

    if intent == "panelist_quota_full_surveys":
        return {
            "intent": intent,
            "result": {
                "quota_full_surveys": survey_activity.get(
                    "quota_full_surveys",
                    0,
                )
            },
        }

    if intent == "panelist_security_terminations":
        return {
            "intent": intent,
            "result": {
                "security_terminated_surveys": survey_activity.get(
                    "security_terminated_surveys",
                    0,
                )
            },
        }

    if intent == "panelist_completion_rate":
        return {
            "intent": intent,
            "result": {
                "completion_rate": survey_activity.get(
                    "completion_rate",
                    0,
                ),
                "total_survey_participations": survey_activity.get(
                    "total_survey_participations",
                    0,
                ),
                "completed_surveys": survey_activity.get(
                    "completed_surveys",
                    0,
                ),
            },
        }

    return {
        "intent": "general_panel",
        "result": None,
    }