import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { ToastContext, type ToastTone } from '../../hooks/useToast';
import { cn } from '../../lib/cn';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const TONE_CLASSES: Record<ToastTone, string> = {
  success: 'bg-leaf-700 text-white',
  error: 'bg-ladybug-600 text-white',
  info: 'bg-bark-800 text-white',
};

const AUTO_DISMISS_MS = 4000;

/** Uygulamanın kökünde sarmalar; `useToast()` ile herhangi bir yerden çağrılır. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'rounded-xl px-4 py-3 text-sm font-medium shadow-garden-lg',
              TONE_CLASSES[t.tone],
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
