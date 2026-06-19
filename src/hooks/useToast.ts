import { useState, useCallback } from 'react';
import type { Toast, ToastType } from '../types';

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = String(++_id);
    setToasts(prev => [...prev, { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((msg: string, d?: number) => show(msg, 'success', d), [show]);
  const error   = useCallback((msg: string, d?: number) => show(msg, 'error', d ?? 6000), [show]);
  const info    = useCallback((msg: string, d?: number) => show(msg, 'info', d), [show]);
  const warning = useCallback((msg: string, d?: number) => show(msg, 'warning', d), [show]);

  return { toasts, show, dismiss, success, error, info, warning };
}

export type ToastAPI = ReturnType<typeof useToast>;
