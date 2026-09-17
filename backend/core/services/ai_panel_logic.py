def get_panel_deterministic_result(
    intent,
    context
):

    overview = context.get(
        "overview",
        {}
    )

    if intent == "total_panelists":

        return {
            "intent": intent,
            "result": {
                "total_panelists": (
                    overview.get(
                        "total_panelists",
                        0
                    )
                )
            }
        }

    if intent == "active_panelists":

        return {
            "intent": intent,
            "result": {
                "active_panelists": (
                    overview.get(
                        "active_panelists",
                        0
                    )
                )
            }
        }

    if intent == "verified_panelists":

        return {
            "intent": intent,
            "result": {
                "verified_panelists": (
                    overview.get(
                        "verified_panelists",
                        0
                    )
                )
            }
        }

    if intent == "registered_this_month":

        return {
            "intent": intent,
            "result": {
                "registered_this_month": (
                    overview.get(
                        "registered_this_month",
                        0
                    )
                )
            }
        }

    if intent == "panelists_by_country":

        return {
            "intent": intent,
            "result": context.get(
                "country_distribution",
                []
            )
        }

    if intent == "panelists_by_industry":

        return {
            "intent": intent,
            "result": context.get(
                "industry_distribution",
                []
            )
        }

    return {
        "intent": "general_panel",
        "result": None
    }