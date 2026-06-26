import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Sparkles} from "lucide-react";
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
      const response = await api.get("/listings/recommendations/personalized/?limit=8");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-40 bg-slate-200 rounded-lg mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-indigo-600" />
        <h2 className="text-xl font-semibold text-slate-900">
          {t("recommendations.personalized")}
        </h2>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {t("recommendations.for_you")}
        </span>
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
                {listing.district && (
                  <p className="text-xs text-slate-500 mt-1">{listing.district}</p>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}