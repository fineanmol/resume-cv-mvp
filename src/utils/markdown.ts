/** Convert `**bold**` markers to HTML strong tags for preview rendering. */
export function formatMarkdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
