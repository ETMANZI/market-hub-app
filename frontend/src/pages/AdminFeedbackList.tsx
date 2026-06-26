import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Star,
  Trash2,
  Mail,
  Calendar,
  MessageSquare,
  Download,
  RefreshCw,
  Eye,
  Filter,
  X,
} from "lucide-react";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";
// import Button from "../components/ui/Button";
import { api } from "../lib/api";

type Feedback = {
  id: number;
  name: string;
  email: string;
  rating: number;
  subject: string;
  message: string;
  page_url: string;
  created_at: string;
  user_info: {
    id: number;
    username: string;
    email: string;
  } | null;
};

export default function AdminFeedbackPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const { data: feedbacks = [], isLoading, refetch } = useQuery<Feedback[]>({
    queryKey: ["admin-feedbacks", subjectFilter, minRating],
    queryFn: async () => {
      let url = "/admin/feedbacks/";
      const params = new URLSearchParams();
      if (subjectFilter) params.append("subject", subjectFilter);
      if (minRating) params.append("min_rating", String(minRating));
      if (params.toString()) url += `?${params.toString()}`;
      const response = await api.get(url);
      return response.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-feedback-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/feedbacks/stats/");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/feedbacks/${id}/delete/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedbacks"] });
      queryClient.invalidateQueries({ queryKey: ["admin-feedback-stats"] });
      setSelectedFeedback(null);
    },
  });

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}
          />
        ))}
      </div>
    );
  };

  const getSubjectLabel = (subject: string) => {
    const labels: Record<string, string> = {
      bug: "Bug Report",
      feature: "Feature Request",
      improvement: "Improvement",
      question: "Question",
      other: "Other",
    };
    return labels[subject] || subject;
  };

  const getSubjectBadgeColor = (subject: string) => {
    const colors: Record<string, string> = {
      bug: "bg-red-100 text-red-700",
      feature: "bg-green-100 text-green-700",
      improvement: "bg-blue-100 text-blue-700",
      question: "bg-yellow-100 text-yellow-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[subject] || "bg-gray-100 text-gray-700";
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "Rating", "Subject", "Message", "Date", "Page URL"];
    const csvData = feedbacks.map((f) => [
      f.id,
      f.name,
      f.email,
      f.rating,
      getSubjectLabel(f.subject),
      f.message.replace(/,/g, " "),
      new Date(f.created_at).toLocaleString(),
      f.page_url || "",
    ]);
    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedbacks_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSubjectFilter("");
    setMinRating(0);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageContainer>
        <div className="py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {t("adminn.feedback.title")}
            </h1>
            <p className="text-slate-600">
              {t("adminn.feedback.subtitle")}
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm text-slate-500">{t("adminn.feedback.total")}</p>
              </div>
              <div className="rounded-xl bg-yellow-50 p-4 shadow-sm border border-yellow-200">
                <p className="text-2xl font-bold text-yellow-700">{stats.avg_rating}</p>
                <p className="text-sm text-yellow-600">{t("adminn.feedback.avg_rating")}</p>
              </div>
              <div className="rounded-xl bg-green-50 p-4 shadow-sm border border-green-200">
                <p className="text-2xl font-bold text-green-700">
                  {stats.rating_distribution?.["5_star"] || 0}
                </p>
                <p className="text-sm text-green-600">{t("adminn.feedback.five_star")}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 shadow-sm border border-blue-200">
                <p className="text-2xl font-bold text-blue-700">{feedbacks.length}</p>
                <p className="text-sm text-blue-600">{t("adminn.feedback.showing")}</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-4 shadow-sm border border-purple-200">
                <p className="text-2xl font-bold text-purple-700">
                  {stats.last_7_days || 0}
                </p>
                <p className="text-sm text-purple-600">{t("adminn.feedback.last_7_days")}</p>
              </div>
            </div>
          )}

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              >
                <Filter size={16} />
                {t("adminn.feedback.filters")}
              </button>
              {(subjectFilter || minRating > 0) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                >
                  <X size={16} />
                  {t("adminn.feedback.clear_filters")}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              >
                <Download size={16} /> {t("adminn.feedback.export_csv")}
              </button>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              >
                <RefreshCw size={16} /> {t("adminn.feedback.refresh")}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="mb-6 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("adminn.feedback.subject")}
                  </label>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{t("adminn.feedback.all_subjects")}</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="improvement">Improvement</option>
                    <option value="question">Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("adminn.feedback.min_rating")}
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="0">{t("adminn.feedback.all_ratings")}</option>
                    <option value="1">1+ {t("adminn.feedback.stars")}</option>
                    <option value="2">2+ {t("adminn.feedback.stars")}</option>
                    <option value="3">3+ {t("adminn.feedback.stars")}</option>
                    <option value="4">4+ {t("adminn.feedback.stars")}</option>
                    <option value="5">5 {t("adminn.feedback.stars")}</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Feedback List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : feedbacks.length === 0 ? (
            <Card>
              <div className="py-12 text-center">
                <MessageSquare size={48} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500">{t("adminn.feedback.no_feedback")}</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <Card key={feedback.id} className="hover:shadow-md transition">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{feedback.name}</h3>
                        {getRatingStars(feedback.rating)}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getSubjectBadgeColor(
                            feedback.subject
                          )}`}
                        >
                          {getSubjectLabel(feedback.subject)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-1">
                        <Mail size={14} className="inline mr-1" /> {feedback.email}
                      </p>
                      <p className="text-slate-600 text-sm mt-2 line-clamp-2">{feedback.message}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(feedback.created_at).toLocaleString()}
                        </span>
                        {feedback.page_url && (
                          <span className="truncate max-w-md">Page: {feedback.page_url}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedFeedback(feedback)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this feedback?")) {
                            deleteMutation.mutate(feedback.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Detail Modal */}
          {selectedFeedback && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedFeedback(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">
                    {t("adminn.feedback.feedback_details")}
                  </h3>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">{t("adminn.feedback.name")}</p>
                      <p className="font-medium">{selectedFeedback.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{t("adminn.feedback.email")}</p>
                      <p className="font-medium">{selectedFeedback.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{t("adminn.feedback.rating")}</p>
                      <div className="mt-1">{getRatingStars(selectedFeedback.rating)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{t("adminn.feedback.subject")}</p>
                      <p className="font-medium">{getSubjectLabel(selectedFeedback.subject)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{t("adminn.feedback.date")}</p>
                      <p className="font-medium">
                        {new Date(selectedFeedback.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{t("adminn.feedback.message")}</p>
                    <p className="mt-1 text-slate-700 whitespace-pre-wrap">
                      {selectedFeedback.message}
                    </p>
                  </div>
                  {selectedFeedback.page_url && (
                    <div>
                      <p className="text-sm text-slate-500">{t("adminn.feedback.page_url")}</p>
                      <p className="text-sm text-indigo-600 break-all">{selectedFeedback.page_url}</p>
                    </div>
                  )}
                  <div className="flex justify-end pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        if (confirm("Delete this feedback?")) {
                          deleteMutation.mutate(selectedFeedback.id);
                          setSelectedFeedback(null);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      {t("adminn.feedback.delete")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}