import { useState, useCallback, useRef, useEffect } from 'react';
import type { Toast, ToastType } from '../types';

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    };
  }, []);

  const show = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = String(++_id);
    setToasts(prev => [...prev, { id, type, message, duration }]);
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        timeoutsRef.current.delete(id);
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
      timeoutsRef.current.set(id, timeoutId);
    }
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((msg: string, d?: number) => show(msg, 'success', d), [show]);
  const error   = useCallback((msg: string, d?: number) => show(msg, 'error', d ?? 6000), [show]);
  const info    = useCallback((msg: string, d?: number) => show(msg, 'info', d), [show]);
  const warning = useCallback((msg: string, d?: number) => show(msg, 'warning', d), [show]);

  return { toasts, show, dismiss, success, error, info, warning };
}

export type ToastAPI = ReturnType<typeof useToast>;
