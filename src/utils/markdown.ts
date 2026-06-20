/**
 * Convert `**bold**` markers to HTML `<strong>` tags for preview rendering.
 * HTML-escapes the input first so the output is safe to pass to
 * `dangerouslySetInnerHTML`.
 */
export function formatMarkdownBold(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
