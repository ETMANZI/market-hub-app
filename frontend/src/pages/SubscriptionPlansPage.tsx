import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { api } from "../lib/api";
import { isAuthenticated } from "../lib/auth";

type SubscriptionPlan = {
  id: number;
  name: string;
  code: string;
  description: string;
  price: string;
  currency: string;
  billing_cycle: string;
  duration_days: number;
  max_listings: number;
  max_images_per_listing: number;
  can_post_business_ads: boolean;
  can_feature_listings: boolean;
  can_access_advanced_analytics: boolean;
  priority_support: boolean;
  is_active: boolean;
};

type MySubscriptionResponse = {
  has_subscription: boolean;
  listings_hidden?: boolean;
  hidden_listings_count?: number;
  subscription: {
    id: number;
    status: string;
    start_date: string | null;
    end_date: string | null;
    is_currently_active: boolean;
    plan: SubscriptionPlan;
  } | null;
};

// Helper function to get image limit by plan name (fallback)
const getImageLimitByPlanName = (planName: string): number => {
  const name = planName?.toLowerCase() || "";
  if (name === "basic") return 1;
  if (name === "classic") return 2;
  if (name === "premium") return 3;
  if (name === "business") return 4;
  return 0;
};

export default function SubscriptionPlansPage() {
  const { t } = useTranslation();
  const loggedIn = isAuthenticated();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await api.get("/subscriptions/plans/");
      console.log("Plans API response:", response.data);
      return response.data;
    },
  });

  const { data: mySubscription, refetch } = useQuery<MySubscriptionResponse>({
    queryKey: ["my-subscription"],
    queryFn: async () => (await api.get("/subscriptions/my-subscription/")).data,
    enabled: loggedIn,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: number) =>
      (await api.post("/subscriptions/subscribe/", { plan_id: planId })).data,
    onSuccess: (data) => {
      setActionError(null);
      setActionMessage(
        `${t("subscription.request_submitted")} ${t("subscription.amount_to_pay")}: ${data.amount} ${data.currency}`
      );
      refetch();
    },
    onError: (error: any) => {
      setActionMessage(null);
      setActionError(
        error?.response?.data?.detail || t("subscription.failed_to_subscribe")
      );
    },
  });

  const currentSubscription = mySubscription?.subscription;

  const isExpired =
    currentSubscription?.status === "expired" ||
    (currentSubscription?.end_date
      ? new Date(currentSubscription.end_date).getTime() < Date.now()
      : false);

  const isPending = currentSubscription?.status === "pending";

  const hasActiveSubscription = currentSubscription?.is_currently_active === true;
  const hasAnySubscription = !!currentSubscription;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageContainer>
        <div className="py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              {t("subscription.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              {t("subscription.description")}
            </p>
          </div>

          {loggedIn && mySubscription?.listings_hidden && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {t("subscription.hidden_due_to_expiry")}
              {mySubscription.hidden_listings_count
                ? ` ${t("subscription.hidden_count")}: ${mySubscription.hidden_listings_count}.`
                : ""}
            </div>
          )}

          {loggedIn && currentSubscription && (
            <div
              className={`mb-8 rounded-3xl border p-5 shadow-sm ${
                hasActiveSubscription
                  ? "border-emerald-200 bg-emerald-50"
                  : isExpired
                  ? "border-red-200 bg-red-50"
                  : currentSubscription.status === "pending"
                  ? "border-amber-200 bg-amber-50"
                  : currentSubscription.status === "rejected"
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                {t("subscription.current_subscription")}
              </p>

              <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {currentSubscription.plan.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    {t("subscription.status")}:{" "}
                    <span className="font-semibold">
                      {hasActiveSubscription 
                        ? t("subscription.status_active")
                        : isExpired
                        ? t("subscription.status_expired")
                        : t(`subscription.status_${currentSubscription.status}`)}
                    </span>
                  </p>

                  {currentSubscription.start_date && (
                    <p className="mt-1 text-sm text-slate-600">
                      {t("subscription.started_on")}:{" "}
                      {new Date(currentSubscription.start_date).toLocaleDateString()}
                    </p>
                  )}

                  {currentSubscription.end_date && (
                    <p className="mt-1 text-sm text-slate-600">
                      {t("subscription.ends_on")}:{" "}
                      {new Date(currentSubscription.end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <p className="text-sm text-slate-500">
                      {t("subscription.max_listings")}
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      {currentSubscription.plan.max_listings}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <p className="text-sm text-slate-500">
                      {t("subscription.max_images_per_listing")}
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      {currentSubscription.plan.max_images_per_listing || 
                        getImageLimitByPlanName(currentSubscription.plan.name)}
                    </p>
                  </div>

                  {isExpired && (
                    <a
                      href="#plans"
                      className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      {t("subscription.renew_now")}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {actionMessage && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {actionMessage}
            </div>
          )}

          {actionError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 w-32 rounded bg-slate-200" />
                    <div className="h-8 w-24 rounded bg-slate-200" />
                    <div className="h-20 rounded bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-4 rounded bg-slate-200" />
                      <div className="h-4 rounded bg-slate-200" />
                      <div className="h-4 rounded bg-slate-200" />
                    </div>
                    <div className="h-10 rounded bg-slate-200" />
                  </div>
                </Card>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <Card>
              <div className="py-12 text-center">
                <h2 className="text-xl font-semibold text-slate-900">
                  {t("subscription.no_plans_available")}
                </h2>
                <p className="mt-2 text-slate-600">
                  {t("subscription.no_plans_description")}
                </p>
              </div>
            </Card>
          ) : (
            <div id="plans" className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => {
                const hasThisSubscription = currentSubscription?.plan?.id === plan.id;
                const isCurrentActivePlan = hasThisSubscription && hasActiveSubscription;
                const isCurrentExpiredPlan = hasThisSubscription && isExpired;
                const isCurrentPendingPlan = hasThisSubscription && isPending;
                
                // Get image limit (from API or fallback)
                const imageLimit = plan.max_images_per_listing || getImageLimitByPlanName(plan.name);

                return (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden border-2 ${
                      isCurrentActivePlan
                        ? "border-emerald-500 bg-emerald-50/40 shadow-lg"
                        : isCurrentExpiredPlan
                        ? "border-red-500 bg-red-50/40 shadow-lg"
                        : "border-slate-200"
                    }`}
                  >
                    {isCurrentActivePlan && (
                      <div className="absolute right-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow">
                        {t("subscription.current_plan")}
                      </div>
                    )}

                    {isCurrentExpiredPlan && (
                      <div className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow">
                        {t("subscription.expired")}
                      </div>
                    )}

                    {isCurrentPendingPlan && (
                      <div className="absolute right-3 top-3 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow">
                        {t("subscription.pending")}
                      </div>
                    )}

                    <div className="flex h-full flex-col">
                      <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-900">
                          {plan.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {plan.description}
                        </p>
                      </div>

                      <div className="mb-5">
                        <div className="text-3xl font-bold text-indigo-600">
                          {plan.currency} {plan.price}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {plan.billing_cycle} • {plan.duration_days} {t("subscription.days")}
                        </p>
                      </div>

                      <div className="mb-6 space-y-3 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {t("subscription.max_listings")}:
                          </span>
                          <span className="font-semibold text-indigo-600">{plan.max_listings}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 shrink-0 text-indigo-500" />
                          <span className="font-medium">
                            {t("subscription.max_images_per_listing")}:
                          </span>
                          <span className="font-semibold text-indigo-600">{imageLimit}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {plan.can_post_business_ads ? (
                            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                          )}
                          <span>{t("subscription.business_ads")}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {plan.can_feature_listings ? (
                            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                          )}
                          <span>{t("subscription.featured_listings")}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {plan.can_access_advanced_analytics ? (
                            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                          )}
                          <span>{t("subscription.advanced_analytics")}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {plan.priority_support ? (
                            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                          )}
                          <span>{t("subscription.priority_support")}</span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        {!loggedIn ? (
                          <Link to="/login">
                            <Button className="w-full bg-slate-700">
                              {t("subscription.login_to_subscribe")}
                            </Button>
                          </Link>
                        ) : isCurrentActivePlan ? (
                          <Button className="w-full bg-emerald-600" disabled>
                            {t("subscription.current_plan")}
                          </Button>
                        ) : isCurrentPendingPlan ? (
                          <Button className="w-full bg-amber-500" disabled>
                            {t("subscription.pending_approval")}
                          </Button>
                        ) : isCurrentExpiredPlan ? (
                          <Button
                            className="w-full bg-indigo-600"
                            onClick={() => {
                              setActionMessage(null);
                              setActionError(null);
                              subscribeMutation.mutate(plan.id);
                            }}
                            disabled={subscribeMutation.isPending}
                          >
                            {subscribeMutation.isPending
                              ? t("subscription.processing")
                              : t("subscription.renew_plan")}
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-indigo-600"
                            onClick={() => {
                              setActionMessage(null);
                              setActionError(null);
                              subscribeMutation.mutate(plan.id);
                            }}
                            disabled={subscribeMutation.isPending}
                          >
                            {subscribeMutation.isPending
                              ? t("subscription.processing")
                              : t("subscription.choose_plan")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {loggedIn && !hasAnySubscription && !isLoading && plans.length > 0 && (
            <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center">
              <p className="text-blue-800">
                {t("subscription.no_subscription_yet")}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {t("subscription.choose_plan_to_start")}
              </p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}