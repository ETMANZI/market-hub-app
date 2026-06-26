import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { api } from "../lib/api";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/accounts/forgot-password/", { email });
      setMessage(res.data.message);
      setEmail("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          t("forgot_password.error_message")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center">
      <PageContainer>
        <div className="mx-auto max-w-md">
          <Card className="p-6 shadow-lg">
            <h1 className="mb-2 text-2xl font-semibold text-slate-800">
              {t("forgot_password.title")}
            </h1>
            <p className="mb-6 text-sm text-slate-500">
              {t("forgot_password.description")}
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                type="email"
                placeholder={t("forgot_password.email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-600">{message}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("forgot_password.sending") : t("forgot_password.send_button")}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-slate-500">
              {t("forgot_password.remembered_password")}{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:underline"
              >
                {t("forgot_password.back_to_login")}
              </Link>
            </div>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}