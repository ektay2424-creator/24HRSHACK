import { useEffect, useState } from 'react';
import { type ReactNode, createContext, useCallback, useContext } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

type Toast = { id: number; message: string; variant: 'success' | 'info' | 'warning' };

const ToastCtx = createContext<(message: string, variant?: Toast['variant']) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: Toast['variant'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => setToasts((x) => x.filter((y) => y.id !== t.id))} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), 3200);
    return () => clearTimeout(t);
  }, []);

  const icon =
    toast.variant === 'success' ? <CheckCircle2 size={16} /> : toast.variant === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />;
  const accent =
    toast.variant === 'success'
      ? 'text-mint-400 border-mint/25'
      : toast.variant === 'warning'
      ? 'text-rose-300 border-rose/25'
      : 'text-indigo-300 border-indigo-500/25';

  return (
    <div
      className={`panel-raised flex items-start gap-3 rounded-lg px-4 py-3 pr-2.5 text-sm shadow-xl ${accent} ${
        leaving ? 'animate-fade-in [animation-direction:reverse]' : 'animate-slide-in-right'
      }`}
      style={{ minWidth: 280, maxWidth: 360 }}
    >
      <span className="mt-0.5">{icon}</span>
      <p className="flex-1 leading-snug text-slate-200">{toast.message}</p>
      <button onClick={onClose} className="rounded p-1 text-slate-500 hover:text-slate-200 hover:bg-white/5">
        <X size={13} />
      </button>
    </div>
  );
}
