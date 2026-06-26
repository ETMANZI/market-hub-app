import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ShareButton from '../components/ShareButton';
import ReportButton from '../components/ReportButton';
import {
  MapPin,
  House,
  Building2,
  Layers3,
  ArrowLeft,
  Phone,
  CalendarDays,
  BedDouble,
  Bath,
  Ruler,
  Map,
  Car,
  Droplets,
  Zap,
  Fuel,
  Gauge,
  Palette,
  Cog,
  BadgeCheck,
  Package,
  Truck,
  Shirt,
  UtensilsCrossed,
  Home,
  Hash,
  Archive,
  Scale,
} from "lucide-react";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";
import { api } from "../lib/api";
import { SimilarListings, TrendingListings } from "../components/Recommendations";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type ListingImage = {
  id: string;
  image: string;
  is_cover?: boolean;
};

type Listing = {
  id: string;
  title: string;
  description: string;
  listing_type:
    | "house"
    | "parcel"
    | "business_ad"
    | "car"
    | "clothes_product"
    | "food_product"
    | "home_kitchen_product";
  sale_mode?: "sell" | "rent" | "ads";
  price: string | number;
  discount_price?: string | number | null;
  district?: string;
  sector?: string;
  village?: string;
  address?: string;
  contact_phone?: string;
  contact_email?: string;
  owner_name?: string;
  status?: string;
  images?: ListingImage[];
  created_at?: string;
  bedrooms?: number;
  bathrooms?: number;
  upi?: string;
  land_size?: string | number;
  latitude?: string | number | null;
  longitude?: string | number | null;
  has_electricity?: boolean;
  has_water?: boolean;
  negotiable?: boolean;
  owner_id?:string;

  car_make?: string;
  car_model?: string;
  car_year?: string | number | null;
  car_mileage?: string | number | null;
  car_fuel_type?: string;
  car_transmission?: string;
  car_condition?: string;
  car_color?: string;

  brand?: string;
  stock_quantity?: string | number | null;
  sku?: string;
  product_condition?: string;
  has_home_delivery?: boolean;
  delivery_fee?: string | number | null;
  delivery_notes?: string;

  clothes_gender?: string;
  clothes_size?: string;
  clothes_color?: string;
  clothes_material?: string;
  clothes_category?: string;

  food_category?: string;
  food_unit?: string;
  food_weight_volume?: string;
  is_perishable?: boolean;
  expiry_date?: string | null;
  is_prepared_food?: boolean;

  home_product_category?: string;
  material?: string;
  color?: string;
  dimensions?: string;
  weight?: string;
  warranty_months?: string | number | null;
};

function getListingIcon(type: Listing["listing_type"]) {
  if (type === "house") return <House size={16} />;
  if (type === "parcel") return <Layers3 size={16} />;
  if (type === "car") return <Car size={16} />;
  if (type === "clothes_product") return <Shirt size={16} />;
  if (type === "food_product") return <UtensilsCrossed size={16} />;
  if (type === "home_kitchen_product") return <Home size={16} />;
  return <Building2 size={16} />;
}

function getListingLabel(type: Listing["listing_type"], t: (key: string) => string) {
  if (type === "house") return t("listing_detail.house");
  if (type === "parcel") return t("listing_detail.parcel");
  if (type === "car") return t("listing_detail.car");
  if (type === "clothes_product") return t("listing_detail.clothes_product");
  if (type === "food_product") return t("listing_detail.food_product");
  if (type === "home_kitchen_product") return t("listing_detail.home_kitchen_product");
  return t("listing_detail.business_ad");
}

function formatPrice(value?: string | number | null) {
  const amount = Math.round(parseFloat(String(value ?? 0)));
  if (Number.isNaN(amount)) return "0";
  return new Intl.NumberFormat("en-RW").format(amount);
}

function formatDate(value?: string | null, t?: (key: string) => string) {
  if (!value) return t ? t("listing_detail.na") : "N/A";
  return new Date(value).toLocaleDateString("en-RW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatLandSize(value?: string | number | null) {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "0 m²";
  return num % 1 === 0 ? `${num.toFixed(0)} m²` : `${num} m²`;
}

function formatMileage(value?: string | number | null) {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "0 km";
  return `${new Intl.NumberFormat("en-RW").format(num)} km`;
}

function formatNumber(value?: string | number | null) {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "0";
  return new Intl.NumberFormat("en-RW").format(num);
}

function formatLabel(value?: string | null) {
  if (!value) return "Not specified";
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

function formatPhoneForCall(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/\s+/g, "");
}

function formatPhoneForWhatsApp(phone?: string | null) {
  if (!phone) return "";
  const clean = phone.replace(/\D/g, "");

  if (clean.startsWith("250")) return clean;
  if (clean.startsWith("0")) return `25${clean}`;

  return clean;
}

function getWhatsAppLink(phone?: string | null, title?: string) {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  if (!formattedPhone) return "#";

  const text = encodeURIComponent(
    `Hello, I am interested in your listing${title ? `: ${title}` : ""}.`
  );

  return `https://wa.me/${formattedPhone}?text=${text}`;
}

function InfoTile({
  icon,
  label,
  value,
  valueClassName = "text-slate-900",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-600">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className={`text-lg font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}

export default function ListingDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Record view for recommendation engine
  useEffect(() => {
    if (id) {
      api.post(`/listings/recommendations/record-view/${id}/`).catch(console.error);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    api
      .post("/moderation/track-visitor/", {
        path: `/listings/${id}`,
      })
      .catch(() => {});

    api.post(`/listings/${id}/increment_view/`).catch(() => {});
  }, [id]);

  const { data: listing, isLoading, isError } = useQuery<Listing>({
    queryKey: ["public-listing", id],
    queryFn: async () => {
      const response = await api.get(`/public/listings/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });

  const handleTrackContact = async (contactType: "call" | "whatsapp") => {
    if (!listing?.id) return;

    try {
      await api.post(`/listings/${listing.id}/track_contact/`, {
        contact_type: contactType,
      });
    } catch {
      // ignore tracking failure
    }
  };

  const images = listing?.images || [];
  const coverImage =
    selectedImage ||
    images.find((img) => img.is_cover)?.image ||
    images[0]?.image ||
    "";

  const isHouse = listing?.listing_type === "house";
  const isParcel = listing?.listing_type === "parcel";
  const isCar = listing?.listing_type === "car";
  const isClothes = listing?.listing_type === "clothes_product";
  const isFood = listing?.listing_type === "food_product";
  const isHomeKitchen = listing?.listing_type === "home_kitchen_product";
  const isProduct = isClothes || isFood || isHomeKitchen;
  const showPropertyDetails = isHouse || isParcel;

  const latNum = Number(listing?.latitude);
  const lngNum = Number(listing?.longitude);
  const hasCoordinates = Number.isFinite(latNum) && Number.isFinite(lngNum);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageContainer>
        <div className="py-8 md:py-10">
          <div className="mb-6">
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              {t("listing_detail.back_to_listings")}
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="animate-pulse lg:col-span-2">
                <div className="h-[420px] rounded-2xl bg-slate-200" />
              </Card>

              <Card className="animate-pulse">
                <div className="space-y-4">
                  <div className="h-6 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-5/6 rounded bg-slate-200" />
                </div>
              </Card>
            </div>
          ) : isError || !listing ? (
            <Card>
              <p className="text-red-600">{t("listing_detail.load_error")}</p>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card className="overflow-hidden p-0">
                    <div className="h-[420px] w-full bg-slate-200">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-500">
                          {t("listing_detail.no_image")}
                        </div>
                      )}
                    </div>
                  </Card>

                  {images.length > 1 && (
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {images.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setSelectedImage(img.image)}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                          <img
                            src={img.image}
                            alt={listing.title}
                            className="h-24 w-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <Card className="mt-6">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {getListingIcon(listing.listing_type)}
                        {getListingLabel(listing.listing_type, t)}
                      </span>

                      {listing.sale_mode && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {listing.sale_mode === "sell"
                            ? t("listing_detail.for_sale")
                            : listing.sale_mode === "rent"
                            ? t("listing_detail.for_rent")
                            : t("listing_detail.advertisement")}
                        </span>
                      )}

                      {listing.negotiable ? (
                        <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                          {t("listing_detail.negotiable")}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {t("listing_detail.fixed_price")}
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                      {listing.title}
                    </h1>

                    {(listing.address || listing.district || listing.sector || listing.village) && (
                      <div className="mt-3 flex items-start gap-2 text-slate-600">
                        <MapPin size={18} className="mt-0.5 shrink-0" />
                        <span>
                          {listing.address ||
                            [listing.district, listing.sector, listing.village]
                              .filter(Boolean)
                              .join(", ") ||
                            t("listing_detail.location_not_specified")}
                        </span>
                      </div>
                    )}

                    {isCar && (
                      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoTile icon={<Car size={16} />} label={t("listing_detail.car_make")} value={listing.car_make || t("listing_detail.not_specified")} />
                        <InfoTile icon={<Car size={16} />} label={t("listing_detail.car_model")} value={listing.car_model || t("listing_detail.not_specified")} />
                        <InfoTile icon={<CalendarDays size={16} />} label={t("listing_detail.car_year")} value={listing.car_year || t("listing_detail.not_specified")} />
                        <InfoTile icon={<Gauge size={16} />} label={t("listing_detail.car_mileage")} value={formatMileage(listing.car_mileage)} />
                        <InfoTile icon={<Fuel size={16} />} label={t("listing_detail.car_fuel_type")} value={formatLabel(listing.car_fuel_type)} />
                        <InfoTile icon={<Cog size={16} />} label={t("listing_detail.car_transmission")} value={formatLabel(listing.car_transmission)} />
                        <InfoTile icon={<BadgeCheck size={16} />} label={t("listing_detail.car_condition")} value={formatLabel(listing.car_condition)} />
                        <InfoTile icon={<Palette size={16} />} label={t("listing_detail.car_color")} value={listing.car_color || t("listing_detail.not_specified")} />
                      </div>
                    )}

                    {showPropertyDetails && (
                      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {isHouse && (
                          <>
                            <InfoTile icon={<BedDouble size={16} />} label={t("listing_detail.bedrooms")} value={listing.bedrooms ?? 0} />
                            <InfoTile icon={<Bath size={16} />} label={t("listing_detail.bathrooms")} value={listing.bathrooms ?? 0} />
                          </>
                        )}

                        <InfoTile icon={<Ruler size={16} />} label={t("listing_detail.land_size")} value={formatLandSize(listing.land_size)} />

                        {listing.upi && (
                          <InfoTile icon={<Map size={16} />} label={t("listing_detail.upi")} value={listing.upi} />
                        )}

                        <InfoTile
                          icon={<Zap size={16} />}
                          label={t("listing_detail.electricity")}
                          value={listing.has_electricity ? t("listing_detail.available") : t("listing_detail.not_available")}
                          valueClassName={listing.has_electricity ? "text-green-600" : "text-slate-900"}
                        />

                        <InfoTile
                          icon={<Droplets size={16} />}
                          label={t("listing_detail.water")}
                          value={listing.has_water ? t("listing_detail.available") : t("listing_detail.not_available")}
                          valueClassName={listing.has_water ? "text-green-600" : "text-slate-900"}
                        />
                      </div>
                    )}

                    {isProduct && (
                      <div className="mt-6">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900">
                          {t("listing_detail.product_details")}
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <InfoTile icon={<Package size={16} />} label={t("listing_detail.brand")} value={listing.brand || t("listing_detail.not_specified")} />
                          <InfoTile
                            icon={<Archive size={16} />}
                            label={t("listing_detail.stock_quantity")}
                            value={listing.stock_quantity != null ? formatNumber(listing.stock_quantity) : t("listing_detail.not_specified")}
                          />
                          <InfoTile icon={<Hash size={16} />} label={t("listing_detail.sku")} value={listing.sku || t("listing_detail.not_specified")} />
                          <InfoTile
                            icon={<BadgeCheck size={16} />}
                            label={t("listing_detail.product_condition")}
                            value={formatLabel(listing.product_condition)}
                          />
                          <InfoTile
                            icon={<Truck size={16} />}
                            label={t("listing_detail.home_delivery")}
                            value={listing.has_home_delivery ? t("listing_detail.available") : t("listing_detail.not_available")}
                            valueClassName={listing.has_home_delivery ? "text-green-600" : "text-slate-900"}
                          />
                          <InfoTile
                            icon={<Truck size={16} />}
                            label={t("listing_detail.delivery_fee")}
                            value={
                              listing.has_home_delivery
                                ? `RWF ${formatPrice(listing.delivery_fee)}`
                                : t("listing_detail.not_applicable")
                            }
                          />
                        </div>

                        {listing.delivery_notes && (
                          <div className="mt-4 rounded-2xl bg-slate-100 p-4">
                            <p className="text-sm font-medium text-slate-700">{t("listing_detail.delivery_notes")}</p>
                            <p className="mt-2 text-slate-600">{listing.delivery_notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {isClothes && (
                      <div className="mt-6">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900">
                          {t("listing_detail.clothes_details")}
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <InfoTile
                            icon={<Shirt size={16} />}
                            label={t("listing_detail.clothes_category")}
                            value={listing.clothes_category || t("listing_detail.not_specified")}
                          />
                          <InfoTile
                            icon={<BadgeCheck size={16} />}
                            label={t("listing_detail.clothes_gender")}
                            value={formatLabel(listing.clothes_gender)}
                          />
                          <InfoTile
                            icon={<Ruler size={16} />}
                            label={t("listing_detail.clothes_size")}
                            value={listing.clothes_size?.toUpperCase() || t("listing_detail.not_specified")}
                          />
                          <InfoTile
                            icon={<Palette size={16} />}
                            label={t("listing_detail.clothes_color")}
                            value={listing.clothes_color || t("listing_detail.not_specified")}
                          />
                          <InfoTile
                            icon={<Package size={16} />}
                            label={t("listing_detail.clothes_material")}
                            value={listing.clothes_material || t("listing_detail.not_specified")}
                          />
                        </div>
                      </div>
                    )}

                    {isFood && (
                      <div className="mt-6">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900">
                          {t("listing_detail.food_details")}
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <InfoTile
                            icon={<UtensilsCrossed size={16} />}
                            label={t("listing_detail.food_category")}
                            value={listing.food_category || t("listing_detail.not_specified")}
                          />
                          <InfoTile
                            icon={<Scale size={16} />}
                            label={t("listing_detail.food_unit")}
                            value={formatLabel(listing.food_unit)}
                          />
                          <InfoTile
                            icon={<Package size={16} />}
                            label={t("listing_detail.food_weight_volume")}
                            value={listing.food_weight_volume || t("listing_detail.not_specified")}
                          />
                          <InfoTile
                            icon={<BadgeCheck size={16} />}
                            label={t("listing_detail.perishable")}
                            value={listing.is_perishable ? t("listing_detail.yes") : t("listing_detail.no")}
                            valueClassName={listing.is_perishable ? "text-green-600" : "text-slate-900"}
                          />
                          <InfoTile
                            icon={<CalendarDays size={16} />}
                            label={t("listing_detail.expiry_date")}
                            value={
                              listing.is_perishable
                                ? formatDate(listing.expiry_date || undefined, t)
                                : t("listing_detail.not_applicable")
                            }
                          />
                          <InfoTile
                            icon={<UtensilsCrossed size={16} />}
                            label={t("listing_detail.prepared_food")}
                            value={listing.is_prepared_food ? t("listing_detail.yes") : t("listing_detail.no")}
                            valueClassName={listing.is_prepared_food ? "text-green-600" : "text-slate-900"}
                          />
                        </div>
                      </div>
                    )}

                    {isHomeKitchen && (
                      <div className="mt-6">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900">
                          {t("listing_detail.home_kitchen_details")}
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <InfoTile
                            icon={<Home size={16} />}
                            label={t("listing_detail.home_product_category")}
                            value={listing.home_product_category || t("listing_detail.not_specified")}
                          />
                          <InfoTile
                            icon={<Package size={16} />}
                            label={t("listing_detail.material")}
                            value={listing.material || t("listing_detail.not_specified")}
                          />
                          <InfoTile
                            icon={<Palette size={16} />}
                            label={t("listing_detail.product_color")}
                            value={listing.color || t("listing_detail.not_specified")}
                          />
                          <InfoTile
                            icon={<Ruler size={16} />}
                            label={t("listing_detail.dimensions")}
                            value={listing.dimensions || t("listing_detail.not_specified")}
                          />
                          <InfoTile
                            icon={<Scale size={16} />}
                            label={t("listing_detail.weight")}
                            value={listing.weight || t("listing_detail.not_specified")}
                          />
                          <InfoTile
                            icon={<BadgeCheck size={16} />}
                            label={t("listing_detail.warranty")}
                            value={
                              listing.warranty_months != null
                                ? `${listing.warranty_months} ${t("listing_detail.months")}`
                                : t("listing_detail.not_specified")
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <h2 className="text-lg font-semibold text-slate-900">{t("listing_detail.description")}</h2>
                      <p className="mt-2 whitespace-pre-line leading-7 text-slate-600">
                        {listing.description || t("listing_detail.no_description")}
                      </p>
                    </div>
                  </Card>
                </div>

                <div>
                  <Card>
                    <p className="text-sm text-slate-500">{t("listing_detail.price")}</p>

                    <div className="mt-2">
                      {listing.discount_price && Number(listing.discount_price) > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-base text-slate-400 line-through">
                            RWF {formatPrice(listing.price)}
                          </span>
                          <h2 className="text-3xl font-bold text-green-600">
                            RWF {formatPrice(listing.discount_price)}
                          </h2>
                        </div>
                      ) : (
                        <h2 className="text-3xl font-bold text-slate-900">
                          RWF {formatPrice(listing.price)}
                        </h2>
                      )}
                    </div>

                    <div className="mt-2">
                      {listing.negotiable ? (
                        <span className="inline-block rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-green-700">
                          {t("listing_detail.negotiable_badge")}
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-red-600">
                          {t("listing_detail.fixed_price_badge")}
                        </span>
                      )}
                    </div>

                    <div className="mt-6 space-y-4 text-sm text-slate-600">
                      {(listing.district || listing.sector || listing.village) && (
                        <div className="flex items-start gap-3">
                          <MapPin size={18} className="mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-slate-900">{t("listing_detail.location")}</p>
                            <p>
                              {[listing.district, listing.sector, listing.village]
                                .filter(Boolean)
                                .join(", ") || t("listing_detail.not_specified")}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <CalendarDays size={18} className="mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900">{t("listing_detail.posted_on")}</p>
                          <p>{formatDate(listing.created_at, t)}</p>
                        </div>
                      </div>

                      {listing.contact_email && (
                        <div className="flex items-start gap-3">
                          <Package size={18} className="mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-slate-900">{t("listing_detail.email")}</p>
                            <p>{listing.contact_email}</p>
                          </div>
                        </div>
                      )}

                      {hasCoordinates && !isCar && (
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <Map size={18} className="mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-slate-900">{t("listing_detail.map_location")}</p>
                              <a
                                href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {t("listing_detail.view_on_google_maps")}
                              </a>
                              <p className="mt-1 text-xs text-slate-500">
                                {latNum}, {lngNum}
                              </p>
                            </div>
                          </div>

                          <div className="overflow-hidden rounded-2xl border border-slate-200">
                            <MapContainer
                              center={[latNum, lngNum]}
                              zoom={16}
                              scrollWheelZoom={false}
                              style={{ height: "220px", width: "100%" }}
                            >
                              <TileLayer
                                attribution="© OpenStreetMap"
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker position={[latNum, lngNum]} icon={markerIcon} />
                            </MapContainer>
                          </div>
                        </div>
                      )}

                      {listing.contact_phone && (
                        <div className="flex items-start gap-3">
                          <Phone size={18} className="mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-slate-900">{t("listing_detail.contact")}</p>
                            <p>{listing.contact_phone}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {listing.contact_phone ? (
                        <>
                          <a
                            href={`tel:${formatPhoneForCall(listing.contact_phone)}`}
                            onClick={() => handleTrackContact("call")}
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-300 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-600"
                          >
                            {t("listing_detail.call_now")}
                          </a>

                          <a
                            href={getWhatsAppLink(listing.contact_phone, listing.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleTrackContact("whatsapp")}
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700"
                          >
                            {t("listing_detail.whatsapp")}
                          </a>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="w-full rounded-2xl bg-slate-300 px-4 py-3 text-white"
                          disabled
                        >
                          {t("listing_detail.no_contact")}
                        </button>
                      )}
<div className="mt-4 flex gap-3">
  <ShareButton title={listing.title} />
  <ReportButton 
    listingId={listing.id} 
    userId={listing.owner_id}
    userName={listing.owner_name}
  />
</div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="mt-8">
                <SimilarListings listingId={listing.id} />
              </div>
              
              <div className="mt-8">
                <TrendingListings />
              </div>

              <div className="mt-6">
                <Link
                  to="/listings"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft size={16} />
                  {t("listing_detail.back_to_listings")}
                </Link>
              </div>
            </>
          )}
        </div>
      </PageContainer>
    </div>
  );
}