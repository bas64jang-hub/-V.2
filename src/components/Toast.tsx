import React from 'react';
import { useTransformers } from '../context/TransformerContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, RefreshCw } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useTransformers();

  if (!toast.show) return null;

  const getBgColor = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-red-900 border-red-700 text-white';
      case 'warning':
        return 'bg-amber-900 border-amber-700 text-white';
      case 'info':
        return 'bg-blue-900 border-blue-700 text-white';
      case 'success':
      default:
        return 'bg-[#005137] border-emerald-600 text-white';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-300 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-300 shrink-0" />;
      case 'success':
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />;
    }
  };

  return (
    <div
      id="toastNotification"
      className={`fixed top-4 right-4 sm:right-6 z-50 max-w-lg w-[calc(100%-2rem)] sm:w-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${getBgColor()}`}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-sm leading-snug">{toast.message}</span>
          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-black/25 text-white/90">
            {toast.badge}
          </span>
        </div>
        {toast.timestamp && (
          <div className="text-[11px] text-white/75 font-mono">
            บันทึกเวลา: {toast.timestamp}
          </div>
        )}
      </div>
      <button
        onClick={hideToast}
        className="text-white/70 hover:text-white p-1 rounded transition-colors"
        title="ปิดการแจ้งเตือน"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
