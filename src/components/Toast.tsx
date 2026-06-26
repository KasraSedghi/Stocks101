'use client';

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, type ToastVariant } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

const toastConfig: Record<ToastVariant, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-dark-panel border-neon-green/30',
    border: 'border-neon-green/50',
    icon: <CheckCircle size={20} className="text-neon-green" />,
  },
  error: {
    bg: 'bg-dark-panel border-neon-red/30',
    border: 'border-neon-red/50',
    icon: <AlertCircle size={20} className="text-neon-red" />,
  },
  info: {
    bg: 'bg-dark-panel border-info/30',
    border: 'border-info/50',
    icon: <Info size={20} className="text-info" />,
  },
  warning: {
    bg: 'bg-dark-panel border-warning/30',
    border: 'border-warning/50',
    icon: <AlertTriangle size={20} className="text-warning" />,
  },
};

interface ToastItemProps {
  id: string;
  message: string;
  variant: ToastVariant;
}

function ToastItem({ id, message, variant }: ToastItemProps) {
  const { removeToast } = useToastStore();
  const config = toastConfig[variant];

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border animate-in fade-in slide-in-from-right-5 duration-normal',
        config.bg,
        config.border
      )}
    >
      {config.icon}
      <p className="flex-1 text-sm text-white">{message}</p>
      <button
        onClick={() => removeToast(id)}
        className="text-gray-400 hover:text-white transition-colors"
        aria-label="Close toast"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed bottom-4 right-4 z-notification flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem {...toast} />
        </div>
      ))}
    </div>
  );
}
