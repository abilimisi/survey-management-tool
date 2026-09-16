def detect_analytics_intent(question):
    """
    Detect the type of analytics question asked by the user.
    """

    question = question.lower().strip()

    # Overall completion rate
    if (
        "completion rate" in question
        or "overall completion" in question
        or "completion percentage" in question
    ):
        return "completion_rate"

    # Best vendor
    if (
        "best vendor" in question
        or "best-performing vendor" in question
        or "best performing vendor" in question
        or "top vendor" in question
        or "highest vendor" in question
    ):
        return "best_vendor"

    # Worst vendor
    if (
        "worst vendor" in question
        or "lowest vendor" in question
        or "poor vendor" in question
        or "underperforming vendor" in question
    ):
        return "worst_vendor"

    # Best project
    if (
        "best project" in question
        or "best-performing project" in question
        or "best performing project" in question
        or "top project" in question
        or "highest project" in question
    ):
        return "best_project"

    # Worst project
    if (
        "worst project" in question
        or "lowest project" in question
        or "poor project" in question
        or "underperforming project" in question
    ):
        return "worst_project"

    # Hits trend
    if (
        "hit trend" in question
        or "hits trend" in question
        or "hits trending" in question
        or "survey hits trend" in question
        or "last 7 days" in question
    ):
        return "hits_trend"

    return "general"