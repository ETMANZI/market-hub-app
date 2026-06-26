from django.urls import path
from .views import (
    SubscriptionPlanListView,
    MySubscriptionView,
    SubscribeToPlanView,
    MySubscriptionPaymentsView,
    AdminSubscriptionRequestListView,
    AdminSubscriptionPaymentListView,
    AdminApproveSubscriptionView,
    AdminRejectSubscriptionView,
    UserSubscriptionLimitsView,
)

urlpatterns = [
    path("plans/", SubscriptionPlanListView.as_view(), name="subscription-plans"),
    path("my-subscription/", MySubscriptionView.as_view(), name="my-subscription"),
    path("subscribe/", SubscribeToPlanView.as_view(), name="subscribe-to-plan"),
    path("my-payments/", MySubscriptionPaymentsView.as_view(), name="my-subscription-payments"),
    path("my-subscription-limits/", UserSubscriptionLimitsView.as_view(), name="subscription-limits"),
    path("admin/requests/", AdminSubscriptionRequestListView.as_view(), name="admin-subscription-requests"),
    path("admin/payments/", AdminSubscriptionPaymentListView.as_view(), name="admin-subscription-payments"),
    path("admin/requests/<int:pk>/approve/", AdminApproveSubscriptionView.as_view(), name="admin-approve-subscription"),
    path("admin/requests/<int:pk>/reject/", AdminRejectSubscriptionView.as_view(), name="admin-reject-subscription"),
]