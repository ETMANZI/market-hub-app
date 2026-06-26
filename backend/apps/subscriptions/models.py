from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class SubscriptionPlan(models.Model):
    BILLING_CYCLE_CHOICES = (
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
    )

    name = models.CharField(max_length=100, unique=True)
    code = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)

    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default="RWF")
    billing_cycle = models.CharField(
        max_length=20,
        choices=BILLING_CYCLE_CHOICES,
        default="monthly",
    )
    duration_days = models.PositiveIntegerField(default=30)

    max_listings = models.PositiveIntegerField(default=0)
    can_post_business_ads = models.BooleanField(default=False)
    can_feature_listings = models.BooleanField(default=False)
    can_access_advanced_analytics = models.BooleanField(default=False)
    priority_support = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    max_listings = models.PositiveIntegerField(default=0)
    max_images_per_listing = models.PositiveIntegerField(default=1)
    can_post_business_ads = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["price", "name"]

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.code == 'basic':
            self.max_images_per_listing = 1
            self.max_listings = 2
        elif self.code == 'classic':
            self.max_images_per_listing = 2
            self.max_listings = 3
        elif self.code == 'premium':
            self.max_images_per_listing = 3
            self.max_listings = 4
        elif self.code == 'business':
            self.max_images_per_listing = 4
            self.max_listings = 5
        
        super().save(*args, **kwargs)


class UserSubscription(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("expired", "Expired"),
        ("cancelled", "Cancelled"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name="user_subscriptions",
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    rejection_reason = models.TextField(blank=True)

    requested_at = models.DateTimeField(auto_now_add=True)

    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_subscriptions",
    )

    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    auto_renew = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-requested_at"]

    def approve(self, admin_user):
        now = timezone.now()
        self.status = "approved"
        self.approved_at = now
        self.approved_by = admin_user
        self.start_date = now
        self.end_date = now + timedelta(days=self.plan.duration_days)
        self.rejection_reason = ""
        self.save(
            update_fields=[
                "status",
                "approved_at",
                "approved_by",
                "start_date",
                "end_date",
                "rejection_reason",
                "updated_at",
            ]
        )

    def reject(self, reason=""):
        self.status = "rejected"
        self.rejection_reason = reason or "Rejected by admin"
        self.save(update_fields=["status", "rejection_reason", "updated_at"])

    @property
    def is_currently_active(self):
        return (
            self.status == "approved"
            and self.is_active
            and self.start_date is not None
            and self.end_date is not None
            and self.end_date > timezone.now()
        )

    def __str__(self):
        return f"{self.user} - {self.plan.name} - {self.status}"


class SubscriptionPayment(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("successful", "Successful"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    )

    subscription = models.ForeignKey(
        UserSubscription,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscription_payments",
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default="RWF")
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    transaction_id = models.CharField(max_length=150, blank=True, null=True, unique=True)
    external_reference = models.CharField(max_length=150, blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    paid_at = models.DateTimeField(null=True, blank=True)

    raw_response = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.amount} {self.currency} - {self.status}"