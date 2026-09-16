def get_best_vendor(vendors):
    """
    Return the vendor with the highest IR.
    """

    if not vendors:
        return None

    return max(
        vendors,
        key=lambda vendor: (
            vendor.get("ir", 0),
            vendor.get("completes", 0),
            vendor.get("hits", 0),
        )
    )


def get_worst_vendor(vendors):
    """
    Return the vendor with the lowest IR.
    """

    if not vendors:
        return None

    return min(
        vendors,
        key=lambda vendor: (
            vendor.get("ir", 0),
            vendor.get("completes", 0),
            vendor.get("hits", 0),
        )
    )


def get_best_project(projects):
    """
    Return the project with the highest IR.
    """

    if not projects:
        return None

    return max(
        projects,
        key=lambda project: (
            project.get("ir", 0),
            project.get("completes", 0),
            project.get("hits", 0),
        )
    )


def get_worst_project(projects):
    """
    Return the project with the lowest IR.
    """

    if not projects:
        return None

    return min(
        projects,
        key=lambda project: (
            project.get("ir", 0),
            project.get("completes", 0),
            project.get("hits", 0),
        )
    )


def get_deterministic_answer(intent, analytics):
    """
    Calculate factual analytics results using Python/Django data.

    Groq should explain these results rather than calculate
    the important business metrics itself.
    """

    overview = analytics.get("overview", {})
    vendors = analytics.get("vendors", [])
    projects = analytics.get("projects", [])
    hits_trend = analytics.get("hits_trend", [])

    if intent == "completion_rate":

        return {
            "intent": intent,
            "result": {
                "completion_rate": overview.get(
                    "completion_rate",
                    0
                ),
                "total_hits": overview.get(
                    "total_hits",
                    0
                ),
                "total_completes": overview.get(
                    "total_respondents",
                    0
                ),
            }
        }

    if intent == "best_vendor":

        vendor = get_best_vendor(vendors)

        return {
            "intent": intent,
            "result": vendor
        }

    if intent == "worst_vendor":

        vendor = get_worst_vendor(vendors)

        return {
            "intent": intent,
            "result": vendor
        }

    if intent == "best_project":

        project = get_best_project(projects)

        return {
            "intent": intent,
            "result": project
        }

    if intent == "worst_project":

        project = get_worst_project(projects)

        return {
            "intent": intent,
            "result": project
        }

    if intent == "hits_trend":

        return {
            "intent": intent,
            "result": hits_trend
        }

    return {
        "intent": "general",
        "result": None
    }