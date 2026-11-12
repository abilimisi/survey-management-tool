from core.models import VendorPortalNotification


def notify_vendor(
    project_vendor=None,
    application=None,
    event_type="general_update",
    title="Update",
    message="",
    vendor_user=None,
):
    """
    Send a notification to a vendor portal account.
    The notification can relate to an application or project assignment.
    """

    if vendor_user is None:
        if project_vendor is not None:
            if not project_vendor.vendor.is_diy:
                return None

            try:
                vendor_user = project_vendor.vendor.portal_account
            except Exception:
                return None

        elif application is not None:
            vendor_user = application.user

    if vendor_user is None or not vendor_user.is_active:
        return None

    return VendorPortalNotification.objects.create(
        vendor_recipient=vendor_user,
        application=application,
        project_vendor=project_vendor,
        event_type=event_type,
        title=title,
        message=message,
    )


def notify_admins(
    event_type="general_update",
    title="Update",
    message="",
    application=None,
    project_vendor=None,
):
    """
    Send a notification to each active staff admin.
    """

    from django.contrib.auth.models import User

    admins = User.objects.filter(
        is_active=True,
        is_staff=True,
    )

    notifications = [
        VendorPortalNotification(
            admin_recipient=admin,
            application=application,
            project_vendor=project_vendor,
            event_type=event_type,
            title=title,
            message=message,
        )
        for admin in admins
    ]

    return VendorPortalNotification.objects.bulk_create(notifications)