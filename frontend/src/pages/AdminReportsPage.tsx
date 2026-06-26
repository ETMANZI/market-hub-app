import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Flag,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  User,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";
import { api } from "../lib/api";

type Report = {
  id: number;
  reporter_name: string;
  listing: {
    id: number;
    title: string;
    owner_name?: string;
    owner_email?: string;
    owner_phone?: string;
  } | null;
  reported_user: {
    id: number;
    email: string;
    username: string;
  } | null;
  reason: string;
  description: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  created_at: string;
};

const statusColors = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  investigating: "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  dismissed: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusLabels = {
  pending: "Pending Review",
  investigating: "Under Investigation",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const reasonLabels: Record<string, string> = {
  spam: "Spam or Misleading",
  fraud: "Fraud or Scam",
  illegal: "Illegal Content",
  harassment: "Harassment or Abuse",
  incorrect_info: "Incorrect Information",
  duplicate: "Duplicate Listing",
  other: "Other",
};

export default function AdminReportsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [adminNotes, setAdminNotes] = useState("");

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["admin-reports", statusFilter],
    queryFn: async () => {
      const url =
        statusFilter === "all"
          ? "/admin/reports/"
          : `/admin/reports/?status=${statusFilter}`;
      const response = await api.get(url);
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ reportId, status, notes }: { reportId: number; status: string; notes?: string }) => {
      const response = await api.patch(`/admin/reports/${reportId}/update/`, {
        status,
        admin_notes: notes,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      setSelectedReport(null);
      setAdminNotes("");
    },
  });

  const getStatusBadge = (status: string) => {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border ${statusColors[status as keyof typeof statusColors]}`}>
        {status === "pending" && <AlertTriangle size={12} />}
        {status === "investigating" && <Loader2 size={12} className="animate-spin" />}
        {status === "resolved" && <CheckCircle size={12} />}
        {status === "dismissed" && <XCircle size={12} />}
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-RW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "pending").length,
    investigating: reports.filter(r => r.status === "investigating").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    dismissed: reports.filter(r => r.status === "dismissed").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageContainer>
        <div className="py-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Flag size={28} className="text-red-600" />
              <h1 className="text-3xl font-bold text-slate-900">
                {t("admin.reports.title")}
              </h1>
            </div>
            <p className="text-slate-600">
              {t("admin.reports.subtitle")}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-500">Total Reports</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 shadow-sm border border-amber-200">
              <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
              <p className="text-sm text-amber-600">Pending</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4 shadow-sm border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">{stats.investigating}</p>
              <p className="text-sm text-blue-600">Investigating</p>
            </div>
            <div className="rounded-xl bg-green-50 p-4 shadow-sm border border-green-200">
              <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
              <p className="text-sm text-green-600">Resolved</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 shadow-sm border border-gray-200">
              <p className="text-2xl font-bold text-gray-700">{stats.dismissed}</p>
              <p className="text-sm text-gray-600">Dismissed</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("investigating")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === "investigating"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              Investigating
            </button>
            <button
              onClick={() => setStatusFilter("resolved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === "resolved"
                  ? "bg-green-600 text-white"
                  : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setStatusFilter("dismissed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === "dismissed"
                  ? "bg-gray-600 text-white"
                  : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              Dismissed
            </button>
          </div>

          {/* Reports List - Fixed onClick handler */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : reports.length === 0 ? (
            <Card>
              <div className="py-12 text-center">
                <Flag size={48} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500">No reports found</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <Card className="hover:shadow-md transition">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            Reported by: {report.reporter_name}
                          </h3>
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-2">
                          <span className="font-medium">Reason:</span> {reasonLabels[report.reason] || report.reason}
                        </p>
                        
                        {report.listing && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Reported Listing:</span> {report.listing.title}
                          </p>
                        )}
                        
                        {report.reported_user && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Reported User:</span> {report.reported_user.email}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(report.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Flag size={20} className="text-red-600" />
                <h3 className="text-xl font-bold text-slate-900">Report Details</h3>
                {getStatusBadge(selectedReport.status)}
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Reporter Information */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <User size={16} />
                  Reporter Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Name/Email</p>
                    <p className="font-medium">{selectedReport.reporter_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Reported On</p>
                    <p className="font-medium">{formatDate(selectedReport.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Reported Content */}
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Reported Content
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Reason</p>
                    <p className="text-red-800">{reasonLabels[selectedReport.reason] || selectedReport.reason}</p>
                  </div>
                  
                  {selectedReport.description && (
                    <div>
                      <p className="text-sm text-red-600 font-medium">Description</p>
                      <p className="text-red-800 whitespace-pre-wrap">{selectedReport.description}</p>
                    </div>
                  )}
                  
                  {selectedReport.listing && (
                    <div>
                      <p className="text-sm text-red-600 font-medium">Reported Listing</p>
                      <div className="mt-2 bg-white rounded-lg p-3 space-y-2">
                        <p className="font-medium text-slate-900">{selectedReport.listing.title}</p>
                        {selectedReport.listing.owner_name && (
                          <p className="text-sm text-slate-600">Owner: {selectedReport.listing.owner_name}</p>
                        )}
                        {selectedReport.listing.owner_email && (
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Mail size={14} /> {selectedReport.listing.owner_email}
                          </p>
                        )}
                        {selectedReport.listing.owner_phone && (
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Phone size={14} /> {selectedReport.listing.owner_phone}
                          </p>
                        )}
                        <a
                          href={`/listings/${selectedReport.listing.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                        >
                          View Listing <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {selectedReport.reported_user && (
                    <div>
                      <p className="text-sm text-red-600 font-medium">Reported User</p>
                      <div className="mt-2 bg-white rounded-lg p-3">
                        <p className="font-medium">{selectedReport.reported_user.email}</p>
                        <p className="text-sm text-slate-600">Username: {selectedReport.reported_user.username}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Actions */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Admin Actions</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Update Status
                  </label>
                  <select
                    value={selectedReport.status}
                    onChange={(e) => {
                      updateStatusMutation.mutate({
                        reportId: selectedReport.id,
                        status: e.target.value,
                        notes: adminNotes,
                      });
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="investigating">Under Investigation</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    placeholder="Add internal notes about this report..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="flex gap-3">
                  {selectedReport.status !== "resolved" && (
                    <button
                      onClick={() => {
                        updateStatusMutation.mutate({
                          reportId: selectedReport.id,
                          status: "resolved",
                          notes: adminNotes,
                        });
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      <CheckCircle size={16} className="inline mr-2" />
                      Mark as Resolved
                    </button>
                  )}
                  {selectedReport.status !== "dismissed" && (
                    <button
                      onClick={() => {
                        updateStatusMutation.mutate({
                          reportId: selectedReport.id,
                          status: "dismissed",
                          notes: adminNotes,
                        });
                      }}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                    >
                      <XCircle size={16} className="inline mr-2" />
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}