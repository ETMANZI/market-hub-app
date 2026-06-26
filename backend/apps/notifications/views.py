from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class MyNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")[:20]


class MyUnreadNotificationCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        unread_count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).count()
        return Response({"unread_count": unread_count})


class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notification = Notification.objects.filter(
            id=pk,
            user=request.user,
        ).first()

        if not notification:
            return Response({"detail": "Notification not found."}, status=404)

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response({"message": "Notification marked as read."})


class MarkAllNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(is_read=True)

        return Response({"message": "All notifications marked as read."})