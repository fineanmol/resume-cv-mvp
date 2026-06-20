import { useRef, useEffect } from 'react';

import { PAGE_HEIGHT_PX } from '../constants/page';

/**
 * Simulates CSS `break-inside: avoid` in the live editor preview.
 *
 * After every content change it scans every `.group/item` inside the sheet,
 * identifies items that would be sliced by a page boundary, and pushes them
 * down so they start at the top of the next page — exactly as the browser's
 * print engine would do when the user downloads the PDF.
 *
 * Loop-prevention: a 150 ms cooldown prevents the ResizeObserver from
 * triggering a re-run caused by our own `marginTop` adjustments.
 *
 * Adjustments are stored in `data-pb-push` / `data-pb-orig` attributes so
 * the PDF clone can reset them before generating the actual PDF.
 */
export function usePreviewPageBreaks(
  sheet: HTMLElement | null,
  zoomScale: number,
): void {
  const zoomRef = useRef(zoomScale);
  useEffect(() => { zoomRef.current = zoomScale; }, [zoomScale]);

  useEffect(() => {
    if (!sheet) return;

    let lastApply = 0;
    let rafId: number | null = null;

    const resetAll = () => {
      sheet.querySelectorAll<HTMLElement>('[data-pb-push]').forEach(el => {
        el.style.marginTop = el.getAttribute('data-pb-orig') ?? '';
        el.removeAttribute('data-pb-push');
        el.removeAttribute('data-pb-orig');
      });
    };

    const applyBreaks = () => {
      lastApply = Date.now();
      resetAll();

      const sheetRect = sheet.getBoundingClientRect();
      const scale = zoomRef.current;

      const items = Array.from(
        sheet.querySelectorAll<HTMLElement>('.group\\/item'),
      ).filter(el => !el.closest('[data-pdf-hide]'));

      for (const el of items) {
        const rect = el.getBoundingClientRect();
        const top    = (rect.top    - sheetRect.top) / scale;
        const bottom = (rect.bottom - sheetRect.top) / scale;
        const boundary = Math.ceil((top + 1) / PAGE_HEIGHT_PX) * PAGE_HEIGHT_PX;

        if (top < boundary && bottom > boundary) {
          const push = boundary - top + 16;
          const currentMT = parseFloat(window.getComputedStyle(el).marginTop) || 0;
          el.setAttribute('data-pb-orig', el.style.marginTop);
          el.setAttribute('data-pb-push', 'true');
          el.style.marginTop = `${currentMT + push}px`;
        }
      }
    };

    const schedule = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (Date.now() - lastApply < 150) return;
        applyBreaks();
      });
    };

    const obs = new ResizeObserver(schedule);
    obs.observe(sheet);
    const initTimer = setTimeout(applyBreaks, 200);
    const fontTimer = setTimeout(applyBreaks, 700);

    return () => {
      obs.disconnect();
      clearTimeout(initTimer);
      clearTimeout(fontTimer);
      if (rafId !== null) cancelAnimationFrame(rafId);
      resetAll();
    };
  }, [sheet, zoomScale]);
}
