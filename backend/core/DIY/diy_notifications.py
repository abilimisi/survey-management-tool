from django.contrib.auth import get_user_model

from core.models import DIYNotification


def notify_client(study, event_type, title, message):
    """
    Send a notification to the client user who created the study.
    """

    if not study.created_by_id:
        return None

    notification = DIYNotification(
        client_recipient=study.created_by,
        admin_recipient=None,
        study=study,
        event_type=event_type,
        title=title,
        message=message,
    )

    notification.full_clean()
    notification.save()

    return notification


def notify_admins(study, event_type, title, message):
    """
    Send a notification to all active staff users.
    """

    User = get_user_model()

    admins = User.objects.filter(
        is_active=True,
        is_staff=True,
    )

    notifications = []

    for admin in admins:
        notification = DIYNotification(
            client_recipient=None,
            admin_recipient=admin,
            study=study,
            event_type=event_type,
            title=title,
            message=message,
        )

        notification.full_clean()
        notification.save()

        notifications.append(notification)

    return notifications