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

export const PDF_COLOR_PROPS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
];

export const PDF_SVG_COLOR_PROPS = ['fill', 'stroke', 'stop-color'];

export function safeColor(value: string): string {
  if (!value || value === 'none') return value;
  const resolved = convertOklToRgb(value.trim());
  if (/oklch|oklab|color-mix/i.test(resolved)) return '#334155';
  return resolved;
}

export const DEEP_COLOR_PROPS = [
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
export function deepSanitizeColorsForTree(sourceRoot: Element, targetRoot: Element, win: Window) {
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
export function inlineElementColors(source: Element, target: Element, win: Window) {
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
