from decimal import Decimal
from datetime import timedelta
import logging
from django.db.models import Q, Count
from django.utils import timezone
from .models import Listing, UserPreference, RecommendationCache
from django.db.models import Q, F, Count, Avg, DecimalField, Case, When, Value
from django.db.models.functions import Coalesce, ExtractDay, Now

logger = logging.getLogger(__name__)
class RecommendationEngine:

    @staticmethod
    def get_personalized_recommendations(user, limit=10):
        try:
            cache_valid_until = timezone.now() - timedelta(hours=6)
            cached = RecommendationCache.objects.filter(user=user, created_at__gt=cache_valid_until).first()
            if cached:
                listing_ids = cached.recommendations[:limit]
                return list(Listing.objects.filter(id__in=listing_ids, visibility_status=Listing.VisibilityStatus.ACTIVE))

            # Gather user views - Using views_count instead of ListingView
            viewed_listings = Listing.objects.filter(
                owner=user,
                visibility_status=Listing.VisibilityStatus.ACTIVE
            ).order_by('-views_count')[:20]
            
            viewed_categories, viewed_types, viewed_districts, viewed_prices = set(), set(), set(), []

            for listing in viewed_listings:
                if listing:
                    if listing.category:
                        viewed_categories.add(listing.category_id)
                    viewed_types.add(listing.listing_type)
                    if listing.district:
                        viewed_districts.add(listing.district)
                    if listing.price:
                        viewed_prices.append(float(listing.price))

            try:
                prefs = user.preferences
                preferred_categories = prefs.preferred_categories or []
                preferred_types = prefs.preferred_listing_types or []
            except UserPreference.DoesNotExist:
                preferred_categories, preferred_types = [], []

            avg_price = float(sum(viewed_prices)/len(viewed_prices)) if viewed_prices else None

            query = Q(visibility_status=Listing.VisibilityStatus.ACTIVE)

            categories_to_use = list(viewed_categories) + preferred_categories
            if categories_to_use:
                query &= Q(category__in=categories_to_use)

            types_to_use = list(viewed_types) + preferred_types
            if types_to_use:
                query &= Q(listing_type__in=types_to_use)

            if avg_price:
                price_range = avg_price * 0.3
                query &= Q(price__gte=Decimal(avg_price - price_range), price__lte=Decimal(avg_price + price_range))

            viewed_ids = [v.id for v in viewed_listings]
            if viewed_ids:
                query &= ~Q(id__in=viewed_ids)

            recommendations = list(Listing.objects.filter(query)[:limit])

            # Fill with popular listings - FIXED: use views_count
            if len(recommendations) < limit:
                popular = Listing.objects.filter(
                    visibility_status=Listing.VisibilityStatus.ACTIVE
                ).order_by('-views_count')[:limit - len(recommendations)]  # ← FIXED

                recommendations.extend([p for p in popular if p not in recommendations])

            # Cache results
            RecommendationCache.objects.update_or_create(
                user=user,
                defaults={
                    'recommendations': [r.id for r in recommendations],
                    'expires_at': timezone.now() + timedelta(hours=6)
                }
            )

            return recommendations[:limit]

        except Exception as e:
            logger.error(f"Error in get_personalized_recommendations: {e}")
            return []

    @staticmethod
    def get_similar_listings(listing, limit=6):
        """
        AI-Powered Similar Listings Algorithm - More Flexible
        
        Scoring Factors:
        1. Category Match (30%) - Same category or related
        2. Price Similarity (25%) - Flexible price range
        3. Listing Type Match (20%) - Same type
        4. Location Match (15%) - Same district or nearby
        5. Popularity Boost (10%) - High view count bonus
        """
        try:
            from django.db.models import Case, When, Value, DecimalField, F, Q
            
            if not listing:
                return []

            # Start with all active listings except current
            similar = Listing.objects.filter(
                visibility_status=Listing.VisibilityStatus.ACTIVE
            ).exclude(id=listing.id)

            # Apply flexible filters (not strict)
            
            # 1. Same listing type (preferred but not required)
            type_filter = Q(listing_type=listing.listing_type)
            
            # 2. Category - same or None (don't filter out if no category)
            if listing.category:
                category_filter = Q(category=listing.category) | Q(category__isnull=True)
            else:
                category_filter = Q()
            
            # 3. Price - flexible range (50% to 150%)
            if listing.price:
                price_filter = Q(
                    price__gte=listing.price * Decimal('0.5'),
                    price__lte=listing.price * Decimal('1.5')
                ) | Q(price__isnull=True)
            else:
                price_filter = Q()
            
            # 4. Location - same district or nearby
            if listing.district:
                location_filter = Q(district=listing.district) | Q(district__isnull=True)
            else:
                location_filter = Q()
            
            # Apply all filters (using OR so we don't exclude everything)
            similar = similar.filter(
                type_filter | category_filter | price_filter | location_filter
            )
            
            # Now annotate with similarity scores
            similar = similar.annotate(
                # Category score (30%)
                category_score=Case(
                    When(category=listing.category, then=Value(100)),
                    default=Value(30),  # Give partial score even if different category
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                ),
                
                # Price similarity score (25%)
                price_score=Case(
                    When(
                        price__gte=listing.price * Decimal('0.8'),
                        price__lte=listing.price * Decimal('1.2'),
                        then=Value(100)
                    ),
                    When(
                        price__gte=listing.price * Decimal('0.5'),
                        price__lte=listing.price * Decimal('1.5'),
                        then=Value(60)
                    ),
                    default=Value(20),
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                ),
                
                # Listing type score (20%)
                type_score=Case(
                    When(listing_type=listing.listing_type, then=Value(100)),
                    default=Value(20),
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                ),
                
                # Location score (15%)
                location_score=Case(
                    When(district=listing.district, then=Value(100)),
                    When(sector=listing.sector, then=Value(60)),
                    default=Value(10),
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                ),
                
                # Popularity score (10%)
                popularity_score=Case(
                    When(views_count__gte=100, then=Value(100)),
                    When(views_count__gte=50, then=Value(70)),
                    When(views_count__gte=10, then=Value(40)),
                    default=Value(10),
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                ),
            )
            
            # Calculate final similarity score
            similar = similar.annotate(
                similarity_score=(
                    (F('category_score') * Decimal('0.30')) +
                    (F('price_score') * Decimal('0.25')) +
                    (F('type_score') * Decimal('0.20')) +
                    (F('location_score') * Decimal('0.15')) +
                    (F('popularity_score') * Decimal('0.10'))
                )
            ).order_by('-similarity_score')[:limit]
            
            # Convert to list
            similar_list = list(similar)
            
            # If still no results, get popular listings as fallback
            if len(similar_list) == 0:
                print("No similar listings found, falling back to popular listings")
                popular = Listing.objects.filter(
                    visibility_status=Listing.VisibilityStatus.ACTIVE
                ).exclude(id=listing.id).order_by('-views_count')[:limit]
                
                for p in popular:
                    p.similarity_score = 0
                    p.match_quality = "📌 Popular"
                    similar_list.append(p)
            
            # Add match quality labels
            for item in similar_list:
                if hasattr(item, 'similarity_score') and item.similarity_score > 0:
                    if item.similarity_score >= 70:
                        item.match_quality = "🔥 Very Similar"
                    elif item.similarity_score >= 50:
                        item.match_quality = "👍 Similar"
                    elif item.similarity_score >= 30:
                        item.match_quality = "👀 You might also like"
                    else:
                        item.match_quality = "📌 Related"
                else:
                    item.match_quality = "📌 Popular"
            
            print(f"Found {len(similar_list)} similar listings for '{listing.title}'")
            return similar_list[:limit]

        except Exception as e:
            logger.error(f"Error in get_similar_listings: {e}")
            # Ultimate fallback - just return popular listings
            try:
                popular = Listing.objects.filter(
                    visibility_status=Listing.VisibilityStatus.ACTIVE
                ).exclude(id=listing.id).order_by('-views_count')[:limit]
                return list(popular)
            except:
                return []
        
    
    @staticmethod
    def get_similar_listings11(listing, limit=6):
        """
        AI-Powered Similar Listings Algorithm
        
        Scoring Factors:
        1. Category Match (30-35%) - Same category is best
        2. Price Similarity (20-25%) - Within 20% price range
        3. Listing Type Match (15-20%) - Same type (house, car, etc.)
        4. Location Match (10-15%) - Same district/sector
        5. Attribute Match (15-25%) - Based on listing type (bedrooms, car make, etc.)
        6. Popularity Boost (5%) - High view count bonus
        """
        try:
            from django.db.models import Case, When, Value, DecimalField, F
            from django.db.models.functions import Coalesce
            
            if not listing:
                return []

            # Base annotation for all listing types
            similar = Listing.objects.filter(
                visibility_status=Listing.VisibilityStatus.ACTIVE
            ).exclude(id=listing.id).annotate(
                
                # 1. CATEGORY MATCH - 100 points if same category
                category_score=Case(
                    When(category=listing.category, then=Value(100)),
                    default=Value(0),
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                ),
                
                # 2. PRICE SIMILARITY - Within 20% range
                price_score=Case(
                    When(
                        price__gte=listing.price * Decimal('0.8'),
                        price__lte=listing.price * Decimal('1.2'),
                        then=Value(100)
                    ),
                    When(
                        price__gte=listing.price * Decimal('0.5'),
                        price__lte=listing.price * Decimal('1.5'),
                        then=Value(50)
                    ),
                    default=Value(0),
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                ),
                
                # 3. LISTING TYPE MATCH - Same listing type
                type_score=Case(
                    When(listing_type=listing.listing_type, then=Value(100)),
                    default=Value(0),
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                ),
                
                # 4. LOCATION MATCH - District or sector match
                location_score=Case(
                    When(district=listing.district, then=Value(100)),
                    When(sector=listing.sector, then=Value(60)),
                    When(village=listing.village, then=Value(40)),
                    default=Value(0),
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                ),
                
                # 5. POPULARITY BOOST - Bonus for high view counts
                popularity_score=Case(
                    When(views_count__gte=100, then=Value(20)),
                    When(views_count__gte=50, then=Value(10)),
                    When(views_count__gte=10, then=Value(5)),
                    default=Value(0),
                    output_field=DecimalField(max_digits=5, decimal_places=2)
                ),
                
                # Default attribute_score (will be overridden for specific types)
                attribute_score=Value(0, output_field=DecimalField(max_digits=5, decimal_places=2)),
            )
            
            # Add attribute matching based on listing type
            if listing.listing_type == Listing.ListingType.HOUSE:
                similar = similar.annotate(
                    attribute_score=Case(
                        When(bedrooms=listing.bedrooms, then=Value(30)) +
                        When(bathrooms=listing.bathrooms, then=Value(30)) +
                        When(has_electricity=listing.has_electricity, then=Value(20)) +
                        When(has_water=listing.has_water, then=Value(20)),
                        default=Value(0),
                        output_field=DecimalField(max_digits=5, decimal_places=2)
                    )
                )
                # Adjust weights for houses
                similar = similar.annotate(
                    similarity_score=(
                        (F('category_score') * Decimal('0.30')) +
                        (F('price_score') * Decimal('0.20')) +
                        (F('type_score') * Decimal('0.15')) +
                        (F('location_score') * Decimal('0.15')) +
                        (F('attribute_score') * Decimal('0.15')) +
                        (F('popularity_score') * Decimal('0.05'))
                    )
                )
                
            elif listing.listing_type == Listing.ListingType.CAR:
                similar = similar.annotate(
                    attribute_score=Case(
                        When(car_make=listing.car_make, then=Value(40)) +
                        When(car_model=listing.car_model, then=Value(30)) +
                        When(
                            car_year__gte=(listing.car_year - 3) if listing.car_year else 0,
                            car_year__lte=(listing.car_year + 3) if listing.car_year else 9999,
                            then=Value(30)
                        ),
                        default=Value(0),
                        output_field=DecimalField(max_digits=5, decimal_places=2)
                    )
                )
                similar = similar.annotate(
                    similarity_score=(
                        (F('category_score') * Decimal('0.25')) +
                        (F('price_score') * Decimal('0.20')) +
                        (F('type_score') * Decimal('0.15')) +
                        (F('location_score') * Decimal('0.10')) +
                        (F('attribute_score') * Decimal('0.25')) +
                        (F('popularity_score') * Decimal('0.05'))
                    )
                )
                
            elif listing.listing_type == Listing.ListingType.CLOTHES_PRODUCT:
                similar = similar.annotate(
                    attribute_score=Case(
                        When(clothes_gender=listing.clothes_gender, then=Value(40)) +
                        When(clothes_size=listing.clothes_size, then=Value(30)) +
                        When(clothes_category=listing.clothes_category, then=Value(30)),
                        default=Value(0),
                        output_field=DecimalField(max_digits=5, decimal_places=2)
                    )
                )
                # Adjust weights for clothes
                similar = similar.annotate(
                    similarity_score=(
                        (F('category_score') * Decimal('0.25')) +
                        (F('price_score') * Decimal('0.20')) +
                        (F('type_score') * Decimal('0.15')) +
                        (F('location_score') * Decimal('0.10')) +
                        (F('attribute_score') * Decimal('0.25')) +
                        (F('popularity_score') * Decimal('0.05'))
                    )
                )
                
            elif listing.listing_type == Listing.ListingType.FOOD_PRODUCT:
                similar = similar.annotate(
                    attribute_score=Case(
                        When(food_category=listing.food_category, then=Value(50)) +
                        When(is_perishable=listing.is_perishable, then=Value(25)) +
                        When(is_prepared_food=listing.is_prepared_food, then=Value(25)),
                        default=Value(0),
                        output_field=DecimalField(max_digits=5, decimal_places=2)
                    )
                )
                # Adjust weights for food
                similar = similar.annotate(
                    similarity_score=(
                        (F('category_score') * Decimal('0.30')) +
                        (F('price_score') * Decimal('0.20')) +
                        (F('type_score') * Decimal('0.15')) +
                        (F('location_score') * Decimal('0.10')) +
                        (F('attribute_score') * Decimal('0.20')) +
                        (F('popularity_score') * Decimal('0.05'))
                    )
                )
                
            elif listing.listing_type == Listing.ListingType.HOME_KITCHEN_PRODUCT:
                similar = similar.annotate(
                    attribute_score=Case(
                        When(home_product_category=listing.home_product_category, then=Value(40)) +
                        When(material=listing.material, then=Value(30)) +
                        When(color=listing.color, then=Value(30)),
                        default=Value(0),
                        output_field=DecimalField(max_digits=5, decimal_places=2)
                    )
                )
                # Adjust weights for home products
                similar = similar.annotate(
                    similarity_score=(
                        (F('category_score') * Decimal('0.30')) +
                        (F('price_score') * Decimal('0.20')) +
                        (F('type_score') * Decimal('0.15')) +
                        (F('location_score') * Decimal('0.10')) +
                        (F('attribute_score') * Decimal('0.20')) +
                        (F('popularity_score') * Decimal('0.05'))
                    )
                )
                
            elif listing.listing_type == Listing.ListingType.PARCEL:
                similar = similar.annotate(
                    attribute_score=Case(
                        When(land_size__range=(
                            listing.land_size * Decimal('0.8') if listing.land_size else 0,
                            listing.land_size * Decimal('1.2') if listing.land_size else 999999
                        ), then=Value(100)),
                        default=Value(0),
                        output_field=DecimalField(max_digits=5, decimal_places=2)
                    )
                )
                # Adjust weights for parcels
                similar = similar.annotate(
                    similarity_score=(
                        (F('category_score') * Decimal('0.30')) +
                        (F('price_score') * Decimal('0.20')) +
                        (F('type_score') * Decimal('0.15')) +
                        (F('location_score') * Decimal('0.20')) +
                        (F('attribute_score') * Decimal('0.10')) +
                        (F('popularity_score') * Decimal('0.05'))
                    )
                )
                
            elif listing.listing_type == Listing.ListingType.BUSINESS_AD:
                similar = similar.annotate(
                    attribute_score=Case(
                        When(category=listing.category, then=Value(50)) +
                        When(district=listing.district, then=Value(50)),
                        default=Value(0),
                        output_field=DecimalField(max_digits=5, decimal_places=2)
                    )
                )
                # Adjust weights for business ads
                similar = similar.annotate(
                    similarity_score=(
                        (F('category_score') * Decimal('0.25')) +
                        (F('price_score') * Decimal('0.15')) +
                        (F('type_score') * Decimal('0.15')) +
                        (F('location_score') * Decimal('0.30')) +
                        (F('attribute_score') * Decimal('0.10')) +
                        (F('popularity_score') * Decimal('0.05'))
                    )
                )
                
            else:
                # Default weights for any other listing type
                similar = similar.annotate(
                    similarity_score=(
                        (F('category_score') * Decimal('0.35')) +
                        (F('price_score') * Decimal('0.25')) +
                        (F('type_score') * Decimal('0.20')) +
                        (F('location_score') * Decimal('0.15')) +
                        (F('popularity_score') * Decimal('0.05'))
                    )
                )
            
            # Filter and order by similarity score
            similar = similar.filter(
                similarity_score__gt=0
            ).order_by('-similarity_score')[:limit]
            
            # Convert to list and add metadata
            similar_list = list(similar)
            
            # If not enough similar listings, fallback to popular
            if len(similar_list) < limit:
                popular = Listing.objects.filter(
                    visibility_status=Listing.VisibilityStatus.ACTIVE,
                    listing_type=listing.listing_type
                ).exclude(id=listing.id).order_by('-views_count')[:limit - len(similar_list)]
                
                for p in popular:
                    if p not in similar_list:
                        p.similarity_score = 0
                        p.match_quality = "📌 Popular"
                        similar_list.append(p)
            
            # Add match quality labels
            for item in similar_list:
                if hasattr(item, 'similarity_score') and item.similarity_score > 0:
                    if item.similarity_score >= 70:
                        item.match_quality = "🔥 Very Similar"
                    elif item.similarity_score >= 50:
                        item.match_quality = "👍 Similar"
                    elif item.similarity_score >= 30:
                        item.match_quality = "👀 You might also like"
                    else:
                        item.match_quality = "📌 Related"
                else:
                    item.match_quality = "📌 Popular"
            
            return similar_list[:limit]

        except Exception as e:
            logger.error(f"Error in get_similar_listings: {e}")
            # Fallback to simple version if AI fails
            try:
                query = Q(visibility_status=Listing.VisibilityStatus.ACTIVE) & ~Q(id=listing.id)
                if listing.category:
                    query &= Q(category=listing.category)
                query &= Q(listing_type=listing.listing_type)
                if listing.price:
                    price_range = float(listing.price) * 0.2
                    query &= Q(price__gte=Decimal(float(listing.price) - price_range),
                            price__lte=Decimal(float(listing.price) + price_range))
                if listing.district:
                    query &= Q(district=listing.district)
                
                similar = list(Listing.objects.filter(query)[:limit])
                
                if len(similar) < limit:
                    popular = Listing.objects.filter(
                        visibility_status=Listing.VisibilityStatus.ACTIVE,
                        listing_type=listing.listing_type
                    ).exclude(id=listing.id).order_by('-views_count')[:limit - len(similar)]
                    similar.extend([p for p in popular if p not in similar])
                
                return similar[:limit]
            except:
                return []

    @staticmethod
    def record_listing_view(user, listing, request):
        try:
            # Just increment the views_count field
            listing.views_count += 1
            listing.save(update_fields=['views_count'])

            if user and user.is_authenticated:
                RecommendationEngine.update_preferences_from_view(user, listing)

        except Exception as e:
            logger.error(f"Error in record_listing_view: {e}")

    @staticmethod
    def update_preferences_from_view(user, listing):
        try:
            prefs, _ = UserPreference.objects.get_or_create(user=user)
            
            # Ensure fields are lists before modifying
            if not isinstance(prefs.preferred_categories, list):
                prefs.preferred_categories = []
            if not isinstance(prefs.preferred_listing_types, list):
                prefs.preferred_listing_types = []
            
            # Categories
            if listing.category and listing.category.id not in prefs.preferred_categories:
                categories = prefs.preferred_categories[:4]
                categories.insert(0, listing.category.id)
                prefs.preferred_categories = categories
            
            # Listing types
            if listing.listing_type and listing.listing_type not in prefs.preferred_listing_types:
                types = prefs.preferred_listing_types[:2]
                types.insert(0, listing.listing_type)
                prefs.preferred_listing_types = types
            
            prefs.save()
            
        except Exception as e:
            logger.error(f"Error in update_preferences_from_view: {e}")

    @staticmethod
    def get_trending_listings(limit=10, days=7):
        """
        Powerful trending algorithm with 4 key factors:
        - Views velocity (40%)
        - Engagement rate (30%)  
        - Recency (20%)
        - Price attractiveness (10%)
        """
        try:
            from django.db.models import Case, When, Value, DecimalField, F, Q
            from django.db.models.functions import Coalesce, ExtractDay
            from datetime import timedelta
            from django.utils import timezone
            
            now = timezone.now()
            time_threshold = now - timedelta(days=days)
            
            trending = Listing.objects.filter(
                visibility_status=Listing.VisibilityStatus.ACTIVE,
                created_at__gte=time_threshold
            ).exclude(  # ← EXCLUDE BUSINESS ADS
                listing_type=Listing.ListingType.BUSINESS_AD
            ).annotate(
                # Factor 1: Views per day (40%)
                days_old=Case(
                    When(created_at__isnull=False, 
                        then=ExtractDay(now - F('created_at')) + 1),
                    default=Value(1),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                ),
                views_per_day=Case(
                    When(days_old__gt=0, then=F('views_count') / F('days_old')),
                    default=Value(0),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                ),
                normalized_views=Case(
                    When(views_per_day__gt=0, 
                        then=F('views_per_day') * 100 / (F('views_per_day') + 100)),
                    default=Value(0),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                ),
                
                # Factor 2: Engagement rate (30%)
                engagement_rate=Case(
                    When(views_count__gt=0,
                        then=(F('call_clicks') + F('whatsapp_clicks')) * 100.0 / F('views_count')),
                    default=Value(0),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                ),
                
                # Factor 3: Recency boost (20%)
                hours_old=ExtractDay(now - F('created_at')) * 24,
                recency_score=Case(
                    When(hours_old__lt=24, then=Value(100)),
                    When(hours_old__lt=72, then=Value(70)),
                    When(hours_old__lt=168, then=Value(40)),
                    default=Value(20),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                ),
                
                # Factor 4: Price attractiveness (10%)
                avg_price_in_category=Coalesce(
                    Avg('price', filter=Q(category=F('category'))),
                    Value(1),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                ),
                price_score=Case(
                    When(price__lt=F('avg_price_in_category') * 0.7, then=Value(100)),
                    When(price__lt=F('avg_price_in_category'), then=Value(70)),
                    When(price__gt=F('avg_price_in_category') * 1.5, then=Value(20)),
                    default=Value(50),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                ),
            ).annotate(
                trending_score=(
                    Coalesce(F('normalized_views'), Value(0)) * Decimal('0.40') +
                    Coalesce(F('engagement_rate'), Value(0)) * Decimal('0.30') +
                    Coalesce(F('recency_score'), Value(0)) * Decimal('0.20') +
                    Coalesce(F('price_score'), Value(0)) * Decimal('0.10')
                )
            ).filter(trending_score__gt=0).order_by('-trending_score')[:limit]
            
            # Add trending metadata
            for idx, item in enumerate(trending):
                item.trending_rank = idx + 1
                if item.trending_score >= 80:
                    item.trending_badge = "🔥 HOT"
                elif item.trending_score >= 60:
                    item.trending_badge = "📈 TRENDING"
                elif item.trending_score >= 40:
                    item.trending_badge = "⭐ POPULAR"
                else:
                    item.trending_badge = "🆕 NEW"
            
            return trending
            
        except Exception as e:
            logger.error(f"Error in get_trending_listings: {e}")
            # Fallback to simple trending by views
            try:
                return Listing.objects.filter(
                    visibility_status=Listing.VisibilityStatus.ACTIVE,
                    views_count__gt=0
                ).order_by('-views_count')[:limit]
            except:
                return []
        
     