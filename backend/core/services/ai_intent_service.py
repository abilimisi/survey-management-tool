"""def detect_ai_intent(question):

    question = question.lower().strip()

    # PANELISTS

    if "panelist" in question:

        return {
            "domain": "panelists",
            "intent": detect_panel_intent(question)
        }

    # ANALYTICS

    analytics_intent = detect_analytics_intent(
        question
    )

    if analytics_intent != "general":

        return {
            "domain": "analytics",
            "intent": analytics_intent
        }

    return {
        "domain": "general",
        "intent": "general"
    }"""