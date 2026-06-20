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

  const probe = document.createElement('span');
  probe.style.setProperty('position', 'absolute', 'important');
  probe.style.setProperty('visibility', 'hidden', 'important');
  probe.style.setProperty('pointer-events', 'none', 'important');
  document.body.appendChild(probe);

  try {
    for (const prop of ['color', 'background-color', 'border-color'] as const) {
      probe.style.setProperty(prop, colorStr.trim(), 'important');
      const resolved = getComputedStyle(probe).getPropertyValue(prop);
      probe.style.removeProperty(prop);
      if (resolved && !/oklch|oklab|color-mix/i.test(resolved)) {
        return resolved;
      }
    }
  } finally {
    document.body.removeChild(probe);
  }

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

const COLOR_FUNCTION_NAMES = ['color-mix', 'oklab', 'oklch'] as const;

function extractColorFunction(css: string, fnStart: number): { match: string; end: number } | null {
  const open = css.indexOf('(', fnStart);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '(') depth++;
    else if (css[i] === ')') {
      depth--;
      if (depth === 0) return { match: css.slice(fnStart, i + 1), end: i };
    }
  }
  return null;
}

/** Replace oklch/oklab/color-mix in CSS text so html2canvas can parse it. */
export function sanitizeCssOklch(cssText: string): string {
  let out = cssText;
  let changed = true;
  while (changed) {
    changed = false;
    for (const name of COLOR_FUNCTION_NAMES) {
      let idx = 0;
      while (true) {
        const fnStart = out.indexOf(name, idx);
        if (fnStart === -1) break;
        const extracted = extractColorFunction(out, fnStart);
        if (!extracted) break;
        const replacement = convertOklToRgb(extracted.match);
        if (replacement !== extracted.match) changed = true;
        out = out.slice(0, fnStart) + replacement + out.slice(extracted.end + 1);
        idx = fnStart + Math.max(replacement.length, 1);
      }
    }
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
  'flex-shrink',
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
  'border-color',
  'white-space',
  'box-sizing',
  'min-height',
  'min-width',
  'width',
  'height',
  'vertical-align',
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
    if (!val) continue;
    if (prop === 'border-color' || prop.endsWith('-color')) {
      target.style.setProperty(prop, safeColor(val));
    } else {
      target.style.setProperty(prop, val);
    }
  }
}

const DEEP_COLOR_PROPS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'column-rule-color',
  'fill',
  'stroke',
  'stop-color',
  'box-shadow',
  'text-shadow',
];

/** Force resolved rgb colors on every node — last line of defense before html2canvas. */
function deepSanitizeColorsForTree(sourceRoot: Element, targetRoot: Element, win: Window) {
  const sources = [sourceRoot, ...Array.from(sourceRoot.querySelectorAll('*'))];
  const targets = [targetRoot, ...Array.from(targetRoot.querySelectorAll('*'))];
  const len = Math.min(sources.length, targets.length);

  for (let i = 0; i < len; i++) {
    const src = sources[i];
    const tgt = targets[i];
    if (!(tgt instanceof HTMLElement || tgt instanceof SVGElement)) continue;

    const cs = win.getComputedStyle(src);
    for (const prop of DEEP_COLOR_PROPS) {
      const val = cs.getPropertyValue(prop);
      if (!val || val === 'none') continue;
      if (/oklch|oklab|color-mix/i.test(val)) {
        tgt.style.setProperty(prop, sanitizeCssOklch(val), 'important');
      } else if (prop.includes('shadow')) {
        tgt.style.setProperty(prop, val, 'important');
      } else if (val !== 'transparent' || prop === 'color') {
        tgt.style.setProperty(prop, safeColor(val), 'important');
      }
    }

    if (tgt instanceof SVGElement) {
      for (const attr of ['fill', 'stroke'] as const) {
        const raw = tgt.getAttribute(attr);
        if (!raw || raw === 'none') continue;
        if (raw === 'currentColor' || /oklch|oklab|color-mix/i.test(raw)) {
          const computed = safeColor(cs.getPropertyValue(attr) || cs.color);
          if (computed !== 'none') tgt.setAttribute(attr, computed);
        }
      }
    }

    const inlineStyle = tgt.getAttribute('style');
    if (inlineStyle && /oklch|oklab|color-mix/i.test(inlineStyle)) {
      tgt.setAttribute('style', sanitizeCssOklch(inlineStyle));
    }
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
  const sources = [sourceRoot, ...Array.from(sourceRoot.querySelectorAll('*'))];
  const targets = [targetRoot, ...Array.from(targetRoot.querySelectorAll('*'))];
  const len = Math.min(sources.length, targets.length);
  for (let i = 0; i < len; i++) {
    inlineElementColors(sources[i], targets[i], sourceWin);
    inlineLayoutStyles(sources[i], targets[i], sourceWin);
  }
}

function inlineAllResolvedColors(root: Element, win: Window) {
  for (const el of [root, ...Array.from(root.querySelectorAll('*'))]) {
    inlineElementColors(el, el, win);
  }
}

function stripClonedDocStyles(clonedDoc: Document) {
  clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => el.remove());
}

/** Copy computed border-radius from live avatar nodes so print/PDF keeps circle/rounded shapes. */
function preserveAvatarShapesForPrint(clone: HTMLElement, source: HTMLElement) {
  const srcAvatars = source.querySelectorAll('.group\\/avatar');
  const cloneAvatars = clone.querySelectorAll('.group\\/avatar');

  srcAvatars.forEach((src, i) => {
    const cloneAvatar = cloneAvatars[i];
    if (!(src instanceof HTMLElement) || !(cloneAvatar instanceof HTMLElement)) return;

    const srcInner = src.querySelector(':scope > div');
    const cloneInner = cloneAvatar.querySelector(':scope > div');
    if (!(srcInner instanceof HTMLElement) || !(cloneInner instanceof HTMLElement)) return;

    const cs = window.getComputedStyle(srcInner);
    cloneInner.style.borderRadius = cs.borderRadius;
    cloneInner.style.overflow = 'hidden';

    const cloneImg = cloneInner.querySelector('img');
    if (cloneImg instanceof HTMLImageElement) {
      cloneImg.style.borderRadius = cs.borderRadius;
    }
  });
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
    if (!style) return;
    const sanitized = sanitizeCssOklch(style);
    if (sanitized !== style) el.setAttribute('style', sanitized);
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

function prepareEntryIconAlignment(clone: HTMLElement) {
  clone.querySelectorAll('.pdf-keep, .group\\/logo').forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.style.alignSelf = 'flex-start';
    el.style.flexShrink = '0';
    el.style.marginTop = '1px';
  });
}

function prepareSheetForExport(clone: HTMLElement, sheetElement: HTMLElement): number {
  const cs = window.getComputedStyle(sheetElement);
  clone.classList.add('pdf-export');
  clone.style.minHeight = 'auto';
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';
  clone.style.boxShadow = 'none';
  clone.style.margin = '0';
  clone.style.padding = cs.padding;
  clone.style.paddingTop = cs.paddingTop;
  clone.style.paddingBottom = cs.paddingBottom;
  return sheetElement.scrollHeight;
}

function finalizePdfClone(clone: HTMLElement, source: HTMLElement, win: Window) {
  syncStylesFromSource(source, clone, win);
  sanitizeInlineStyles(clone);
  deepSanitizeColorsForTree(source, clone, win);
  prepareSkillChipsForPdf(clone, source);
  prepareFlexIconRows(clone, source);
  prepareEntryIconAlignment(clone);
}

function prepareSkillChipsForPdf(clone: HTMLElement, source: HTMLElement) {
  const sourceChips = source.querySelectorAll('[data-skill-chip]');
  const cloneChips = clone.querySelectorAll('[data-skill-chip]');

  sourceChips.forEach((srcChip, i) => {
    const chip = cloneChips[i];
    if (!(chip instanceof HTMLElement) || !(srcChip instanceof HTMLElement)) return;

    const textEl = srcChip.querySelector('[data-skill-index]');
    const text = textEl?.textContent?.trim() || srcChip.textContent?.trim() || '';

    chip.querySelectorAll('.edit-only, button').forEach((el) => el.remove());
    chip.classList.remove('edit-only');
    chip.textContent = text;

    inlineLayoutStyles(srcChip, chip, window);
    const cs = window.getComputedStyle(srcChip);
    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';
    chip.style.justifyContent = 'center';
    chip.style.boxSizing = 'border-box';
    chip.style.lineHeight = '1.375';
    chip.style.whiteSpace = 'nowrap';
    chip.style.verticalAlign = 'middle';
    chip.style.padding = cs.padding;
    chip.style.minHeight = cs.minHeight;
    chip.style.fontSize = cs.fontSize;
    chip.style.fontWeight = cs.fontWeight;
    chip.style.borderRadius = cs.borderRadius;
    chip.style.borderWidth = cs.borderTopWidth;
    chip.style.borderStyle = cs.borderTopStyle;
    chip.style.borderColor = safeColor(cs.borderTopColor);
    chip.style.backgroundColor = safeColor(cs.backgroundColor);
    chip.style.color = safeColor(cs.color);
  });

  // Non-editable skill chips (no data-skill-chip wrapper)
  const sourceSkillSpans = source.querySelectorAll('.flex.flex-wrap.items-center.gap-1\\.5 > span');
  const cloneSkillSpans = clone.querySelectorAll('.flex.flex-wrap.items-center.gap-1\\.5 > span');
  sourceSkillSpans.forEach((src, i) => {
    const chip = cloneSkillSpans[i];
    if (!(chip instanceof HTMLElement) || !(src instanceof HTMLElement)) return;
    if (src.hasAttribute('data-skill-chip')) return;
    inlineLayoutStyles(src, chip, window);
    const cs = window.getComputedStyle(src);
    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';
    chip.style.justifyContent = 'center';
    chip.style.boxSizing = 'border-box';
    chip.style.lineHeight = '1.375';
    chip.style.whiteSpace = 'nowrap';
    chip.style.verticalAlign = 'middle';
    chip.style.padding = cs.padding;
    chip.style.minHeight = cs.minHeight;
    chip.style.fontSize = cs.fontSize;
    chip.style.borderWidth = cs.borderTopWidth;
    chip.style.borderStyle = cs.borderTopStyle;
    chip.style.borderColor = safeColor(cs.borderTopColor);
    chip.style.borderRadius = cs.borderRadius;
    chip.style.backgroundColor = safeColor(cs.backgroundColor);
    chip.style.color = safeColor(cs.color);
  });

  source.querySelectorAll('.flex.flex-wrap.items-center.gap-1\\.5').forEach((srcWrap, i) => {
    const wrap = clone.querySelectorAll('.flex.flex-wrap.items-center.gap-1\\.5')[i];
    if (!(wrap instanceof HTMLElement) || !(srcWrap instanceof HTMLElement)) return;
    wrap.style.display = 'block';
    wrap.style.lineHeight = '1.375';
    wrap.style.fontSize = window.getComputedStyle(srcWrap).fontSize;
    wrap.querySelectorAll('[data-skill-chip], :scope > span').forEach((chip, j) => {
      const srcChip = srcWrap.querySelectorAll('[data-skill-chip], :scope > span')[j];
      if (!(chip instanceof HTMLElement) || !(srcChip instanceof HTMLElement)) return;
      chip.style.display = 'inline-flex';
      chip.style.margin = '0 6px 6px 0';
      chip.style.verticalAlign = 'middle';
    });
  });
}

const FLEX_ICON_ROW_SELECTORS = [
  'span.inline-flex.items-center',
  'li.flex.items-start',
  'li.flex.gap-2',
  'li.flex.gap-2\\.5',
  '.flex.items-start.gap-2',
  '.flex.items-center.gap-1\\.5',
  '.flex.items-center.gap-1',
  '.flex.items-center.gap-2',
  'header .flex.flex-wrap',
].join(', ');

function prepareInlineIcon(el: Element, win: Window) {
  if (!(el instanceof HTMLElement)) return;
  const cs = win.getComputedStyle(el);
  el.style.display = 'inline-block';
  el.style.flexShrink = '0';
  el.style.verticalAlign = 'middle';
  el.style.margin = '0';
  if (cs.width && cs.width !== 'auto') el.style.width = cs.width;
  if (cs.height && cs.height !== 'auto') el.style.height = cs.height;
}

function prepareFlexIconRows(clone: HTMLElement, source: HTMLElement) {
  const sources = source.querySelectorAll(FLEX_ICON_ROW_SELECTORS);
  const targets = clone.querySelectorAll(FLEX_ICON_ROW_SELECTORS);

  sources.forEach((src, i) => {
    const tgt = targets[i];
    if (!(tgt instanceof HTMLElement) || !(src instanceof HTMLElement)) return;

    inlineLayoutStyles(src, tgt, window);
    const cs = window.getComputedStyle(src);
    const isInline = cs.display.includes('inline');
    tgt.style.display = isInline ? 'inline-flex' : 'flex';
    tgt.style.flexDirection = 'row';
    const alignItems = cs.alignItems || 'center';
    tgt.style.alignItems = tgt.classList.contains('items-start') || alignItems === 'flex-start'
      ? 'flex-start'
      : alignItems;
    tgt.style.alignContent = cs.alignContent || 'normal';
    tgt.style.flexWrap = cs.flexWrap || 'nowrap';

    src.querySelectorAll('svg, img').forEach((_icon, j) => {
      const tIcon = tgt.querySelectorAll('svg, img')[j];
      if (tIcon) prepareInlineIcon(tIcon, window);
    });

    // Entry icon badge wrapper (colored square behind lucide icon)
    src.querySelectorAll('span.inline-flex.items-center.justify-center').forEach((badge, j) => {
      const tBadge = tgt.querySelectorAll('span.inline-flex.items-center.justify-center')[j];
      if (!(tBadge instanceof HTMLElement) || !(badge instanceof HTMLElement)) return;
      inlineLayoutStyles(badge, tBadge, window);
      tBadge.style.display = 'inline-flex';
      tBadge.style.alignItems = 'center';
      tBadge.style.justifyContent = 'center';
      tBadge.style.flexShrink = '0';
      tBadge.style.verticalAlign = 'middle';
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

  /**
   * Print-based PDF export — pixel-perfect because it uses the browser's own render engine.
   * Opens the sheet in a hidden iframe with all page styles, calls print(), then removes
   * the iframe. The user selects "Save as PDF" in the browser print dialog.
   *
   * This is the approach used by Resume.io, Zety, Novoresume, and most SaaS resume builders.
   * html2canvas is fundamentally unreliable for complex CSS (flexbox, oklch, SVG icons, etc.).
   */
  public static downloadPdf(element: HTMLElement, _filename: string): Promise<void> {
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
    stripEditorFocusClasses(clone);
    clone.querySelectorAll('.edit-only, [data-pdf-hide]').forEach(el => el.remove());
    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

    if (sheetElement.querySelector('header[data-show-title="false"]')) {
      clone.querySelectorAll('[data-header-subtitle]').forEach(el => el.remove());
    }

    preserveAvatarShapesForPrint(clone, sheetElement);

    // Reset any preview page-break margin adjustments (data-pb-push) so they
    // don't affect the PDF layout — the browser's print engine handles breaks itself.
    clone.querySelectorAll<HTMLElement>('[data-pb-push]').forEach(el => {
      el.style.marginTop = el.getAttribute('data-pb-orig') ?? '';
      el.removeAttribute('data-pb-push');
      el.removeAttribute('data-pb-orig');
    });

    // ── Designer template: convert two-column grid → float layout ────────────
    // CSS Grid with a single row is an atomic formatting context in Chrome's
    // print engine: Chrome cannot fragment between columns in a row, so it
    // moves the ENTIRE grid to the next page when it doesn't fit after the
    // header (leaving header alone on page 1, all sections on page 2).
    // Floated blocks CAN be fragmented across pages by Chrome, so we replace
    // the grid with a float-based layout only in the PDF clone.
    const designerGrid = clone.querySelector<HTMLElement>('[data-testid="designer-column-grid"]');
    if (designerGrid) {
      const [leftCol, rightCol] = Array.from(
        designerGrid.querySelectorAll<HTMLElement>(':scope > .designer-column')
      );
      if (leftCol && rightCol) {
        // Read the inline gap React set (style="gap: Xpx") then clear it
        const gapPx = Math.max(0, parseFloat(designerGrid.style.gap) || parseFloat(designerGrid.style.columnGap) || 16);
        designerGrid.style.display = 'block'; // override Tailwind `grid` — floats inside grid are ignored
        designerGrid.style.gap = '';
        designerGrid.style.columnGap = '';
        designerGrid.style.rowGap = '';

        // Replicate grid-cols-[1.4fr_1fr] proportions: 1.4/2.4 ≈ 58.33% left, 1/2.4 ≈ 41.67% right
        leftCol.style.display = 'block';
        leftCol.style.float = 'left';
        leftCol.style.width = `calc(58.333% - ${gapPx}px)`;
        leftCol.style.marginRight = `${gapPx}px`;
        leftCol.style.gap = ''; // clear inline flex gap (margin-bottom handles spacing)

        rightCol.style.display = 'block';
        rightCol.style.float = 'left';
        rightCol.style.width = '41.667%';
        rightCol.style.gap = ''; // clear inline flex gap

        // Clearfix so the container wraps both floats
        const clearfix = document.createElement('div');
        clearfix.style.cssText = 'clear:both;display:block;height:0;';
        designerGrid.appendChild(clearfix);
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Strip the gray placeholder background and shadow from the avatar container.
    // The inner div of .group/avatar always has bg-slate-100 + shadow-sm hardcoded;
    // we wipe them here so nothing shows through the photo in print.
    clone.querySelectorAll('.group\\/avatar > div').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.backgroundColor = 'transparent';
        el.style.boxShadow = 'none';
      }
    });
    // Belt-and-suspenders: also strip the class so Tailwind's CSS rule no longer applies
    clone.querySelectorAll('[class*="bg-slate-100"]').forEach(el => {
      el.className = el.className
        .replace(/\bbg-slate-100(?:\/\d+)?\b/g, '')
        .replace(/\bshadow-sm\b/g, '')
        .trim();
    });

    // Force all images to absolute URLs (iframe is about:blank, relative hrefs break)
    clone.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:') && !src.startsWith('http')) {
        img.src = new URL(src, window.location.href).href;
      }
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title></title>
  ${fontLinks}
  <style>
    ${allStyles}

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      display: flex;
      justify-content: center;
    }

    .pdf-sheet {
      box-shadow: none !important;
      margin: 0 !important;
      height: auto !important;         /* let content determine height across pages */
      min-height: auto !important;
      width: 210mm !important;
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Strip the gray placeholder background — only needed in editor */
    .group\\/avatar > div,
    [class*="bg-slate-100"] {
      background-color: transparent !important;
      box-shadow: none !important;
    }

    /* Preserve border-radius clipping ONLY for the avatar/photo container.
     * Applying overflow:hidden to .rounded globally would make every SectionWrapper
     * (which also uses the "rounded" class) non-breakable, causing whole sections
     * to jump to the next page instead of breaking between individual entries.
     * Do NOT use border-radius: inherit — it zeroes out Tailwind rounded-full. */
    .group\\/avatar > div,
    .group\\/avatar img {
      overflow: hidden !important;
    }

    /* Ensure the photo image fills its container */
    .group\\/avatar img {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
    }

    /* Strip all editor decoration */
    .pdf-sheet::before,
    .pdf-sheet::after {
      display: none !important;
      content: none !important;
    }

    /* Hide animation on wave/frame lines */
    .photo-wave-dash,
    .photo-wave-dash-slow,
    .photo-frame-dash {
      animation: none !important;
    }

    /* Force backgrounds to print */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* margin: 0 prevents Chrome from printing its built-in date/title/URL/page-number
     * headers & footers — those only render when there is non-zero @page margin space. */
    @page { size: A4; margin: 0; }

    /* ── Page-break management ─────────────────────────────────
     * The designer two-column grid is converted to float layout in the JS clone
     * preparation above. Floated blocks fragment correctly across print pages.
     * We just need to ensure the columns and their children allow fragmentation.
     * ──────────────────────────────────────────────────────────── */

    /* Float columns: allow fragmentation and ensure block layout */
    .designer-column {
      break-inside: auto !important;
      page-break-inside: auto !important;
      overflow: visible !important;
      display: block !important;
      min-height: 0 !important;
    }
    .designer-column > .group\\/draggable,
    .designer-column section {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }

    /* Header: stay with the first row of content below it */
    header {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    .group\\/draggable {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }

    .group\/section {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }

    section h3, h3 {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    .group\/item,
    .relative.group\/item {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    ul > li {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    /*
     * Force entry containers to block layout in print.
     * Chrome refuses to fragment a flex container whose children all have
     * break-inside:avoid — it treats the whole flex box as one unbreakable unit
     * and pushes the entire section to the next page.
     * Switching to display:block restores per-entry fragmentation.
     */
    section > div.flex,
    section > ul.flex,
    .designer-column section > div.flex,
    .designer-column section > ul.flex {
      display: block !important;
    }
    /* Restore entry gap (flex gap is gone after the display change) — skip grid containers (e.g. language grid) */
    section > div:not(.grid) > .group\/item + .group\/item,
    section > ul > li + li {
      margin-top: var(--entry-gap, 8px);
    }
    /* Designer columns use flex gap in preview; display:block in print drops it */
    .designer-column > .group\\/draggable:not(:last-child) {
      margin-bottom: var(--section-gap, 8px);
    }
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
        const triggerPrint = () => {
          if (printed) return;
          printed = true;
          try {
            win.focus();
            win.print();
          } catch (err) {
            cleanup();
            reject(err);
            return;
          }
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
    clone.style.width = '794px';
    
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
        windowWidth: 794,
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
            style.textContent = `
              body {
                margin: 0 !important;
                padding: 0 !important;
              }
              .pdf-sheet.pdf-export,
              .pdf-export {
                min-height: auto !important;
                box-shadow: none !important;
              }
              .pdf-export::before,
              .pdf-export::after,
              .pdf-sheet.pdf-export::before,
              .pdf-sheet.pdf-export::after {
                display: none !important;
                content: none !important;
              }
              .pdf-export header {
                margin-top: 0 !important;
              }
              .pdf-export .pdf-keep,
              .pdf-export .group\\/logo {
                align-self: flex-start !important;
                flex-shrink: 0 !important;
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
                opacity: 0.5 !important;
              }
              .pdf-sheet img {
                display: inline-block !important;
                vertical-align: middle !important;
                height: auto !important;
                max-height: none !important;
              }
              .pdf-sheet svg.lucide,
              .pdf-sheet svg:not(.profile-photo-frame):not(.profile-photo-waves) {
                display: inline-block !important;
                vertical-align: middle !important;
                flex-shrink: 0 !important;
              }
              .pdf-sheet span.inline-flex.items-center,
              .pdf-sheet .inline-flex.items-center,
              .pdf-sheet .flex.items-start.gap-2,
              .pdf-sheet .flex.items-center.gap-1\\.5,
              .pdf-sheet .flex.items-center.gap-1,
              .pdf-sheet .flex.items-center.gap-2 {
                flex-direction: row !important;
                align-content: center !important;
              }
              .pdf-sheet span.inline-flex.items-center,
              .pdf-sheet .inline-flex.items-center,
              .pdf-sheet .flex.items-center.gap-1\\.5,
              .pdf-sheet .flex.items-center.gap-1,
              .pdf-sheet .flex.items-center.gap-2,
              .pdf-sheet header .flex.flex-wrap {
                align-items: center !important;
              }
              .pdf-sheet li.flex.gap-2,
              .pdf-sheet li.flex.gap-2\\.5,
              .pdf-sheet .flex.items-start.gap-2 {
                align-items: flex-start !important;
              }
              .pdf-sheet span.inline-flex.items-center > svg,
              .pdf-sheet span.inline-flex.items-center > img,
              .pdf-sheet li.flex > svg,
              .pdf-sheet li.flex > img,
              .pdf-sheet li.flex > span > svg,
              .pdf-sheet .flex.items-center > svg,
              .pdf-sheet .flex.items-start > span > svg,
              .pdf-sheet .flex.items-start > span > img {
                display: inline-block !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                vertical-align: middle !important;
              }
              .pdf-sheet .flex.flex-wrap.items-center.gap-1\\.5 {
                gap: 6px !important;
                row-gap: 6px !important;
                column-gap: 6px !important;
                align-items: center !important;
                align-content: flex-start !important;
              }
              .pdf-sheet .flex.flex-wrap.items-center.gap-1\\.5 > span,
              .pdf-sheet [data-skill-chip] {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-sizing: border-box !important;
                vertical-align: middle !important;
                line-height: 1.375 !important;
                white-space: nowrap !important;
              }
              .pdf-sheet header .flex.flex-wrap {
                align-items: center !important;
                row-gap: 6px !important;
                column-gap: 16px !important;
              }
              .pdf-sheet .pdf-keep {
                visibility: visible !important;
                opacity: 1 !important;
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
