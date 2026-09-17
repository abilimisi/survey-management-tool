import re


def contains_any(question, phrases):
    for phrase in phrases:
        pattern = rf"\b{re.escape(phrase)}\b"

        if re.search(pattern, question):
            return True

    return False


def detect_project_intent(question):
    question = question.lower().strip()

    if contains_any(
        question,
        [
            "total projects",
            "total project",
            "how many projects",
            "how many project",
            "number of projects",
            "project count",
        ],
    ):
        return "total_projects"

    if contains_any(
        question,
        [
            "active projects",
            "active project",
            "how many active projects",
            "number of active projects",
        ],
    ):
        return "active_projects"

    if contains_any(
        question,
        [
            "running projects",
            "running project",
            "how many running projects",
        ],
    ):
        return "running_projects"

    if contains_any(
        question,
        [
            "testing projects",
            "testing project",
            "how many testing projects",
        ],
    ):
        return "testing_projects"

    if contains_any(
        question,
        [
            "closed projects",
            "closed project",
            "how many closed projects",
        ],
    ):
        return "closed_projects"

    if contains_any(
        question,
        [
            "projects on hold",
            "projects on_hold",
            "on hold projects",
            "on_hold projects",
        ],
    ):
        return "on_hold_projects"

    if contains_any(
        question,
        [
            "best project",
            "best-performing project",
            "best performing project",
            "top project",
            "highest project",
        ],
    ):
        return "best_project"

    if contains_any(
        question,
        [
            "worst project",
            "worst-performing project",
            "worst performing project",
            "lowest project",
            "underperforming project",
        ],
    ):
        return "worst_project"

    if contains_any(
        question,
        [
            "projects by performance",
            "project performance",
            "project completion rates",
            "project completion rate",
            "show project performance",
        ],
    ):
        return "project_performance"

    return "general_project"