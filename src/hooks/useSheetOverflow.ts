import { useState, useEffect } from 'react';
import type { RefObject } from 'react';

import { PAGE_HEIGHT_PX as A4_HEIGHT_PX } from '../constants/page';

export function useSheetOverflow(sheetRef: RefObject<HTMLDivElement | null>, deps: unknown[]) {
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = sheetRef.current?.querySelector('.pdf-sheet') as HTMLElement | null;
    if (!el) return;
    const obs = new ResizeObserver(() => setOverflow(el.scrollHeight > A4_HEIGHT_PX));
    obs.observe(el);
    return () => obs.disconnect();
  // deps tracks activeDocId / activeDocType changes so observer re-attaches on navigation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetRef, ...deps]);

  return overflow;
}
