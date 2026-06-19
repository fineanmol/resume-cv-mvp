import React, { useState, useEffect, useRef } from 'react';
import {
  Star, Award, Trophy, Target, Terminal, Flag, Check,
  Briefcase, Code, Book, Globe,
} from 'lucide-react';

export const renderAchievementIcon = (iconName?: string, accentColor?: string, className = "w-3 h-3 flex-shrink-0 mt-0.5") => {
  const color = accentColor || "#314855";
  const bgStyle = {
    backgroundColor: `${color}15`,
    padding: '4px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color,
    width: '20px',
    height: '20px',
    flexShrink: 0
  };
  const fill = `${color}cc`;
  let iconNode: React.ReactNode;
  switch (iconName) {
    case 'star':    iconNode = <Star className="w-3.5 h-3.5" fill={fill} stroke={color} strokeWidth={2} />; break;
    case 'award':   iconNode = <Award className="w-3.5 h-3.5" fill={fill} stroke={color} strokeWidth={2} />; break;
    case 'trophy':  iconNode = <Trophy className="w-3.5 h-3.5" fill={fill} stroke={color} strokeWidth={2} />; break;
    case 'target':  iconNode = <Target className="w-3.5 h-3.5" stroke={color} strokeWidth={2.5} />; break;
    case 'terminal':iconNode = <Terminal className="w-3.5 h-3.5" stroke={color} strokeWidth={2.5} />; break;
    case 'flag':    iconNode = <Flag className="w-3.5 h-3.5" fill={fill} stroke={color} strokeWidth={2} />; break;
    case 'check':   iconNode = <Check className="w-3.5 h-3.5" stroke={color} strokeWidth={3} />; break;
    default:        iconNode = <Star className="w-3.5 h-3.5" fill={fill} stroke={color} strokeWidth={2} />;
  }
  return (
    <span style={bgStyle} className={`${className} !mt-0 !p-1 inline-flex items-center justify-center`}>
      {iconNode}
    </span>
  );
};

export const getDynamicAchievementIcon = (idx: number, title: string, customIcon?: string, accentColor?: string, className = "w-3 h-3 flex-shrink-0 mt-0.5") => {
  const validIcons = ['star', 'award', 'trophy', 'target', 'terminal', 'flag', 'check'];
  if (customIcon && validIcons.includes(customIcon)) return renderAchievementIcon(customIcon, accentColor, className);
  const t = title.toLowerCase();
  if (t.includes('rockstar') || t.includes('award') || t.includes('first') || t.includes('place') || t.includes('won')) return renderAchievementIcon('trophy', accentColor, className);
  if (t.includes('medal') || t.includes('bronze') || t.includes('silver') || t.includes('gold') || t.includes('academic') || t.includes('score')) return renderAchievementIcon('award', accentColor, className);
  if (t.includes('hackathon') || t.includes('participat') || t.includes('world') || t.includes('smart')) return renderAchievementIcon('target', accentColor, className);
  if (t.includes('digitalocean') || t.includes('github') || t.includes('open source') || t.includes('event') || t.includes('code') || t.includes('hacktoberfest')) return renderAchievementIcon('terminal', accentColor, className);
  switch (idx % 4) {
    case 0: return renderAchievementIcon('trophy', accentColor, className);
    case 1: return renderAchievementIcon('award', accentColor, className);
    case 2: return renderAchievementIcon('target', accentColor, className);
    default: return renderAchievementIcon('terminal', accentColor, className);
  }
};

export const AchievementIconPicker: React.FC<{
  currentIcon: string;
  onChange: (icon: string) => void;
  isEditable: boolean;
  accentColor?: string;
}> = ({ currentIcon, onChange, isEditable, accentColor }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);
  const icons = ['star', 'award', 'trophy', 'target', 'terminal', 'flag', 'check'] as const;
  if (!isEditable) return getDynamicAchievementIcon(0, '', currentIcon, accentColor, "w-3 h-3 flex-shrink-0 mt-0.5");
  return (
    <div className="relative inline-block edit-only" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="hover:scale-125 transition flex-shrink-0 mt-0.5 flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 p-0.5 rounded cursor-pointer"
        type="button" title="Change Icon"
      >
        {getDynamicAchievementIcon(0, '', currentIcon, accentColor, "w-3.5 h-3.5")}
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-40 bg-white border border-slate-200 shadow-lg rounded-md p-1.5 flex gap-1 edit-only">
          {icons.map(icon => (
            <button key={icon} type="button"
              onClick={() => { onChange(icon); setOpen(false); }}
              className={`p-1 hover:bg-slate-100 rounded cursor-pointer transition-colors ${currentIcon === icon ? 'bg-slate-100' : ''}`}
            >
              {getDynamicAchievementIcon(0, '', icon, accentColor, "w-3.5 h-3.5")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const renderProjectIcon = (iconName?: string, accentColor?: string, className = "w-3 h-3 flex-shrink-0 mt-0.5") => {
  const color = accentColor || "#314855";
  const bgStyle = {
    backgroundColor: `${color}15`,
    padding: '4px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color,
    width: '20px',
    height: '20px',
    flexShrink: 0
  };
  const fill = `${color}cc`;
  let iconNode: React.ReactNode;
  switch (iconName) {
    case 'briefcase': iconNode = <Briefcase className="w-3.5 h-3.5" fill={fill} stroke={color} strokeWidth={2} />; break;
    case 'code':      iconNode = <Code className="w-3.5 h-3.5" stroke={color} strokeWidth={2.5} />; break;
    case 'book':      iconNode = <Book className="w-3.5 h-3.5" fill={fill} stroke={color} strokeWidth={2} />; break;
    case 'globe':     iconNode = <Globe className="w-3.5 h-3.5" stroke={color} strokeWidth={2.5} />; break;
    case 'star':      iconNode = <Star className="w-3.5 h-3.5" fill={fill} stroke={color} strokeWidth={2} />; break;
    case 'award':     iconNode = <Award className="w-3.5 h-3.5" fill={fill} stroke={color} strokeWidth={2} />; break;
    case 'trophy':    iconNode = <Trophy className="w-3.5 h-3.5" fill={fill} stroke={color} strokeWidth={2} />; break;
    case 'target':    iconNode = <Target className="w-3.5 h-3.5" stroke={color} strokeWidth={2.5} />; break;
    case 'terminal':  iconNode = <Terminal className="w-3.5 h-3.5" stroke={color} strokeWidth={2.5} />; break;
    case 'flag':      iconNode = <Flag className="w-3.5 h-3.5" fill={fill} stroke={color} strokeWidth={2} />; break;
    case 'check':     iconNode = <Check className="w-3.5 h-3.5" stroke={color} strokeWidth={3} />; break;
    default:          iconNode = <Briefcase className="w-3.5 h-3.5" fill={fill} stroke={color} strokeWidth={2} />;
  }
  return (
    <span style={bgStyle} className={`${className} !mt-0 !p-1 inline-flex items-center justify-center`}>
      {iconNode}
    </span>
  );
};

export const getDynamicProjectIcon = (idx: number, title: string, customIcon?: string, accentColor?: string, className = "w-3 h-3 flex-shrink-0 mt-0.5") => {
  const validIcons = ['briefcase', 'code', 'book', 'globe', 'star', 'award', 'trophy', 'target', 'terminal', 'flag', 'check'];
  if (customIcon && validIcons.includes(customIcon)) return renderProjectIcon(customIcon, accentColor, className);
  const t = title.toLowerCase();
  if (t.includes('web') || t.includes('app') || t.includes('site') || t.includes('portfolio') || t.includes('online')) return renderProjectIcon('globe', accentColor, className);
  if (t.includes('code') || t.includes('software') || t.includes('program') || t.includes('develop') || t.includes('system')) return renderProjectIcon('code', accentColor, className);
  if (t.includes('cert') || t.includes('course') || t.includes('degree') || t.includes('train') || t.includes('learn')) return renderProjectIcon('book', accentColor, className);
  if (t.includes('work') || t.includes('job') || t.includes('company') || t.includes('client') || t.includes('consult')) return renderProjectIcon('briefcase', accentColor, className);
  switch (idx % 4) {
    case 0: return renderProjectIcon('briefcase', accentColor, className);
    case 1: return renderProjectIcon('code', accentColor, className);
    case 2: return renderProjectIcon('book', accentColor, className);
    default: return renderProjectIcon('globe', accentColor, className);
  }
};
