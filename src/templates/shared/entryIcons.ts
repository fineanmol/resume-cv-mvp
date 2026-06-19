/** Achievement / honors entry icons */
export const ACHIEVEMENT_ICON_NAMES = [
  'star', 'award', 'trophy', 'medal', 'ribbon', 'crown', 'target', 'flag', 'check',
  'zap', 'rocket', 'lightbulb', 'gem', 'shield', 'heart', 'terminal',
] as const;

/** Project / certification entry icons */
export const PROJECT_ICON_NAMES = [
  'briefcase', 'code', 'book', 'globe', 'folder', 'database', 'server', 'cloud',
  'smartphone', 'cpu', 'layers', 'palette', 'git-branch', 'box', 'terminal',
  'star', 'trophy', 'target', 'award',
] as const;

export type AchievementIconName = (typeof ACHIEVEMENT_ICON_NAMES)[number];
export type ProjectIconName = (typeof PROJECT_ICON_NAMES)[number];

export const isAchievementIcon = (name?: string): name is AchievementIconName =>
  !!name && (ACHIEVEMENT_ICON_NAMES as readonly string[]).includes(name);

export const isProjectIcon = (name?: string): name is ProjectIconName =>
  !!name && (PROJECT_ICON_NAMES as readonly string[]).includes(name);
