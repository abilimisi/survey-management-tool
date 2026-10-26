import re
import unicodedata

from django.db.models import Q

from core.models import Client, Project, DIYStudy,DIYProjectReference


def normalize_name(value):
    """Normalize names for duplicate detection, not for display."""
    value = unicodedata.normalize("NFKC", value or "")
    value = re.sub(r"\s+", " ", value).strip()
    return value.casefold()


def find_matching_clients(company_name):
    """
    Return exact normalized-name matches.
    Never silently choose when multiple clients match.
    """
    target = normalize_name(company_name)

    return [
        client
        for client in Client.objects.all().only(
            "id", "name", "client_source"
        )
        if normalize_name(client.name) == target
    ]

def find_matching_projects(client, study_name):
    target = normalize_name(study_name)

    # The database filters by client first. Normalize names in Python
    # to avoid relying on database-specific case-folding behavior.
    candidates = Project.objects.filter(
        client=client
    ).only("id", "name", "client")

    return [
        project
        for project in candidates
        if normalize_name(project.name) == target
    ]

def generate_diy_reference():
    sequence = DIYProjectReference.objects.create()
    return f"OB{sequence.pk:02d}"