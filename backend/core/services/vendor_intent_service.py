import re


def contains_any(question, phrases):
    for phrase in phrases:
        pattern = rf"\b{re.escape(phrase)}\b"

        if re.search(pattern, question):
            return True

    return False


def detect_vendor_intent(question):
    question = question.lower().strip()

    if contains_any(
        question,
        [
            "total vendors",
            "total vendor",
            "how many vendors",
            "how many vendor",
            "number of vendors",
            "vendor count",
        ],
    ):
        return "total_vendors"

    if contains_any(
        question,
        [
            "active vendors",
            "active vendor",
            "how many active vendors",
        ],
    ):
        return "active_vendors"

    if contains_any(
        question,
        [
            "inactive vendors",
            "inactive vendor",
            "how many inactive vendors",
        ],
    ):
        return "inactive_vendors"

    if contains_any(
        question,
        [
            "best vendor",
            "best-performing vendor",
            "best performing vendor",
            "vendor is performing best",
            "top vendor",
            "highest vendor",
        ],
    ):
        return "best_vendor"

    if contains_any(
        question,
        [
            "worst vendor",
            "worst-performing vendor",
            "worst performing vendor",
            "lowest vendor",
            "underperforming vendor",
        ],
    ):
        return "worst_vendor"

    if contains_any(
        question,
        [
            "vendor performance",
            "vendor completion rates",
            "vendor completion rate",
            "show vendor performance",
            "vendors by performance",
        ],
    ):
        return "vendor_performance"

    return "general_vendor"