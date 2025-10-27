'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { CheckCircle, XCircle, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/format';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default';

interface Toast {
  id: string;
  type: ToastType;
  message: ReactNode | string;
  duration?: number; // ms
}

interface ShowToastOptions {
  duration?: number; // override default 5000
}

interface ToastContextType {
  showToast: (type: ToastType, message: ReactNode | string, options?: ShowToastOptions) => string; // returns id
  dismiss: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast باید در ToastProvider استفاده شود');
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: ReactNode | string, options?: ShowToastOptions) => {
      const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const duration = options?.duration ?? 5000;
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      return id;
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, dismiss, clearAll }}>
      {children}

      {/* Container */}
      <div
        className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm"
        dir="rtl"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const { type, message } = toast;
  const initialDuration = Math.max(1000, toast.duration ?? 5000);

  // Pause/Resume timer on hover
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(initialDuration);

  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const start = () => {
    clear();
    startRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, remainingRef.current);
  };

  const handleMouseEnter = () => {
    // pause
    if (timeoutRef.current) {
      const elapsed = Date.now() - startRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      clear();
    }
  };

  const handleMouseLeave = () => {
    // resume
    if (remainingRef.current <= 0) {
      onClose();
    } else {
      start();
    }
  };

  useEffect(() => {
    start();
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
    error: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    default: <Info className="h-5 w-5 text-gray-600 dark:text-gray-300" />,
  };

  const variantClasses: Record<ToastType, string> = {
    success:
      'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/60 dark:text-green-100 dark:border-green-800',
    error:
      'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/60 dark:text-red-100 dark:border-red-800',
    info:
      'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/60 dark:text-blue-100 dark:border-blue-800',
    warning:
      'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/60 dark:text-amber-100 dark:border-amber-800',
    default:
      'bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-900/70 dark:text-gray-100 dark:border-gray-700',
  };

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-left data-[state=closed]:fade-out-0',
        'backdrop-blur supports-[backdrop-filter]:bg-opacity-90',
        variantClasses[type]
      )}
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1 text-sm leading-6">{message}</div>
      <button
        onClick={() => {
          clear();
          onClose();
        }}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        aria-label="بستن"
        title="بستن"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
