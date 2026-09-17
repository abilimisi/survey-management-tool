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


def get_vendor_deterministic_result(intent, context):
    overview = context.get("overview", {})
    performance = context.get("performance", [])

    if intent == "total_vendors":
        return {
            "intent": intent,
            "result": {
                "total_vendors": overview.get(
                    "total_vendors",
                    0,
                )
            },
        }

    if intent == "active_vendors":
        return {
            "intent": intent,
            "result": {
                "active_vendors": overview.get(
                    "active_vendors",
                    0,
                )
            },
        }

    if intent == "inactive_vendors":
        return {
            "intent": intent,
            "result": {
                "inactive_vendors": overview.get(
                    "inactive_vendors",
                    0,
                )
            },
        }

    if intent == "best_vendor":
        return {
            "intent": intent,
            "result": get_top_items(
                performance,
                "ir",
            ),
        }

    if intent == "worst_vendor":
        return {
            "intent": intent,
            "result": get_bottom_items(
                performance,
                "ir",
            ),
        }

    if intent == "vendor_performance":
        return {
            "intent": intent,
            "result": performance,
        }

    return {
        "intent": "general_vendor",
        "result": None,
    }