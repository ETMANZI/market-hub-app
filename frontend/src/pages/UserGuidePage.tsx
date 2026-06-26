import { useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  Search,
  PlusCircle,
  LayoutDashboard,
  CreditCard,
  HelpCircle,
  Camera,
  MessageCircle,
  Bell,
  Shield,
  Star,
  TrendingUp,
  Users,
  FileText,
  Download,
  Printer,
  Phone,
  MessageCircle as WhatsAppIcon,
  X,
} from "lucide-react";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";

type GuideSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  searchKeywords: string[];
};

export default function UserGuidePage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("getting-started");
  const [searchQuery, setSearchQuery] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const phoneNumber = "+250 788 263 338";
  const whatsappUrl = "https://wa.me/250788263338";
  const telUrl = "tel:+250788263338";

  const sections: GuideSection[] = [
    {
      id: "getting-started",
      title: t("guide.getting_started.title"),
      icon: <HelpCircle size={20} />,
      searchKeywords: ["getting started", "register", "account", "sign up", "create account", "welcome"],
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              {t("guide.getting_started.welcome")}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {t("guide.getting_started.description")}
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">
              {t("guide.getting_started.account_creation")}
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
              <li>{t("guide.getting_started.step1")}</li>
              <li>{t("guide.getting_started.step2")}</li>
              <li>{t("guide.getting_started.step3")}</li>
              <li>{t("guide.getting_started.step4")}</li>
            </ol>
          </div>

          {/* Screenshot Placeholder */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
            <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
              <div className="h-48 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Users size={48} className="text-indigo-400 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">
                    {t("guide.screenshot_placeholder")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    registration-form-screenshot.png
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {t("guide.registration_screenshot_hint")}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "posting-listing",
      title: t("guide.posting_listing.title"),
      icon: <PlusCircle size={20} />,
      searchKeywords: ["post", "listing", "publish", "sell", "ad", "create listing", "upload images"],
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            {t("guide.posting_listing.description")}
          </p>

          <div className="grid gap-4">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Camera size={18} />
                {t("guide.posting_listing.image_guidelines")}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                <li>{t("guide.posting_listing.image_tip1")}</li>
                <li>{t("guide.posting_listing.image_tip2")}</li>
                <li>{t("guide.posting_listing.image_tip3")}</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Star size={18} />
                {t("guide.posting_listing.listing_tips")}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                <li>{t("guide.posting_listing.tip1")}</li>
                <li>{t("guide.posting_listing.tip2")}</li>
                <li>{t("guide.posting_listing.tip3")}</li>
              </ul>
            </div>
          </div>

          {/* Screenshot Placeholder */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
            <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
              <div className="h-48 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PlusCircle size={48} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">
                    {t("guide.screenshot_placeholder")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    publish-listing-form-screenshot.png
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {t("guide.publish_screenshot_hint")}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "subscriptions",
      title: t("guide.subscriptions.title"),
      icon: <CreditCard size={20} />,
      searchKeywords: ["subscription", "plan", "pay", "upgrade", "basic", "classic", "premium", "business", "price", "payment"],
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            {t("guide.subscriptions.description")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Basic Plan */}
            <div className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
              <h4 className="font-bold text-slate-800 mb-2">{t("guide.subscriptions.basic")}</h4>
              <p className="text-2xl font-bold text-indigo-600">1,500 RWF</p>
              <p className="text-sm text-slate-500 mt-1">{t("guide.subscriptions.basic_desc")}</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex items-center gap-2">✓ 3 {t("guide.subscriptions.listings")}</li>
                <li className="flex items-center gap-2">✓ 1 {t("guide.subscriptions.images")}</li>
              </ul>
            </div>

            {/* Classic Plan */}
            <div className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
              <h4 className="font-bold text-slate-800 mb-2">{t("guide.subscriptions.classic")}</h4>
              <p className="text-2xl font-bold text-indigo-600">2,000 RWF</p>
              <p className="text-sm text-slate-500 mt-1">{t("guide.subscriptions.classic_desc")}</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex items-center gap-2">✓ 3 {t("guide.subscriptions.listings")}</li>
                <li className="flex items-center gap-2">✓ 2 {t("guide.subscriptions.images")}</li>
                <li className="flex items-center gap-2">✓ {t("guide.subscriptions.business_ads")}</li>
              </ul>
            </div>

            {/* Premium Plan */}
            <div className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
              <h4 className="font-bold text-slate-800 mb-2">{t("guide.subscriptions.premium")}</h4>
              <p className="text-2xl font-bold text-indigo-600">3,0000 RWF</p>
              <p className="text-sm text-slate-500 mt-1">{t("guide.subscriptions.premium_desc")}</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex items-center gap-2">✓ 4 {t("guide.subscriptions.listings")}</li>
                <li className="flex items-center gap-2">✓ 3 {t("guide.subscriptions.images")}</li>
                <li className="flex items-center gap-2">✓ {t("guide.subscriptions.business_ads")}</li>
                <li className="flex items-center gap-2">✓ {t("guide.subscriptions.analytics")}</li>
              </ul>
            </div>

            {/* Business Plan */}
            <div className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition bg-gradient-to-br from-indigo-50 to-purple-50">
              <h4 className="font-bold text-indigo-800 mb-2">{t("guide.subscriptions.business")}</h4>
              <p className="text-2xl font-bold text-indigo-600">4,000 RWF</p>
              <p className="text-sm text-slate-500 mt-1">{t("guide.subscriptions.business_desc")}</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex items-center gap-2">✓ 5 {t("guide.subscriptions.listings")}</li>
                <li className="flex items-center gap-2">✓ 4 {t("guide.subscriptions.images")}</li>
                <li className="flex items-center gap-2">✓ {t("guide.subscriptions.business_ads")}</li>
                <li className="flex items-center gap-2">✓ {t("guide.subscriptions.analytics")}</li>
                <li className="flex items-center gap-2">✓ {t("guide.subscriptions.priority_support")}</li>
              </ul>
              <div className="mt-2 text-xs text-indigo-600 font-semibold">⭐ Most Popular</div>
            </div>
          </div>

          {/* Screenshot Placeholder */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
            <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
              <div className="h-48 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <CreditCard size={48} className="text-purple-400 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">
                    {t("guide.screenshot_placeholder")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    subscription-plans-screenshot.png
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {t("guide.subscription_screenshot_hint")}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "dashboard",
      title: t("guide.dashboard.title"),
      icon: <LayoutDashboard size={20} />,
      searchKeywords: ["dashboard", "analytics", "statistics", "manage", "listings", "messages", "notifications"],
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            {t("guide.dashboard.description")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <FileText size={18} className="text-indigo-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800">{t("guide.dashboard.manage_listings")}</h4>
                <p className="text-xs text-slate-500">{t("guide.dashboard.manage_listings_desc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <TrendingUp size={18} className="text-emerald-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800">{t("guide.dashboard.analytics")}</h4>
                <p className="text-xs text-slate-500">{t("guide.dashboard.analytics_desc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Bell size={18} className="text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800">{t("guide.dashboard.notifications")}</h4>
                <p className="text-xs text-slate-500">{t("guide.dashboard.notifications_desc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle size={18} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800">{t("guide.dashboard.messages")}</h4>
                <p className="text-xs text-slate-500">{t("guide.dashboard.messages_desc")}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "safety",
      title: t("guide.safety.title"),
      icon: <Shield size={20} />,
      searchKeywords: ["safety", "security", "scam", "warning", "protect", "fraud"],
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <Shield size={18} />
              {t("guide.safety.safety_tips")}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-red-700 text-sm font-bold">1</span>
                <p className="text-sm text-red-700">{t("guide.safety.tip1")}</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-red-700 text-sm font-bold">2</span>
                <p className="text-sm text-red-700">{t("guide.safety.tip2")}</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-red-700 text-sm font-bold">3</span>
                <p className="text-sm text-red-700">{t("guide.safety.tip3")}</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-red-700 text-sm font-bold">4</span>
                <p className="text-sm text-red-700">{t("guide.safety.tip4")}</p>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">
              {t("guide.safety.scam_warning")}
            </h4>
            <p className="text-sm text-blue-700">
              {t("guide.safety.scam_message")}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "faq",
      title: t("guide.faq.title"),
      icon: <HelpCircle size={20} />,
      searchKeywords: ["faq", "question", "help", "support", "how to", "problem"],
      content: (
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h4 className="font-semibold text-slate-800 mb-2">
              {t("guide.faq.q1")}
            </h4>
            <p className="text-slate-600 text-sm">
              {t("guide.faq.a1")}
            </p>
          </div>
          <div className="border-b border-slate-200 pb-3">
            <h4 className="font-semibold text-slate-800 mb-2">
              {t("guide.faq.q2")}
            </h4>
            <p className="text-slate-600 text-sm">
              {t("guide.faq.a2")}
            </p>
          </div>
          <div className="border-b border-slate-200 pb-3">
            <h4 className="font-semibold text-slate-800 mb-2">
              {t("guide.faq.q3")}
            </h4>
            <p className="text-slate-600 text-sm">
              {t("guide.faq.a3")}
            </p>
          </div>
          <div className="border-b border-slate-200 pb-3">
            <h4 className="font-semibold text-slate-800 mb-2">
              {t("guide.faq.q4")}
            </h4>
            <p className="text-slate-600 text-sm">
              {t("guide.faq.a4")}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">
              {t("guide.faq.q5")}
            </h4>
            <p className="text-slate-600 text-sm">
              {t("guide.faq.a5")}
            </p>
          </div>
        </div>
      ),
    },
  ];

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return sections;
    }
    const query = searchQuery.toLowerCase().trim();
    return sections.filter(
      (section) =>
        section.title.toLowerCase().includes(query) ||
        section.searchKeywords.some((keyword) => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Auto-select first filtered section if current active section is not in filtered results
  const displayedActiveSection = useMemo(() => {
    if (filteredSections.some((s) => s.id === activeSection)) {
      return activeSection;
    }
    return filteredSections[0]?.id || "getting-started";
  }, [filteredSections, activeSection]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Handle Print - prints only the guide content
  const handlePrint = () => {
    const printContent = contentRef.current?.cloneNode(true) as HTMLElement;
    if (!printContent) return;

    const originalTitle = document.title;
    document.title = t("guide.title") + " - Market Hub";

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${t("guide.title")} - Market Hub</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                max-width: 900px;
                margin: 0 auto;
                padding: 40px 20px;
              }
              h1 { color: #0f172a; font-size: 28px; margin-bottom: 20px; }
              h2 { color: #1e293b; font-size: 22px; margin-top: 30px; margin-bottom: 15px; }
              h3 { color: #334155; font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
              h4 { color: #475569; font-size: 16px; margin-top: 15px; margin-bottom: 8px; }
              p { margin-bottom: 12px; }
              ul, ol { margin-bottom: 15px; padding-left: 25px; }
              li { margin-bottom: 5px; }
              .bg-blue-50, .bg-amber-50, .bg-green-50, .bg-red-50, .bg-slate-50 { 
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
                margin: 16px 0;
              }
              .border-2 { border: 1px solid #e2e8f0; }
              .rounded-xl { border-radius: 12px; }
              .grid { display: grid; gap: 16px; }
              .grid-cols-1 { grid-template-columns: 1fr; }
              @media (min-width: 768px) {
                .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
                .md\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
              }
              .text-center { text-align: center; }
              .font-bold { font-weight: 700; }
              .text-2xl { font-size: 24px; }
              .text-indigo-600 { color: #4f46e5; }
              .text-slate-500 { color: #64748b; }
              .text-slate-600 { color: #475569; }
              .text-slate-700 { color: #334155; }
              .text-slate-800 { color: #1e293b; }
              .mt-2 { margin-top: 8px; }
              .mt-3 { margin-top: 12px; }
              .mb-2 { margin-bottom: 8px; }
              .mb-3 { margin-bottom: 12px; }
              .mb-4 { margin-bottom: 16px; }
              .space-y-4 > * + * { margin-top: 16px; }
              .space-y-6 > * + * { margin-top: 24px; }
              .flex { display: flex; }
              .items-center { align-items: center; }
              .gap-2 { gap: 8px; }
              .gap-3 { gap: 12px; }
              .break-all { word-break: break-all; }
              .print-header { margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
              .print-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
              @media print {
                body { margin: 0; padding: 20px; }
                .no-print { display: none; }
                .page-break { page-break-before: always; }
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1>${t("guide.title")}</h1>
              <p>${t("guide.subtitle")}</p>
            </div>
            ${printContent.outerHTML}
            <div class="print-footer">
              <p>Market Hub - ${new Date().toLocaleDateString()}</p>
              <p>${t("guide.print_footer")}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
    document.title = originalTitle;
  };

  // Handle Download as PDF
  const handleDownload = () => {
    const content = contentRef.current?.cloneNode(true) as HTMLElement;
    if (!content) return;

    const styles = `
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        h1 { color: #0f172a; font-size: 28px; margin-bottom: 20px; }
        h2 { color: #1e293b; font-size: 22px; margin-top: 30px; margin-bottom: 15px; }
        h3 { color: #334155; font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
        h4 { color: #475569; font-size: 16px; margin-top: 15px; margin-bottom: 8px; }
        p { margin-bottom: 12px; }
        ul, ol { margin-bottom: 15px; padding-left: 25px; }
        li { margin-bottom: 5px; }
        .bg-blue-50, .bg-amber-50, .bg-green-50, .bg-red-50, .bg-slate-50 { 
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
        }
        .border-2 { border: 1px solid #e2e8f0; }
        .rounded-xl { border-radius: 12px; }
        .grid { display: grid; gap: 16px; }
        .grid-cols-1 { grid-template-columns: 1fr; }
        @media (min-width: 768px) {
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
          .md\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        }
        .text-center { text-align: center; }
        .font-bold { font-weight: 700; }
        .text-2xl { font-size: 24px; }
        .text-indigo-600 { color: #4f46e5; }
        .text-slate-500 { color: #64748b; }
        .text-slate-600 { color: #475569; }
        .text-slate-700 { color: #334155; }
        .text-slate-800 { color: #1e293b; }
        .mt-2 { margin-top: 8px; }
        .mt-3 { margin-top: 12px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .space-y-4 > * + * { margin-top: 16px; }
        .space-y-6 > * + * { margin-top: 24px; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .break-all { word-break: break-all; }
        .print-header { margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        .print-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${t("guide.title")} - Market Hub</title>
          ${styles}
        </head>
        <body>
          <div class="print-header">
            <h1>${t("guide.title")}</h1>
            <p>${t("guide.subtitle")}</p>
          </div>
          ${content.outerHTML}
          <div class="print-footer">
            <p>Market Hub - ${new Date().toLocaleDateString()}</p>
            <p>${t("guide.print_footer")}</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-hub-user-guide-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageContainer>
        <div className="py-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {t("guide.title")}
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {t("guide.subtitle")}
            </p>
          </div>

          {/* Search Bar with Clear Button */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("guide.search_placeholder")}
                className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Search Results Count */}
            {searchQuery && (
              <p className="text-xs text-slate-500 mt-2 text-center">
                Found {filteredSections.length} {filteredSections.length === 1 ? "result" : "results"} for "{searchQuery}"
              </p>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation - Filtered */}
            <div className="lg:w-64 shrink-0">
              <Card className="sticky top-28">
                <nav className="space-y-1">
                  {filteredSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition ${
                        displayedActiveSection === section.id
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className={displayedActiveSection === section.id ? "text-indigo-600" : "text-slate-400"}>
                        {section.icon}
                      </span>
                      <span className="flex-1 text-sm">{section.title}</span>
                      <ChevronRight
                        size={16}
                        className={`${
                          displayedActiveSection === section.id ? "text-indigo-600" : "text-slate-400"
                        }`}
                      />
                    </button>
                  ))}
                </nav>

                {/* No Results Message */}
                {filteredSections.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">No results found for "{searchQuery}"</p>
                    <button
                      onClick={clearSearch}
                      className="mt-2 text-indigo-600 text-sm hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}

                {/* Contact Support Section with Call and WhatsApp */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4">
                    <p className="text-white text-sm font-medium mb-3 text-center">
                      {t("guide.need_help")}
                    </p>
                    
                    {/* Call Button */}
                    <a
                      href={telUrl}
                      className="flex items-center justify-center gap-2 w-full bg-white text-indigo-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-50 transition mb-2"
                    >
                      <Phone size={16} />
                      {t("guide.call_now")}
                    </a>
                    
                    {/* WhatsApp Button */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#20b859] transition"
                    >
                      <WhatsAppIcon size={16} />
                      {t("guide.whatsapp")}
                    </a>
                    
                    {/* Phone Number Display */}
                    <p className="text-white/70 text-xs text-center mt-3">
                      {phoneNumber}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content - Shows selected section */}
            <div className="flex-1">
              <div ref={contentRef}>
                <Card>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      {sections.find((s) => s.id === displayedActiveSection)?.icon}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {sections.find((s) => s.id === displayedActiveSection)?.title}
                    </h2>
                  </div>

                  <div className="prose prose-slate max-w-none">
                    {sections.find((s) => s.id === displayedActiveSection)?.content}
                  </div>
                </Card>
              </div>

              {/* Download PDF Button */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  <Printer size={16} />
                  {t("guide.print_guide")}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition"
                >
                  <Download size={16} />
                  {t("guide.download_pdf")}
                </button>
              </div>

              {/* Feedback Section */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  {t("guide.feedback_text")}{" "}
                  <a href="/feedback" className="text-indigo-600 hover:underline">
                    {t("guide.feedback_link")}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}