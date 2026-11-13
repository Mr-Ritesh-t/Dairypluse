'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (type: ToastType, message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastMessage = { id, type, message, title };
      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message: string, title: string = 'Success') => {
      showToast('success', message, title);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, title: string = 'Error') => {
      showToast('error', message, title);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title: string = 'Notice') => {
      showToast('warning', message, title);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title: string = 'Information') => {
      showToast('info', message, title);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast,
      }}
    >
      {children}
      {/* Floating Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 sm:top-5 sm:right-5 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 sm:p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md transition-all duration-200 animate-in slide-in-from-top-2 fade-in ${
                isSuccess
                  ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-emerald-500/10'
                  : isError
                  ? 'bg-rose-50/95 border-rose-300 text-rose-950 shadow-rose-500/10'
                  : isWarning
                  ? 'bg-amber-50/95 border-amber-300 text-amber-950 shadow-amber-500/10'
                  : 'bg-blue-50/95 border-blue-300 text-blue-950 shadow-blue-500/10'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-600" />}
              </div>

              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-xs font-bold leading-tight mb-0.5">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs opacity-90 leading-snug break-words">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-black/5 transition cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

