'use client';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) =>
    setToasts(t => t.filter(x => x.id !== id)), []);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast]);
  const error   = useCallback((title: string, message?: string) => toast({ type: 'error',   title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast]);
  const info    = useCallback((title: string, message?: string) => toast({ type: 'info',    title, message }), [toast]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={16} className="text-green-600" />,
    error:   <XCircle    size={16} className="text-red-600"   />,
    warning: <AlertTriangle size={16} className="text-amber-600" />,
    info:    <Info       size={16} className="text-blue-600"  />,
  };
  const borders: Record<ToastType, string> = {
    success: 'border-l-4 border-green-500',
    error:   'border-l-4 border-red-500',
    warning: 'border-l-4 border-amber-500',
    info:    'border-l-4 border-blue-500',
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-3 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,.15)] px-4 py-3 min-w-[300px] max-w-[380px] animate-fade-in',
              borders[t.type]
            )}>
            <div className="flex-shrink-0 mt-0.5">{icons[t.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-zinc-900">{t.title}</p>
              {t.message && <p className="text-[12px] text-zinc-500 mt-0.5">{t.message}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="flex-shrink-0 text-zinc-400 hover:text-zinc-700 transition">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
