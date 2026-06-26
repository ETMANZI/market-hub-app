from rest_framework import serializers
from apps.listings.models import Listing
from .models import SubscriptionPlan, UserSubscription, SubscriptionPayment


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "name",
            "code",
            "description",
            "price",
            "currency",
            "billing_cycle",
            "duration_days",
            "max_listings",
            "can_post_business_ads",
            "can_feature_listings",
            "can_access_advanced_analytics",
            "priority_support",
            "is_active",
        ]


class SubscriptionPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPayment
        fields = [
            "id",
            "subscription",
            "user",
            "amount",
            "currency",
            "payment_method",
            "transaction_id",
            "external_reference",
            "status",
            "paid_at",
            "raw_response",
            "created_at",
            "updated_at",
        ]


class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    is_currently_active = serializers.ReadOnlyField()
    approved_by_name = serializers.SerializerMethodField()
    usage = serializers.SerializerMethodField()

    class Meta:
        model = UserSubscription
        fields = [
            "id",
            "status",
            "rejection_reason",
            "requested_at",
            "approved_at",
            "approved_by",
            "approved_by_name",
            "start_date",
            "end_date",
            "auto_renew",
            "is_active",
            "created_at",
            "updated_at",
            "is_currently_active",
            "plan",
            "usage",
        ]

    def get_approved_by_name(self, obj):
        if not obj.approved_by:
            return None

        full_name = f"{obj.approved_by.first_name or ''} {obj.approved_by.last_name or ''}".strip()
        return full_name or obj.approved_by.username or obj.approved_by.email

    def get_usage(self, obj):
        if not obj.user_id or not obj.plan_id:
            return {
                "used_listings": 0,
                "remaining_listings": 0,
            }

        used_listings = Listing.objects.filter(
            owner=obj.user,
            status__in=[Listing.Status.PENDING, Listing.Status.APPROVED],
        ).count()

        remaining = max(obj.plan.max_listings - used_listings, 0)

        return {
            "used_listings": used_listings,
            "remaining_listings": remaining,
        }


class AdminUserSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    is_currently_active = serializers.ReadOnlyField()
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    usage = serializers.SerializerMethodField()
    latest_payment = serializers.SerializerMethodField()

    class Meta:
        model = UserSubscription
        fields = [
            "id",
            "user",
            "user_name",
            "user_email",
            "plan",
            "status",
            "rejection_reason",
            "requested_at",
            "approved_at",
            "approved_by",
            "start_date",
            "end_date",
            "auto_renew",
            "is_active",
            "created_at",
            "updated_at",
            "is_currently_active",
            "usage",
            "latest_payment",
        ]

    def get_user_name(self, obj):
        full_name = f"{obj.user.first_name or ''} {obj.user.last_name or ''}".strip()
        return full_name or obj.user.username or obj.user.email

    def get_user_email(self, obj):
        return obj.user.email

    def get_usage(self, obj):
        used_listings = Listing.objects.filter(
            owner=obj.user,
            status__in=[Listing.Status.PENDING, Listing.Status.APPROVED],
        ).count()

        remaining = max(obj.plan.max_listings - used_listings, 0)

        return {
            "used_listings": used_listings,
            "remaining_listings": remaining,
        }

    def get_latest_payment(self, obj):
        payment = obj.payments.order_by("-created_at").first()
        if not payment:
            return None

        return {
            "id": payment.id,
            "amount": str(payment.amount),
            "currency": payment.currency,
            "status": payment.status,
            "payment_method": payment.payment_method,
            "transaction_id": payment.transaction_id,
            "paid_at": payment.paid_at,
        }