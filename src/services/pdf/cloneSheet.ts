import { stripEditorFocusClasses } from '../../utils/editorFocus';
import {
  deepSanitizeColorsForTree,
  inlineElementColors,
  safeColor,
  sanitizeCssOklch,
} from './colorSanitizer';
import { inlineLayoutStyles } from './layoutInliner';

/** Walk source/target trees in parallel and inline colors + layout from the live DOM. */
export function syncStylesFromSource(sourceRoot: Element, targetRoot: Element, sourceWin: Window) {
  const sources = [sourceRoot, ...Array.from(sourceRoot.querySelectorAll('*'))];
  const targets = [targetRoot, ...Array.from(targetRoot.querySelectorAll('*'))];
  const len = Math.min(sources.length, targets.length);
  for (let i = 0; i < len; i++) {
    inlineElementColors(sources[i], targets[i], sourceWin);
    inlineLayoutStyles(sources[i], targets[i], sourceWin);
  }
}

export function inlineAllResolvedColors(root: Element, win: Window) {
  for (const el of [root, ...Array.from(root.querySelectorAll('*'))]) {
    inlineElementColors(el, el, win);
  }
}

export function stripClonedDocStyles(clonedDoc: Document) {
  clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => el.remove());
}

/** Copy computed border-radius from live avatar nodes so print/PDF keeps circle/rounded shapes. */
export function preserveAvatarShapesForPrint(clone: HTMLElement, source: HTMLElement) {
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

export function injectSanitizedStyles(clonedDoc: Document) {
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

export function sanitizeInlineStyles(root: Element) {
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

/** Strip editor-only chrome and restore print state on a cloned sheet. */
export function stripEditOnlyFromClone(clone: HTMLElement, sheetElement: HTMLElement) {
  stripEditorFocusClasses(clone);
  clone.querySelectorAll('.edit-only, [data-pdf-hide]').forEach((el) => el.remove());
  clone.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'));

  if (sheetElement.querySelector('header[data-show-title="false"]')) {
    clone.querySelectorAll('[data-header-subtitle]').forEach((el) => el.remove());
  }

  // Reset any preview page-break margin adjustments (data-pb-push) so they
  // don't affect the PDF layout — the browser's print engine handles breaks itself.
  clone.querySelectorAll<HTMLElement>('[data-pb-push]').forEach((el) => {
    el.style.marginTop = el.getAttribute('data-pb-orig') ?? '';
    el.removeAttribute('data-pb-push');
    el.removeAttribute('data-pb-orig');
  });
}

/**
 * Designer template: convert two-column grid → float layout.
 * CSS Grid with a single row is an atomic formatting context in Chrome's
 * print engine: Chrome cannot fragment between columns in a row, so it
 * moves the ENTIRE grid to the next page when it doesn't fit after the
 * header (leaving header alone on page 1, all sections on page 2).
 * Floated blocks CAN be fragmented across pages by Chrome, so we replace
 * the grid with a float-based layout only in the PDF clone.
 */
export function designerFloatTransform(clone: HTMLElement) {
  const designerGrid = clone.querySelector<HTMLElement>('[data-testid="designer-column-grid"]');
  if (!designerGrid) return;

  const [leftCol, rightCol] = Array.from(
    designerGrid.querySelectorAll<HTMLElement>(':scope > .designer-column')
  );
  if (!leftCol || !rightCol) return;

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

/** Strip the gray placeholder background and shadow from the avatar container. */
export function stripAvatarPlaceholderStyles(clone: HTMLElement) {
  clone.querySelectorAll('.group\\/avatar > div').forEach((el) => {
    if (el instanceof HTMLElement) {
      el.style.backgroundColor = 'transparent';
      el.style.boxShadow = 'none';
    }
  });
  // Belt-and-suspenders: also strip the class so Tailwind's CSS rule no longer applies
  clone.querySelectorAll('[class*="bg-slate-100"]').forEach((el) => {
    el.className = el.className
      .replace(/\bbg-slate-100(?:\/\d+)?\b/g, '')
      .replace(/\bshadow-sm\b/g, '')
      .trim();
  });
}

/** Force all images to absolute URLs (iframe is about:blank, relative hrefs break). */
export function resolveCloneImageUrls(clone: HTMLElement) {
  clone.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('data:') && !src.startsWith('http')) {
      img.src = new URL(src, window.location.href).href;
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

export function prepareSheetForExport(clone: HTMLElement, sheetElement: HTMLElement): number {
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

export function finalizePdfClone(clone: HTMLElement, source: HTMLElement, win: Window) {
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
