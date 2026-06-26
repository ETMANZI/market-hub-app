import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="mt-10 bg-gradient-to-r from-slate-100 via-white to-slate-100 border-t border-slate-200">
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-10">
        <div className="grid gap-10 md:grid-cols-3">
          
          <div>
            <h3 className="text-lg font-bold text-slate-900">Market Hub</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {t("footer.description")}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <a href="#" className="p-2 rounded-full bg-white shadow hover:bg-slate-200 transition">
                <Facebook size={16} />
              </a>
              <a href="#" className="p-2 rounded-full bg-white shadow hover:bg-slate-200 transition">
                <Instagram size={16} />
              </a>
              <a href="#" className="p-2 rounded-full bg-white shadow hover:bg-slate-200 transition">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">{t("footer.quick_links")}</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <Link to="/listings" className="block hover:text-slate-900 transition">{t("footer.listings")}</Link>
              <Link to="/register" className="block hover:text-slate-900 transition">{t("footer.register")}</Link>
              <Link to="/login" className="block hover:text-slate-900 transition">{t("footer.login")}</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">{t("footer.contact")}</h4>
            <div className="space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-500" />
                {t("footer.location")}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-slate-500" />
                +250 788 263 338
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-slate-500" />
                eugenetuyizere@gmail.com
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })} Powered by B2HP Ltd</p>
          <div className="flex gap-4 mt-2 md:mt-0">

          <Link to="/guide" className="text-sm text-slate-500 hover:text-slate-700">
            {t("nav.user_guide")}
          </Link>
          <Link to="/privacy" className="text-sm text-slate-500 hover:text-slate-700">
            {t("footer.privacy_policy")}
          </Link>
          <Link to="/terms" className="text-sm text-slate-500 hover:text-slate-700">
            {t("register.terms_of_service")}
          </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}