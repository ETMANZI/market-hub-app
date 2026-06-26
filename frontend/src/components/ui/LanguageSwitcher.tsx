import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    
    console.log("LanguageSwitcher is rendering!"); // Debug log
    
    return (
        <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg">
            <button onClick={() => i18n.changeLanguage('en')} className="px-2">EN</button>
            <span>|</span>
            <button onClick={() => i18n.changeLanguage('rw')} className="px-2">RW</button>
        </div>
    );
}