import { useState, useEffect, type RefObject } from 'react';

/** Wait for lazy-loaded `.pdf-sheet` to mount inside the preview wrapper. */
export function usePdfSheet(sheetRef: RefObject<HTMLDivElement | null>): HTMLElement | null {
  const [sheet, setSheet] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = sheetRef.current;
    if (!root) return;

    const sync = () => {
      const next = root.querySelector('.pdf-sheet') as HTMLElement | null;
      setSheet((prev) => (prev === next ? prev : next));
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [sheetRef]);

  return sheet;
}
