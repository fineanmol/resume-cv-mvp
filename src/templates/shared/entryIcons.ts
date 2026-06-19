/** Achievement / honors entry icons */
export const ACHIEVEMENT_ICON_NAMES = [
  'star', 'award', 'trophy', 'medal', 'ribbon', 'crown', 'target', 'flag', 'check',
  'zap', 'rocket', 'lightbulb', 'gem', 'shield', 'heart', 'terminal',
  'graduation-cap', 'badge-check', 'flame', 'trending-up', 'users', 'handshake',
  'megaphone', 'thumbs-up', 'sparkles', 'circle-check', 'brain', 'microscope', 'chart-line',
] as const;

/** Project / certification entry icons */
export const PROJECT_ICON_NAMES = [
  'briefcase', 'code', 'book', 'globe', 'folder', 'database', 'server', 'cloud',
  'smartphone', 'cpu', 'layers', 'palette', 'git-branch', 'box', 'terminal',
  'pen-tool', 'layout', 'monitor', 'blocks', 'package', 'ship', 'lock',
  'bar-chart', 'file-code', 'puzzle', 'bot', 'circuit-board', 'link', 'hammer',
  'building-2', 'webhook', 'radio', 'scan-line', 'star', 'trophy', 'target', 'award',
] as const;

export type AchievementIconName = (typeof ACHIEVEMENT_ICON_NAMES)[number];
export type ProjectIconName = (typeof PROJECT_ICON_NAMES)[number];

export const isAchievementIcon = (name?: string): name is AchievementIconName =>
  !!name && (ACHIEVEMENT_ICON_NAMES as readonly string[]).includes(name);

export const isProjectIcon = (name?: string): name is ProjectIconName =>
  !!name && (PROJECT_ICON_NAMES as readonly string[]).includes(name);
