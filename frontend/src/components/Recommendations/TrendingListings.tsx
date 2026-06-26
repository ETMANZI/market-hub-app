import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { TrendingUp, Eye } from "lucide-react";
import { api } from "../../lib/api";
import Card from "../ui/Card";

type Listing = {
  id: string;
  title: string;
  price: string | number;
  views_count: number;
  listing_type: string;
  district?: string;
  images?: { image: string; is_cover?: boolean }[];
};

export default function TrendingListings() {
  const { t } = useTranslation();
  
  const { data: trending = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["trending-listings"],
    queryFn: async () => {
      const response = await api.get("/recommendations/trending/?limit=8");
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

  if (trending.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={20} className="text-orange-500" />
        <h2 className="text-xl font-semibold text-slate-900">
          {t("recommendations.trending")}
        </h2>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
          {t("recommendations.hot")}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trending.map((listing) => (
          <Link to={`/listings/${listing.id}`} key={listing.id}>
            <Card className="overflow-hidden hover:shadow-lg transition relative">
              {listing.views_count > 100 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Eye size={10} />
                  {listing.views_count}+
                </div>
              )}
              <div className="h-40 overflow-hidden bg-slate-100">
                {listing.images?.[0]?.image ? (
                  <img
                    src={listing.images[0].image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
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
                <div className="flex items-center gap-1 mt-1">
                  <Eye size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-500">{listing.views_count} views</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}