from django.utils import timezone
from .models import UserSubscription
from apps.listings.models import Listing
from apps.notifications.utils import create_notification


def expire_user_subscriptions_and_hide_listings(user):
    """
    Marks expired subscriptions, hides user listings when no valid subscription remains,
    and sends a notification when a subscription expires.
    """
    if not user or not user.is_authenticated:
        return

    now = timezone.now()

    expired_subscriptions = UserSubscription.objects.filter(
        user=user,
        status="approved",
        is_active=True,
        end_date__isnull=False,
        end_date__lte=now,
    ).select_related("plan")

    expired_list = list(expired_subscriptions)

    if expired_list:
        expired_subscriptions.update(status="expired", is_active=False)

        for subscription in expired_list:
            create_notification(
                user=user,
                title="Subscription Expired",
                message=(
                    f'Your "{subscription.plan.name}" subscription has expired. '
                    f'Your listings are now hidden until you renew.'
                ),
                notification_type="subscription_expired",
            )
            
            # Remove featured status from expired subscription listings
            Listing.objects.filter(
                owner=user,
                is_featured=True
            ).update(
                is_featured=False,
                featured_priority=0,
                featured_expires_at=None
            )

    has_active_subscription = UserSubscription.objects.filter(
        user=user,
        status="approved",
        is_active=True,
        start_date__isnull=False,
        end_date__isnull=False,
        end_date__gt=now,
    ).exists()

    if not has_active_subscription:
        Listing.objects.filter(
            owner=user,
            visibility_status=Listing.VisibilityStatus.ACTIVE,
        ).update(
            visibility_status=Listing.VisibilityStatus.INACTIVE
        )
    else:
        # User has active subscription - ensure their listings are visible
        Listing.objects.filter(
            owner=user,
            visibility_status=Listing.VisibilityStatus.INACTIVE,
            status=Listing.Status.APPROVED
        ).update(
            visibility_status=Listing.VisibilityStatus.ACTIVE
        )
        
        # Also ensure premium/business listings are featured
        active_sub = get_active_subscription(user)
        if active_sub and active_sub.plan.name in ['premium', 'business']:
            priority = 2 if active_sub.plan.name == 'business' else 1
            Listing.objects.filter(
                owner=user,
                visibility_status=Listing.VisibilityStatus.ACTIVE
            ).update(
                is_featured=True,
                featured_priority=priority,
                featured_expires_at=active_sub.end_date
            )


def get_active_subscription(user):
    """
    Returns the latest approved and currently valid subscription for a user.
    Also expires old subscriptions, hides listings if needed,
    and sends expiry notifications.
    """
    if not user or not user.is_authenticated:
        return None

    expire_user_subscriptions_and_hide_listings(user)

    now = timezone.now()

    return (
        UserSubscription.objects.filter(
            user=user,
            status="approved",
            is_active=True,
            start_date__isnull=False,
            end_date__isnull=False,
            end_date__gt=now,
        )
        .select_related("plan")
        .order_by("-approved_at", "-created_at")
        .first()
    )