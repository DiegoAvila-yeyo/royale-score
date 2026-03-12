'use client';

import React from 'react';
import { Toast } from '@/hooks/useToast';
import { X } from 'lucide-react';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const TOAST_STYLES: Record<Toast['type'], string> = {
  success: 'bg-green-500/20 border-green-500/50 text-green-300',
  info: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
  error: 'bg-red-500/20 border-red-500/50 text-red-300',
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-28 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-md
            shadow-lg text-sm font-semibold
            pointer-events-auto
            animate-[slideInRight_0.3s_ease-out]
            ${TOAST_STYLES[toast.type]}
          `}
        >
          {toast.icon && <span className="text-base">{toast.icon}</span>}
          <span className="flex-1 whitespace-nowrap">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Cerrar notificación"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
