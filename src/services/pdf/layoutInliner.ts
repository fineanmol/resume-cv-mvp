import { safeColor } from './colorSanitizer';

/** Layout props safe to copy without breaking the PDF clone positioning. */
export const PDF_LAYOUT_PROPS = [
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

export function inlineLayoutStyles(source: Element, target: Element, win: Window) {
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
