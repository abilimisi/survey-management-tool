def get_campaign_deterministic_result(intent, context):
    overview = context.get("overview", {})
    funnel = context.get("funnel", {})
    performance = context.get("performance", [])

    # ---------------------------------------------------------
    # Campaign counts
    # ---------------------------------------------------------

    if intent == "total_campaigns":
        return {
            "intent": intent,
            "result": {
                "total_campaigns": overview.get(
                    "total_campaigns",
                    0,
                )
            },
        }

    if intent == "running_campaigns":
        return {
            "intent": intent,
            "result": {
                "running_campaigns": overview.get(
                    "running_campaigns",
                    0,
                )
            },
        }

    if intent == "draft_campaigns":
        return {
            "intent": intent,
            "result": {
                "draft_campaigns": overview.get(
                    "draft_campaigns",
                    0,
                )
            },
        }

    if intent == "paused_campaigns":
        return {
            "intent": intent,
            "result": {
                "paused_campaigns": overview.get(
                    "paused_campaigns",
                    0,
                )
            },
        }

    if intent == "completed_campaigns":
        return {
            "intent": intent,
            "result": {
                "completed_campaigns": overview.get(
                    "completed_campaigns",
                    0,
                )
            },
        }

    # ---------------------------------------------------------
    # Funnel counts
    # ---------------------------------------------------------

    if intent == "total_recipients":
        return {
            "intent": intent,
            "result": {
                "total_recipients": funnel.get(
                    "total_recipients",
                    0,
                )
            },
        }

    if intent == "email_sent":
        return {
            "intent": intent,
            "result": {
                "email_sent": funnel.get(
                    "email_sent",
                    0,
                )
            },
        }

    if intent == "clicked":
        return {
            "intent": intent,
            "result": {
                "clicked": funnel.get(
                    "clicked",
                    0,
                )
            },
        }

    if intent == "started":
        return {
            "intent": intent,
            "result": {
                "started": funnel.get(
                    "started",
                    0,
                )
            },
        }

    if intent == "completed":
        return {
            "intent": intent,
            "result": {
                "completed": funnel.get(
                    "completed",
                    0,
                )
            },
        }

    if intent == "terminated":
        return {
            "intent": intent,
            "result": {
                "terminated": funnel.get(
                    "terminated",
                    0,
                )
            },
        }

    if intent == "quota_full":
        return {
            "intent": intent,
            "result": {
                "quota_full": funnel.get(
                    "quota_full",
                    0,
                )
            },
        }

    if intent == "security_terminated":
        return {
            "intent": intent,
            "result": {
                "security_terminated": funnel.get(
                    "security_terminated",
                    0,
                )
            },
        }

    # ---------------------------------------------------------
    # Funnel rates
    # ---------------------------------------------------------

    if intent == "email_send_rate":
        return {
            "intent": intent,
            "result": {
                "send_rate": funnel.get(
                    "send_rate",
                    0,
                ),
                "total_recipients": funnel.get(
                    "total_recipients",
                    0,
                ),
                "email_sent": funnel.get(
                    "email_sent",
                    0,
                ),
            },
        }

    if intent == "click_rate":
        return {
            "intent": intent,
            "result": {
                "click_rate": funnel.get(
                    "click_rate",
                    0,
                ),
                "total_recipients": funnel.get(
                    "total_recipients",
                    0,
                ),
                "clicked": funnel.get(
                    "clicked",
                    0,
                ),
            },
        }

    if intent == "start_rate":
        return {
            "intent": intent,
            "result": {
                "start_rate": funnel.get(
                    "start_rate",
                    0,
                ),
                "total_recipients": funnel.get(
                    "total_recipients",
                    0,
                ),
                "started": funnel.get(
                    "started",
                    0,
                ),
            },
        }

    if intent == "completion_rate":
        return {
            "intent": intent,
            "result": {
                "completion_rate": funnel.get(
                    "completion_rate",
                    0,
                ),
                "total_recipients": funnel.get(
                    "total_recipients",
                    0,
                ),
                "completed": funnel.get(
                    "completed",
                    0,
                ),
            },
        }

    # ---------------------------------------------------------
    # Full funnel
    # ---------------------------------------------------------

    if intent == "campaign_funnel":
        return {
            "intent": intent,
            "result": funnel,
        }

    # ---------------------------------------------------------
    # Campaign performance
    # ---------------------------------------------------------

    if intent == "campaign_performance":
        return {
            "intent": intent,
            "result": performance,
        }

    # ---------------------------------------------------------
    # Default
    # ---------------------------------------------------------

    return {
        "intent": "general_campaign",
        "result": None,
    }