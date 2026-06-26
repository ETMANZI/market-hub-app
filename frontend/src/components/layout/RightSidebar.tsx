import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  Phone,
  BadgeHelp,
  Megaphone,
  Handshake,
  Building2,
  ExternalLink,
  MessageCircle,
  Star,
  Eye,
  BookOpen,
  Flag,
} from "lucide-react";
import Card from "../ui/Card";
import { isAuthenticated } from "../../lib/auth";
import { api } from "../../lib/api";

type Partner = {
  id: number;
  name: string;
  logo?: string | null;
  website?: string | null;
  description?: string;
  is_active?: boolean;
};

type CurrentUser = {
  id: number;
  is_staff?: boolean;
  is_superuser?: boolean;
};

export default function RightSidebar() {
  const { t } = useTranslation();
  const loggedIn = isAuthenticated();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);

  // Phone contact variables
  const phoneNumber = "+250788263338";
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, "")}`;
  const telUrl = `tel:${phoneNumber}`;

  // Fetch current user to check if admin
  const { data: currentUser } = useQuery<CurrentUser>({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        const response = await api.get("/accounts/me/");
        return response.data;
      } catch {
        return null;
      }
    },
    enabled: loggedIn,
  });

  const isAdmin = currentUser?.is_staff === true || currentUser?.is_superuser === true;

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await api.get("/partners/");
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setPartners(data);
      } catch (error) {
        console.error("Failed to load partners", error);
        setPartners([]);
      } finally {
        setLoadingPartners(false);
      }
    };

    fetchPartners();
  }, []);

  return (
    <aside className="space-y-4 lg:sticky lg:top-28">
      {/* Quick Actions Card */}
      <Card>
        <h3 className="text-base font-semibold text-slate-900">{t("sidebar.quick_actions")}</h3>

        <div className="mt-4 space-y-3">
          {loggedIn ? (
            <>
              <Link
                to="/publish"
                className="flex items-center gap-2 rounded-2xl bg-slate-400 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                <PlusCircle size={16} />
                {t("sidebar.post_listing")}
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LayoutDashboard size={16} />
                {t("sidebar.dashboard")}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="flex items-center gap-2 rounded-2xl bg-slate-400 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                <PlusCircle size={16} />
                {t("sidebar.create_account")}
              </Link>

              <Link
                to="/login"
                className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LayoutDashboard size={16} />
                {t("sidebar.sign_in")}
              </Link>
            </>
          )}
        </div>
      </Card>

      {/* Promote Your Listing Card */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
            <Megaphone size={18} />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {t("sidebar.promote_listing")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t("sidebar.promote_text")}
            </p>
          </div>
        </div>
      </Card>

      {/* Our Partners Card */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <Handshake size={18} />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">{t("sidebar.our_partners")}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t("sidebar.partners_text")}
            </p>

            <div className="mt-4 space-y-3">
              {loadingPartners ? (
                <p className="text-sm text-slate-500">{t("sidebar.loading_partners")}</p>
              ) : partners.length === 0 ? (
                <p className="text-sm text-slate-500">{t("sidebar.no_partners")}</p>
              ) : (
                partners.map((partner) => {
                  const isClickable = Boolean(partner.website && partner.website.trim());

                  const card = (
                    <div
                      className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 transition ${
                        isClickable
                          ? "cursor-pointer hover:border-slate-300 hover:bg-white hover:shadow-sm"
                          : ""
                      }`}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                        {partner.logo ? (
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Building2 size={18} className="text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {partner.name}
                        </p>
                        {partner.description && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {partner.description}
                          </p>
                        )}
                      </div>

                      {isClickable && (
                        <ExternalLink size={15} className="shrink-0 text-slate-400" />
                      )}
                    </div>
                  );

                  return isClickable ? (
                    <a
                      key={partner.id}
                      href={partner.website!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {card}
                    </a>
                  ) : (
                    <div key={partner.id}>{card}</div>
                  );
                })
              )}
            </div>

            <Link
              to="/partners"
              className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
            >
              {t("sidebar.view_all_partners")}
            </Link>
          </div>
        </div>
      </Card>

      {/* Safety Tips Card */}
      <Card>
        <h3 className="text-base font-semibold text-slate-900">{t("sidebar.safety_tips")}</h3>

        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-green-600" />
            <p>{t("sidebar.safety_tip_1")}</p>
          </div>

          <div className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-green-600" />
            <p>{t("sidebar.safety_tip_2")}</p>
          </div>

          <div className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-green-600" />
            <p>{t("sidebar.safety_tip_3")}</p>
          </div>
        </div>
      </Card>

      {/* User Guide Card */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
            <BookOpen size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">{t("sidebar.user_guide")}</h3>
            <p className="mt-1 text-xs text-slate-500">{t("sidebar.user_guide_text")}</p>

            <div className="mt-3">
              <Link
                to="/guide"
                className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 transition hover:bg-sky-100"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-sky-600" />
                  <span className="text-sm font-medium text-sky-700">
                    {t("sidebar.read_guide")}
                  </span>
                </div>
                <span className="text-xs text-sky-500">→</span>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Admin Reports Card - Only for admin users */}
      {isAdmin && (
        <Card>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-red-50 p-3 text-red-700">
              <Flag size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-900">{t("sidebar.reports")}</h3>
              <p className="mt-1 text-xs text-slate-500">{t("sidebar.reports_text")}</p>

              <div className="mt-3">
                <Link
                  to="/admin/reports"
                  className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3 py-2 transition hover:bg-red-100"
                >
                  <div className="flex items-center gap-2">
                    <Flag size={16} className="text-red-600" />
                    <span className="text-sm font-medium text-red-700">
                      {t("sidebar.view_reports")}
                    </span>
                  </div>
                  <span className="text-xs text-red-500">→</span>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Feedback Card - Two Menus */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-purple-50 p-3 text-purple-700">
            <Star size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">{t("sidebar.feedback")}</h3>
            <p className="mt-1 text-xs text-slate-500">{t("sidebar.feedback_text")}</p>

            <div className="mt-3 space-y-2">
              {/* Menu 1: Give Feedback - Everyone can see */}
              <Link
                to="/feedback"
                className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 transition hover:bg-purple-100"
              >
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    {t("sidebar.give_feedback")}
                  </span>
                </div>
                <span className="text-xs text-purple-500">→</span>
              </Link>

              {/* Menu 2: View All Feedback - Only Admin can see */}
              {isAdmin && (
                <Link
                  to="/admin/feedbacks"
                  className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 transition hover:bg-indigo-100"
                >
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-700">
                      {t("sidebar.view_feedback")}
                    </span>
                  </div>
                  <span className="text-xs text-indigo-500">→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Need Help Card */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
            <BadgeHelp size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">{t("sidebar.need_help")}</h3>
            <p className="mt-1 text-xs text-slate-500">{t("sidebar.support_text")}</p>

            <div className="mt-3 flex gap-2">
              {/* Call Button */}
              <a
                href={telUrl}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Phone size={14} className="text-slate-500" />
                <span>{t("sidebar.call_now")}</span>
              </a>

              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <MessageCircle size={14} className="text-slate-500" />
                <span>{t("sidebar.whatsapp")}</span>
              </a>
            </div>
          </div>
        </div>
      </Card>
    </aside>
  );
}