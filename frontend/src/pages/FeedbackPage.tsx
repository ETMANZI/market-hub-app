import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Star, Send, CheckCircle, AlertCircle, Smile, Frown, Meh } from "lucide-react";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { api } from "../lib/api";
// import { isAuthenticated } from "../lib/auth";

type FeedbackFormData = {
  name: string;
  email: string;
  rating: number;
  subject: string;
  message: string;
  page_url: string;
};

export default function FeedbackPage() {
  const { t } = useTranslation();
//   const loggedIn = isAuthenticated();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FeedbackFormData>({
    defaultValues: {
      name: "",
      email: "",
      rating: 0,
      subject: "",
      message: "",
      page_url: window.location.pathname,
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      const response = await api.post("/feedback/", {
        ...data,
        rating: rating,
      });
      return response.data;
    },
    onSuccess: () => {
      setSubmitSuccess(true);
      setSubmitError("");
      reset();
      setRating(0);
      setTimeout(() => setSubmitSuccess(false), 5000);
    },
    onError: (error: any) => {
      setSubmitError(error?.response?.data?.detail || t("feedback.error_message"));
      setTimeout(() => setSubmitError(""), 5000);
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    if (rating === 0) {
      setSubmitError(t("feedback.rating_required"));
      setTimeout(() => setSubmitError(""), 3000);
      return;
    }
    feedbackMutation.mutate({ ...data, rating });
  };

  const getRatingEmoji = (star: number) => {
    if (star === 1) return <Frown size={24} className="text-red-500" />;
    if (star === 2) return <Frown size={24} className="text-orange-500" />;
    if (star === 3) return <Meh size={24} className="text-yellow-500" />;
    if (star === 4) return <Smile size={24} className="text-lime-500" />;
    if (star === 5) return <Smile size={24} className="text-green-500" />;
    return null;
  };

  const getRatingLabel = (star: number) => {
    const labels: Record<number, string> = {
      1: t("feedback.very_bad"),
      2: t("feedback.bad"),
      3: t("feedback.average"),
      4: t("feedback.good"),
      5: t("feedback.excellent"),
    };
    return labels[star] || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageContainer>
        <div className="mx-auto max-w-3xl py-10">
          <Card className="overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8 text-white">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
                  <Star size={32} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">{t("feedback.title")}</h1>
                <p className="text-purple-100">{t("feedback.subtitle")}</p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {submitSuccess && (
                <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700">{t("feedback.success_message")}</p>
                </div>
              )}

              {submitError && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Rating Section */}
                <div className="text-center">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    {t("feedback.rating")} *
                  </label>
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-2 justify-center flex-wrap">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-all duration-200 transform hover:scale-110"
                        >
                          <Star
                            size={40}
                            className={`${
                              (hoverRating || rating) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            } transition-colors duration-150`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <div className="flex items-center gap-2 animate-in fade-in duration-200">
                        {getRatingEmoji(rating)}
                        <span className="text-sm font-medium text-slate-600">
                          {getRatingLabel(rating)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {t("feedback.name")} *
                    </label>
                    <Input
                      placeholder={t("feedback.name_placeholder")}
                      {...register("name", { required: t("feedback.name_required") })}
                      className="rounded-xl"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {t("feedback.email")} *
                    </label>
                    <Input
                      type="email"
                      placeholder={t("feedback.email_placeholder")}
                      {...register("email", { 
                        required: t("feedback.email_required"),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t("feedback.email_invalid"),
                        }
                      })}
                      className="rounded-xl"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("feedback.subject")} *
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    {...register("subject", { required: t("feedback.subject_required") })}
                  >
                    <option value="">{t("feedback.select_subject")}</option>
                    <option value="bug">{t("feedback.subject_bug")}</option>
                    <option value="feature">{t("feedback.subject_feature")}</option>
                    <option value="improvement">{t("feedback.subject_improvement")}</option>
                    <option value="question">{t("feedback.subject_question")}</option>
                    <option value="other">{t("feedback.subject_other")}</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("feedback.message")} *
                  </label>
                  <textarea
                    rows={5}
                    placeholder={t("feedback.message_placeholder")}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
                    {...register("message", { required: t("feedback.message_required") })}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-400">
                    {t("feedback.message_hint")}
                  </p>
                </div>

                <input type="hidden" {...register("page_url")} />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl py-3 text-base font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t("feedback.sending")}
                    </>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      {t("feedback.submit")}
                    </>
                  )}
                </Button>
              </form>

              {/* Footer note */}
              <p className="mt-6 text-center text-xs text-slate-400">
                {t("feedback.footer_note")}
              </p>
            </div>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}