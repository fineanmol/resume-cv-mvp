import { useState, useEffect } from 'react';

/** Reserve scroll height when the sheet is CSS-scaled so page 2+ stays visible in preview. */
export function useScaledSheetHeight(
  sheet: HTMLElement | null,
  zoomScale: number,
): number | undefined {
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!sheet) return;

    const update = () => {
      setHeight(Math.ceil(sheet.scrollHeight * zoomScale));
    };

    const obs = new ResizeObserver(update);
    obs.observe(sheet);
    update();
    return () => obs.disconnect();
  }, [sheet, zoomScale]);

  return height;
}
