# apps/subscriptions/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import UserSubscription  # Fixed: Use UserSubscription

@receiver(post_save, sender=UserSubscription)
def update_listings_on_subscription_change(sender, instance, created, **kwargs):
    """
    When a user subscribes to Premium/Business, update their listings
    When subscription expires/downgrades, remove featured status
    """
    from apps.listings.models import Listing
    
    user = instance.user
    plan_name = instance.plan.name if instance.plan else None
    
    # Check if user has active Premium or Business plan
    is_premium_or_business = (
        plan_name in ['premium', 'business'] and 
        instance.status == 'approved' and 
        instance.is_active and
        instance.end_date and 
        instance.end_date > timezone.now()
    )
    
    # Get user's active listings
    user_listings = Listing.objects.filter(
        owner=user,
        visibility_status=Listing.VisibilityStatus.ACTIVE
    )
    
    if is_premium_or_business:
        # User has active Premium/Business - Feature their listings
        priority = 2 if plan_name == 'business' else 1
        expires_at = instance.end_date  # Use subscription end date
        
        updated_count = user_listings.update(
            is_featured=True,
            featured_priority=priority,
            featured_expires_at=expires_at
        )
        print(f"✅ Featured {updated_count} listings for {user.email} ({plan_name} plan)")
    else:
        # User downgraded or subscription expired - Remove featured status
        updated_count = user_listings.update(
            is_featured=False,
            featured_priority=0,
            featured_expires_at=None
        )
        print(f"❌ Removed featured from {updated_count} listings for {user.email}")

@receiver(post_delete, sender=UserSubscription)
def remove_featured_on_subscription_delete(sender, instance, **kwargs):
    """When subscription is deleted, remove featured status from listings"""
    from apps.listings.models import Listing
    
    user = instance.user
    Listing.objects.filter(owner=user).update(
        is_featured=False,
        featured_priority=0,
        featured_expires_at=None
    )
    print(f"❌ Removed featured from all listings for {user.email} (subscription deleted)")