import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { GitCompare } from "lucide-react";
import { api } from "../../lib/api";
import Card from "../ui/Card";

type Listing = {
  id: string;
  title: string;
  price: string | number;
  listing_type: string;
  district?: string;
  images?: { image: string; is_cover?: boolean }[];
};

export default function SimilarListings({ listingId }: { listingId: string }) {
  const { t } = useTranslation();
  
  const { data: similar = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["similar-listings", listingId],
    queryFn: async () => {
      const response = await api.get(`/recommendations/similar/${listingId}/?limit=4`);
      return response.data;
    },
    enabled: !!listingId,
  });

  if (isLoading || similar.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <div className="flex items-center gap-2 mb-4">
        <GitCompare size={20} className="text-indigo-600" />
        <h2 className="text-xl font-semibold text-slate-900">
          {t("recommendations.similar_listings")}
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {similar.map((listing) => (
          <Link to={`/listings/${listing.id}`} key={listing.id}>
            <Card className="overflow-hidden hover:shadow-lg transition">
              <div className="h-32 overflow-hidden bg-slate-100">
                {listing.images?.[0]?.image ? (
                  <img
                    src={listing.images[0].image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                    No image
                  </div>
                )}
              </div>
              <div className="p-2">
                <h3 className="font-medium text-slate-800 line-clamp-1 text-xs">
                  {listing.title}
                </h3>
                <p className="text-indigo-600 font-semibold text-xs mt-1">
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