import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Bell, Sparkles, Crown, Zap } from "lucide-react";
import { isAuthenticated, logoutUser, getAccessToken } from "../../lib/auth";
import { api } from "../../lib/api";
import AdMarquee from "./AdMarquee";

type CurrentUser = {
  id: string | number;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
};

type AdItem = {
  id: string | number;
  title: string;
  description?: string;
  contact_phone?: string;
  contact_email?: string;
};

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
};

type MySubscriptionResponse = {
  has_subscription: boolean;
  subscription: {
    id: number;
    status: string;
    is_currently_active: boolean;
    end_date?: string | null;
    plan?: {
      name: string;
    };
  } | null;
};

function formatNotificationTime(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// NavLink component - moved outside
function NavLink({
  to,
  children,
  variant = "default",
}: {
  to: string;
  children: ReactNode;
  variant?: "default" | "primary";
}) {
  if (variant === "primary") {
    return (
      <Link
        to={to}
        className="rounded-lg bg-slate-300 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}

// MobileNavLink component - moved outside
function MobileNavLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}

// LanguageSwitcher component - moved outside
function LanguageSwitcher({
  changeLanguage,
  mobile = false,
  currentLang,
}: {
  changeLanguage: (lng: "en" | "rw") => void;
  mobile?: boolean;
  currentLang: string;
}) {
  if (mobile) {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
        <button
          onClick={() => changeLanguage("en")}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            currentLang === "en" ? "bg-slate-300 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
          aria-label="Switch to English"
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage("rw")}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            currentLang === "rw" ? "bg-slate-300 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
          aria-label="Switch to Kinyarwanda"
        >
          RW
        </button>
      </div>
    );
  }

  return (
    <div className="ml-4 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
      <button
        onClick={() => changeLanguage("en")}
        className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
          currentLang === "en" ? "bg-slate-300 text-white" : "text-slate-600 hover:bg-slate-100"
        }`}
        aria-label="Switch to English"
      >
        English
      </button>
      <button
        onClick={() => changeLanguage("rw")}
        className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
          currentLang === "rw" ? "bg-slate-300 text-white" : "text-slate-600 hover:bg-slate-100"
        }`}
        aria-label="Switch to Kinyarwanda"
      >
        Kinyarwanda
      </button>
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();

  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const syncAuth = () => setLoggedIn(isAuthenticated());

    syncAuth();
    window.addEventListener("storage", syncAuth);

    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
    setIsMobileMenuOpen(false);
    setIsNotificationOpen(false);
  }, [location.pathname]);

  const { data: currentUser, isLoading: isLoadingCurrentUser } = useQuery<CurrentUser | null>({
    queryKey: ["navbar-current-user"],
    queryFn: async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          setLoggedIn(false);
          return null;
        }

        const response = await api.get("/accounts/me/");
        return response.data;
      } catch (err: any) {
        if (err?.response?.status === 401) {
          logoutUser();
          setLoggedIn(false);
        }
        return null;
      }
    },
    enabled: loggedIn,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: mySubscription } = useQuery<MySubscriptionResponse>({
    queryKey: ["my-subscription"],
    queryFn: async () => (await api.get("/subscriptions/my-subscription/")).data,
    enabled: loggedIn,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: ads = [] } = useQuery<AdItem[]>({
    queryKey: ["ads-ticker"],
    queryFn: async () => {
      try {
        const response = await api.get("/ads/ticker/");
        return response.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: notifications = [] } = useQuery<NotificationItem[]>({
    queryKey: ["my-notifications"],
    queryFn: async () => {
      const response = await api.get("/notifications/my/");
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
    enabled: loggedIn,
    refetchInterval: 30000,
  });

  const { data: unreadNotificationData } = useQuery<{ unread_count: number }>({
    queryKey: ["my-unread-notification-count"],
    queryFn: async () => (await api.get("/notifications/my/unread-count/")).data,
    enabled: loggedIn,
    refetchInterval: 30000,
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await api.post(`/notifications/${notificationId}/read/`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["my-unread-notification-count"] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: async () => {
      await api.post("/notifications/read-all/");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["my-unread-notification-count"] });
    },
  });

  const handleLogout = async () => {
    logoutUser();
    setLoggedIn(false);
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/listings";
  };

  const canModerate = !!loggedIn && !!(currentUser?.is_staff || currentUser?.is_superuser);

  const canPublish =
    !!loggedIn &&
    !!mySubscription?.subscription &&
    mySubscription.subscription.status === "approved" &&
    !!mySubscription.subscription.is_currently_active;

  const hasActiveSubscription = !!mySubscription?.subscription?.is_currently_active;
  const subscriptionPlanName = mySubscription?.subscription?.plan?.name;

  const displayName = () => {
    if (isLoadingCurrentUser) return "...";

    if (currentUser?.first_name || currentUser?.last_name) {
      return [currentUser.first_name, currentUser.last_name].filter(Boolean).join(" ").trim();
    }

    if (currentUser?.username) return currentUser.username;

    return t("nav.account");
  };

  const changeLanguage = (lng: "en" | "rw") => {
    i18n.changeLanguage(lng);
    localStorage.setItem("preferred_language", lng);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
        <div className="hidden md:flex md:items-center md:justify-between md:py-4">
          <Link
            to="/"
            className="text-2xl font-bold text-slate-800 transition-colors hover:text-slate-600"
          >
            Isoko Ryawe
          </Link>

          <div className="flex items-center gap-1 text-sm">
            <NavLink to="/listings">{t("nav.listings")}</NavLink>

            {!loggedIn ? (
              <>
                <NavLink to="/register">{t("nav.register")}</NavLink>
                <Link
                  to="/login"
                  className="rounded-lg bg-slate-300 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
                >
                  {t("nav.login")}
                </Link>
              </>
            ) : (
              <>
                <span className="px-3 py-2 text-slate-600">
                  {t("nav.hi")},{" "}
                  <span className="font-semibold text-slate-800">{displayName()}</span>
                </span>

                {canPublish && <NavLink to="/publish">{t("nav.publish")}</NavLink>}
                <NavLink to="/dashboard">{t("nav.dashboard")}</NavLink>
                <NavLink to="/profile">{t("nav.profile")}</NavLink>

                {/* Attractive Subscription Button */}
                {!hasActiveSubscription ? (
                  <Link
                    to="/subscriptions"
                    className="group relative ml-2 overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-100 transition-opacity duration-300 group-hover:opacity-0"></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                    <span className="relative flex items-center gap-2">
                      <Sparkles size={16} className="animate-pulse" />
                      {t("nav.subscribe_now")}
                      <Zap size={14} className="animate-pulse" />
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/subscriptions"
                    className="group rounded-full border-2 border-emerald-500 bg-emerald-50 px-5 py-1.5 text-sm font-medium text-emerald-700 transition-all duration-300 hover:bg-emerald-100"
                  >
                    <span className="flex items-center gap-2">
                      <Crown size={16} className="text-amber-500" />
                      {subscriptionPlanName || t("nav.subscriptions")}
                    </span>
                  </Link>
                )}

                {canModerate && <NavLink to="/admin/moderation">{t("nav.moderation")}</NavLink>}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsNotificationOpen((prev) => !prev)}
                    className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />

                    {(unreadNotificationData?.unread_count || 0) > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                        {unreadNotificationData?.unread_count}
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                        <button
                          type="button"
                          onClick={() => markAllNotificationsReadMutation.mutate()}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Mark all as read
                        </button>
                      </div>

                      <div className="max-h-[420px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-slate-500">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              key={notification.id}
                              type="button"
                              onClick={() => {
                                if (!notification.is_read) {
                                  markNotificationReadMutation.mutate(notification.id);
                                }
                              }}
                              className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                                notification.is_read ? "bg-white" : "bg-indigo-50/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {notification.title}
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-slate-600">
                                    {notification.message}
                                  </p>
                                  <p className="mt-2 text-[11px] text-slate-400">
                                    {formatNotificationTime(notification.created_at)}
                                  </p>
                                </div>

                                {!notification.is_read && (
                                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600" />
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  {t("nav.logout")}
                </button>
              </>
            )}

            <LanguageSwitcher changeLanguage={changeLanguage} currentLang={i18n.language} />
          </div>
        </div>

        <div className="flex items-center justify-between py-3 md:hidden">
          <Link to="/" className="text-xl font-bold text-slate-800">
            Isoko Ryawe
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher changeLanguage={changeLanguage} mobile currentLang={i18n.language} />

            {loggedIn && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationOpen((prev) => !prev)}
                  className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {(unreadNotificationData?.unread_count || 0) > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                      {unreadNotificationData?.unread_count}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                      <button
                        type="button"
                        onClick={() => markAllNotificationsReadMutation.mutate()}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => {
                              if (!notification.is_read) {
                                markNotificationReadMutation.mutate(notification.id);
                              }
                            }}
                            className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                              notification.is_read ? "bg-white" : "bg-indigo-50/40"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">
                                  {notification.title}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                  {notification.message}
                                </p>
                                <p className="mt-2 text-[11px] text-slate-400">
                                  {formatNotificationTime(notification.created_at)}
                                </p>
                              </div>

                              {!notification.is_read && (
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600" />
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              <MobileNavLink to="/listings" onClick={() => setIsMobileMenuOpen(false)}>
                {t("nav.listings")}
              </MobileNavLink>

              {!loggedIn ? (
                <>
                  <MobileNavLink to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    {t("nav.register")}
                  </MobileNavLink>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mx-3 rounded-lg bg-slate-300 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-slate-600"
                  >
                    {t("nav.login")}
                  </Link>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 text-slate-600">
                    {t("nav.hi")},{" "}
                    <span className="font-semibold text-slate-800">{displayName()}</span>
                  </div>

                  {canPublish && (
                    <MobileNavLink to="/publish" onClick={() => setIsMobileMenuOpen(false)}>
                      {t("nav.publish")}
                    </MobileNavLink>
                  )}
                  <MobileNavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    {t("nav.dashboard")}
                  </MobileNavLink>
                  <MobileNavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    {t("nav.profile")}
                  </MobileNavLink>

                  {/* Mobile Subscription Button */}
                  {!hasActiveSubscription ? (
                    <Link
                      to="/subscriptions"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="mx-3 my-1 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles size={16} />
                        {t("nav.subscribe_now")}
                      </span>
                    </Link>
                  ) : (
                    <Link
                      to="/subscriptions"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="mx-3 my-1 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-2 text-center text-sm font-medium text-emerald-700"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Crown size={16} className="text-amber-500" />
                        {subscriptionPlanName || t("nav.subscriptions")}
                      </span>
                    </Link>
                  )}

                  {canModerate && (
                    <MobileNavLink to="/admin/moderation" onClick={() => setIsMobileMenuOpen(false)}>
                      {t("nav.moderation")}
                    </MobileNavLink>
                  )}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="mx-3 mt-2 rounded-lg bg-red-600 px-4 py-2 text-left text-sm font-medium text-white"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <AdMarquee ads={ads} speed="slow" />
    </header>
  );
}