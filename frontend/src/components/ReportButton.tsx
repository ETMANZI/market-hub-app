import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { isAuthenticated, getAccessToken } from '../lib/auth';

type ReportButtonProps = {
  listingId?: string;
  userId?: string;
  userName?: string;
  className?: string;
};

const REASONS = [
  { value: 'spam', label: 'report.reasons.spam' },
  { value: 'fraud', label: 'report.reasons.fraud' },
  { value: 'illegal', label: 'report.reasons.illegal' },
  { value: 'harassment', label: 'report.reasons.harassment' },
  { value: 'incorrect_info', label: 'report.reasons.incorrect_info' },
  { value: 'duplicate', label: 'report.reasons.duplicate' },
  { value: 'other', label: 'report.reasons.other' },
];

export default function ReportButton({ listingId, userId, userName, className = '' }: ReportButtonProps) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async () => {
    // Check authentication first
    if (!isAuthenticated()) {
      setError(t('report.login_required'));
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (!selectedReason) {
      setError(t('report.select_reason'));
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = getAccessToken();
      console.log('Token exists:', !!token);
      console.log('Submitting report for listing:', listingId);
      
      const payload: any = {
        reason: selectedReason,
        description: description,
      };
      
      if (listingId) {
        payload.listing = listingId;
      }
      if (userId) {
        payload.reported_user = userId;
      }
      
      const response = await api.post('/listings/reportcreate/', payload);
      
      console.log('Report response:', response.data);
      
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setSelectedReason('');
        setDescription('');
      }, 2000);
    } catch (err: any) {
      console.error('Report error:', err);
      console.error('Error response:', err?.response?.data);
      console.error('Error status:', err?.response?.status);
      
      if (err?.response?.status === 401) {
        setError(t('report.login_required'));
      } else if (err?.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(t('report.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 ${className}`}
      >
        <Flag size={16} />
        {t('report.report')}
      </button>
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-200 px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" />
                <h3 className="text-lg font-semibold text-slate-900">{t('report.report_listing')}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5">
              {userName && (
                <p className="mb-4 text-sm text-slate-600">
                  {t('report.reporting')}: <span className="font-semibold">{userName}</span>
                </p>
              )}
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t('report.reason')} *
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                >
                  <option value="">{t('report.select_reason')}</option>
                  {REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {t(reason.label)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t('report.description')} (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t('report.description_placeholder')}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>
              
              {error && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle size={16} />
                  {t('report.success')}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || success}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? t('report.submitting') : t('report.submit')}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}