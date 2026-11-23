import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface ToastMessage {
  id: number;
  text: string;
  tone?: 'info' | 'success' | 'warning';
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  const isSuccess = toast.tone === 'success';
  const isWarning = toast.tone === 'warning';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-lg pointer-events-auto"
    >
      <div
        className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-earth-lg ${
          isWarning
            ? 'bg-[#FEF2F2] border-[#B91C1C]/40 text-[#B91C1C]'
            : isSuccess
              ? 'bg-[#231712] border-[#A0522D] text-[#F5F5DC]'
              : 'bg-[#231712] border-[#A0522D] text-[#F5F5DC]'
        }`}
      >
        {isWarning ? (
          <AlertCircle className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-[#F4A460] shrink-0 mt-0.5" aria-hidden="true" />
        )}
        <p className="text-xs sm:text-sm font-medium leading-snug flex-1">{toast.text}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar aviso"
          className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
