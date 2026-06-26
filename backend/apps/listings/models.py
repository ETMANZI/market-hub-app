from django.conf import settings
from django.db import models
from apps.common.models import TimeStampedModel
from django.core.validators import URLValidator
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="children"
    )

    def __str__(self):
        return self.name



class Listing(TimeStampedModel):
    class ListingType(models.TextChoices):
        BUSINESS_AD = "business_ad", "Business Ad"
        HOUSE = "house", "House"
        PARCEL = "parcel", "Parcel"
        CAR = "car", "Car"
        CLOTHES_PRODUCT = "clothes_product", "Clothes Product"
        FOOD_PRODUCT = "food_product", "Food Product"
        HOME_KITCHEN_PRODUCT = "home_kitchen_product", "Home & Kitchen Product"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    class VisibilityStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    class SaleMode(models.TextChoices):
        SELL = "sell", "Sell"
        RENT = "rent", "Rent"
        ADS = "ads", "Ads"

    class ProductCondition(models.TextChoices):
        NEW = "new", "New"
        USED = "used", "Used"

    class ClothesGender(models.TextChoices):
        MEN = "men", "Men"
        WOMEN = "women", "Women"
        UNISEX = "unisex", "Unisex"
        KIDS = "kids", "Kids"

    class ClothesSize(models.TextChoices):
        XS = "xs", "XS"
        S = "s", "S"
        M = "m", "M"
        L = "l", "L"
        XL = "xl", "XL"
        XXL = "xxl", "XXL"
        XXXL = "xxxl", "XXXL"

    class FoodUnit(models.TextChoices):
        PIECE = "piece", "Piece"
        KG = "kg", "Kg"
        GRAM = "gram", "Gram"
        LITER = "liter", "Liter"
        ML = "ml", "Ml"
        PACK = "pack", "Pack"
        PLATE = "plate", "Plate"
        BOX = "box", "Box"
        BOTTLE = "bottle", "Bottle"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="listings"
    )
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()

    listing_type = models.CharField(max_length=30, choices=ListingType.choices)
    sale_mode = models.CharField(max_length=20, choices=SaleMode.choices, blank=True)

    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)
    visibility_status = models.CharField(
        max_length=20,
        choices=VisibilityStatus.choices,
        default=VisibilityStatus.ACTIVE,
    )

    price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount_price = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    publish_fee = models.DecimalField(max_digits=10, decimal_places=2, default=5000)
    is_featured = models.BooleanField(default=False)
    negotiable = models.BooleanField(default=False)

    address = models.CharField(max_length=255, blank=True)
    district = models.CharField(max_length=100, blank=True)
    sector = models.CharField(max_length=100, blank=True)
    village = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=50, decimal_places=16, null=True, blank=True)
    longitude = models.DecimalField(max_digits=50, decimal_places=16, null=True, blank=True)

    contact_phone = models.CharField(max_length=30, blank=True)
    contact_email = models.EmailField(blank=True)

    views_count = models.PositiveIntegerField(default=0)
    call_clicks = models.PositiveIntegerField(default=0)
    whatsapp_clicks = models.PositiveIntegerField(default=0)

    rejection_reason = models.TextField(blank=True, null=True)
    moderated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="moderated_listings"
    )
    moderated_at = models.DateTimeField(null=True, blank=True)


    bedrooms = models.PositiveIntegerField(null=True, blank=True)
    bathrooms = models.PositiveIntegerField(null=True, blank=True)
    has_electricity = models.BooleanField(default=False)
    has_water = models.BooleanField(default=False)


    upi = models.CharField(max_length=50, null=True, blank=True)
    land_size = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)


    car_make = models.CharField(max_length=100, blank=True, null=True)
    car_model = models.CharField(max_length=100, blank=True, null=True)
    car_year = models.PositiveIntegerField(blank=True, null=True)
    car_mileage = models.PositiveIntegerField(blank=True, null=True)
    car_fuel_type = models.CharField(
        max_length=20,
        choices=[
            ("petrol", "Petrol"),
            ("diesel", "Diesel"),
            ("electric", "Electric"),
            ("hybrid", "Hybrid"),
        ],
        blank=True,
        null=True,
    )
    car_transmission = models.CharField(
        max_length=20,
        choices=[
            ("manual", "Manual"),
            ("automatic", "Automatic"),
        ],
        blank=True,
        null=True,
    )
    car_condition = models.CharField(
        max_length=25,
        choices=[
            ("new", "New"),
            ("used", "Used"),
        ],
        blank=True,
        null=True,
    )
    car_color = models.CharField(max_length=50, blank=True, null=True)


    brand = models.CharField(max_length=100, blank=True, null=True)
    stock_quantity = models.PositiveIntegerField(null=True, blank=True)
    sku = models.CharField(max_length=100, blank=True, null=True)
    product_condition = models.CharField(
        max_length=20,
        choices=ProductCondition.choices,
        blank=True,
        null=True,
    )

    has_home_delivery = models.BooleanField(default=False)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    delivery_notes = models.CharField(max_length=255, blank=True, null=True)


    clothes_gender = models.CharField(
        max_length=20,
        choices=ClothesGender.choices,
        blank=True,
        null=True,
    )
    clothes_size = models.CharField(
        max_length=10,
        choices=ClothesSize.choices,
        blank=True,
        null=True,
    )
    clothes_color = models.CharField(max_length=50, blank=True, null=True)
    clothes_material = models.CharField(max_length=100, blank=True, null=True)
    clothes_category = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Example: shirt, trouser, dress, shoes, jacket"
    )


    food_category = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Example: fresh food, cooked food, drink, snack, bakery"
    )
    food_unit = models.CharField(
        max_length=20,
        choices=FoodUnit.choices,
        blank=True,
        null=True,
    )
    food_weight_volume = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Example: 1kg, 500ml, 12 pieces"
    )
    is_perishable = models.BooleanField(default=False)
    expiry_date = models.DateField(blank=True, null=True)
    is_prepared_food = models.BooleanField(default=False)


    home_product_category = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Example: cookware, furniture, decor, appliance, storage"
    )
    material = models.CharField(max_length=100, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    dimensions = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Example: 120x60x75 cm"
    )
    weight = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Example: 5kg"
    )
    warranty_months = models.PositiveIntegerField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    featured_priority = models.IntegerField(default=0, help_text="0=Normal, 1=Premium, 2=Business")
    featured_expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title
    
    def to_dict(self):
        """Convert listing to dictionary for API responses"""
        # Get images - assuming you have an Image model related to Listing
        images_data = []
        primary_image = None
        
        if hasattr(self, 'images'):
            images_data = [
                {
                    'image': img.image.url if hasattr(img.image, 'url') else str(img.image),
                    'is_cover': getattr(img, 'is_cover', False)
                }
                for img in self.images.all()
            ]
            
            # Get primary image (cover image or first image)
            if images_data:
                cover_images = [img for img in images_data if img.get('is_cover')]
                primary_image = cover_images[0]['image'] if cover_images else images_data[0]['image']
        
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'description': self.description,
            'price': str(self.price) if self.price else '0',
            'discount_price': str(self.discount_price) if self.discount_price else None,
            'listing_type': self.listing_type,
            'sale_mode': self.sale_mode,
            'district': self.district,
            'sector': self.sector,
            'village': self.village,
            'address': self.address,
            'views_count': self.views_count,
            'call_clicks': self.call_clicks,
            'whatsapp_clicks': self.whatsapp_clicks,
            'is_featured': self.is_featured,
            'negotiable': self.negotiable,
            'status': self.status,
            'visibility_status': self.visibility_status,
            'images': images_data,
            'primary_image': primary_image,
            'owner_id': self.owner_id,
            'owner_name': self.owner.get_full_name() or self.owner.username if hasattr(self, 'owner') else None,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'created_at': self.created_at.isoformat() if hasattr(self, 'created_at') else None,
            'updated_at': self.updated_at.isoformat() if hasattr(self, 'updated_at') else None,
            
            # House specific fields
            'bedrooms': self.bedrooms,
            'bathrooms': self.bathrooms,
            'has_electricity': self.has_electricity,
            'has_water': self.has_water,
            
            # Parcel specific fields
            'upi': self.upi,
            'land_size': str(self.land_size) if self.land_size else None,
            
            # Car specific fields
            'car_make': self.car_make,
            'car_model': self.car_model,
            'car_year': self.car_year,
            'car_mileage': self.car_mileage,
            'car_fuel_type': self.car_fuel_type,
            'car_transmission': self.car_transmission,
            'car_condition': self.car_condition,
            'car_color': self.car_color,
            
            # Product specific fields
            'brand': self.brand,
            'stock_quantity': self.stock_quantity,
            'sku': self.sku,
            'product_condition': self.product_condition,
            
            # Delivery fields
            'has_home_delivery': self.has_home_delivery,
            'delivery_fee': str(self.delivery_fee) if self.delivery_fee else None,
            'delivery_notes': self.delivery_notes,
            
            # Clothes specific fields
            'clothes_gender': self.clothes_gender,
            'clothes_size': self.clothes_size,
            'clothes_color': self.clothes_color,
            'clothes_material': self.clothes_material,
            'clothes_category': self.clothes_category,
            
            # Food specific fields
            'food_category': self.food_category,
            'food_unit': self.food_unit,
            'food_weight_volume': self.food_weight_volume,
            'is_perishable': self.is_perishable,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'is_prepared_food': self.is_prepared_food,
            
            # Home product specific fields
            'home_product_category': self.home_product_category,
            'material': self.material,
            'color': self.color,
            'dimensions': self.dimensions,
            'weight': self.weight,
            'warranty_months': self.warranty_months,
            
            # Contact fields
            'contact_phone': self.contact_phone,
            'contact_email': self.contact_email,
            
            # Location fields
            'latitude': str(self.latitude) if self.latitude else None,
            'longitude': str(self.longitude) if self.longitude else None,
        }

    def to_dict_light(self):
        """Lightweight version for listing pages (better performance)"""
        # Get primary image efficiently
        primary_image = None
        if hasattr(self, 'images'):
            cover_image = self.images.filter(is_cover=True).first()
            if cover_image:
                primary_image = cover_image.image.url if hasattr(cover_image.image, 'url') else str(cover_image.image)
            else:
                first_image = self.images.first()
                if first_image:
                    primary_image = first_image.image.url if hasattr(first_image.image, 'url') else str(first_image.image)
        
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'price': str(self.price) if self.price else '0',
            'discount_price': str(self.discount_price) if self.discount_price else None,
            'listing_type': self.listing_type,
            'sale_mode': self.sale_mode,
            'district': self.district,
            'sector': self.sector,
            'views_count': self.views_count,
            'is_featured': self.is_featured,
            'negotiable': self.negotiable,
            'primary_image': primary_image,
            'owner_id': self.owner_id,
            'owner_name': self.owner.get_full_name() or self.owner.username if hasattr(self, 'owner') else None,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'created_at': self.created_at.isoformat() if hasattr(self, 'created_at') else None,
            
            # Specific fields based on listing type (add as needed)
            'bedrooms': self.bedrooms if self.listing_type == self.ListingType.HOUSE else None,
            'bathrooms': self.bathrooms if self.listing_type == self.ListingType.HOUSE else None,
            'car_make': self.car_make if self.listing_type == self.ListingType.CAR else None,
            'car_model': self.car_model if self.listing_type == self.ListingType.CAR else None,
            'car_year': self.car_year if self.listing_type == self.ListingType.CAR else None,
        }
    


class ListingImage(TimeStampedModel):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="listings/")
    alt_text = models.CharField(max_length=255, blank=True)
    is_cover = models.BooleanField(default=False)


class Favorite(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="favorited_by")

    class Meta:
        unique_together = ("user", "listing")


class Partner(models.Model):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to="partners/")
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Notification(models.Model):
    TYPE_CHOICES = [
        ("listing_approved", "Listing Approved"),
        ("listing_rejected", "Listing Rejected"),
        ("listing_view", "Listing View"),
        ("listing_contact", "Listing Contact"),
        ("subscription_expiry", "Subscription Expiry"),
        ("subscription_expired", "Subscription Expired"),
        ("general", "General"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="app_notifications"
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default="general")
    is_read = models.BooleanField(default=False)
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.title}"


class FCMDevice(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="fcm_devices"
    )
    token = models.TextField(unique=True)
    device_type = models.CharField(max_length=20, blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.device_type or 'device'}"


class ListingViewEvent(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="view_events")
    viewed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    session_key = models.CharField(max_length=100, null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="listing_view_events"
    )

    def __str__(self):
        return f"{self.listing} viewed at {self.viewed_at}"


class ListingContactEvent(models.Model):
    CONTACT_CHOICES = [
        ("call", "Call"),
        ("whatsapp", "WhatsApp"),
    ]

    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="contact_events")
    contact_type = models.CharField(max_length=20, choices=CONTACT_CHOICES)
    clicked_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    session_key = models.CharField(max_length=100, null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="listing_contact_events"
    )

    def __str__(self):
        return f"{self.listing} - {self.contact_type}"


class PromoBanner(models.Model):
    class MediaType(models.TextChoices):
        VIDEO = "video", "Video"
        IMAGE = "image", "Image"
        GIF = "gif", "GIF"

    title = models.CharField(max_length=200, blank=True)
    media_type = models.CharField(
        max_length=10,
        choices=MediaType.choices,
        default=MediaType.VIDEO,
    )
    file = models.FileField(upload_to="promo_banners/")
    target_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or f"Banner {self.id}"


class ListingImpression(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="impressions")
    session_key = models.CharField(max_length=100, blank=True, default="")
    ip_address = models.CharField(max_length=100, blank=True, default="")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)


class ListingInterest(models.Model):
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="interests"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    anonymous_user_id = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["listing", "user"],
                name="unique_listing_interest_user"
            ),
            models.UniqueConstraint(
                fields=["listing", "anonymous_user_id"],
                name="unique_listing_interest_anonymous"
            ),
        ]

class ListingViewLog(models.Model):
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="view_logs"
    )
    session_key = models.CharField(max_length=100)
    ip_address = models.CharField(max_length=100)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="listing_view_logs"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["listing", "session_key", "created_at"]),
            models.Index(fields=["listing", "ip_address", "created_at"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.listing} - {self.session_key} - {self.created_at}"


    
    
# ============================================
# 4. AI-Powered Recommendation Models
# ============================================

class ListingView(models.Model):
    """Track individual listing views for recommendation engine"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='recommendation_views'
    )
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='recommendation_views')
    session_id = models.CharField(max_length=100, null=True, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-viewed_at']
    
    def __str__(self):
        user_str = self.user.email if self.user else f"Anonymous({self.session_id})"
        return f"{user_str} viewed {self.listing.title}"


class UserPreference(models.Model):
    """Store user preferences for personalized recommendations"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='preferences'
    )
    preferred_categories = models.JSONField(default=list)
    preferred_listing_types = models.JSONField(default=list)
    
    # Add these missing fields
    price_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location_preferences = models.CharField(max_length=255, blank=True, null=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences for {self.user.email}"
class RecommendationCache(models.Model):
    """Cache personalized recommendations for faster loading"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recommendation_cache'
    )
    recommendations = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def __str__(self):
        return f"Recommendations for {self.user.email}"
    
    
    
class Report(models.Model):
    REASON_CHOICES = (
        ('spam', 'Spam or Misleading'),
        ('fraud', 'Fraud or Scam'),
        ('illegal', 'Illegal Content'),
        ('harassment', 'Harassment or Abuse'),
        ('incorrect_info', 'Incorrect Information'),
        ('duplicate', 'Duplicate Listing'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('investigating', 'Under Investigation'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    )
    
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_made'
    )
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reports'
    )
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reports_received'
    )
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        target = self.listing.title if self.listing else self.reported_user.email
        return f"{self.reporter.email} reported {target} for {self.reason}"