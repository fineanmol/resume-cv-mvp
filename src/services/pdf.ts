import html2pdf from 'html2pdf.js';

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

function copyComputedStyles(original: HTMLElement, cloned: HTMLElement) {
  const computed = window.getComputedStyle(original);

  const propertiesToCopy = [
    'color',
    'background-color',
    'background-image',
    'background-position',
    'background-repeat',
    'background-size',
    'border-color',
    'border-style',
    'border-width',
    'border-top-color',
    'border-top-style',
    'border-top-width',
    'border-bottom-color',
    'border-bottom-style',
    'border-bottom-width',
    'border-left-color',
    'border-left-style',
    'border-left-width',
    'border-right-color',
    'border-right-style',
    'border-right-width',
    'border-radius',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-left-radius',
    'border-bottom-right-radius',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'line-height',
    'letter-spacing',
    'text-align',
    'text-decoration',
    'text-transform',
    'padding',
    'padding-top',
    'padding-bottom',
    'padding-left',
    'padding-right',
    'margin',
    'margin-top',
    'margin-bottom',
    'margin-left',
    'margin-right',
    'width',
    'height',
    'min-width',
    'min-height',
    'max-width',
    'max-height',
    'display',
    'flex-direction',
    'flex-wrap',
    'flex-grow',
    'flex-shrink',
    'flex-basis',
    'justify-content',
    'align-items',
    'align-self',
    'gap',
    'row-gap',
    'column-gap',
    'position',
    'top',
    'bottom',
    'left',
    'right',
    'z-index',
    'opacity',
    'visibility',
    'box-sizing',
    'list-style-type',
    'list-style-position',
    'fill',
    'stroke',
    'stroke-width',
    'vertical-align',
    'transform'
  ];

  propertiesToCopy.forEach((prop) => {
    const val = computed.getPropertyValue(prop);
    if (val) {
      const resolved = (val.includes('oklch') || val.includes('oklab')) ? convertOklToRgb(val) : val;
      cloned.style.setProperty(prop, resolved);
    }
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

  public static downloadPdf(element: HTMLElement, filename: string): void {
    if (!html2pdf) {
      alert("PDF downloader package is not available.");
      return;
    }

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

    // Clone and strip all transforms/shadows so html2canvas sees a plain A4 element
    const clone = sheetElement.cloneNode(true) as HTMLElement;
    
    // Resolve relative image src attributes to absolute URLs so they load correctly inside the about:blank iframe
    clone.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:') && !src.startsWith('http:') && !src.startsWith('https:')) {
        (img as HTMLImageElement).src = new URL(src, window.location.href).href;
      }
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

    // Copy computed layout and typographic styles from original elements to cloned elements first
    copyComputedStyles(sheetElement, clone);
    const origEls = sheetElement.querySelectorAll('*');
    const cloneEls = clone.querySelectorAll('*');
    for (let i = 0; i < origEls.length; i++) {
      if (origEls[i] && cloneEls[i]) {
        const origEl = origEls[i] as HTMLElement;
        // Skip SVG children (path, rect, circle, g, etc.) to prevent layout and scale distortions
        if (origEl.closest('svg') && origEl.tagName.toLowerCase() !== 'svg') {
          continue;
        }
        copyComputedStyles(origEl, cloneEls[i] as HTMLElement);
      }
    }

    // Override specific layout properties for PDF generation while keeping original inline styles (like fonts, padding)
    clone.style.transform = 'none';
    clone.style.transition = 'none';
    clone.style.boxShadow = 'none';
    clone.style.position = 'relative';
    clone.style.left = '0px';
    clone.style.top = '0px';
    // Positive z-index so html2canvas (which renders the clone specifically) does not skip it
    clone.style.zIndex = '9999';
    clone.style.width = '794px';
    const originalHeight = sheetElement.offsetHeight || 1123;
    const pageCount = Math.max(1, Math.ceil(originalHeight / 1123));
    const targetHeight = pageCount * 1122;
    clone.style.height = `${targetHeight}px`;
    clone.style.minHeight = `${targetHeight}px`;
    clone.style.maxHeight = `${targetHeight}px`;
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
        scale: 4,
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
            `;
            clonedDoc.head.appendChild(style);
          }
        }
      },
      jsPDF: { unit: 'pt' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };

    html2pdf()
      .set(opt)
      .from(clone)
      .save()
      .then(() => {
        document.body.removeChild(wrapper);
      })
      .catch((err: unknown) => {
        console.error('PDF download failed:', err);
        document.body.removeChild(wrapper);
      });
  }
}
