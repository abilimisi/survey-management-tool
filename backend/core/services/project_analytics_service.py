from django.db.models import Count
from core.models import Project, Respondent


def get_project_overview():
    total_projects = Project.objects.count()

    active_projects = Project.objects.filter(
        status__in=["running", "testing"]
    ).count()

    running_projects = Project.objects.filter(
        status="running"
    ).count()

    testing_projects = Project.objects.filter(
        status="testing"
    ).count()

    closed_projects = Project.objects.filter(
        status="closed"
    ).count()

    on_hold_projects = Project.objects.filter(
        status="on_hold"
    ).count()

    return {
        "total_projects": total_projects,
        "active_projects": active_projects,
        "running_projects": running_projects,
        "testing_projects": testing_projects,
        "closed_projects": closed_projects,
        "on_hold_projects": on_hold_projects,
    }


def get_project_performance():
    projects = Project.objects.all()

    data = []

    for project in projects:
        respondents = Respondent.objects.filter(
            project=project
        )

        hits = respondents.count()

        if hits == 0:
            continue

        completes = respondents.filter(
            status="complete"
        ).count()

        terminates = respondents.filter(
            status="terminate"
        ).count()

        quota_full = respondents.filter(
            status="quota_full"
        ).count()

        security_terminate = respondents.filter(
            status="security_terminate"
        ).count()

        started = respondents.filter(
            status="started"
        ).count()

        completion_rate = round(
            (completes / hits) * 100,
            2,
        )

        data.append(
            {
                "project_id": project.id,
                "project_name": project.name,
                "status": project.status,
                "hits": hits,
                "completes": completes,
                "terminates": terminates,
                "quota_full": quota_full,
                "security_terminate": security_terminate,
                "started": started,
                "completion_rate": completion_rate,
            }
        )

    data.sort(
        key=lambda item: (
            item["completion_rate"],
            item["completes"],
            item["hits"],
        ),
        reverse=True,
    )

    return data


def get_project_ai_context():
    return {
        "overview": get_project_overview(),
        "performance": get_project_performance(),
    }