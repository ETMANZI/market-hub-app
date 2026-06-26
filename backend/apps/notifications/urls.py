from django.urls import path
from .views import (
    MyNotificationListView,
    MyUnreadNotificationCountView,
    MarkNotificationReadView,
    MarkAllNotificationsReadView,
)

urlpatterns = [
    path("my/", MyNotificationListView.as_view(), name="my-notifications"),
    path("my/unread-count/", MyUnreadNotificationCountView.as_view(), name="my-unread-notification-count"),
    path("<int:pk>/read/", MarkNotificationReadView.as_view(), name="mark-notification-read"),
    path("read-all/", MarkAllNotificationsReadView.as_view(), name="mark-all-notifications-read"),
]