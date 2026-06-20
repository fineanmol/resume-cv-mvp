/**
 * Splits a bullet string (which may have inline bullet indicators or newlines)
 * into an array of clean individual bullet strings.
 */
export function splitIntoBullets(bullets: string): string[] {
  if (!bullets) return [];
  
  // Split by newlines first
  const rawLines = bullets.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const finalBullets: string[] = [];
  
  // Regex matching common bullet characters or space-dash-space / space-asterisk-space
  const bulletSplitRegex = /[•●▪◦\u2022\u25cf\u25aa\u25e6\u2043\u25a0✦■⁃]|\s+[-*]\s+/;
  
  for (const line of rawLines) {
    if (bulletSplitRegex.test(line)) {
      const parts = line.split(bulletSplitRegex).map(p => p.trim()).filter(Boolean);
      for (const part of parts) {
        const cleaned = cleanLeadingBullet(part);
        if (cleaned) {
          finalBullets.push(cleaned);
        }
      }
    } else {
      const cleaned = cleanLeadingBullet(line);
      if (cleaned) {
        finalBullets.push(cleaned);
      }
    }
  }
  
  return finalBullets.length > 0 ? finalBullets : [bullets];
}

/**
 * Strips leading bullet characters/symbols (like •, ●, ▪, -, *) from the string.
 * Avoids stripping negative signs from numbers (e.g. -5% latency) by requiring
 * space after plain dashes or asterisks.
 */
export function cleanLeadingBullet(text: string): string {
  return text.trim().replace(/^[•●▪◦\u2022\u25cf\u25aa\u25e6\u2043\u25a0✦■⁃]\s*|^[-*]\s+/, '');
}

/**
 * Strips markdown bold syntax (**text**) from a string, leaving plain text.
 * Used as a defense-in-depth sanitiser on AI-generated bullet content.
 */
export function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*([^*\n]+)\*\*/g, '$1');
}
