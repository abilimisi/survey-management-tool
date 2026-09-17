def get_top_items(items, key):
    if not items:
        return None

    highest_value = max(
        item.get(key, 0)
        for item in items
    )

    return [
        item
        for item in items
        if item.get(key, 0) == highest_value
    ]


def get_bottom_items(items, key):
    if not items:
        return None

    lowest_value = min(
        item.get(key, 0)
        for item in items
    )

    return [
        item
        for item in items
        if item.get(key, 0) == lowest_value
    ]


def get_project_deterministic_result(intent, context):
    overview = context.get("overview", {})
    performance = context.get("performance", [])

    if intent == "total_projects":
        return {
            "intent": intent,
            "result": {
                "total_projects": overview.get(
                    "total_projects",
                    0,
                )
            },
        }

    if intent == "active_projects":
        return {
            "intent": intent,
            "result": {
                "active_projects": overview.get(
                    "active_projects",
                    0,
                )
            },
        }

    if intent == "running_projects":
        return {
            "intent": intent,
            "result": {
                "running_projects": overview.get(
                    "running_projects",
                    0,
                )
            },
        }

    if intent == "testing_projects":
        return {
            "intent": intent,
            "result": {
                "testing_projects": overview.get(
                    "testing_projects",
                    0,
                )
            },
        }

    if intent == "closed_projects":
        return {
            "intent": intent,
            "result": {
                "closed_projects": overview.get(
                    "closed_projects",
                    0,
                )
            },
        }

    if intent == "on_hold_projects":
        return {
            "intent": intent,
            "result": {
                "on_hold_projects": overview.get(
                    "on_hold_projects",
                    0,
                )
            },
        }

    if intent == "best_project":
        return {
            "intent": intent,
            "result": get_top_items(
                performance,
                "completion_rate",
            ),
        }

    if intent == "worst_project":
        return {
            "intent": intent,
            "result": get_bottom_items(
                performance,
                "completion_rate",
            ),
        }

    if intent == "project_performance":
        return {
            "intent": intent,
            "result": performance,
        }

    return {
        "intent": "general_project",
        "result": None,
    }