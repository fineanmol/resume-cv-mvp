/** Map free-text proficiency to 1–5 bubble count for language displays. */
export function getLanguageBubbleCount(levelText: string): number {
  const l = levelText.toLowerCase();
  if (
    l.includes("native") ||
    l.includes("fluent") ||
    l.includes("c2") ||
    l.includes("bilingual") ||
    l.includes("5")
  )
    return 5;
  if (
    l.includes("proficient") ||
    l.includes("advanced") ||
    l.includes("4") ||
    l.includes("c1")
  )
    return 4;
  if (
    l.includes("conversational") ||
    l.includes("intermediate") ||
    l.includes("upper") ||
    l.includes("3") ||
    l.includes("b1") ||
    l.includes("b2")
  )
    return 3;
  if (
    l.includes("beginner") ||
    l.includes("elementary") ||
    l.includes("basic") ||
    l.includes("1") ||
    l.includes("2") ||
    l.includes("a1") ||
    l.includes("a2")
  )
    return 2;
  return 3;
}

export const LANGUAGE_LEVELS_BY_BUBBLE = [
  'Beginner',
  'Elementary',
  'Intermediate',
  'Advanced',
  'Fluent',
] as const;

/** Map bubble count (1–5) back to a canonical proficiency label. */
export function getLanguageLevelFromBubbleCount(count: number): string {
  const clamped = Math.min(5, Math.max(1, Math.round(count)));
  return LANGUAGE_LEVELS_BY_BUBBLE[clamped - 1];
}
