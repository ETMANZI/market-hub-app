import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { api } from "../lib/api";
import MapPicker from "../components/MapPicker";

type Category = {
  id: string | number;
  name: string;
};

type ExistingImage = {
  id: string | number;
  image: string;
  alt_text?: string;
  is_cover?: boolean;
};

type Listing = {
  id: string;
  title: string;
  slug: string;
  category?: string | number | null;
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
  discount_price: string | number | null;
  district?: string;
  sector?: string;
  village?: string;
  address?: string;
  contact_phone?: string;
  contact_email?: string;
  bedrooms?: number;
  bathrooms?: number;
  upi?: string;
  land_size?: string | number | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  has_electricity?: boolean;
  has_water?: boolean;
  is_owner?: boolean;
  images?: ExistingImage[];
  negotiable?: boolean;

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

  bedrooms?: number;
  bathrooms?: number;
  upi: string;
  land_size?: number;
  latitude?: number;
  longitude?: number;
  has_electricity: boolean;
  has_water: boolean;
  negotiable?: boolean;

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

function extractErrorMessage(err: any, t: (key: string) => string): string {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (status === 401) return t("edit_listing.error_unauthorized");
  if (status === 403) return t("edit_listing.error_forbidden");

  if (!data) return t("edit_listing.error_generic");
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;

  if (typeof data === "object") {
    const messages: string[] = [];

    Object.entries(data).forEach(([field, value]) => {
      if (Array.isArray(value)) messages.push(`${field}: ${value.join(", ")}`);
      else if (typeof value === "string") messages.push(`${field}: ${value}`);
    });

    if (messages.length > 0) return messages.join(" | ");
  }

  return t("edit_listing.error_generic");
}

const normalizeId = (value: string | number | null | undefined): string | null => {
  if (value === null || value === undefined) return null;
  return String(value);
};

const PRODUCT_TYPES = [
  "clothes_product",
  "food_product",
  "home_kitchen_product",
];

export default function EditListingPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newImages, setNewImages] = useState<SelectedImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [selectedCoverImageId, setSelectedCoverImageId] = useState<string | null>(null);
  const [initialCoverImageId, setInitialCoverImageId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

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
      bedrooms: 0,
      bathrooms: 0,
      upi: "",
      land_size: 0,
      latitude: undefined,
      longitude: undefined,
      has_electricity: false,
      has_water: false,
      negotiable: false,

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
  const showBedroomsBathrooms = isHouse;
  const showLandSize = isHouse || isParcel;
  const showUpi = isHouse || isParcel;
  const showUtilities = isHouse || isParcel;
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

  const { data: listing, isLoading, isError } = useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: async () => {
      const response = await api.get(`/listings/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });

  const normalizedImages = useMemo(() => {
    return (listing?.images || []).map((img) => ({
      ...img,
      normalizedId: String(img.id),
    }));
  }, [listing]);

  useEffect(() => {
    if (!listing) return;

    reset({
      title: listing.title || "",
      slug: listing.slug || "",
      category: listing.category ? String(listing.category) : "",
      description: listing.description || "",
      listing_type: listing.listing_type || "house",
      sale_mode: listing.sale_mode || "sell",
      price: Number(listing.price || 0),
      discount_price:
        listing.discount_price !== null && listing.discount_price !== undefined
          ? Number(listing.discount_price)
          : undefined,
      district: listing.district || "",
      sector: listing.sector || "",
      village: listing.village || "",
      address: listing.address || "",
      contact_phone: listing.contact_phone || "",
      contact_email: listing.contact_email || "",

      bedrooms: listing.bedrooms !== null && listing.bedrooms !== undefined ? Number(listing.bedrooms) : 0,
      bathrooms: listing.bathrooms !== null && listing.bathrooms !== undefined ? Number(listing.bathrooms) : 0,
      upi: listing.upi || "",
      land_size:
        listing.land_size !== null && listing.land_size !== undefined
          ? Number(listing.land_size)
          : 0,
      latitude:
        listing.latitude !== null &&
        listing.latitude !== undefined &&
        String(listing.latitude) !== ""
          ? Number(listing.latitude)
          : undefined,
      longitude:
        listing.longitude !== null &&
        listing.longitude !== undefined &&
        String(listing.longitude) !== ""
          ? Number(listing.longitude)
          : undefined,
      has_electricity: !!listing.has_electricity,
      has_water: !!listing.has_water,
      negotiable: !!listing.negotiable,

      car_make: listing.car_make || "",
      car_model: listing.car_model || "",
      car_year:
        listing.car_year !== null && listing.car_year !== undefined
          ? Number(listing.car_year)
          : undefined,
      car_mileage:
        listing.car_mileage !== null && listing.car_mileage !== undefined
          ? Number(listing.car_mileage)
          : undefined,
      car_fuel_type: listing.car_fuel_type || "",
      car_transmission: listing.car_transmission || "",
      car_condition: listing.car_condition || "",
      car_color: listing.car_color || "",

      brand: listing.brand || "",
      stock_quantity:
        listing.stock_quantity !== null && listing.stock_quantity !== undefined
          ? Number(listing.stock_quantity)
          : undefined,
      sku: listing.sku || "",
      product_condition: listing.product_condition || "",
      has_home_delivery: !!listing.has_home_delivery,
      delivery_fee:
        listing.delivery_fee !== null && listing.delivery_fee !== undefined
          ? Number(listing.delivery_fee)
          : undefined,
      delivery_notes: listing.delivery_notes || "",

      clothes_gender: listing.clothes_gender || "",
      clothes_size: listing.clothes_size || "",
      clothes_color: listing.clothes_color || "",
      clothes_material: listing.clothes_material || "",
      clothes_category: listing.clothes_category || "",

      food_category: listing.food_category || "",
      food_unit: listing.food_unit || "",
      food_weight_volume: listing.food_weight_volume || "",
      is_perishable: !!listing.is_perishable,
      expiry_date: listing.expiry_date || "",
      is_prepared_food: !!listing.is_prepared_food,

      home_product_category: listing.home_product_category || "",
      material: listing.material || "",
      color: listing.color || "",
      dimensions: listing.dimensions || "",
      weight: listing.weight || "",
      warranty_months:
        listing.warranty_months !== null && listing.warranty_months !== undefined
          ? Number(listing.warranty_months)
          : undefined,
    });

    const currentCover =
      normalizeId(normalizedImages.find((img) => img.is_cover)?.normalizedId) ||
      normalizeId(normalizedImages[0]?.normalizedId) ||
      null;

    setSelectedCoverImageId(currentCover);
    setInitialCoverImageId(currentCover);
    setDeletedImageIds([]);
  }, [listing, normalizedImages, reset]);

  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [newImages]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...mapped]);
    e.target.value = "";
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImages((prev) => {
      const target = prev[indexToRemove];
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const clearAllNewImages = () => {
    newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setNewImages([]);
  };

  const handleSetCoverImage = (imageId: string | number) => {
    const normalizedId = String(imageId);
    setDeletedImageIds((prev) => prev.filter((imgId) => imgId !== normalizedId));
    setSelectedCoverImageId(normalizedId);
  };

  const toggleDeleteExistingImage = (imageId: string | number) => {
    const normalizedId = String(imageId);

    setDeletedImageIds((prev) => {
      const exists = prev.includes(normalizedId);
      const updated = exists ? prev.filter((imgId) => imgId !== normalizedId) : [...prev, normalizedId];

      if (selectedCoverImageId === normalizedId && !exists) {
        const nextAvailableImage = normalizedImages.find(
          (img) => img.normalizedId !== normalizedId && !updated.includes(img.normalizedId)
        );
        setSelectedCoverImageId(nextAvailableImage?.normalizedId ?? null);
      }

      return updated;
    });
  };

  const resetCoverImage = () => {
    if (initialCoverImageId !== null && !deletedImageIds.includes(initialCoverImageId)) {
      setSelectedCoverImageId(initialCoverImageId);
      return;
    }

    const firstAvailableImage = normalizedImages.find((img) => !deletedImageIds.includes(img.normalizedId));
    setSelectedCoverImageId(firstAvailableImage?.normalizedId ?? null);
  };

  const appendIfPresent = (
    formData: FormData,
    key: string,
    value: string | number | boolean | undefined | null
  ) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, String(value));
  };

  const updateMutation = useMutation({
    mutationFn: async (data: ListingForm) => {
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
      } else {
        formData.append("bedrooms", "0");
        formData.append("bathrooms", "0");
      }

      if (showUpi) formData.append("upi", data.upi || "");
      else formData.append("upi", "");

      if (showLandSize) appendIfPresent(formData, "land_size", data.land_size);
      else formData.append("land_size", "0");

      if (showUtilities) {
        formData.append("has_electricity", String(!!data.has_electricity));
        formData.append("has_water", String(!!data.has_water));
      } else {
        formData.append("has_electricity", "false");
        formData.append("has_water", "false");
      }

      if (isCar) {
        formData.append("latitude", "");
        formData.append("longitude", "");

        formData.append("car_make", data.car_make || "");
        formData.append("car_model", data.car_model || "");
        appendIfPresent(formData, "car_year", data.car_year);
        appendIfPresent(formData, "car_mileage", data.car_mileage);
        appendIfPresent(formData, "car_fuel_type", data.car_fuel_type);
        appendIfPresent(formData, "car_transmission", data.car_transmission);
        appendIfPresent(formData, "car_condition", data.car_condition);
        appendIfPresent(formData, "car_color", data.car_color);
      } else {
        formData.append("latitude", data.latitude !== undefined ? String(data.latitude) : "");
        formData.append("longitude", data.longitude !== undefined ? String(data.longitude) : "");

        formData.append("car_make", "");
        formData.append("car_model", "");
        formData.append("car_year", "");
        formData.append("car_mileage", "");
        formData.append("car_fuel_type", "");
        formData.append("car_transmission", "");
        formData.append("car_condition", "");
        formData.append("car_color", "");
      }

      if (isProductType) {
        appendIfPresent(formData, "brand", data.brand);
        appendIfPresent(formData, "stock_quantity", data.stock_quantity);
        appendIfPresent(formData, "sku", data.sku);
        appendIfPresent(formData, "product_condition", data.product_condition);
        formData.append("has_home_delivery", String(!!data.has_home_delivery));
        appendIfPresent(formData, "delivery_fee", data.delivery_fee);
        appendIfPresent(formData, "delivery_notes", data.delivery_notes);
      } else {
        formData.append("brand", "");
        formData.append("stock_quantity", "");
        formData.append("sku", "");
        formData.append("product_condition", "");
        formData.append("has_home_delivery", "false");
        formData.append("delivery_fee", "");
        formData.append("delivery_notes", "");
      }

      if (listingType === "clothes_product") {
        appendIfPresent(formData, "clothes_gender", data.clothes_gender);
        appendIfPresent(formData, "clothes_size", data.clothes_size);
        appendIfPresent(formData, "clothes_color", data.clothes_color);
        appendIfPresent(formData, "clothes_material", data.clothes_material);
        appendIfPresent(formData, "clothes_category", data.clothes_category);
      } else {
        formData.append("clothes_gender", "");
        formData.append("clothes_size", "");
        formData.append("clothes_color", "");
        formData.append("clothes_material", "");
        formData.append("clothes_category", "");
      }

      if (listingType === "food_product") {
        appendIfPresent(formData, "food_category", data.food_category);
        appendIfPresent(formData, "food_unit", data.food_unit);
        appendIfPresent(formData, "food_weight_volume", data.food_weight_volume);
        formData.append("is_perishable", String(!!data.is_perishable));
        appendIfPresent(formData, "expiry_date", data.expiry_date);
        formData.append("is_prepared_food", String(!!data.is_prepared_food));
      } else {
        formData.append("food_category", "");
        formData.append("food_unit", "");
        formData.append("food_weight_volume", "");
        formData.append("is_perishable", "false");
        formData.append("expiry_date", "");
        formData.append("is_prepared_food", "false");
      }

      if (listingType === "home_kitchen_product") {
        appendIfPresent(formData, "home_product_category", data.home_product_category);
        appendIfPresent(formData, "material", data.material);
        appendIfPresent(formData, "color", data.color);
        appendIfPresent(formData, "dimensions", data.dimensions);
        appendIfPresent(formData, "weight", data.weight);
        appendIfPresent(formData, "warranty_months", data.warranty_months);
      } else {
        formData.append("home_product_category", "");
        formData.append("material", "");
        formData.append("color", "");
        formData.append("dimensions", "");
        formData.append("weight", "");
        formData.append("warranty_months", "");
      }

      newImages.forEach((img) => formData.append("new_images", img.file));
      deletedImageIds.forEach((imageId) => formData.append("delete_image_ids", imageId));

      const coverId =
        selectedCoverImageId !== null && !deletedImageIds.includes(selectedCoverImageId)
          ? selectedCoverImageId
          : null;

      if (coverId !== null) formData.append("cover_image_id", coverId);

      const response = await api.patch(`/listings/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: async (updatedListing) => {
      setMessage(t("edit_listing.success_message"));
      setError("");
      clearAllNewImages();
      setDeletedImageIds([]);

      await queryClient.invalidateQueries({ queryKey: ["listings"] });
      await queryClient.invalidateQueries({ queryKey: ["listing", id] });
      await queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      await queryClient.invalidateQueries({ queryKey: ["all-moderation-listings"] });

      navigate(`/listings/${updatedListing.id}`);
    },
    onError: (err: any) => {
      setError(extractErrorMessage(err, t));
      setMessage("");
    },
  });

  const onSubmit = (data: ListingForm) => {
    setError("");
    setMessage("");
    updateMutation.mutate(data);
  };

  const visibleExistingImages = normalizedImages.filter((img) => !deletedImageIds.includes(img.normalizedId));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageContainer>
          <div className="mx-auto max-w-4xl py-10">
            <Card>
              <p className="text-slate-600">{t("edit_listing.loading")}</p>
            </Card>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageContainer>
          <div className="mx-auto max-w-4xl py-10">
            <Card>
              <p className="text-red-600">{t("edit_listing.load_error")}</p>
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
          <div className="mb-4">
            <Link
              to={`/listings/${listing.id}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              {t("edit_listing.back_to_listing")}
            </Link>
          </div>

          <Card>
            <h1 className="mb-6 text-3xl font-bold text-slate-900">{t("edit_listing.title")}</h1>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.title_label")}</label>
                <Input placeholder={t("edit_listing.title_placeholder")} {...register("title", { required: true })} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.slug_label")}</label>
                <Input placeholder={t("edit_listing.slug_placeholder")} {...register("slug", { required: true })} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.category_label")}</label>
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                  {...register("category")}
                >
                  <option value="">
                    {loadingCategories ? t("edit_listing.loading_categories") : t("edit_listing.select_category")}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.listing_type_label")}</label>
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                  {...register("listing_type")}
                >
                  <option value="house">{t("edit_listing.house")}</option>
                  <option value="parcel">{t("edit_listing.parcel")}</option>
                  <option value="business_ad">{t("edit_listing.business_ad")}</option>
                  <option value="car">{t("edit_listing.car")}</option>
                  <option value="clothes_product">{t("edit_listing.clothes_product")}</option>
                  <option value="food_product">{t("edit_listing.food_product")}</option>
                  <option value="home_kitchen_product">{t("edit_listing.home_kitchen_product")}</option>
                </select>
              </div>

              {showSaleMode && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.sale_mode_label")}</label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                    {...register("sale_mode")}
                  >
                    {listingType === "house" && (
                      <>
                        <option value="sell">{t("edit_listing.sell")}</option>
                        <option value="rent">{t("edit_listing.rent")}</option>
                      </>
                    )}

                    {(listingType === "parcel" ||
                      listingType === "car" ||
                      listingType === "clothes_product" ||
                      listingType === "food_product" ||
                      listingType === "home_kitchen_product") && (
                      <option value="sell">{t("edit_listing.sell")}</option>
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.price_label")}</label>
                <Input
                  placeholder={t("edit_listing.price_placeholder")}
                  type="number"
                  {...register("price", { valueAsNumber: true, required: true })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.discount_price_label")}</label>
                <Input
                  placeholder={t("edit_listing.discount_price_placeholder")}
                  type="number"
                  step="0.01"
                  {...register("discount_price", {
                    setValueAs: (value) => (value === "" || value === null ? undefined : Number(value)),
                  })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("edit_listing.negotiable_label")}
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <input type="checkbox" className="h-4 w-4" {...register("negotiable")} />
                  <span className="text-sm text-slate-700">{t("edit_listing.yes")}</span>
                </div>
              </div>

              {showBedroomsBathrooms && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.bedrooms_label")}</label>
                    <Input
                      placeholder={t("edit_listing.bedrooms_placeholder")}
                      type="number"
                      {...register("bedrooms", { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.bathrooms_label")}</label>
                    <Input
                      placeholder={t("edit_listing.bathrooms_placeholder")}
                      type="number"
                      {...register("bathrooms", { valueAsNumber: true })}
                    />
                  </div>
                </>
              )}

              {showUpi && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.upi_label")}</label>
                  <Input placeholder={t("edit_listing.upi_placeholder")} {...register("upi")} />
                </div>
              )}

              {showLandSize && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.land_size_label")}</label>
                  <Input
                    placeholder={t("edit_listing.land_size_placeholder")}
                    type="number"
                    step="0.01"
                    {...register("land_size", { valueAsNumber: true })}
                  />
                </div>
              )}

              {isCar && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-4 text-sm font-semibold text-slate-800">{t("edit_listing.car_details")}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.car_make_label")}</label>
                      <Input placeholder={t("edit_listing.car_make_placeholder")} {...register("car_make")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.car_model_label")}</label>
                      <Input placeholder={t("edit_listing.car_model_placeholder")} {...register("car_model")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.car_year_label")}</label>
                      <Input
                        placeholder={t("edit_listing.car_year_placeholder")}
                        type="number"
                        {...register("car_year", {
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.car_mileage_label")}</label>
                      <Input
                        placeholder={t("edit_listing.car_mileage_placeholder")}
                        type="number"
                        {...register("car_mileage", {
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.car_fuel_type_label")}</label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("car_fuel_type")}
                      >
                        <option value="">{t("edit_listing.select_fuel_type")}</option>
                        <option value="petrol">{t("edit_listing.petrol")}</option>
                        <option value="diesel">{t("edit_listing.diesel")}</option>
                        <option value="electric">{t("edit_listing.electric")}</option>
                        <option value="hybrid">{t("edit_listing.hybrid")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.car_transmission_label")}</label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("car_transmission")}
                      >
                        <option value="">{t("edit_listing.select_transmission")}</option>
                        <option value="manual">{t("edit_listing.manual")}</option>
                        <option value="automatic">{t("edit_listing.automatic")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.car_condition_label")}</label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("car_condition")}
                      >
                        <option value="">{t("edit_listing.select_condition")}</option>
                        <option value="new">{t("edit_listing.new")}</option>
                        <option value="used">{t("edit_listing.used")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.car_color_label")}</label>
                      <Input placeholder={t("edit_listing.car_color_placeholder")} {...register("car_color")} />
                    </div>
                  </div>
                </div>
              )}

              {isProductType && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-4 text-sm font-semibold text-slate-800">{t("edit_listing.product_details")}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.brand_label")}</label>
                      <Input placeholder={t("edit_listing.brand_placeholder")} {...register("brand")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.stock_quantity_label")}</label>
                      <Input
                        placeholder={t("edit_listing.stock_quantity_placeholder")}
                        type="number"
                        {...register("stock_quantity", {
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.sku_label")}</label>
                      <Input placeholder={t("edit_listing.sku_placeholder")} {...register("sku")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.product_condition_label")}</label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("product_condition")}
                      >
                        <option value="">{t("edit_listing.select_condition")}</option>
                        <option value="new">{t("edit_listing.new")}</option>
                        <option value="used">{t("edit_listing.used")}</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          {...register("has_home_delivery")}
                        />
                        <span className="text-sm text-slate-700">{t("edit_listing.home_delivery_available")}</span>
                      </label>
                    </div>

                    {hasHomeDelivery && (
                      <>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.delivery_fee_label")}</label>
                          <Input
                            placeholder={t("edit_listing.delivery_fee_placeholder")}
                            type="number"
                            step="0.01"
                            {...register("delivery_fee", {
                              setValueAs: (v) => (v === "" ? undefined : Number(v)),
                            })}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.delivery_notes_label")}</label>
                          <Input
                            placeholder={t("edit_listing.delivery_notes_placeholder")}
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
                  <p className="mb-4 text-sm font-semibold text-slate-800">{t("edit_listing.clothes_details")}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.clothes_category_label")}</label>
                      <Input
                        placeholder={t("edit_listing.clothes_category_placeholder")}
                        {...register("clothes_category")}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.clothes_gender_label")}</label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("clothes_gender")}
                      >
                        <option value="">{t("edit_listing.select_gender")}</option>
                        <option value="men">{t("edit_listing.men")}</option>
                        <option value="women">{t("edit_listing.women")}</option>
                        <option value="unisex">{t("edit_listing.unisex")}</option>
                        <option value="kids">{t("edit_listing.kids")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.clothes_size_label")}</label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("clothes_size")}
                      >
                        <option value="">{t("edit_listing.select_size")}</option>
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
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.clothes_color_label")}</label>
                      <Input placeholder={t("edit_listing.clothes_color_placeholder")} {...register("clothes_color")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.clothes_material_label")}</label>
                      <Input placeholder={t("edit_listing.clothes_material_placeholder")} {...register("clothes_material")} />
                    </div>
                  </div>
                </div>
              )}

              {listingType === "food_product" && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-4 text-sm font-semibold text-slate-800">{t("edit_listing.food_details")}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.food_category_label")}</label>
                      <Input
                        placeholder={t("edit_listing.food_category_placeholder")}
                        {...register("food_category")}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.food_unit_label")}</label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                        {...register("food_unit")}
                      >
                        <option value="">{t("edit_listing.select_unit")}</option>
                        <option value="piece">{t("edit_listing.piece")}</option>
                        <option value="kg">{t("edit_listing.kg")}</option>
                        <option value="gram">{t("edit_listing.gram")}</option>
                        <option value="liter">{t("edit_listing.liter")}</option>
                        <option value="ml">{t("edit_listing.ml")}</option>
                        <option value="pack">{t("edit_listing.pack")}</option>
                        <option value="plate">{t("edit_listing.plate")}</option>
                        <option value="box">{t("edit_listing.box")}</option>
                        <option value="bottle">{t("edit_listing.bottle")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.food_weight_volume_label")}</label>
                      <Input
                        placeholder={t("edit_listing.food_weight_volume_placeholder")}
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
                        <span className="text-sm text-slate-700">{t("edit_listing.perishable")}</span>
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          {...register("is_prepared_food")}
                        />
                        <span className="text-sm text-slate-700">{t("edit_listing.prepared_food")}</span>
                      </label>
                    </div>

                    {isPerishable && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.expiry_date_label")}</label>
                        <Input type="date" {...register("expiry_date")} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {listingType === "home_kitchen_product" && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-4 text-sm font-semibold text-slate-800">{t("edit_listing.home_kitchen_details")}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.home_product_category_label")}</label>
                      <Input
                        placeholder={t("edit_listing.home_product_category_placeholder")}
                        {...register("home_product_category")}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.material_label")}</label>
                      <Input placeholder={t("edit_listing.material_placeholder")} {...register("material")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.product_color_label")}</label>
                      <Input placeholder={t("edit_listing.product_color_placeholder")} {...register("color")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.dimensions_label")}</label>
                      <Input placeholder={t("edit_listing.dimensions_placeholder")} {...register("dimensions")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.weight_label")}</label>
                      <Input placeholder={t("edit_listing.weight_placeholder")} {...register("weight")} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.warranty_label")}</label>
                      <Input
                        placeholder={t("edit_listing.warranty_placeholder")}
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
                  <p className="mb-3 text-sm font-semibold text-slate-800">{t("edit_listing.utilities")}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                      <input type="checkbox" className="h-4 w-4" {...register("has_electricity")} />
                      <span className="text-sm text-slate-700">{t("edit_listing.has_electricity")}</span>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                      <input type="checkbox" className="h-4 w-4" {...register("has_water")} />
                      <span className="text-sm text-slate-700">{t("edit_listing.has_water")}</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.district_label")}</label>
                <Input placeholder={t("edit_listing.district_placeholder")} {...register("district")} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.sector_label")}</label>
                <Input placeholder={t("edit_listing.sector_placeholder")} {...register("sector")} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.village_label")}</label>
                <Input placeholder={t("edit_listing.village_placeholder")} {...register("village")} />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.address_label")}</label>
                <Input placeholder={t("edit_listing.address_placeholder")} {...register("address")} />
              </div>
              {showMap && (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("edit_listing.map_label")}
                  </label>

                  {/* Add fixed height container to prevent map from moving during scroll */}
                  <div className="relative rounded-2xl border border-slate-200 bg-white" style={{ height: '300px', zIndex: 1 }}>
                    <div className="absolute inset-0">
                      <MapPicker
                        latitude={latitude}
                        longitude={longitude}
                        onChange={(lat, lng) => {
                          setValue("latitude", lat, { shouldDirty: true });
                          setValue("longitude", lng, { shouldDirty: true });
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    {t("edit_listing.selected_location")}{" "}
                    <span className="font-medium text-slate-700">{latitude ?? t("edit_listing.na")}, {longitude ?? t("edit_listing.na")}</span>
                  </div>

                  <input type="hidden" {...register("latitude", { valueAsNumber: true })} />
                  <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
                </div>
              )}


              {!showMap && (
                <>
                  <input type="hidden" {...register("latitude", { valueAsNumber: true })} />
                  <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.contact_phone_label")}</label>
                <Input placeholder={t("edit_listing.contact_phone_placeholder")} {...register("contact_phone")} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.contact_email_label")}</label>
                <Input placeholder={t("edit_listing.contact_email_placeholder")} type="email" {...register("contact_email")} />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("edit_listing.description_label")}</label>
                <textarea
                  placeholder={t("edit_listing.description_placeholder")}
                  className="min-h-36 w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                  {...register("description", { required: true })}
                />
              </div>

              <div className="md:col-span-2">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">{t("edit_listing.existing_images")}</h2>

                {normalizedImages.length > 0 ? (
                  <>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-600">
                        {t("edit_listing.current_selected_cover")}{" "}
                        <span className="font-semibold">{selectedCoverImageId || t("edit_listing.none")}</span>
                      </p>

                      {selectedCoverImageId !== initialCoverImageId && (
                        <button
                          type="button"
                          onClick={resetCoverImage}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          {t("edit_listing.reset_cover")}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {normalizedImages.map((img) => {
                        const isDeleted = deletedImageIds.includes(img.normalizedId);
                        const isSelectedCover = selectedCoverImageId === img.normalizedId;

                        return (
                          <div
                            key={img.normalizedId}
                            className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                              isDeleted ? "border-red-300 opacity-50" : "border-slate-200"
                            }`}
                          >
                            <img
                              src={img.image}
                              alt={img.alt_text || t("edit_listing.listing_image")}
                              className="h-32 w-full object-cover"
                            />

                            <div className="space-y-2 p-2">
                              <div className="flex flex-wrap gap-2">
                                {img.is_cover && !isDeleted && (
                                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                                    {t("edit_listing.current_cover")}
                                  </span>
                                )}

                                {isSelectedCover && !isDeleted && (
                                  <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700">
                                    {t("edit_listing.selected_cover")}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                <button
                                  type="button"
                                  disabled={isDeleted}
                                  onClick={() => handleSetCoverImage(img.normalizedId)}
                                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {t("edit_listing.set_as_cover")}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleDeleteExistingImage(img.normalizedId)}
                                  className={`rounded-xl px-3 py-2 text-xs font-medium text-white ${
                                    isDeleted ? "bg-slate-500 hover:bg-slate-600" : "bg-red-600 hover:bg-red-700"
                                  }`}
                                >
                                  {isDeleted ? t("edit_listing.undo_remove") : t("edit_listing.remove")}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">{t("edit_listing.no_existing_images")}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">{t("edit_listing.add_new_images")}</h2>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-700"
                />

                <p className="mt-2 text-xs text-slate-500">
                  {t("edit_listing.add_images_hint")}
                </p>

                {newImages.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">
                        {t("edit_listing.new_images_selected", { count: newImages.length })}
                      </p>

                      <button
                        type="button"
                        onClick={clearAllNewImages}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        {t("edit_listing.clear_all")}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {newImages.map((item, index) => (
                        <div
                          key={`${item.file.name}-${index}`}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                          <img src={item.preview} alt={item.file.name} className="h-32 w-full object-cover" />

                          <div className="space-y-2 p-2">
                            <p className="truncate text-xs text-slate-600">{item.file.name}</p>

                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="w-full rounded-xl bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                            >
                              {t("edit_listing.remove")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-slate-600">
                  {t("edit_listing.remaining_images")}{" "}
                  <span className="font-semibold">{visibleExistingImages.length}</span>
                </p>
              </div>

              <Button type="submit" className="md:col-span-2" disabled={isSubmitting || updateMutation.isPending}>
                {isSubmitting || updateMutation.isPending ? t("edit_listing.saving") : t("edit_listing.save_changes")}
              </Button>
            </form>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}