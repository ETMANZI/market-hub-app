import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import Card from "../ui/Card";
import { Link } from "react-router-dom";

type Listing = {
  id: string;
  title: string;
  price: string | number;
  listing_type: string;
  district?: string;
  images?: { image: string; is_cover?: boolean }[];
};

export default function PersonalizedRecommendations() {
  const { t } = useTranslation();
  
  const { data: recommendations = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["personalized-recommendations"],
    queryFn: async () => {
      try {
        const response = await api.get("/recommendations/personalized/?limit=8");
        return response.data;
      } catch (error) {
        console.error("Failed to load recommendations:", error);
        return [];
      }
    },
  });

  // Don't show if no recommendations
  if (isLoading) {
    return (
      <div className="my-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-900">
            {t("recommendations.personalized")}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-slate-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="my-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-900">
            {t("recommendations.personalized")}
          </h2>
        </div>
        <Card className="p-8 text-center">
          <p className="text-slate-500">
            {t("recommendations.no_recommendations")}
          </p>
          <Link to="/listings" className="text-indigo-600 hover:underline mt-2 inline-block">
            {t("recommendations.browse_listings")}
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-indigo-600" />
        <h2 className="text-xl font-semibold text-slate-900">
          {t("recommendations.personalized")}
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((listing) => (
          <Link to={`/listings/${listing.id}`} key={listing.id}>
            <Card className="overflow-hidden hover:shadow-lg transition">
              <div className="h-40 overflow-hidden bg-slate-100">
                {listing.images?.[0]?.image ? (
                  <img
                    src={listing.images[0].image}
                    alt={listing.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    No image
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-slate-800 line-clamp-1 text-sm">
                  {listing.title}
                </h3>
                <p className="text-indigo-600 font-bold text-sm mt-1">
                  RWF {Number(listing.price).toLocaleString()}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}