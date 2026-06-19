import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
  dismiss: (id: string) => void;
}

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />,
  error:   <XCircle      className="w-4 h-4 flex-shrink-0 text-red-400" />,
  warning: <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />,
  info:    <Info         className="w-4 h-4 flex-shrink-0 text-sky-400" />,
} as const;

const BORDER = {
  success: 'border-emerald-500/30 bg-emerald-950/60',
  error:   'border-red-500/30 bg-red-950/60',
  warning: 'border-amber-500/30 bg-amber-950/60',
  info:    'border-sky-500/30 bg-sky-950/60',
} as const;

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, dismiss }) => (
  <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence initial={false}>
      {toasts.map(toast => (
        <motion.div
          key={toast.id}
          layout
          initial={{ opacity: 0, x: 60, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm max-w-sm backdrop-blur-md text-slate-100 ${BORDER[toast.type]}`}
        >
          {ICONS[toast.type]}
          <span className="flex-1 leading-snug text-[13px]">{toast.message}</span>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-slate-400 hover:text-slate-200 transition cursor-pointer flex-shrink-0 -mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
