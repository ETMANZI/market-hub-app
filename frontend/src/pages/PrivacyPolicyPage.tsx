import { useTranslation } from "react-i18next";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50">
      <PageContainer>
        <div className="mx-auto max-w-4xl py-10">
          <Card>
            <h1 className="mb-6 text-3xl font-bold text-slate-900">
              {t("privacy.title")}
            </h1>
            <p className="mb-8 text-sm text-slate-500">
              {t("privacy.last_updated")}: {new Date().toLocaleDateString()}
            </p>

            <div className="prose prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("privacy.introduction.title")}
                </h2>
                <p className="text-slate-600">{t("privacy.introduction.content")}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("privacy.information_collected.title")}
                </h2>
                <p className="text-slate-600">{t("privacy.information_collected.content")}</p>
                <ul className="mt-2 list-disc pl-6 text-slate-600">
                  <li>{t("privacy.information_collected.item_1")}</li>
                  <li>{t("privacy.information_collected.item_2")}</li>
                  <li>{t("privacy.information_collected.item_3")}</li>
                  <li>{t("privacy.information_collected.item_4")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("privacy.how_we_use.title")}
                </h2>
                <p className="text-slate-600">{t("privacy.how_we_use.content")}</p>
                <ul className="mt-2 list-disc pl-6 text-slate-600">
                  <li>{t("privacy.how_we_use.item_1")}</li>
                  <li>{t("privacy.how_we_use.item_2")}</li>
                  <li>{t("privacy.how_we_use.item_3")}</li>
                  <li>{t("privacy.how_we_use.item_4")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("privacy.information_sharing.title")}
                </h2>
                <p className="text-slate-600">{t("privacy.information_sharing.content")}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("privacy.data_security.title")}
                </h2>
                <p className="text-slate-600">{t("privacy.data_security.content")}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("privacy.cookies.title")}
                </h2>
                <p className="text-slate-600">{t("privacy.cookies.content")}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("privacy.your_rights.title")}
                </h2>
                <p className="text-slate-600">{t("privacy.your_rights.content")}</p>
                <ul className="mt-2 list-disc pl-6 text-slate-600">
                  <li>{t("privacy.your_rights.item_1")}</li>
                  <li>{t("privacy.your_rights.item_2")}</li>
                  <li>{t("privacy.your_rights.item_3")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800">
                  {t("privacy.contact_us.title")}
                </h2>
                <p className="text-slate-600">
                  {t("privacy.contact_us.content")}
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