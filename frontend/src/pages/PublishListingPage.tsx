import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { api } from "../lib/api";
import MapPicker from "../components/MapPicker";
import { isAuthenticated } from "../lib/auth";

type Category = {
  id: string | number;
  name: string;
};

// type SubscriptionLimits = {
//   has_active_subscription: boolean;
//   current_plan: string | null;
//   max_images_per_listing: number;
//   max_listings: number;
//   can_post_business_ads: boolean;
//   subscription_end_date: string | null;
// };
type SubscriptionLimits = {
  has_active_subscription: boolean;
  current_plan: {
    id: number;
    name: string;
    code: string;
    max_images_per_listing: number;
    max_listings: number;
    can_post_business_ads: boolean;
  } | null;
  max_images_per_listing: number;
  max_listings: number;
  can_post_business_ads: boolean;
  subscription_end_date: string | null;
};

type ListingForm = {
  title: string;
  slug: string;
  category: string;
  description: string;
  listing_type: string;
  sale_mode: string;

  price: number;
  discount_price?: number;

  district: string;
  sector: string;
  village: string;
  address: string;
  contact_phone: string;
  contact_email: string;

  latitude?: number;
  longitude?: number;

  negotiable?: boolean;

  bedrooms?: number;
  bathrooms?: number;
  has_electricity: boolean;
  has_water: boolean;

  upi: string;
  land_size?: number;

  car_make?: string;
  car_model?: string;
  car_year?: number;
  car_mileage?: number;
  car_fuel_type?: string;
  car_transmission?: string;
  car_condition?: string;
  car_color?: string;

  brand?: string;
  stock_quantity?: number;
  sku?: string;
  product_condition?: string;
  has_home_delivery?: boolean;
  delivery_fee?: number;
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
  expiry_date?: string;
  is_prepared_food?: boolean;

  home_product_category?: string;
  material?: string;
  color?: string;
  dimensions?: string;
  weight?: string;
  warranty_months?: number;
};

type SelectedImage = {
  file: File;
  preview: string;
};

const PRODUCT_TYPES = [
  "clothes_product",
  "food_product",
  "home_kitchen_product",
];

export default function PublishListingPage() {
  const { t } = useTranslation();
  const loggedIn = isAuthenticated();
  
  // Fetch subscription limits
  const { data: limits, isLoading: limitsLoading } = useQuery<SubscriptionLimits>({
    queryKey: ["subscription-limits"],
    queryFn: async () => {
      const response = await api.get("/subscriptions/my-subscription-limits/");
      return response.data;
    },
    enabled: loggedIn,
    staleTime: 5 * 60 * 1000,
  });

  const maxImages = limits?.max_images_per_listing || 1;
  const canPostBusinessAds = limits?.can_post_business_ads || false;
  const hasActiveSubscription = limits?.has_active_subscription || false;


  const currentPlanName = limits?.current_plan?.name || null;
 


  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ListingForm>({
    defaultValues: {
      title: "",
      slug: "",
      category: "",
      description: "",
      listing_type: "house",
      sale_mode: "sell",
      price: 0,
      discount_price: undefined,
      district: "",
      sector: "",
      village: "",
      address: "",
      contact_phone: "",
      contact_email: "",
      latitude: undefined,
      longitude: undefined,
      negotiable: false,

      bedrooms: 0,
      bathrooms: 0,
      upi: "",
      land_size: 0,
      has_electricity: false,
      has_water: false,

      car_make: "",
      car_model: "",
      car_year: undefined,
      car_mileage: undefined,
      car_fuel_type: "",
      car_transmission: "",
      car_condition: "",
      car_color: "",

      brand: "",
      stock_quantity: undefined,
      sku: "",
      product_condition: "",
      has_home_delivery: false,
      delivery_fee: undefined,
      delivery_notes: "",

      clothes_gender: "",
      clothes_size: "",
      clothes_color: "",
      clothes_material: "",
      clothes_category: "",

      food_category: "",
      food_unit: "",
      food_weight_volume: "",
      is_perishable: false,
      expiry_date: "",
      is_prepared_food: false,

      home_product_category: "",
      material: "",
      color: "",
      dimensions: "",
      weight: "",
      warranty_months: undefined,
    },
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const listingType = watch("listing_type");
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const hasHomeDelivery = watch("has_home_delivery");
  const isPerishable = watch("is_perishable");

  const isCar = listingType === "car";
  const isBusinessAd = listingType === "business_ad";
  const isHouse = listingType === "house";
  const isParcel = listingType === "parcel";
  const isProductType = useMemo(() => PRODUCT_TYPES.includes(listingType), [listingType]);

  const showSaleMode = !isBusinessAd;
  const showLandSize = isParcel || isHouse;
  const showBedroomsBathrooms = isHouse;
  const showUpi = isParcel || isHouse;
  const showUtilities = isParcel || isHouse;
  const showMap = listingType !== "car";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await api.get("/categories/");
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (listingType === "business_ad") {
      setValue("sale_mode", "ads");
    } else if (
      listingType === "parcel" ||
      listingType === "car" ||
      listingType === "clothes_product" ||
      listingType === "food_product" ||
      listingType === "home_kitchen_product"
    ) {
      setValue("sale_mode", "sell");
    } else if (listingType === "house") {
      setValue("sale_mode", "sell");
    }
  }, [listingType, setValue]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check image limit
    if (images.length + files.length > maxImages) {
      setError(t("publish.max_images_error", { max: maxImages }));
      e.target.value = "";
      return;
    }

    setError("");

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => {
      const imageToRemove = prev[indexToRemove];
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.preview);
      return prev.filter((_, index) => index !== indexToRemove);
    });
    setError("");
  };

  const clearAllImages = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setError("");
  };

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  const appendIfPresent = (
    formData: FormData,
    key: string,
    value: string | number | boolean | undefined | null
  ) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, String(value));
  };

  const onSubmit = async (data: ListingForm) => {
    try {
      setError("");
      setMessage("");

      // Validate image limit before submission
      if (images.length === 0) {
        setError(t("publish.at_least_one_image"));
        return;
      }

      if (images.length > maxImages) {
        setError(t("publish.max_images_error", { max: maxImages }));
        return;
      }

      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("slug", data.slug);
      formData.append("category", data.category || "");
      formData.append("description", data.description);
      formData.append("listing_type", data.listing_type);
      formData.append("price", String(data.price || 0));
      formData.append("negotiable", String(!!data.negotiable));

      if (
        data.discount_price !== undefined &&
        data.discount_price !== null &&
        !Number.isNaN(data.discount_price)
      ) {
        formData.append("discount_price", String(data.discount_price));
      }

      formData.append("district", data.district || "");
      formData.append("sector", data.sector || "");
      formData.append("village", data.village || "");
      formData.append("address", data.address || "");
      formData.append("contact_phone", data.contact_phone || "");
      formData.append("contact_email", data.contact_email || "");

      if (showSaleMode) {
        formData.append("sale_mode", data.sale_mode || "");
      }

      if (showBedroomsBathrooms) {
        appendIfPresent(formData, "bedrooms", data.bedrooms);
        appendIfPresent(formData, "bathrooms", data.bathrooms);
      }

      if (showUpi) {
        appendIfPresent(formData, "upi", data.upi);
      }

      if (showLandSize) {
        appendIfPresent(formData, "land_size", data.land_size);
      }

      if (showUtilities) {
        formData.append("has_electricity", String(!!data.has_electricity));
        formData.append("has_water", String(!!data.has_water));
      }

      if (isCar) {
        appendIfPresent(formData, "car_make", data.car_make);
        appendIfPresent(formData, "car_model", data.car_model);
        appendIfPresent(formData, "car_year", data.car_year);
        appendIfPresent(formData, "car_mileage", data.car_mileage);
        appendIfPresent(formData, "car_fuel_type", data.car_fuel_type);
        appendIfPresent(formData, "car_transmission", data.car_transmission);
        appendIfPresent(formData, "car_condition", data.car_condition);
        appendIfPresent(formData, "car_color", data.car_color);
      } else {
        appendIfPresent(formData, "latitude", data.latitude);
        appendIfPresent(formData, "longitude", data.longitude);
      }

      if (isProductType) {
        appendIfPresent(formData, "brand", data.brand);
        appendIfPresent(formData, "stock_quantity", data.stock_quantity);
        appendIfPresent(formData, "sku", data.sku);
        appendIfPresent(formData, "product_condition", data.product_condition);
        formData.append("has_home_delivery", String(!!data.has_home_delivery));
        appendIfPresent(formData, "delivery_fee", data.delivery_fee);
        appendIfPresent(formData, "delivery_notes", data.delivery_notes);
      }

      if (listingType === "clothes_product") {
        appendIfPresent(formData, "clothes_gender", data.clothes_gender);
        appendIfPresent(formData, "clothes_size", data.clothes_size);
        appendIfPresent(formData, "clothes_color", data.clothes_color);
        appendIfPresent(formData, "clothes_material", data.clothes_material);
        appendIfPresent(formData, "clothes_category", data.clothes_category);
      }

      if (listingType === "food_product") {
        appendIfPresent(formData, "food_category", data.food_category);
        appendIfPresent(formData, "food_unit", data.food_unit);
        appendIfPresent(formData, "food_weight_volume", data.food_weight_volume);
        formData.append("is_perishable", String(!!data.is_perishable));
        appendIfPresent(formData, "expiry_date", data.expiry_date);
        formData.append("is_prepared_food", String(!!data.is_prepared_food));
      }

      if (listingType === "home_kitchen_product") {
        appendIfPresent(formData, "home_product_category", data.home_product_category);
        appendIfPresent(formData, "material", data.material);
        appendIfPresent(formData, "color", data.color);
        appendIfPresent(formData, "dimensions", data.dimensions);
        appendIfPresent(formData, "weight", data.weight);
        appendIfPresent(formData, "warranty_months", data.warranty_months);
      }

      images.forEach((image) => formData.append("new_images", image.file));

      const listingRes = await api.post("/listings/", formData);
      const listingId = listingRes.data.id;

      const paymentRes = await api.post("/payments/create-listing-payment/", {
        listing_id: listingId,
      });

      setMessage(
        t("publish.payment_message", {
          amount: paymentRes.data.amount,
          currency: paymentRes.data.currency,
        })
      );

      clearAllImages();

      reset({
        title: "",
        slug: "",
        category: "",
        description: "",
        listing_type: "house",
        sale_mode: "sell",
        price: 0,
        discount_price: undefined,
        district: "",
        sector: "",
        village: "",
        address: "",
        contact_phone: "",
        contact_email: "",
        latitude: undefined,
        longitude: undefined,
        negotiable: false,

        bedrooms: 0,
        bathrooms: 0,
        upi: "",
        land_size: 0,
        has_electricity: false,
        has_water: false,

        car_make: "",
        car_model: "",
        car_year: undefined,
        car_mileage: undefined,
        car_fuel_type: "",
        car_transmission: "",
        car_condition: "",
        car_color: "",

        brand: "",
        stock_quantity: undefined,
        sku: "",
        product_condition: "",
        has_home_delivery: false,
        delivery_fee: undefined,
        delivery_notes: "",

        clothes_gender: "",
        clothes_size: "",
        clothes_color: "",
        clothes_material: "",
        clothes_category: "",

        food_category: "",
        food_unit: "",
        food_weight_volume: "",
        is_perishable: false,
        expiry_date: "",
        is_prepared_food: false,

        home_product_category: "",
        material: "",
        color: "",
        dimensions: "",
        weight: "",
        warranty_months: undefined,
      });
    } catch (err: any) {
      const responseData = err?.response?.data;

      if (typeof responseData === "string") {
        setError(responseData);
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else if (responseData && typeof responseData === "object") {
        const firstError = Object.entries(responseData)
          .map(([field, messages]) => {
            return `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`;
          })
          .join(" | ");
        setError(firstError);
      } else {
        setError(t("publish.error_message"));
      }
    }
  };

  // Show loading state while fetching subscription limits
  if (limitsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageContainer>
          <div className="mx-auto max-w-4xl py-10">
            <Card>
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
              </div>
            </Card>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageContainer>
        <div className="mx-auto max-w-4xl py-10">
          <Card>
            <h1 className="mb-6 text-3xl font-bold text-slate-900">
              {t("publish.title")}
            </h1>

            {/* Subscription Info Banner */}
            <div className={`mb-6 rounded-lg p-4 ${
              hasActiveSubscription 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {hasActiveSubscription 
                      ? t("publish.current_plan", { plan: currentPlanName })
                      : t("publish.free_plan")}
                  </p>
                  <p className="text-sm mt-1">
                    {t("publish.images_allowed", { count: maxImages })}
                  </p>
                  {limits?.subscription_end_date && (
                    <p className="text-xs mt-1 text-slate-500">
                      {t("publish.valid_until")}: {new Date(limits.subscription_end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {!hasActiveSubscription && (
                  <a
                    href="/subscriptions"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    {t("publish.upgrade_plan")}
                  </a>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.title_label")}
                </label>
                <Input placeholder={t("publish.title_placeholder")} {...register("title", { required: true })} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.slug_label")}
                </label>
                <Input placeholder={t("publish.slug_placeholder")} {...register("slug", { required: true })} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.category_label")}
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                  {...register("category")}
                >
                  <option value="">
                    {loadingCategories ? t("publish.loading_categories") : t("publish.select_category")}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.listing_type_label")}
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                  {...register("listing_type")}
                >
                  <option value="house">{t("publish.house")}</option>
                  <option value="parcel">{t("publish.parcel")}</option>
                  <option 
                    value="business_ad" 
                    disabled={!canPostBusinessAds}
                    className={!canPostBusinessAds ? 'text-slate-400' : ''}
                  >
                    {t("publish.business_ad")}
                    {!canPostBusinessAds && ` (${t("publish.upgrade_required")})`}
                  </option>
                  <option value="car">{t("publish.car")}</option>
                  <option value="clothes_product">{t("publish.clothes_product")}</option>
                  <option value="food_product">{t("publish.food_product")}</option>
                  <option value="home_kitchen_product">{t("publish.home_kitchen_product")}</option>
                </select>
              </div>

              {showSaleMode && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("publish.sale_mode_label")}
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                    {...register("sale_mode")}
                  >
                    {listingType === "house" && (
                      <>
                        <option value="sell">{t("publish.sell")}</option>
                        <option value="rent">{t("publish.rent")}</option>
                      </>
                    )}

                    {(listingType === "parcel" ||
                      listingType === "car" ||
                      listingType === "clothes_product" ||
                      listingType === "food_product" ||
                      listingType === "home_kitchen_product") && (
                      <option value="sell">{t("publish.sell")}</option>
                    )}

                    {listingType === "business_ad" && (
                      <option value="ads">{t("publish.ads")}</option>
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.price_label")}
                </label>
                <Input
                  placeholder={t("publish.price_placeholder")}
                  type="number"
                  {...register("price", { valueAsNumber: true, required: true })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.discount_price_label")}
                </label>
                <Input
                  placeholder={t("publish.discount_price_placeholder")}
                  type="number"
                  step="0.01"
                  {...register("discount_price", {
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.negotiable_label")}
                </label>

                <label className="flex w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 outline-none">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0"
                    {...register("negotiable")}
                  />
                  <span className="ml-3 text-sm text-slate-700">{t("publish.yes")}</span>
                </label>
              </div>

              {showBedroomsBathrooms && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {t("publish.bedrooms_label")}
                    </label>
                    <Input
                      placeholder={t("publish.bedrooms_placeholder")}
                      type="number"
                      {...register("bedrooms", {
                        setValueAs: (v) => (v === "" ? undefined : Number(v)),
                      })}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {t("publish.bathrooms_label")}
                    </label>
                    <Input
                      placeholder={t("publish.bathrooms_placeholder")}
                      type="number"
                      {...register("bathrooms", {
                        setValueAs: (v) => (v === "" ? undefined : Number(v)),
                      })}
                    />
                  </div>
                </>
              )}

              {showUpi && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("publish.upi_label")}
                  </label>
                  <Input placeholder={t("publish.upi_placeholder")} {...register("upi")} />
                </div>
              )}

              {showLandSize && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("publish.land_size_label")}
                  </label>
                  <Input
                    placeholder={t("publish.land_size_placeholder")}
                    type="number"
                    step="0.01"
                    {...register("land_size", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                  />
                </div>
              )}

              {isCar && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-4 text-sm font-semibold text-slate-800">{t("publish.car_details")}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.car_make_label")}
                      </label>
                      <Input placeholder={t("publish.car_make_placeholder")} {...register("car_make")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.car_model_label")}
                      </label>
                      <Input placeholder={t("publish.car_model_placeholder")} {...register("car_model")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.car_year_label")}
                      </label>
                      <Input
                        placeholder={t("publish.car_year_placeholder")}
                        type="number"
                        {...register("car_year", {
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.car_mileage_label")}
                      </label>
                      <Input
                        placeholder={t("publish.car_mileage_placeholder")}
                        type="number"
                        {...register("car_mileage", {
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.car_fuel_type_label")}
                      </label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("car_fuel_type")}
                      >
                        <option value="">{t("publish.select_fuel_type")}</option>
                        <option value="petrol">{t("publish.petrol")}</option>
                        <option value="diesel">{t("publish.diesel")}</option>
                        <option value="electric">{t("publish.electric")}</option>
                        <option value="hybrid">{t("publish.hybrid")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.car_transmission_label")}
                      </label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("car_transmission")}
                      >
                        <option value="">{t("publish.select_transmission")}</option>
                        <option value="manual">{t("publish.manual")}</option>
                        <option value="automatic">{t("publish.automatic")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.car_condition_label")}
                      </label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("car_condition")}
                      >
                        <option value="">{t("publish.select_condition")}</option>
                        <option value="new">{t("publish.new")}</option>
                        <option value="used">{t("publish.used")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.car_color_label")}
                      </label>
                      <Input placeholder={t("publish.car_color_placeholder")} {...register("car_color")} />
                    </div>
                  </div>
                </div>
              )}

              {isProductType && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-4 text-sm font-semibold text-slate-800">{t("publish.product_details")}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.brand_label")}
                      </label>
                      <Input placeholder={t("publish.brand_placeholder")} {...register("brand")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.stock_quantity_label")}
                      </label>
                      <Input
                        placeholder={t("publish.stock_quantity_placeholder")}
                        type="number"
                        {...register("stock_quantity", {
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.sku_label")}
                      </label>
                      <Input placeholder={t("publish.sku_placeholder")} {...register("sku")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.product_condition_label")}
                      </label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("product_condition")}
                      >
                        <option value="">{t("publish.select_condition")}</option>
                        <option value="new">{t("publish.new")}</option>
                        <option value="used">{t("publish.used")}</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          {...register("has_home_delivery")}
                        />
                        <span className="text-sm text-slate-700">
                          {t("publish.home_delivery_available")}
                        </span>
                      </label>
                    </div>

                    {hasHomeDelivery && (
                      <>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            {t("publish.delivery_fee_label")}
                          </label>
                          <Input
                            placeholder={t("publish.delivery_fee_placeholder")}
                            type="number"
                            step="0.01"
                            {...register("delivery_fee", {
                              setValueAs: (v) => (v === "" ? undefined : Number(v)),
                            })}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            {t("publish.delivery_notes_label")}
                          </label>
                          <Input
                            placeholder={t("publish.delivery_notes_placeholder")}
                            {...register("delivery_notes")}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {listingType === "clothes_product" && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-4 text-sm font-semibold text-slate-800">{t("publish.clothes_details")}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.clothes_category_label")}
                      </label>
                      <Input
                        placeholder={t("publish.clothes_category_placeholder")}
                        {...register("clothes_category")}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.clothes_gender_label")}
                      </label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("clothes_gender")}
                      >
                        <option value="">{t("publish.select_gender")}</option>
                        <option value="men">{t("publish.men")}</option>
                        <option value="women">{t("publish.women")}</option>
                        <option value="unisex">{t("publish.unisex")}</option>
                        <option value="kids">{t("publish.kids")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.clothes_size_label")}
                      </label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("clothes_size")}
                      >
                        <option value="">{t("publish.select_size")}</option>
                        <option value="xs">XS</option>
                        <option value="s">S</option>
                        <option value="m">M</option>
                        <option value="l">L</option>
                        <option value="xl">XL</option>
                        <option value="xxl">XXL</option>
                        <option value="xxxl">XXXL</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.clothes_color_label")}
                      </label>
                      <Input placeholder={t("publish.clothes_color_placeholder")} {...register("clothes_color")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.clothes_material_label")}
                      </label>
                      <Input placeholder={t("publish.clothes_material_placeholder")} {...register("clothes_material")} />
                    </div>
                  </div>
                </div>
              )}

              {listingType === "food_product" && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-4 text-sm font-semibold text-slate-800">{t("publish.food_details")}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.food_category_label")}
                      </label>
                      <Input
                        placeholder={t("publish.food_category_placeholder")}
                        {...register("food_category")}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.food_unit_label")}
                      </label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("food_unit")}
                      >
                        <option value="">{t("publish.select_unit")}</option>
                        <option value="piece">{t("publish.piece")}</option>
                        <option value="kg">{t("publish.kg")}</option>
                        <option value="gram">{t("publish.gram")}</option>
                        <option value="liter">{t("publish.liter")}</option>
                        <option value="ml">{t("publish.ml")}</option>
                        <option value="pack">{t("publish.pack")}</option>
                        <option value="plate">{t("publish.plate")}</option>
                        <option value="box">{t("publish.box")}</option>
                        <option value="bottle">{t("publish.bottle")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.food_weight_volume_label")}
                      </label>
                      <Input
                        placeholder={t("publish.food_weight_volume_placeholder")}
                        {...register("food_weight_volume")}
                      />
                    </div>

                    <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          {...register("is_perishable")}
                        />
                        <span className="text-sm text-slate-700">{t("publish.perishable")}</span>
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          {...register("is_prepared_food")}
                        />
                        <span className="text-sm text-slate-700">{t("publish.prepared_food")}</span>
                      </label>
                    </div>

                    {isPerishable && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          {t("publish.expiry_date_label")}
                        </label>
                        <Input type="date" {...register("expiry_date")} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {listingType === "home_kitchen_product" && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-4 text-sm font-semibold text-slate-800">{t("publish.home_kitchen_details")}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.home_product_category_label")}
                      </label>
                      <Input
                        placeholder={t("publish.home_product_category_placeholder")}
                        {...register("home_product_category")}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.material_label")}
                      </label>
                      <Input placeholder={t("publish.material_placeholder")} {...register("material")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.product_color_label")}
                      </label>
                      <Input placeholder={t("publish.product_color_placeholder")} {...register("color")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.dimensions_label")}
                      </label>
                      <Input placeholder={t("publish.dimensions_placeholder")} {...register("dimensions")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.weight_label")}
                      </label>
                      <Input placeholder={t("publish.weight_placeholder")} {...register("weight")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("publish.warranty_label")}
                      </label>
                      <Input
                        placeholder={t("publish.warranty_placeholder")}
                        type="number"
                        {...register("warranty_months", {
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {showUtilities && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-800">{t("publish.utilities")}</p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        {...register("has_electricity")}
                      />
                      <span className="text-sm text-slate-700">
                        {t("publish.has_electricity")}
                      </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        {...register("has_water")}
                      />
                      <span className="text-sm text-slate-700">
                        {t("publish.has_water")}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.district_label")}
                </label>
                <Input placeholder={t("publish.district_placeholder")} {...register("district")} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.sector_label")}
                </label>
                <Input placeholder={t("publish.sector_placeholder")} {...register("sector")} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.village_label")}
                </label>
                <Input placeholder={t("publish.village_placeholder")} {...register("village")} />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.address_label")}
                </label>
                <Input placeholder={t("publish.address_placeholder")} {...register("address")} />
              </div>

              {showMap && (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("publish.map_label")}
                  </label>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <MapPicker
                      latitude={latitude}
                      longitude={longitude}
                      onChange={(lat, lng) => {
                        setValue("latitude", lat, { shouldDirty: true });
                        setValue("longitude", lng, { shouldDirty: true });
                      }}
                    />
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    {t("publish.selected_location")}{" "}
                    <span className="font-medium text-slate-700">
                      {latitude ?? t("publish.na")}, {longitude ?? t("publish.na")}
                    </span>
                  </div>

                  <input type="hidden" {...register("latitude")} />
                  <input type="hidden" {...register("longitude")} />
                </div>
              )}

              {!showMap && (
                <>
                  <input type="hidden" {...register("latitude")} />
                  <input type="hidden" {...register("longitude")} />
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.contact_phone_label")}
                </label>
                <Input placeholder={t("publish.contact_phone_placeholder")} {...register("contact_phone")} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.contact_email_label")}
                </label>
                <Input
                  placeholder={t("publish.contact_email_placeholder")}
                  type="email"
                  {...register("contact_email")}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.description_label")}
                </label>
                <textarea
                  placeholder={t("publish.description_placeholder")}
                  className="min-h-36 w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                  {...register("description", { required: true })}
                />
              </div>

              {/* Updated Image Upload Section */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("publish.images_label")}
                  <span className="text-slate-500 ml-1">
                    ({t("publish.max_images", { current: images.length, max: maxImages })})
                  </span>
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  disabled={images.length >= maxImages}
                  className={`w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700 ${
                    images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />

                <p className="mt-2 text-xs text-slate-500">
                  {t("publish.images_hin", { max: maxImages })}
                </p>

                {/* Image slots indicator */}
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: maxImages }).map((_, index) => (
                    <div
                      key={index}
                      className={`flex-1 h-1 rounded-full transition ${
                        index < images.length ? 'bg-green-500' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {images.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">
                        {t("publish.images_selected", { count: images.length })}
                      </p>

                      <button
                        type="button"
                        onClick={clearAllImages}
                        className="text-sm font-medium text-red-600 transition hover:text-red-700"
                      >
                        {t("publish.clear_all")}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {images.map((item, index) => (
                        <div
                          key={`${item.file.name}-${index}`}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                          <img
                            src={item.preview}
                            alt={item.file.name}
                            className="h-32 w-full object-cover"
                          />

                          <div className="space-y-2 p-2">
                            <p className="truncate text-xs text-slate-600">{item.file.name}</p>

                            <div className="flex items-center justify-between gap-2">
                              {index === 0 ? (
                                <span className="inline-block rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                                  {t("publish.cover_image")}
                                </span>
                              ) : (
                                <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                  {t("publish.image_number", { number: index + 1 })}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="text-[11px] font-medium text-red-600 hover:text-red-700"
                              >
                                {t("publish.remove")}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {message && <p className="text-sm text-green-700 md:col-span-2">{message}</p>}
              {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}

              <Button 
                type="submit" 
                className="md:col-span-2" 
                disabled={isSubmitting || images.length === 0}
              >
                {isSubmitting ? t("publish.creating") : t("publish.submit_button")}
              </Button>
            </form>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}