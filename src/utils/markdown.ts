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
