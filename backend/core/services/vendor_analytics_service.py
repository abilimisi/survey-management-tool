from core.models import Vendor, Respondent


def get_vendor_overview():
    total_vendors = Vendor.objects.count()

    active_vendors = Vendor.objects.filter(
        status=True
    ).count()

    inactive_vendors = Vendor.objects.filter(
        status=False
    ).count()

    return {
        "total_vendors": total_vendors,
        "active_vendors": active_vendors,
        "inactive_vendors": inactive_vendors,
    }


def get_vendor_performance():
    vendors = Vendor.objects.all()

    data = []

    for vendor in vendors:
        respondents = Respondent.objects.filter(
            vendor=vendor
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

        ir = round(
            (completes / hits) * 100,
            2,
        )

        data.append(
            {
                "vendor_id": vendor.id,
                "vendor_name": vendor.name,
                "hits": hits,
                "completes": completes,
                "terminates": terminates,
                "quota_full": quota_full,
                "security_terminate": security_terminate,
                "started": started,
                "ir": ir,
            }
        )

    data.sort(
        key=lambda item: (
            item["ir"],
            item["completes"],
            item["hits"],
        ),
        reverse=True,
    )

    return data


def get_vendor_ai_context():
    return {
        "overview": get_vendor_overview(),
        "performance": get_vendor_performance(),
    }