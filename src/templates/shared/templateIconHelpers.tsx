import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Star, Award, Trophy, Target, Terminal, Flag, Check,
  Briefcase, Code, Book, Globe, Medal, Ribbon, Crown, Zap, Rocket,
  Lightbulb, Gem, Shield, Heart, Folder, Database, Server, Cloud,
  Smartphone, Cpu, Layers, Palette, GitBranch, Box,
} from 'lucide-react';
import { isAchievementIcon, isProjectIcon } from './entryIcons';

/** Entry icons use primary brand color only (no per-item color mixing). */
export const accentColorForIndex = (
  _idx: number,
  brandColor: string,
): string => brandColor || '#314855';

const ICON_MAP: Record<string, LucideIcon> = {
  star: Star,
  award: Award,
  trophy: Trophy,
  target: Target,
  terminal: Terminal,
  flag: Flag,
  check: Check,
  briefcase: Briefcase,
  code: Code,
  book: Book,
  globe: Globe,
  medal: Medal,
  ribbon: Ribbon,
  crown: Crown,
  zap: Zap,
  rocket: Rocket,
  lightbulb: Lightbulb,
  gem: Gem,
  shield: Shield,
  heart: Heart,
  folder: Folder,
  database: Database,
  server: Server,
  cloud: Cloud,
  smartphone: Smartphone,
  cpu: Cpu,
  layers: Layers,
  palette: Palette,
  'git-branch': GitBranch,
  box: Box,
};

const STROKE_HEAVY = new Set([
  'target', 'terminal', 'code', 'globe', 'cpu', 'cloud', 'smartphone', 'git-branch', 'check',
]);

export const renderEntryIcon = (
  iconName?: string,
  accentColor?: string,
  className = 'w-3 h-3 flex-shrink-0 mt-0.5',
) => {
  const color = accentColor || '#314855';
  const name = iconName && ICON_MAP[iconName] ? iconName : 'star';
  const Icon = ICON_MAP[name] ?? Star;
  const fill = color;
  const fillOpacity = STROKE_HEAVY.has(name) ? (name === 'check' ? undefined : 0.2) : undefined;
  const strokeWidth = name === 'check' ? 3 : STROKE_HEAVY.has(name) ? 2 : 1.5;

  const bgStyle: React.CSSProperties = {
    backgroundColor: `${color}15`,
    padding: '4px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
    width: '20px',
    height: '20px',
    flexShrink: 0,
  };

  return (
    <span style={bgStyle} className={`${className} !mt-0 !p-1 inline-flex items-center justify-center`}>
      <Icon
        className="w-3.5 h-3.5"
        fill={name === 'check' ? undefined : fill}
        fillOpacity={fillOpacity}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </span>
  );
};

export const renderAchievementIcon = (
  iconName?: string,
  accentColor?: string,
  className = 'w-3 h-3 flex-shrink-0 mt-0.5',
) => renderEntryIcon(iconName, accentColor, className);

export const renderProjectIcon = (
  iconName?: string,
  accentColor?: string,
  className = 'w-3 h-3 flex-shrink-0 mt-0.5',
) => renderEntryIcon(iconName, accentColor, className);

export const getDynamicAchievementIcon = (
  idx: number,
  title: string,
  customIcon?: string,
  brandColor?: string,
  className = 'w-3 h-3 flex-shrink-0 mt-0.5',
  accentColor2?: string,
) => {
  void accentColor2;
  const accentColor = accentColorForIndex(idx, brandColor || '#314855');
  if (customIcon && isAchievementIcon(customIcon)) {
    return renderEntryIcon(customIcon, accentColor, className);
  }
  const t = title.toLowerCase();
  if (t.includes('rockstar') || t.includes('award') || t.includes('first') || t.includes('place') || t.includes('won')) {
    return renderEntryIcon('trophy', accentColor, className);
  }
  if (t.includes('medal') || t.includes('bronze') || t.includes('silver') || t.includes('gold') || t.includes('academic') || t.includes('score')) {
    return renderEntryIcon('medal', accentColor, className);
  }
  if (t.includes('hackathon') || t.includes('participat') || t.includes('world') || t.includes('smart')) {
    return renderEntryIcon('target', accentColor, className);
  }
  if (t.includes('digitalocean') || t.includes('github') || t.includes('open source') || t.includes('event') || t.includes('code') || t.includes('hacktoberfest')) {
    return renderEntryIcon('terminal', accentColor, className);
  }
  const defaults = ['trophy', 'award', 'target', 'rocket'] as const;
  return renderEntryIcon(defaults[idx % defaults.length], accentColor, className);
};

export const getDynamicProjectIcon = (
  idx: number,
  title: string,
  customIcon?: string,
  brandColor?: string,
  className = 'w-3 h-3 flex-shrink-0 mt-0.5',
  accentColor2?: string,
) => {
  void accentColor2;
  const accentColor = accentColorForIndex(idx, brandColor || '#314855');
  if (customIcon && isProjectIcon(customIcon)) {
    return renderEntryIcon(customIcon, accentColor, className);
  }
  const t = title.toLowerCase();
  if (t.includes('web') || t.includes('app') || t.includes('site') || t.includes('portfolio') || t.includes('online')) {
    return renderEntryIcon('globe', accentColor, className);
  }
  if (t.includes('code') || t.includes('software') || t.includes('program') || t.includes('develop') || t.includes('system')) {
    return renderEntryIcon('code', accentColor, className);
  }
  if (t.includes('cert') || t.includes('course') || t.includes('degree') || t.includes('train') || t.includes('learn')) {
    return renderEntryIcon('book', accentColor, className);
  }
  if (t.includes('work') || t.includes('job') || t.includes('company') || t.includes('client') || t.includes('consult')) {
    return renderEntryIcon('briefcase', accentColor, className);
  }
  if (t.includes('mobile') || t.includes('ios') || t.includes('android')) {
    return renderEntryIcon('smartphone', accentColor, className);
  }
  if (t.includes('data') || t.includes('api') || t.includes('backend')) {
    return renderEntryIcon('database', accentColor, className);
  }
  const defaults = ['briefcase', 'code', 'folder', 'globe'] as const;
  return renderEntryIcon(defaults[idx % defaults.length], accentColor, className);
};
