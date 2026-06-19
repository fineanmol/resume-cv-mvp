import { useEffect } from 'react';
import type { DocType } from '../types';

interface Options {
  activeDocType: DocType | null;
  onUndo: () => void;
  onRedo: () => void;
}

export function useKeyboardShortcuts({ activeDocType, onUndo, onRedo }: Options) {
  useEffect(() => {
    if (!activeDocType) return;
    const handle = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (!e.shiftKey && key === 'z') { e.preventDefault(); onUndo(); }
      else if (!e.shiftKey && key === 'y') { e.preventDefault(); onRedo(); }
      else if (e.shiftKey && key === 'z') { e.preventDefault(); onRedo(); }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [activeDocType, onUndo, onRedo]);
}
