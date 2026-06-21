import html2pdf from 'html2pdf.js';
import { stripEditorFocusClasses } from '../../utils/editorFocus';
import { sanitizeCssOklch, deepSanitizeColorsForTree } from './colorSanitizer';
import {
  designerFloatTransform,
  finalizePdfClone,
  injectSanitizedStyles,
  inlineAllResolvedColors,
  preserveAvatarShapesForPrint,
  prepareSheetForExport,
  resolveCloneImageUrls,
  stripAvatarPlaceholderStyles,
  stripClonedDocStyles,
  stripEditOnlyFromClone,
} from './cloneSheet';
import { getLegacyExportStyleBlock, getPrintStyleBlock } from './printStyles';
import { PAGE_WIDTH_PX } from '../../constants/page';

interface PdfImage {
  width: number;
  height: number;
  data: Uint8ClampedArray | number[];
}

export class PdfService {
  public static async extractFirstPhoto(file: File): Promise<string | null> {
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      if (pdf.numPages === 0) return null;

      // Collect all candidate images across all pages, then pick the best one
      // (largest near-square image ≥ 60×60 px — skips logos, icons, dividers).
      interface Candidate { dataUrl: string; score: number }
      const candidates: Candidate[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const opList = await page.getOperatorList();

        for (let i = 0; i < opList.fnArray.length; i++) {
          if (
            opList.fnArray[i] === pdfjs.OPS.paintImageXObject ||
            (pdfjs.OPS as Record<string, number>)['paintJpegXObject'] !== undefined &&
            opList.fnArray[i] === (pdfjs.OPS as Record<string, number>)['paintJpegXObject']
          ) {
            const imageObjId = opList.argsArray[i][0] as string;

            const img = await new Promise<PdfImage>((resolve) => {
              const result = page.objs.get(imageObjId, (obj: PdfImage) => {
                resolve(obj);
              });
              if (result) resolve(result);
            });

            if (!img || !img.width || !img.height) continue;
            // Skip tiny images (icons, decorations, dividers)
            if (img.width < 60 || img.height < 60) continue;

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;

            let pixelData = img.data;
            if (pixelData.length === img.width * img.height * 3) {
              const rgba = new Uint8ClampedArray(img.width * img.height * 4);
              let j = 0;
              for (let k = 0; k < pixelData.length; k += 3) {
                rgba[j] = pixelData[k];
                rgba[j + 1] = pixelData[k + 1];
                rgba[j + 2] = pixelData[k + 2];
                rgba[j + 3] = 255;
                j += 4;
              }
              pixelData = rgba;
            } else if (pixelData.length === img.width * img.height) {
              const rgba = new Uint8ClampedArray(img.width * img.height * 4);
              let j = 0;
              for (let k = 0; k < pixelData.length; k++) {
                const val = pixelData[k];
                rgba[j] = val;
                rgba[j + 1] = val;
                rgba[j + 2] = val;
                rgba[j + 3] = 255;
                j += 4;
              }
              pixelData = rgba;
            } else if (pixelData.length !== img.width * img.height * 4) {
              continue;
            }

            const imageData = new ImageData(
              new Uint8ClampedArray(pixelData),
              img.width,
              img.height
            );
            ctx.putImageData(imageData, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');

            // Score: area × aspect-ratio closeness to square/portrait (0.5–1.5 ratio)
            const ratio = img.width / img.height;
            const aspectScore = ratio >= 0.5 && ratio <= 1.5 ? 1 : 0.1;
            const score = img.width * img.height * aspectScore;
            candidates.push({ dataUrl, score });
          }
        }
      }

      if (candidates.length === 0) return null;
      // Return the highest-scored candidate (largest near-square/portrait image)
      candidates.sort((a, b) => b.score - a.score);
      return candidates[0].dataUrl;
    } catch (err) {
      console.error("Failed to extract image from PDF:", err);
    }
    return null;
  }

  /**
   * Print-based PDF export — pixel-perfect because it uses the browser's own render engine.
   * Opens the sheet in a hidden iframe with all page styles, calls print(), then removes
   * the iframe. The user selects "Save as PDF" in the browser print dialog.
   *
   * This is the approach used by Resume.io, Zety, Novoresume, and most SaaS resume builders.
   * html2canvas is fundamentally unreliable for complex CSS (flexbox, oklch, SVG icons, etc.).
   */
  public static downloadPdf(element: HTMLElement, filename: string): Promise<void> {
    const sheetElement = (element.querySelector('.pdf-sheet') || element) as HTMLElement;

    // Collect all styles from the parent document
    let allStyles = '';
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (rules) {
          allStyles += Array.from(rules).map(r => r.cssText).join('\n') + '\n';
        }
      } catch {
        // Cross-origin stylesheet — skip (fonts are handled via <link> below)
      }
    }

    // Collect Google Fonts link tags
    const fontLinks = Array.from(
      document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]')
    ).map(l => l.outerHTML).join('\n');

    // Prepare clone: strip editor-only chrome, restore print state
    const clone = sheetElement.cloneNode(true) as HTMLElement;
    stripEditOnlyFromClone(clone, sheetElement);
    preserveAvatarShapesForPrint(clone, sheetElement);
    designerFloatTransform(clone);
    stripAvatarPlaceholderStyles(clone);
    resolveCloneImageUrls(clone);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${filename.replace(/\.pdf$/i, '')}</title>
  ${fontLinks}
  <style>
    ${allStyles}
    ${getPrintStyleBlock()}
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`;

    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:0;opacity:0;pointer-events:none;';
      document.body.appendChild(iframe);

      const cleanup = () => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      };

      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          cleanup();
          reject(new Error('Could not access iframe document'));
          return;
        }

        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        const win = iframe.contentWindow;
        if (!win) {
          cleanup();
          reject(new Error('Could not access iframe window'));
          return;
        }

        let printed = false;
        const prevTitle = document.title;
        const triggerPrint = () => {
          if (printed) return;
          printed = true;
          // Temporarily set the parent document title to the desired filename so
          // Chrome uses it as the suggested PDF save name in the print dialog.
          document.title = filename.replace(/\.pdf$/i, '');
          try {
            win.focus();
            win.print();
          } catch (err) {
            document.title = prevTitle;
            cleanup();
            reject(err);
            return;
          }
          // Restore title after a short delay (print dialog is open by then)
          setTimeout(() => { document.title = prevTitle; }, 1000);
          // Give the print dialog time to open before removing the iframe
          setTimeout(cleanup, 3000);
          resolve();
        };

        win.addEventListener('load', () => setTimeout(triggerPrint, 350));

        // Fallback: if load event never fires (e.g. some browsers with about:blank)
        const fallback = setTimeout(triggerPrint, 2500);
        win.addEventListener('load', () => clearTimeout(fallback));

      } catch (err) {
        cleanup();
        reject(err);
      }
    });
  }

  /** @deprecated Keep old html2canvas implementation available as legacy fallback */
  public static async downloadPdfLegacy(element: HTMLElement, filename: string): Promise<void> {
    const sheetElement = (element.querySelector('.pdf-sheet') || element) as HTMLElement;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = [
      'position: absolute',
      'left: 0',
      'top: 0',
      `width: ${PAGE_WIDTH_PX}px`,
      'height: auto',
      'z-index: -9999',
      'pointer-events: none',
      'padding: 0',
      'margin: 0',
      'box-sizing: border-box',
    ].join(';');

    // Clone the sheet element
    const clone = sheetElement.cloneNode(true) as HTMLElement;

    // Remove in-editor focus/backdrop classes so PDF shows all sections equally
    stripEditorFocusClasses(clone);

    // Resolve relative image src attributes to absolute URLs so they load correctly inside the about:blank iframe
    clone.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:') && !src.startsWith('http:') && !src.startsWith('https:')) {
        (img as HTMLImageElement).src = new URL(src, window.location.href).href;
      }
    });

    // Copy resolved colors + layout from the live preview (including SVG / Lucide icons)
    finalizePdfClone(clone, sheetElement, window);

    // Remove edit-only UI elements completely to prevent rendering them in the PDF
    clone.querySelectorAll('.edit-only, [data-pdf-hide]').forEach((el) => {
      el.remove();
    });
    // Strip edit-only class from decorative assets that must appear in PDF (photo frame, waves)
    clone.querySelectorAll('.pdf-keep, [data-pdf-keep]').forEach((el) => {
      el.classList.remove('edit-only');
    });

    // Clean up edit-mode outline spacing, transition, and padding classes to prevent layout shift distortions in PDF
    const editorClassesToRemove = [
      'outline-none',
      'hover:bg-slate-100/80',
      'focus:bg-slate-100',
      'hover:bg-white/10',
      'focus:bg-white/10',
      'rounded',
      'px-1',
      '-mx-1',
      'transition'
    ];

    clone.querySelectorAll('*').forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.hasAttribute('contenteditable')) {
        htmlEl.removeAttribute('contenteditable');
      }
      editorClassesToRemove.forEach(cls => {
        htmlEl.classList.remove(cls);
      });
    });

    // Replace elements that have data-href with <a> anchor tags so that hyperlinks work on PDF
    clone.querySelectorAll('[data-href]').forEach((el) => {
      const href = el.getAttribute('data-href');
      if (href) {
        const anchor = el.ownerDocument.createElement('a');
        anchor.href = href;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.innerHTML = el.innerHTML;
        if (el instanceof HTMLElement) {
          anchor.style.cssText = el.style.cssText;
        }
        anchor.className = el.className;
        el.parentNode?.replaceChild(anchor, el);
      }
    });

    // Override specific layout properties for PDF generation while keeping original styles
    clone.style.transform = 'none';
    clone.style.transition = 'none';
    clone.style.boxShadow = 'none';
    clone.style.position = 'relative';
    clone.style.left = '0px';
    clone.style.top = '0px';
    clone.style.zIndex = '9999';
    clone.style.width = `${PAGE_WIDTH_PX}px`;
    
    const contentHeight = prepareSheetForExport(clone, sheetElement);

    if (clone.style.display === 'none') {
      clone.style.display = 'block';
    }
    clone.style.opacity = '1';
    clone.style.visibility = 'visible';
    clone.style.pointerEvents = 'none';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Measure after clone is in DOM so html2canvas captures exact content height (no A4 min-height padding)
    const captureHeight = Math.max(clone.scrollHeight, contentHeight);

    const opt = {
      margin: 0,
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: PAGE_WIDTH_PX,
        height: captureHeight,
        windowHeight: captureHeight,
        onclone: (clonedDoc: Document) => {
          const clonedSheet = (sheetElement.id ? clonedDoc.getElementById(sheetElement.id) : null)
            || clonedDoc.querySelector('.pdf-sheet')
            || (clonedDoc.body.querySelector('*') as HTMLElement);

          if (clonedSheet) {
            clonedSheet.classList.add('pdf-export');
            if (clonedSheet instanceof HTMLElement) {
              clonedSheet.style.minHeight = 'auto';
              clonedSheet.style.height = 'auto';
              clonedSheet.style.boxShadow = 'none';
            }
            // Remove html2canvas-copied stylesheets that still contain oklch()
            stripClonedDocStyles(clonedDoc);
            injectSanitizedStyles(clonedDoc);

            // Safety: strip any oklch that survived in injected styles
            clonedDoc.querySelectorAll('style').forEach((el) => {
              if (el.textContent && /oklch|oklab|color-mix/i.test(el.textContent)) {
                el.textContent = sanitizeCssOklch(el.textContent);
              }
            });

            try {
              const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]');
              fontLinks.forEach(link => {
                clonedDoc.head.appendChild(link.cloneNode(true));
              });
            } catch (err) {
              console.warn('Failed to copy font links to cloned document:', err);
            }

            // Copy resolved colors + layout from live DOM (handles SVG currentColor → oklch classes)
            finalizePdfClone(clonedSheet, sheetElement, window);
            if (clonedDoc.defaultView) {
              inlineAllResolvedColors(clonedSheet, clonedDoc.defaultView);
              deepSanitizeColorsForTree(sheetElement, clonedSheet, window);
            }

            const style = clonedDoc.createElement('style');
            style.textContent = getLegacyExportStyleBlock();
            clonedDoc.head.appendChild(style);
          }
        }
      },
      jsPDF: { unit: 'pt' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };

    return html2pdf()
      .set(opt)
      .from(clone)
      .save()
      .then(() => {
        if (document.body.contains(wrapper)) {
          document.body.removeChild(wrapper);
        }
      })
      .catch((err: unknown) => {
        console.error('PDF download failed:', err);
        if (document.body.contains(wrapper)) {
          document.body.removeChild(wrapper);
        }
        throw err;
      });
  }
}
