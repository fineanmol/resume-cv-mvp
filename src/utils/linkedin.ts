/** Normalize LinkedIn profile URLs for href attributes. */
export function formatLinkedinUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('linkedin.com') || trimmed.startsWith('www.linkedin.com')) {
    return `https://${trimmed}`;
  }
  if (trimmed.startsWith('in/')) {
    return `https://linkedin.com/${trimmed}`;
  }
  return `https://linkedin.com/in/${trimmed}`;
}
