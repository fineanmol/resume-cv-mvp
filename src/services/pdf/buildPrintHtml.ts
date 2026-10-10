import {
  designerFloatTransform,
  preserveAvatarShapesForPrint,
  resolveCloneImageUrls,
  stripAvatarPlaceholderStyles,
  stripEditOnlyFromClone,
} from './cloneSheet';
import { getPrintStyleBlock } from './printStyles';

/**
 * Build the exact print-document HTML used by the website Download PDF button.
 * Shared by PdfService.downloadPdf (iframe + window.print) and headless Playwright export.
 */
export function buildPrintHtml(sheetElement: HTMLElement, title = 'Resume'): string {
  let allStyles = '';
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules || sheet.rules;
      if (rules) {
        allStyles += Array.from(rules).map((r) => r.cssText).join('\n') + '\n';
      }
    } catch {
      // Cross-origin stylesheet — skip (fonts via <link> below)
    }
  }

  const fontLinks = Array.from(
    document.querySelectorAll(
      'link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]',
    ),
  )
    .map((l) => l.outerHTML)
    .join('\n');

  const clone = sheetElement.cloneNode(true) as HTMLElement;
  stripEditOnlyFromClone(clone, sheetElement);
  preserveAvatarShapesForPrint(clone, sheetElement);
  clone.querySelectorAll('.group\\/avatar').forEach(node=>{if(!node.querySelector('img'))node.remove();});
  designerFloatTransform(clone);
  stripAvatarPlaceholderStyles(clone);
  resolveCloneImageUrls(clone);

  const safeTitle = title.replace(/\.pdf$/i, '').replace(/[<>&"]/g, '');
  // Page margins repeat on every page; sheet padding only applies at document edges.
  const paddingPx=parseFloat(getComputedStyle(sheetElement).paddingTop)||0;
  const pageMarginMm=Math.max(10, Math.min(35,paddingPx*25.4/96));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  ${fontLinks}
  <style>
    ${allStyles}
    ${getPrintStyleBlock()}
    @page { size: A4; margin: ${pageMarginMm}mm 0; }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`;
}
