import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />;
            case 'error':
              return <AlertCircle className="text-rose-500 shrink-0" size={18} />;
            case 'warning':
              return <AlertTriangle className="text-amber-500 shrink-0" size={18} />;
            default:
              return <Info className="text-blue-500 shrink-0" size={18} />;
          }
        };

        const getBorder = () => {
          switch (toast.type) {
            case 'success':
              return 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-zinc-900';
            case 'error':
              return 'border-rose-200 dark:border-rose-800 bg-white dark:bg-zinc-900';
            case 'warning':
              return 'border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-900';
            default:
              return 'border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-900';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all duration-200 ${getBorder()}`}
          >
            {getIcon()}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
