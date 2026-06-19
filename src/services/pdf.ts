import html2pdf from 'html2pdf.js';
import { stripEditorFocusClasses } from '../utils/editorFocus';

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
  if (!colorStr || !/oklch|oklab|color-mix/i.test(colorStr)) return colorStr;

  // Browser resolves oklch → rgb on style assignment (most reliable in real DOM)
  const probe = document.createElement('span');
  probe.style.setProperty('color', colorStr.trim());
  const resolved = probe.style.color;
  if (resolved && !/oklch|oklab/i.test(resolved)) return resolved;

  if (!colorCtx) return '#334155';

  try {
    colorCtx.clearRect(0, 0, 1, 1);
    colorCtx.fillStyle = colorStr;
    colorCtx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = colorCtx.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  } catch {
    return '#334155';
  }
}

const COLOR_FUNC_RE = /(?:okl(?:ch|ab)|color-mix)\([^)]*(?:\/[^)]*)?\)/gi;

/** Replace oklch/oklab/color-mix in CSS text so html2canvas can parse it. */
export function sanitizeCssOklch(cssText: string): string {
  let out = cssText;
  let prev = '';
  while (out !== prev) {
    prev = out;
    out = out.replace(COLOR_FUNC_RE, (match) => convertOklToRgb(match));
  }
  return out;
}

const PDF_COLOR_PROPS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
];

const PDF_SVG_COLOR_PROPS = ['fill', 'stroke', 'stop-color'];

/** Layout props safe to copy without breaking the PDF clone positioning. */
const PDF_LAYOUT_PROPS = [
  'display',
  'flex-direction',
  'flex-wrap',
  'align-items',
  'align-self',
  'align-content',
  'justify-content',
  'justify-items',
  'gap',
  'row-gap',
  'column-gap',
  'grid-template-columns',
  'grid-template-rows',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'line-height',
  'font-size',
  'font-weight',
  'text-align',
  'border-radius',
  'border-width',
  'border-style',
  'white-space',
];

function safeColor(value: string): string {
  if (!value || value === 'none') return value;
  const resolved = convertOklToRgb(value.trim());
  if (/oklch|oklab|color-mix/i.test(resolved)) return '#334155';
  return resolved;
}

function inlineLayoutStyles(source: Element, target: Element, win: Window) {
  if (!(target instanceof HTMLElement)) return;
  const cs = win.getComputedStyle(source);
  for (const prop of PDF_LAYOUT_PROPS) {
    const val = cs.getPropertyValue(prop);
    if (val) target.style.setProperty(prop, val);
  }
}

/** Inline resolved rgb colors on one element (works for HTML + SVG). */
function inlineElementColors(source: Element, target: Element, win: Window) {
  const cs = win.getComputedStyle(source);

  if (target instanceof HTMLElement || target instanceof SVGElement) {
    for (const prop of PDF_COLOR_PROPS) {
      const val = cs.getPropertyValue(prop);
      if (!val || val === 'none') continue;
      if (val === 'transparent' && prop !== 'color') continue;
      target.style.setProperty(prop, safeColor(val), 'important');
    }
  }

  if (target instanceof SVGElement) {
    const resolvedColor = safeColor(cs.color);
    for (const prop of PDF_SVG_COLOR_PROPS) {
      const computed = safeColor(cs.getPropertyValue(prop));
      if (!computed || computed === 'none') continue;
      target.style.setProperty(prop, computed, 'important');
    }
    for (const attr of ['fill', 'stroke'] as const) {
      const raw = target.getAttribute(attr);
      const computed = safeColor(cs.getPropertyValue(attr));
      if (computed === 'none') continue;
      if (
        raw === 'currentColor'
        || raw === 'inherit'
        || !raw
        || /oklch|oklab|color-mix/i.test(raw)
      ) {
        target.setAttribute(attr, computed !== 'none' ? computed : resolvedColor);
      } else if (/oklch|oklab|color-mix/i.test(raw)) {
        target.setAttribute(attr, safeColor(raw));
      }
    }
  }
}

/** Walk source/target trees in parallel and inline colors + layout from the live DOM. */
function syncStylesFromSource(sourceRoot: Element, targetRoot: Element, sourceWin: Window) {
  const sources = [sourceRoot, ...sourceRoot.querySelectorAll('*')];
  const targets = [targetRoot, ...targetRoot.querySelectorAll('*')];
  const len = Math.min(sources.length, targets.length);
  for (let i = 0; i < len; i++) {
    inlineElementColors(sources[i], targets[i], sourceWin);
    inlineLayoutStyles(sources[i], targets[i], sourceWin);
  }
}

function inlineAllResolvedColors(root: Element, win: Window) {
  for (const el of [root, ...root.querySelectorAll('*')]) {
    inlineElementColors(el, el, win);
  }
}

function stripClonedDocStyles(clonedDoc: Document) {
  clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => el.remove());
}

function injectSanitizedStyles(clonedDoc: Document) {
  let css = '';
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules || sheet.rules;
      if (rules) {
        css += Array.from(rules).map((rule) => rule.cssText).join('\n') + '\n';
      }
    } catch {
      // Skip cross-origin stylesheets
    }
  }
  const style = clonedDoc.createElement('style');
  style.textContent = sanitizeCssOklch(css);
  clonedDoc.head.appendChild(style);
}

function sanitizeInlineStyles(root: Element) {
  root.querySelectorAll('[style]').forEach((el) => {
    const style = el.getAttribute('style');
    if (style && /oklch|oklab|color-mix/i.test(style)) {
      el.setAttribute('style', sanitizeCssOklch(style));
    }
  });
  root.querySelectorAll('[fill],[stroke]').forEach((el) => {
    for (const attr of ['fill', 'stroke']) {
      const val = el.getAttribute(attr);
      if (val && /oklch|oklab|color-mix/i.test(val)) {
        el.setAttribute(attr, safeColor(val));
      }
    }
  });
}

function prepareSkillChipsForPdf(clone: HTMLElement) {
  clone.querySelectorAll('[data-skill-index]').forEach((el) => {
    const text = el.textContent?.trim() || '';
    const chip = el.parentElement;
    if (!chip) return;

    chip.querySelector('button')?.remove();
    chip.classList.remove('edit-only');

    const chipStyle = chip.getAttribute('style') ?? '';
    const chipClass = chip.className.replace(/\bedit-only\b/g, '').trim();
    chip.textContent = text;
    chip.className = chipClass;
    if (chipStyle) chip.setAttribute('style', chipStyle);
    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';
    chip.style.justifyContent = 'center';
    chip.style.lineHeight = '1.375';
  });
}

function prepareFlexIconRows(clone: HTMLElement, source: HTMLElement) {
  const selector = [
    'span.inline-flex.items-center',
    'li.flex.items-center',
    '.flex.items-center.gap-1\\.5',
    '.flex.items-center.gap-1',
  ].join(', ');

  const sources = source.querySelectorAll(selector);
  const targets = clone.querySelectorAll(selector);
  sources.forEach((src, i) => {
    const tgt = targets[i];
    if (!tgt) return;
    inlineLayoutStyles(src, tgt, window);
    if (tgt instanceof HTMLElement) {
      tgt.style.display = window.getComputedStyle(src).display.includes('flex') ? 'inline-flex' : 'flex';
      tgt.style.flexDirection = 'row';
      tgt.style.alignItems = 'center';
    }
    src.querySelectorAll('svg').forEach((svg, j) => {
      const tSvg = tgt.querySelectorAll('svg')[j];
      if (!(tSvg instanceof SVGElement)) return;
      const cs = window.getComputedStyle(svg);
      tSvg.style.display = 'block';
      tSvg.style.flexShrink = '0';
      tSvg.style.width = cs.width;
      tSvg.style.height = cs.height;
      tSvg.style.margin = '0';
    });
  });
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

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const opList = await page.getOperatorList();

        for (let i = 0; i < opList.fnArray.length; i++) {
          if (opList.fnArray[i] === pdfjs.OPS.paintImageXObject) {
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

    // Copy resolved colors + layout from the live preview (including SVG / Lucide icons)
    syncStylesFromSource(sheetElement, clone, window);
    sanitizeInlineStyles(clone);

    prepareSkillChipsForPdf(clone);
    prepareFlexIconRows(clone, sheetElement);

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
          const clonedSheet = (sheetElement.id ? clonedDoc.getElementById(sheetElement.id) : null)
            || clonedDoc.querySelector('.pdf-sheet')
            || (clonedDoc.body.querySelector('*') as HTMLElement);

          if (clonedSheet) {
            // Remove html2canvas-copied stylesheets that still contain oklch()
            stripClonedDocStyles(clonedDoc);
            injectSanitizedStyles(clonedDoc);

            try {
              const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]');
              fontLinks.forEach(link => {
                clonedDoc.head.appendChild(link.cloneNode(true));
              });
            } catch (err) {
              console.warn('Failed to copy font links to cloned document:', err);
            }

            // Copy resolved colors + layout from live DOM (handles SVG currentColor → oklch classes)
            syncStylesFromSource(sheetElement, clonedSheet, window);
            if (clonedDoc.defaultView) {
              inlineAllResolvedColors(clonedSheet, clonedDoc.defaultView);
            }
            sanitizeInlineStyles(clonedSheet);
            prepareSkillChipsForPdf(clonedSheet);
            prepareFlexIconRows(clonedSheet, sheetElement);

            const style = clonedDoc.createElement('style');
            style.textContent = `
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
                background: transparent !important;
                background-color: transparent !important;
                box-shadow: none !important;
              }
              .designer-column {
                border: none !important;
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
              .pdf-sheet span.inline-flex.items-center,
              .pdf-sheet .inline-flex.items-center,
              .pdf-sheet li.flex.items-center,
              .pdf-sheet .flex.items-center.gap-1\\.5,
              .pdf-sheet .flex.items-center.gap-1 {
                flex-direction: row !important;
                align-items: center !important;
                align-content: center !important;
              }
              .pdf-sheet span.inline-flex.items-center > svg,
              .pdf-sheet li.flex.items-center > svg,
              .pdf-sheet .flex.items-center > svg {
                display: block !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
              }
              .pdf-sheet .flex.flex-wrap.items-center.gap-1\\.5 > span {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
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
