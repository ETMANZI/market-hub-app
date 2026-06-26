from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from apps.listings.models import Listing

from apps.notifications.utils import create_notification

from .models import SubscriptionPlan, UserSubscription, SubscriptionPayment
from .serializers import (
    SubscriptionPlanSerializer,
    UserSubscriptionSerializer,
    AdminUserSubscriptionSerializer,
    SubscriptionPaymentSerializer,
)


class SubscriptionPlanListView(generics.ListAPIView):
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return SubscriptionPlan.objects.filter(is_active=True).order_by("price", "name")


class MySubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        subscription = (
            UserSubscription.objects.filter(user=request.user, is_active=True)
            .select_related("plan", "approved_by")
            .order_by("-requested_at")
            .first()
        )
        hidden_count = Listing.objects.filter(
            owner=request.user,
            visibility_status=Listing.VisibilityStatus.INACTIVE
        ).count()
        if not subscription:
            return Response({
                "has_subscription": False,
                "subscription": None,
                "listings_hidden": hidden_count > 0,
                "hidden_listings_count": hidden_count,
            })

        return Response({
            "has_subscription": True,
            "subscription": UserSubscriptionSerializer(subscription).data,
            "listings_hidden": hidden_count > 0,
            "hidden_listings_count": hidden_count,
        })


class SubscribeToPlanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")

        if not plan_id:
            return Response(
                {"detail": "plan_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response(
                {"detail": "Subscription plan not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        now = timezone.now()

        existing_pending = UserSubscription.objects.filter(
            user=request.user,
            is_active=True,
            status="pending",
        ).exists()

        if existing_pending:
            return Response(
                {"detail": "You already have a pending subscription request awaiting approval."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_approved = UserSubscription.objects.filter(
            user=request.user,
            is_active=True,
            status="approved",
            end_date__isnull=False,
            end_date__gt=now,
        ).exists()

        if existing_approved:
            return Response(
                {"detail": "You already have an active approved subscription."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subscription = UserSubscription.objects.create(
            user=request.user,
            plan=plan,
            status="pending",
        )

        payment = SubscriptionPayment.objects.create(
            subscription=subscription,
            user=request.user,
            amount=plan.price,
            currency=plan.currency,
            status="pending",
        )

        return Response(
            {
                "message": "Subscription request submitted successfully.",
                "subscription_id": subscription.id,
                "payment_id": payment.id,
                "amount": str(payment.amount),
                "currency": payment.currency,
                "status": subscription.status,
                "can_renew_again_after_expiry": True,
            },
            status=status.HTTP_201_CREATED,
        )


class MySubscriptionPaymentsView(generics.ListAPIView):
    serializer_class = SubscriptionPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SubscriptionPayment.objects.filter(user=self.request.user).order_by("-created_at")


class AdminSubscriptionRequestListView(generics.ListAPIView):
    serializer_class = AdminUserSubscriptionSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return (
            UserSubscription.objects.select_related("user", "plan", "approved_by")
            .prefetch_related("payments")
            .order_by("-requested_at")
        )


class AdminSubscriptionPaymentListView(generics.ListAPIView):
    serializer_class = SubscriptionPaymentSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return (
            SubscriptionPayment.objects.select_related("user", "subscription", "subscription__plan")
            .order_by("-created_at")
        )





class AdminApproveSubscriptionView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            subscription = UserSubscription.objects.select_related("plan", "user").get(pk=pk)
        except UserSubscription.DoesNotExist:
            return Response(
                {"detail": "Subscription request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        subscription.approve(request.user)

        Listing.objects.filter(owner=subscription.user).update(
            visibility_status=Listing.VisibilityStatus.ACTIVE
        )

        create_notification(
            user=subscription.user,
            title="Subscription Approved",
            message=(
                f'Your "{subscription.plan.name}" subscription has been approved. '
                f'Your listings are now visible again.'
            ),
            notification_type="subscription_approved",
        )

        return Response(
            {
                "message": "Subscription approved successfully. Listings are now visible."
            }
        )


class AdminRejectSubscriptionView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            subscription = UserSubscription.objects.select_related("plan", "user").get(pk=pk)
        except UserSubscription.DoesNotExist:
            return Response(
                {"detail": "Subscription request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        reason = (request.data.get("reason") or "").strip()

        subscription.reject(reason)

        has_active = UserSubscription.objects.filter(
            user=subscription.user,
            status="approved",
            is_active=True,
            end_date__gt=timezone.now(),
        ).exists()

        if not has_active:
            Listing.objects.filter(owner=subscription.user).update(
                visibility_status=Listing.VisibilityStatus.INACTIVE
            )

        create_notification(
            user=subscription.user,
            title="Subscription Rejected",
            message=(
                f'Your "{subscription.plan.name}" subscription request was rejected.'
                + (f" Reason: {reason}" if reason else "")
            ),
            notification_type="subscription_rejected",
        )

        return Response(
            {
                "message": "Subscription rejected successfully.",
                "reason": reason or "Rejected by admin",
            }
        )
        

# class UserSubscriptionLimitsView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request):
#         now = timezone.now()
#         active_subscription = UserSubscription.objects.filter(
#             user=request.user,
#             status='approved',
#             is_active=True,
#             end_date__gt=now
#         ).select_related('plan').first()
        
#         current_plan = None
#         if active_subscription:
#             current_plan = {
#                 'id': active_subscription.plan.id,
#                 'name': active_subscription.plan.name,
#                 'code': active_subscription.plan.code,
#                 'max_images_per_listing': active_subscription.plan.max_images_per_listing,
#                 'max_listings': active_subscription.plan.max_listings,
#                 'can_post_business_ads': active_subscription.plan.can_post_business_ads,
#             }
        
#         available_plans = SubscriptionPlan.objects.filter(
#             is_active=True
#         ).values('id', 'name', 'code', 'max_images_per_listing', 'price', 'billing_cycle')
        
#         if active_subscription:
#             limits = {
#                 'has_active_subscription': True,
#                 'has_pending_subscription': False,
#                 'current_plan': current_plan,
#                 'max_images_per_listing': active_subscription.plan.max_images_per_listing,
#                 'max_listings': active_subscription.plan.max_listings,
#                 'can_post_business_ads': active_subscription.plan.can_post_business_ads,
#                 'can_feature_listings': active_subscription.plan.can_feature_listings,
#                 'can_access_advanced_analytics': active_subscription.plan.can_access_advanced_analytics,
#                 'priority_support': active_subscription.plan.priority_support,
#                 'subscription_end_date': active_subscription.end_date.isoformat() if active_subscription.end_date else None,
#                 'is_expiring_soon': active_subscription.end_date and (active_subscription.end_date - now).days <= 7 if active_subscription.end_date else False,
#                 'available_plans': list(available_plans)
#             }
#         else:
#             pending_subscription = UserSubscription.objects.filter(
#                 user=request.user,
#                 status='pending',
#                 is_active=True
#             ).exists()
            
#             # Get Free plan limits as default
#             free_plan = SubscriptionPlan.objects.filter(code='free', is_active=True).first()
            
#             limits = {
#                 'has_active_subscription': False,
#                 'has_pending_subscription': pending_subscription,
#                 'current_plan': None,
#                 'max_images_per_listing': free_plan.max_images_per_listing if free_plan else 3,
#                 'max_listings': free_plan.max_listings if free_plan else 1,
#                 'can_post_business_ads': False,
#                 'can_feature_listings': False,
#                 'can_access_advanced_analytics': False,
#                 'priority_support': False,
#                 'subscription_end_date': None,
#                 'is_expiring_soon': False,
#                 'available_plans': list(available_plans)
#             }
        
#         return Response(limits)




class UserSubscriptionLimitsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        now = timezone.now()
        active_subscription = UserSubscription.objects.filter(
            user=request.user,
            status='approved',
            is_active=True,
            end_date__gt=now
        ).select_related('plan').first()
        
        current_plan = None
        if active_subscription:
            current_plan = {
                'id': active_subscription.plan.id,
                'name': active_subscription.plan.name,
                'code': active_subscription.plan.code,
                'max_images_per_listing': active_subscription.plan.max_images_per_listing,
                'max_listings': active_subscription.plan.max_listings,
                'can_post_business_ads': active_subscription.plan.can_post_business_ads,
            }
        
        available_plans = SubscriptionPlan.objects.filter(
            is_active=True
        ).values('id', 'name', 'code', 'max_images_per_listing', 'price', 'billing_cycle')
        
        if active_subscription:
            limits = {
                'has_active_subscription': True,
                'has_pending_subscription': False,
                'current_plan': current_plan,
                'max_images_per_listing': active_subscription.plan.max_images_per_listing,
                'max_listings': active_subscription.plan.max_listings,
                'can_post_business_ads': active_subscription.plan.can_post_business_ads,
                'can_feature_listings': active_subscription.plan.can_feature_listings,
                'can_access_advanced_analytics': active_subscription.plan.can_access_advanced_analytics,
                'priority_support': active_subscription.plan.priority_support,
                'subscription_end_date': active_subscription.end_date.isoformat() if active_subscription.end_date else None,
                'is_expiring_soon': active_subscription.end_date and (active_subscription.end_date - now).days <= 7 if active_subscription.end_date else False,
                'available_plans': list(available_plans)
            }
        else:
            pending_subscription = UserSubscription.objects.filter(
                user=request.user,
                status='pending',
                is_active=True
            ).exists()
            
            # No free plan - user must subscribe to post
            limits = {
                'has_active_subscription': False,
                'has_pending_subscription': pending_subscription,
                'current_plan': None,
                'max_images_per_listing': 0,  # No images allowed without subscription
                'max_listings': 0,  # No listings allowed without subscription
                'can_post_business_ads': False,
                'can_feature_listings': False,
                'can_access_advanced_analytics': False,
                'priority_support': False,
                'subscription_end_date': None,
                'is_expiring_soon': False,
                'available_plans': list(available_plans)
            }
        
        return Response(limits)