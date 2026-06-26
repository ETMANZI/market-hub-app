import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Facebook, Twitter, Linkedin, Copy, Check, MessageCircle, Mail } from 'lucide-react';

type ShareButtonProps = {
  title: string;
  url?: string;
  className?: string;
};

export default function ShareButton({ title, url, className = '' }: ShareButtonProps) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 ${className}`}
      >
        <Share2 size={16} />
        {t('share.share')}
      </button>
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-900">{t('share.share_listing')}</h3>
            </div>
            
            <div className="p-5">
              <p className="mb-4 text-sm text-slate-600">{t('share.share_via')}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-[#25D366] px-4 py-3 text-white transition hover:opacity-90"
                  onClick={() => setShowModal(false)}
                >
                  <MessageCircle size={20} />
                  <span className="font-medium">WhatsApp</span>
                </a>
                
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-[#1877F2] px-4 py-3 text-white transition hover:opacity-90"
                  onClick={() => setShowModal(false)}
                >
                  <Facebook size={20} />
                  <span className="font-medium">Facebook</span>
                </a>
                
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-[#1DA1F2] px-4 py-3 text-white transition hover:opacity-90"
                  onClick={() => setShowModal(false)}
                >
                  <Twitter size={20} />
                  <span className="font-medium">Twitter</span>
                </a>
                
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-[#0077B5] px-4 py-3 text-white transition hover:opacity-90"
                  onClick={() => setShowModal(false)}
                >
                  <Linkedin size={20} />
                  <span className="font-medium">LinkedIn</span>
                </a>
                
                <a
                  href={shareLinks.email}
                  className="flex items-center gap-3 rounded-xl bg-slate-600 px-4 py-3 text-white transition hover:opacity-90"
                  onClick={() => setShowModal(false)}
                >
                  <Mail size={20} />
                  <span className="font-medium">{t('share.email')}</span>
                </a>
                
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 text-white transition hover:opacity-90"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  <span className="font-medium">{copied ? t('share.copied') : t('share.copy_link')}</span>
                </button>
              </div>
            </div>
            
            <div className="border-t border-slate-200 px-5 py-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}