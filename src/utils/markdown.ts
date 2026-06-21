/**
 * Convert common inline Markdown markers to HTML tags for preview rendering.
 * HTML-escapes the input first so the output is safe to pass to
 * `dangerouslySetInnerHTML`.
 *
 * Supported markers (double markers processed before single to avoid conflicts):
 *   **text**   → <strong>text</strong>
 *   __text__   → <u>text</u>
 *   ~~text~~   → <s>text</s>
 *   *text*     → <em>text</em>
 *   _text_     → <em>text</em>
 */
export function formatMarkdownInline(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');
}

/** @deprecated Use `formatMarkdownInline` instead. */
export const formatMarkdownBold = formatMarkdownInline;

/**
 * Walk a DOM node tree and convert formatting tags back to markdown markers.
 * Internal helper for `htmlToMarkdown`.
 */
function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }
  const el = node as Element;
  const tag = el.tagName?.toLowerCase() ?? '';
  const children = Array.from(node.childNodes).map(nodeToMarkdown).join('');
  const style = el instanceof HTMLElement ? el.style : null;

  const isBold =
    tag === 'strong' || tag === 'b' ||
    style?.fontWeight === 'bold' || style?.fontWeight === '700';
  const isItalic =
    tag === 'em' || tag === 'i' || style?.fontStyle === 'italic';
  const isUnderline =
    tag === 'u' || (style?.textDecoration ?? '').includes('underline');
  const isStrike =
    tag === 's' || tag === 'del' || tag === 'strike' ||
    (style?.textDecoration ?? '').includes('line-through');

  if (isBold) return `**${children}**`;
  if (isItalic) return `*${children}*`;
  if (isUnderline) return `__${children}__`;
  if (isStrike) return `~~${children}~~`;
  if (tag === 'br') return '';
  return children;
}

/**
 * Convert an HTML string (from a `contentEditable` element) back to inline markdown.
 * Inverse of `formatMarkdownInline` for the formatting tags it produces.
 *
 *   <strong> / <b>  → **...**
 *   <em> / <i>      → *...*
 *   <u>             → __...__
 *   <s> / <del>     → ~~...~~
 *   All other tags  → stripped (text content preserved)
 *
 * Handles inline styles for bold/italic/underline/strikethrough as well,
 * which covers output from `document.execCommand`.
 */
export function htmlToMarkdown(html: string): string {
  if (typeof document === 'undefined') {
    // SSR / test fallback: strip all tags
    return html.replace(/<[^>]*>/g, '');
  }
  const container = document.createElement('div');
  container.innerHTML = html;
  return nodeToMarkdown(container);
}
