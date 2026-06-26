import { useTranslation } from "react-i18next";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50">
      <PageContainer>
        <div className="mx-auto max-w-4xl py-10">
          <Card>
            <h1 className="mb-6 text-3xl font-bold text-slate-900">
              {t("terms.title")}
            </h1>
            <p className="mb-8 text-sm text-slate-500">
              {t("terms.last_updated")}: {new Date().toLocaleDateString()}
            </p>

            <div className="prose prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("terms.acceptance.title")}
                </h2>
                <p className="text-slate-600">{t("terms.acceptance.content")}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("terms.eligibility.title")}
                </h2>
                <p className="text-slate-600">{t("terms.eligibility.content")}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("terms.listings.title")}
                </h2>
                <p className="text-slate-600">{t("terms.listings.content")}</p>
                <ul className="mt-2 list-disc pl-6 text-slate-600">
                  <li>{t("terms.listings.item_1")}</li>
                  <li>{t("terms.listings.item_2")}</li>
                  <li>{t("terms.listings.item_3")}</li>
                  <li>{t("terms.listings.item_4")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("terms.user_accounts.title")}
                </h2>
                <p className="text-slate-600">{t("terms.user_accounts.content")}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("terms.prohibited_conduct.title")}
                </h2>
                <p className="text-slate-600">{t("terms.prohibited_conduct.content")}</p>
                <ul className="mt-2 list-disc pl-6 text-slate-600">
                  <li>{t("terms.prohibited_conduct.item_1")}</li>
                  <li>{t("terms.prohibited_conduct.item_2")}</li>
                  <li>{t("terms.prohibited_conduct.item_3")}</li>
                  <li>{t("terms.prohibited_conduct.item_4")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("terms.payments.title")}
                </h2>
                <p className="text-slate-600">{t("terms.payments.content")}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("terms.termination.title")}
                </h2>
                <p className="text-slate-600">{t("terms.termination.content")}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("terms.disclaimer.title")}
                </h2>
                <p className="text-slate-600">{t("terms.disclaimer.content")}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("terms.changes.title")}
                </h2>
                <p className="text-slate-600">{t("terms.changes.content")}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("terms.contact_us.title")}
                </h2>
                <p className="text-slate-600">
                  {t("terms.contact_us.content")}
                  <a href="mailto:support@markethub.com" className="text-indigo-600 hover:underline">
                    support@markethub.com
                  </a>
                </p>
              </section>
            </div>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}