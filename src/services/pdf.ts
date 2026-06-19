import html2pdf from 'html2pdf.js';
import { stripEditorFocusClasses } from '../utils/editorFocus';

declare const pdfjsLib: {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<PdfDoc> };
  OPS: { paintImageXObject: number; paintJpegXObject: number };
};

interface PdfDoc {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
}

interface PdfPage {
  getOperatorList: () => Promise<{ fnArray: number[]; argsArray: unknown[][] }>;
  objs: { get: (id: string, cb: (obj: PdfImage) => void) => PdfImage | undefined };
}

interface PdfImage {
  width: number;
  height: number;
  data: Uint8ClampedArray | number[];
}

// High-performance single-pixel canvas converter to transform oklch color strings to standard rgba strings
const colorCanvas = document.createElement('canvas');
colorCanvas.width = 1;
colorCanvas.height = 1;
const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });

function convertOklToRgb(colorStr: string): string {
  if (!colorStr || (!colorStr.includes('oklch') && !colorStr.includes('oklab'))) return colorStr;
  if (!colorCtx) return colorStr;

  try {
    colorCtx.clearRect(0, 0, 1, 1);
    colorCtx.fillStyle = colorStr;
    colorCtx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = colorCtx.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  } catch {
    return colorStr;
  }
}

/** Copy colors and typography from the live preview onto the clone (not layout box-model). */
const PDF_INLINE_PROPS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'font-size',
  'font-family',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'fill',
  'stroke',
];

function inlineComputedStyles(source: HTMLElement, target: HTMLElement) {
  const computed = window.getComputedStyle(source);
  PDF_INLINE_PROPS.forEach((prop) => {
    const val = computed.getPropertyValue(prop);
    if (!val) return;
    if (prop === 'fill' || prop === 'stroke' || prop.includes('color')) {
      const resolved = val.includes('oklch') || val.includes('oklab') ? convertOklToRgb(val) : val;
      target.style.setProperty(prop, resolved);
    } else {
      target.style.setProperty(prop, val);
    }
  });
}

function syncComputedStyles(sourceRoot: Element, cloneRoot: Element) {
  if (sourceRoot instanceof HTMLElement && cloneRoot instanceof HTMLElement) {
    inlineComputedStyles(sourceRoot, cloneRoot);
  }

  const sourceChildren = Array.from(sourceRoot.children);
  const cloneChildren = Array.from(cloneRoot.children);
  for (let i = 0; i < sourceChildren.length; i++) {
    if (cloneChildren[i]) {
      syncComputedStyles(sourceChildren[i], cloneChildren[i]);
    }
  }
}

function prepareSkillChipsForPdf(clone: HTMLElement) {
  clone.querySelectorAll('[data-skill-index]').forEach((el) => {
    el.removeAttribute('contenteditable');
    el.removeAttribute('suppresscontenteditablewarning');
    const chip = el.parentElement;
    chip?.querySelector('button')?.remove();
    chip?.classList.remove('edit-only');
  });
}

export class PdfService {
  public static async extractFirstPhoto(file: File): Promise<string | null> {
    if (typeof pdfjsLib === 'undefined') {
      console.warn("PDF.js library is not loaded. Image extraction skipped.");
      return null;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      }

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      if (pdf.numPages === 0) return null;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const opList = await page.getOperatorList();

        for (let i = 0; i < opList.fnArray.length; i++) {
          if (
            opList.fnArray[i] === pdfjsLib.OPS.paintImageXObject ||
            opList.fnArray[i] === pdfjsLib.OPS.paintJpegXObject
          ) {
            const imageObjId = opList.argsArray[i][0] as string;

            const img = await new Promise<PdfImage>((resolve) => {
              const result = page.objs.get(imageObjId, (obj: PdfImage) => {
                resolve(obj);
              });
              if (result) resolve(result);
            });

            if (img && img.width && img.height) {
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
              return canvas.toDataURL('image/jpeg');
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to extract image from PDF:", err);
    }
    return null;
  }

  public static downloadPdf(element: HTMLElement, filename: string): Promise<void> {
    const sheetElement = (element.querySelector('.pdf-sheet') || element) as HTMLElement;

    // Create a hidden wrapper positioned at (0,0) with a negative z-index to stay invisible to the user.
    // Use position: absolute and height: auto to prevent clipping when rendering multi-page documents.
    const wrapper = document.createElement('div');
    wrapper.style.cssText = [
      'position: absolute',
      'left: 0',
      'top: 0',
      'width: 794px',
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

    // Copy computed styles from the live preview while DOM trees still match
    syncComputedStyles(sheetElement, clone);

    prepareSkillChipsForPdf(clone);

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
    clone.style.width = '794px';
    
    const originalHeight = sheetElement.offsetHeight || 1123;

    clone.style.height = 'auto';
    clone.style.minHeight = `${originalHeight}px`;
    clone.style.maxHeight = 'none';
    if (clone.style.display === 'none') {
      clone.style.display = 'block';
    }
    clone.style.opacity = '1';
    clone.style.visibility = 'visible';
    clone.style.pointerEvents = 'none';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

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
        windowWidth: 794,
        onclone: (clonedDoc: Document) => {
          // Find the cloned sheet element in the cloned document
          const clonedSheet = (sheetElement.id ? clonedDoc.getElementById(sheetElement.id) : null)
            || clonedDoc.querySelector('.pdf-sheet')
            || (clonedDoc.body.querySelector('*') as HTMLElement);

          if (clonedSheet) {
            // Copy all styles from the parent document to the cloned document's head.
            // This resolves relative stylesheet URL issues (/assets/index-*.css) inside the about:blank iframe on production.
            try {
              for (const sheet of Array.from(document.styleSheets)) {
                try {
                  const rules = sheet.cssRules || sheet.rules;
                  if (rules) {
                    const cssText = Array.from(rules)
                      .map(rule => rule.cssText)
                      .join('\n');
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = cssText;
                    clonedDoc.head.appendChild(style);
                  }
                } catch {
                  // Skip cross-origin stylesheets (like Google Fonts CDN links) to prevent SecurityError
                }
              }
            } catch (err) {
              console.warn('Failed to copy document stylesheets:', err);
            }

            // Copy Google Fonts links to the cloned document's head to ensure fonts are fully resolved
            try {
              const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]');
              fontLinks.forEach(link => {
                clonedDoc.head.appendChild(link.cloneNode(true));
              });
            } catch (err) {
              console.warn('Failed to copy font links to cloned document:', err);
            }

            // Append style override tag to cloned document to hide layout tools (pseudo-elements, focus outlines)
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              body {
                margin: 0 !important;
                padding: 0 !important;
              }
              * {
                font-variant-ligatures: none !important;
                text-rendering: optimizeLegibility !important;
              }
              .pdf-sheet::before, .pdf-sheet::after {
                display: none !important;
                content: none !important;
              }
              [contenteditable="true"] {
                outline: none !important;
                border-color: transparent !important;
                background-color: transparent !important;
              }
              [class*="group/draggable"] {
                border: none !important;
                padding: 0 !important;
                background: transparent !important;
                background-color: transparent !important;
                box-shadow: none !important;
              }
              .designer-column {
                border: none !important;
                padding: 0 !important;
                background: transparent !important;
                background-color: transparent !important;
              }
              .group\\/section,
              .group\\/item,
              .section-active,
              .item-active,
              .header-active {
                opacity: 1 !important;
                filter: none !important;
                background: transparent !important;
                background-color: transparent !important;
                border-color: transparent !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .photo-frame-dash,
              .photo-wave-dash,
              .photo-wave-dash-slow {
                animation: none !important;
                transform: none !important;
              }
              .profile-photo-waves {
                opacity: 0.35 !important;
              }
              .pdf-sheet span.inline-flex,
              .pdf-sheet .inline-flex.items-center,
              .pdf-sheet .flex.items-center {
                display: inline-flex !important;
                align-items: center !important;
                vertical-align: middle !important;
              }
              .pdf-sheet li.flex.items-center {
                display: flex !important;
                align-items: center !important;
              }
              .pdf-sheet svg {
                display: inline-block !important;
                vertical-align: middle !important;
                flex-shrink: 0 !important;
              }
              .pdf-sheet [class*="lucide"] {
                display: inline-block !important;
                vertical-align: middle !important;
                flex-shrink: 0 !important;
              }
            `;
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
