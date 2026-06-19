import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
import type { ResumeState, ExperienceItem, EducationItem, CertItem, AchievementItem, LanguageItem } from '../types';
import {
  Star, Award, Phone, Mail, MapPin, ExternalLink, Trophy, Target, Terminal, Flag, Check,
  Plus, Settings, Trash2, ArrowLeft, ArrowRight, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ArrowUp, ArrowDown, Briefcase, Code, Book, Globe, Upload, Building2, GraduationCap
} from 'lucide-react';

export const ActiveSectionContext = createContext<{
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  handleMoveSectionUpDown: (id: string, dir: 'up' | 'down') => void;
  handleMoveItemUpDown: (sectionId: string, index: number, dir: 'up' | 'down') => void;
} | null>(null);
import { FONT_CSS } from '../config/fonts';
import { TemplateHeader, formatLinkedinUrl } from './TemplateHeader';
import { splitIntoBullets } from '../utils/bullets';

interface ResumeTemplateProps {
  state: ResumeState;
  isEditable?: boolean;
  onFieldChange?: (field: keyof ResumeState, value: any) => void;
  onExperienceChange?: (index: number, field: keyof ExperienceItem, value: string) => void;
  onEducationChange?: (index: number, field: keyof EducationItem, value: string) => void;
  onCertChange?: (index: number, field: keyof CertItem, value: string) => void;
  onAchievementChange?: (index: number, field: keyof AchievementItem, value: string) => void;
  onLanguageChange?: (index: number, field: keyof LanguageItem, value: string) => void;
  // Add/Delete callbacks (passed from App.tsx)
  onAddExperience?: () => void;
  onDeleteExperience?: (index: number) => void;
  onAddEducation?: () => void;
  onDeleteEducation?: (index: number) => void;
  onAddCert?: () => void;
  onDeleteCert?: (index: number) => void;
  onAddAchievement?: () => void;
  onDeleteAchievement?: (index: number) => void;
  onAddLanguage?: () => void;
  onDeleteLanguage?: (index: number) => void;
  // Layout settings
  onLayoutSettingsChange?: (patch: Partial<any>) => void;
}

// ─── Shared editable span ────────────────────────────────────────────────────
interface EditableProps {
  value: string;
  className?: string;
  onSave: (val: string) => void;
  isEditable: boolean;
  editableClass: string;
  tag?: 'span' | 'p' | 'strong' | 'div' | 'h1' | 'h2' | 'h3' | 'a';
  style?: React.CSSProperties;
  dangerousInnerHtml?: string;
  href?: string;
}
const E: React.FC<EditableProps> = ({ value, className, onSave, isEditable, editableClass, tag = 'span', style, dangerousInnerHtml, href }) => {
  const Tag = tag;
  if (isEditable) {
    return (
      <Tag
        data-href={href}
        className={`${className || ''} ${editableClass}`}
        style={style}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={(e) => {
          const txt = (e.currentTarget as HTMLElement).textContent || '';
          if (txt !== value) onSave(txt);
        }}
      >
        {value}
      </Tag>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${className || ''} hover:underline cursor-pointer`} style={style}>
        {value}
      </a>
    );
  }
  if (dangerousInnerHtml !== undefined) {
    return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: dangerousInnerHtml }} />;
  }
  return <Tag className={className} style={style}>{value}</Tag>;
};

// ─── Bullet list renderer ─────────────────────────────────────────────────────
function BulletList({
  bullets, isEditable, editableClass, onBulletChange, className = '', bulletStyle = 'disc', brandColor, align = 'left'
}: {
  bullets: string; isEditable: boolean; editableClass: string;
  onBulletChange: (updated: string) => void; className?: string;
  bulletStyle?: 'disc' | 'circle' | 'square' | 'dash' | 'arrow' | 'number' | 'none';
  brandColor?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
}) {
  const lines = splitIntoBullets(bullets);
  if (!lines.length) return null;

  const getMarker = (index: number) => {
    switch (bulletStyle) {
      case 'none':
        return null;
      case 'dash':
        return <span style={{ color: brandColor }} className="select-none font-semibold">—</span>;
      case 'arrow':
        return <span style={{ color: brandColor }} className="select-none text-[8px] align-middle">➤</span>;
      case 'number':
        return <span style={{ color: brandColor }} className="select-none font-semibold text-[10px]">{index + 1}.</span>;
      case 'circle':
        return <span style={{ color: brandColor }} className="select-none text-[8px] align-middle">○</span>;
      case 'square':
        return <span style={{ color: brandColor }} className="select-none text-[7px] align-middle">■</span>;
      case 'disc':
      default:
        return <span style={{ color: brandColor }} className="select-none text-[8px] align-middle">●</span>;
    }
  };

  const hasCustomMarker = bulletStyle !== 'none';

  return (
    <ul className={`list-none pl-0 space-y-1 ${className}`}>
      {lines.map((bullet, bIdx) => (
        <li key={bIdx} className="flex items-start">
          {hasCustomMarker && (
            <span contentEditable={false} className="flex-shrink-0 mt-[4px] select-none flex items-center justify-start text-[10px] w-4">
              {getMarker(bIdx)}
            </span>
          )}
          {isEditable ? (
            <span
              className={`flex-1 min-w-0 text-${align} ${editableClass}`}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                const updated = [...lines];
                updated[bIdx] = e.currentTarget.textContent || '';
                onBulletChange(updated.join('\n'));
              }}
            >
              {bullet}
            </span>
          ) : (
            <span
              className={`flex-1 min-w-0 text-${align}`}
              dangerouslySetInnerHTML={{ __html: formatMarkdownBold(bullet) }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

// ─── LinkedIn icon — module-level so it's not recreated each render ──────────
const LI: React.FC = () => (
  <svg className="w-3 h-3 flex-shrink-0 mt-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);

const WorkLink: React.FC<{ url?: string; brandColor?: string }> = ({ url, brandColor }) => {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-href={url}
      className="inline-flex items-center ml-1.5 hover:opacity-80 transition flex-shrink-0 align-middle cursor-pointer"
      style={{ color: brandColor }}
      title={url}
    >
      <ExternalLink className="w-3 h-3 mt-[1px]" />
    </a>
  );
};

// ─── Achievement Icon Rendering ────────────────────────────────────────────────
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

const AchievementIconPicker: React.FC<{
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

// ─── Project Icon Rendering ────────────────────────────────────────────────────
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


const SkillsEditor: React.FC<{
  value: string;
  isEditable: boolean;
  ec: string;
  onSave: (v: string) => void;
  accentColor2?: string;
  brandColor: string;
  badgeStyle: (i: number) => React.CSSProperties;
  defaultBadgeStyle?: React.CSSProperties;
  className?: string;
  skillsStyle?: 'chips' | 'normal';
}> = ({ value, isEditable, ec, onSave, accentColor2, brandColor, badgeStyle, defaultBadgeStyle, className = '', skillsStyle = 'chips' }) => {
  const [focusedSkillIdx, setFocusedSkillIdx] = useState<number | null>(null);
  const skillsList = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  // Focus a newly added "New Skill" chip
  useEffect(() => {
    if (!isEditable) return;
    const idx = skillsList.length - 1;
    if (idx >= 0 && skillsList[idx] === 'New Skill') {
      const el = document.querySelector(`[data-skill-index="${idx}"]`) as HTMLElement | null;
      if (el) {
        el.focus();
        try {
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(el);
          sel?.removeAllRanges();
          sel?.addRange(range);
        } catch (err) {
          console.warn('Failed to set selection range:', err);
        }
      }
    }
  }, [skillsList.length, isEditable]);

  // Focus raw editable area when editing mode is switched on — removed (no separate mode now)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (sourceIndexStr === '') return;
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const list = [...skillsList];
    const [draggedItem] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, draggedItem);
    onSave(list.join(', '));
  };

  const fallbackDefaultStyle = defaultBadgeStyle || { background: brandColor, color: '#fff' };

  if (skillsStyle === 'normal') {
    if (!isEditable) {
      return (
        <p className={`text-xs text-slate-700 leading-relaxed ${className}`}>
          {value}
        </p>
      );
    }
    return (
      <E
        tag="p"
        value={value}
        isEditable={true}
        editableClass={ec}
        className={`text-xs text-slate-700 leading-relaxed w-full ${className}`}
        onSave={onSave}
      />
    );
  }

  if (!isEditable) {
    return (
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs ${className}`}>
        {skillsList.map((s, i) => {
          const baseStyle = accentColor2 ? badgeStyle(i) : fallbackDefaultStyle;
          return (
            <span key={i} className="inline-block align-middle text-center px-2 rounded font-medium border"
              style={{ ...baseStyle, height: '1.8em', lineHeight: '1.8em', paddingTop: 0, paddingBottom: 0 }}>
              {s}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs w-full ${className}`}>
        {skillsList.map((s, i) => {
          const baseStyle = accentColor2 ? badgeStyle(i) : fallbackDefaultStyle;
          return (
            <span
              key={i}
              draggable={focusedSkillIdx === null}
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, i)}
              className="inline-flex items-center gap-0.5 pl-2 pr-1 rounded font-medium border cursor-text hover:border-slate-400 focus-within:border-teal-400 transition-all duration-150 relative group/chip"
              style={{ ...baseStyle, height: '1.8em', lineHeight: '1.8em', paddingTop: 0, paddingBottom: 0 }}
            >
              <span
                contentEditable={true}
                suppressContentEditableWarning={true}
                className="outline-none px-0.5 rounded min-w-[20px]"
                onFocus={() => setFocusedSkillIdx(i)}
                onBlur={(e) => {
                  setFocusedSkillIdx(null);
                  const text = e.currentTarget.textContent?.trim() || '';
                  const list = [...skillsList];
                  if (text === '') {
                    list.splice(i, 1);
                  } else if (text !== s) {
                    list[i] = text;
                  }
                  onSave(list.join(', '));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const text = e.currentTarget.textContent?.trim() || '';
                    const list = [...skillsList];
                    if (text === '') {
                      list.splice(i, 1);
                    } else {
                      list[i] = text;
                    }
                    list.splice(i + 1, 0, 'New Skill');
                    onSave(list.join(', '));
                    setTimeout(() => {
                      const nextEl = document.querySelector(`[data-skill-index="${i + 1}"]`) as HTMLElement | null;
                      if (nextEl) {
                        nextEl.focus();
                        try {
                          const range = document.createRange();
                          const sel = window.getSelection();
                          range.selectNodeContents(nextEl);
                          sel?.removeAllRanges();
                          sel?.addRange(range);
                        } catch {}
                      }
                    }, 50);
                  } else if (e.key === 'Backspace') {
                    const text = e.currentTarget.textContent?.trim() || '';
                    if (text === '') {
                      e.preventDefault();
                      const list = [...skillsList];
                      list.splice(i, 1);
                      onSave(list.join(', '));
                    }
                  }
                }}
                data-skill-index={i}
                title="Click to edit · Enter to add next · Backspace on empty to delete"
              >
                {s}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const list = [...skillsList];
                  list.splice(i, 1);
                  onSave(list.join(', '));
                }}
                className="text-current bg-black/20 hover:bg-black/40 rounded-full w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition-opacity font-bold text-[9px] cursor-pointer ml-0.5 flex-shrink-0"
                title="Remove skill"
                type="button"
              >
                ×
              </button>
            </span>
          );
        })}

        {/* Inline "+" button to add a new skill directly */}
        <button
          type="button"
          onClick={() => {
            const list = [...skillsList, 'New Skill'];
            onSave(list.join(', '));
          }}
          className="edit-only inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 hover:bg-teal-100 text-slate-400 hover:text-teal-600 border border-dashed border-slate-300 hover:border-teal-400 transition-colors cursor-pointer text-[11px] font-bold flex-shrink-0"
          title="Add skill"
        >
          +
        </button>
      </div>
    </div>
  );
};

// ─── Item Logo with Upload / URL Popover ─────────────────────────────────────
const ItemLogo: React.FC<{
  logo?: string;
  brandColor: string;
  isEditable?: boolean;
  onLogoChange?: (logo: string) => void;
  placeholderIcon?: React.ReactNode;
}> = ({ logo, brandColor, isEditable, onLogoChange, placeholderIcon }) => {
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showInput) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowInput(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showInput]);

  const logoEl = logo ? (
    <img src={logo} alt="logo" className="w-6 h-6 rounded object-contain bg-white border border-slate-100 flex-shrink-0" />
  ) : (
    <span className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${brandColor}18`, color: brandColor }}>
      {placeholderIcon || <Briefcase className="w-3.5 h-3.5" />}
    </span>
  );

  if (!isEditable) return logoEl;

  return (
    <div className="relative flex-shrink-0 group/logo edit-only" ref={ref}>
      <button
        type="button"
        onClick={() => { setUrl(logo || ''); setShowInput(!showInput); }}
        className="flex items-center justify-center w-6 h-6 rounded overflow-hidden hover:ring-2 ring-brand-accent transition cursor-pointer"
        title="Set company/school logo"
      >
        {logoEl}
      </button>

      {showInput && (
        <div className="absolute left-0 top-8 z-50 bg-white border border-slate-200 shadow-xl rounded-lg p-3 w-64 flex flex-col gap-2 edit-only">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Company / School Logo</p>
          <div className="flex gap-1.5">
            <input
              type="text"
              className="flex-1 text-xs border border-slate-200 rounded px-2 py-1 outline-none focus:border-brand-accent"
              placeholder="Paste image URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { onLogoChange?.(url.trim()); setShowInput(false); }
              }}
            />
            <button
              type="button"
              className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 rounded font-semibold cursor-pointer"
              onClick={() => { onLogoChange?.(url.trim()); setShowInput(false); }}
            >
              Set
            </button>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline font-semibold cursor-pointer">
              <Upload className="w-3 h-3" /> Upload Image
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const dataUrl = ev.target?.result as string;
                  onLogoChange?.(dataUrl);
                  setShowInput(false);
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
          {logo && (
            <button
              type="button"
              className="text-[10px] text-red-400 hover:text-red-600 hover:underline cursor-pointer text-left"
              onClick={() => { onLogoChange?.(''); setShowInput(false); }}
            >
              Remove logo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Item Wrapper: hover toolbar per resume item ───────────────────────────────
interface ItemWrapperProps {
  sectionId: string;
  index: number;
  totalItems: number;
  isEditable: boolean;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: React.ReactNode;
  // logo props
  logo?: string;
  onLogoChange?: (logo: string) => void;
  showLogo?: boolean;
  placeholderIcon?: React.ReactNode;
  brandColor?: string;
}

const ItemWrapper: React.FC<ItemWrapperProps> = ({
  sectionId, index, totalItems, isEditable, onDelete, onMoveUp, onMoveDown, children,
  logo, onLogoChange, showLogo, placeholderIcon, brandColor = '#314855'
}) => {
  const context = useContext(ActiveSectionContext);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const itemId = `${sectionId}-${index}`;
  const isItemActive = context?.activeItemId === itemId;

  useEffect(() => {
    if (!showSettings) return;
    const handleOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showSettings]);

  if (!isEditable) return <>{children}</>;

  const handleMoveUp = onMoveUp ?? (context?.handleMoveItemUpDown ? () => context.handleMoveItemUpDown(sectionId, index, 'up') : undefined);
  const handleMoveDown = onMoveDown ?? (context?.handleMoveItemUpDown ? () => context.handleMoveItemUpDown(sectionId, index, 'down') : undefined);

  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    context?.setActiveSectionId(sectionId);
    context?.setActiveItemId(itemId);
  };

  return (
    <div
      className={`relative group/item rounded transition-all duration-200 ${isItemActive ? 'p-2 -m-2 item-active' : 'p-0'}`}
      onClick={handleItemClick}
    >
      {children}

      {/* Per-item floating toolbar */}
      <div className="edit-only absolute -top-2 right-0 flex items-center gap-0.5 bg-white border border-slate-200 shadow-md rounded-md px-1 py-0.5 opacity-0 group-hover/item:opacity-100 transition-all duration-150 z-30">
        {index > 0 && handleMoveUp && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleMoveUp(); }}
            className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded cursor-pointer transition"
            title="Move Up"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
        )}
        {index < totalItems - 1 && handleMoveDown && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleMoveDown(); }}
            className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded cursor-pointer transition"
            title="Move Down"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        )}

        {/* Settings gear (with logo upload inside) */}
        {showLogo && onLogoChange && (
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
              className={`p-0.5 hover:bg-slate-100 rounded cursor-pointer transition ${showSettings ? 'bg-slate-100 text-teal-600' : 'text-slate-400 hover:text-slate-700'}`}
              title="Settings"
            >
              <Settings className="w-3 h-3" />
            </button>
            {showSettings && (
              <div className="absolute right-0 top-5 z-50 bg-white border border-slate-200 shadow-xl rounded-lg p-3 w-64 flex flex-col gap-2.5 edit-only">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Logo</p>
                <ItemLogo
                  logo={logo}
                  brandColor={brandColor}
                  isEditable={true}
                  onLogoChange={onLogoChange}
                  placeholderIcon={placeholderIcon}
                />
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-0.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded cursor-pointer transition"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// ─── Section Wrapper: hover toolbar per section ─────────────────────────────────
interface SectionWrapperProps {
  id: string;
  title: string;
  isEditable: boolean;
  align: 'left' | 'center' | 'right' | 'justify' | undefined;
  onAlignChange?: (align: 'left' | 'center' | 'right' | 'justify') => void;
  onAddEntry?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onDeleteSection?: () => void;
  isActive?: boolean;
  onSelect?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: React.ReactNode;
  // skills settings
  skillsStyle?: 'chips' | 'normal';
  onSkillsStyleChange?: (style: 'chips' | 'normal') => void;
  skillsValue?: string;
  onSkillsValueChange?: (val: string) => void;
  // generic layout settings
  layoutSettings?: any;
  onLayoutSettingsChange?: (patch: Partial<any>) => void;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id, title, isEditable, align, onAlignChange, onAddEntry, onMoveLeft, onMoveRight, onDeleteSection,
  isActive: propIsActive, onSelect: propOnSelect, onMoveUp: propOnMoveUp, onMoveDown: propOnMoveDown, children,
  skillsStyle, onSkillsStyleChange, skillsValue, onSkillsValueChange,
  layoutSettings, onLayoutSettingsChange
}) => {
  const context = useContext(ActiveSectionContext);
  const isActive = propIsActive ?? (context?.activeSectionId === id);
  const onSelect = propOnSelect ?? (() => context?.setActiveSectionId(id));
  const onMoveUp = propOnMoveUp ?? (context?.handleMoveSectionUpDown ? () => context.handleMoveSectionUpDown(id, 'up') : undefined);
  const onMoveDown = propOnMoveDown ?? (context?.handleMoveSectionUpDown ? () => context.handleMoveSectionUpDown(id, 'down') : undefined);

  const [showSettings, setShowSettings] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSettings) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showSettings]);

  if (!isEditable) return <>{children}</>;

  const isSkills = id === 'skills';
  const hasSettings = !!onAlignChange ||
    (isSkills && !!onSkillsStyleChange && !!onSkillsValueChange) ||
    (!!layoutSettings && !!onLayoutSettingsChange && ['achievements', 'certs', 'experience', 'education', 'languages'].includes(id));

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      className={`relative group/section rounded transition-all duration-200 ${
        isActive
          ? 'bg-white z-[30] p-2 -m-2 section-active'
          : 'border border-dashed border-transparent hover:border-gray-200 hover:bg-slate-50/30 p-2 -m-2'
      }`}
    >
      {children}

      {/* Floating centered section toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute -top-10 left-1/2 -translate-x-1/2 transition-all flex items-center gap-0.5 bg-white border border-slate-200 shadow-lg rounded-lg px-2 py-1 z-40 edit-only ${
          isActive ? 'opacity-100 visible' : 'opacity-0 invisible group-hover/section:opacity-100 group-hover/section:visible'
        }`}
      >
        {onAddEntry && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddEntry(); }}
            className="flex items-center gap-1 px-2.5 py-1 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded text-[10px] cursor-pointer shadow-sm transition"
            type="button"
            title={id === 'skills' ? 'Add Skill' : `Add entry to ${title}`}
          >
            <Plus className="w-3 h-3" /> {id === 'skills' ? 'Add Skill' : 'Add'}
          </button>
        )}

        {onMoveUp && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded cursor-pointer transition flex items-center justify-center"
            type="button" title="Move Up"
          >
            <ArrowLeft className="w-3.5 h-3.5 rotate-90" />
          </button>
        )}

        {onMoveDown && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded cursor-pointer transition flex items-center justify-center"
            type="button" title="Move Down"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-90" />
          </button>
        )}

        {onMoveLeft && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}
            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded cursor-pointer transition flex items-center justify-center"
            type="button" title="Move Left"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {onMoveRight && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded cursor-pointer transition flex items-center justify-center"
            type="button" title="Move Right"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {hasSettings && (
          <div className="relative" ref={ref}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
              className={`p-1 hover:bg-slate-100 rounded cursor-pointer transition flex items-center justify-center ${showSettings ? 'bg-slate-100 text-teal-600' : 'text-slate-500 hover:text-slate-800'}`}
              type="button" title="Section Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-7 z-50 bg-white border border-slate-200 shadow-xl rounded-lg p-3 flex flex-col gap-2.5 edit-only w-64">
                {onAlignChange && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Alignment</span>
                    <div className="flex gap-1">
                      {(['left', 'center', 'right', 'justify'] as const).map(alignVal => (
                        <button key={alignVal} type="button"
                          onClick={(e) => { e.stopPropagation(); onAlignChange(alignVal); setShowSettings(false); }}
                          className={`p-1 hover:bg-slate-100 rounded cursor-pointer transition flex items-center justify-center ${align === alignVal ? 'bg-slate-100 text-teal-500 font-bold' : 'text-slate-500'}`}
                        >
                          {alignVal === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                          {alignVal === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                          {alignVal === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                          {alignVal === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isSkills && onSkillsStyleChange && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Layout Style</span>
                    <div className="flex gap-1.5">
                      {(['chips', 'normal'] as const).map(style => (
                        <button key={style} type="button"
                          onClick={(e) => { e.stopPropagation(); onSkillsStyleChange(style); }}
                          className={`flex-1 px-2 py-1 rounded text-[10px] font-semibold border cursor-pointer transition ${skillsStyle === style ? 'bg-teal-500 text-white border-teal-500' : 'text-slate-500 border-slate-200 hover:border-slate-400'}`}
                        >
                          {style === 'chips' ? 'Chips' : 'List'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'experience' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Visibility</span>
                    {[
                      { key: 'showExperienceLogo', label: 'Show Company Logo' },
                      { key: 'showExperienceLocation', label: 'Show Location' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                        <input type="checkbox"
                          checked={layoutSettings[key] ?? true}
                          onChange={(e) => onLayoutSettingsChange({ [key]: e.target.checked })}
                          className="rounded"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'education' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Visibility</span>
                    {[
                      { key: 'showEducationLogo', label: 'Show School Logo' },
                      { key: 'showEducationGpa', label: 'Show GPA Badge' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                        <input type="checkbox"
                          checked={layoutSettings[key] ?? true}
                          onChange={(e) => onLayoutSettingsChange({ [key]: e.target.checked })}
                          className="rounded"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'certs' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Visibility</span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                      <input type="checkbox"
                        checked={layoutSettings.showProjectIcon ?? true}
                        onChange={(e) => onLayoutSettingsChange({ showProjectIcon: e.target.checked })}
                        className="rounded"
                      />
                      Show Project Icons
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                      <input type="checkbox"
                        checked={layoutSettings.showProjectDesc ?? true}
                        onChange={(e) => onLayoutSettingsChange({ showProjectDesc: e.target.checked })}
                        className="rounded"
                      />
                      Show Project Description
                    </label>
                  </div>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'achievements' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Visibility</span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                      <input type="checkbox"
                        checked={layoutSettings.showAchievementIcons ?? true}
                        onChange={(e) => onLayoutSettingsChange({ showAchievementIcons: e.target.checked })}
                        className="rounded"
                      />
                      Show Icons
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                      <input type="checkbox"
                        checked={layoutSettings.showAchievementDesc ?? true}
                        onChange={(e) => onLayoutSettingsChange({ showAchievementDesc: e.target.checked })}
                        className="rounded"
                      />
                      Show Description
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {onDeleteSection && (
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteSection(); }}
            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded cursor-pointer transition flex items-center justify-center"
            type="button" title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Bottom sections: Certs / Achievements / Languages ───────────────────────
interface BottomSectionsProps {
  resumeCerts: ResumeState['resumeCerts'];
  resumeAchievements: ResumeState['resumeAchievements'];
  resumeLanguages: ResumeState['resumeLanguages'];
  sec: React.CSSProperties;
  isEditable: boolean;
  ec: string;
  accentColor: string;
  headingClass: string;
  onCertChange?: ResumeTemplateProps['onCertChange'];
  onAchievementChange?: ResumeTemplateProps['onAchievementChange'];
  onLanguageChange?: ResumeTemplateProps['onLanguageChange'];
  certsAlign?: 'left' | 'center' | 'right' | 'justify';
  achievementsAlign?: 'left' | 'center' | 'right' | 'justify';
}

const BottomSections: React.FC<BottomSectionsProps> = ({
  resumeCerts, resumeAchievements, resumeLanguages,
  sec, isEditable, ec, accentColor, headingClass,
  onCertChange, onAchievementChange, onLanguageChange,
  certsAlign = 'left', achievementsAlign = 'left'
}) => (
  <>
    {resumeCerts && resumeCerts.length > 0 && (
      <section style={sec}>
        <h3 className={headingClass} style={{ color: accentColor, borderColor: `${accentColor}40` }}>Certifications</h3>
        <ul className="space-y-1.5 text-xs">
          {resumeCerts.map((cert, idx) => (
            <li key={idx} className={`text-${certsAlign}`}>
              <div className={`flex items-center gap-1 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 font-bold"
                  onSave={v => onCertChange?.(idx, 'title', v)} />
                <WorkLink url={cert.url} brandColor={accentColor} />
              </div>
              <E tag="p" value={cert.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[11px] mt-0.5 text-${certsAlign}`}
                onSave={v => onCertChange?.(idx, 'desc', v)} />
            </li>
          ))}
        </ul>
      </section>
    )}
    {resumeAchievements && resumeAchievements.length > 0 && (
      <section style={sec}>
        <h3 className={headingClass} style={{ color: accentColor, borderColor: `${accentColor}40` }}>Achievements</h3>
        <ul className="space-y-2 text-xs">
          {resumeAchievements.map((ach, idx) => (
            <li key={idx} className={`flex gap-2 text-${achievementsAlign} ${achievementsAlign === 'right' ? 'flex-row-reverse' : ''}`}>
              <Star className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 block"
                  onSave={v => onAchievementChange?.(idx, 'title', v)} />
                <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className="text-slate-500 text-[11px]"
                  onSave={v => onAchievementChange?.(idx, 'desc', v)} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    )}
    {resumeLanguages && resumeLanguages.length > 0 && (
      <section style={sec}>
        <h3 className={headingClass} style={{ color: accentColor, borderColor: `${accentColor}40` }}>Languages</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          {resumeLanguages.map((lang, idx) => (
            <span key={idx} className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <E value={lang.name} isEditable={isEditable} editableClass={ec} className="font-semibold text-slate-800"
                onSave={v => onLanguageChange?.(idx, 'name', v)} />
              <span className="text-slate-400">/</span>
              <E value={lang.level} isEditable={isEditable} editableClass={ec} className="text-slate-500"
                onSave={v => onLanguageChange?.(idx, 'level', v)} />
            </span>
          ))}
        </div>
      </section>
    )}
  </>
);

// ─── Drag and Drop Section Container ──────────────────────────────────────────
interface DraggableSectionProps {
  id: string;
  showLayoutBounds: boolean;
  isEditable: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  dragOverId?: string | null;
  onDragEnter?: (e: React.DragEvent, id: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
}

const DraggableSection: React.FC<DraggableSectionProps> = ({
  id,
  showLayoutBounds,
  isEditable,
  onDragStart,
  onDragOver,
  onDrop,
  children,
  className = '',
  style,
  dragOverId,
  onDragEnter,
  onDragLeave
}) => {
  const isDraggable = isEditable && showLayoutBounds;
  const isOver = dragOverId === id;

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart(e, id)}
      onDragOver={(e) => isDraggable && onDragOver(e)}
      onDragEnter={(e) => isDraggable && onDragEnter?.(e, id)}
      onDragLeave={(e) => isDraggable && onDragLeave?.(e)}
      onDrop={(e) => isDraggable && onDrop(e, id)}
      style={style}
      className={`relative group/draggable ${className} ${
        isDraggable 
          ? `border-2 border-dashed p-2 rounded-xl transition-all duration-200 cursor-move ${
              isOver 
                ? 'border-brand-accent bg-brand-accent/5 scale-[1.02] shadow-md z-10' 
                : 'border-slate-300 hover:border-brand-accent/50 bg-slate-50/10 hover:bg-slate-50/30'
            }`
          : ''
      }`}
    >
      {isDraggable && (
        <div className="absolute -top-2.5 left-2 bg-brand-accent text-[8px] font-bold text-white px-1.5 py-0.5 rounded shadow select-none opacity-0 group-hover/draggable:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider z-20">
          Drag Section: {id}
        </div>
      )}
      {children}
    </div>
  );
};

// ─── Profile Photo with Gold Ring & SVG Abstract Waves ──────────────────────────
const ProfilePhotoWithWaves: React.FC<{ avatar: string; brandColor: string; accentColor2?: string }> = ({ avatar, brandColor, accentColor2 = '#eab308' }) => {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
      {/* Background abstract waves */}
      <svg className="absolute inset-0 w-full h-full opacity-30 overflow-visible pointer-events-none" viewBox="0 0 100 100" fill="none">
        <path d="M-20,40 Q15,15 50,40 T120,40" stroke={accentColor2} strokeWidth="1" strokeDasharray="3 3" />
        <path d="M-20,50 Q25,30 60,50 T120,50" stroke={brandColor} strokeWidth="0.75" />
        <path d="M-20,60 Q35,45 70,60 T120,60" stroke={accentColor2} strokeWidth="0.5" />
      </svg>

      {/* Yellow/Gold dashed semicircle border ring around the photo */}
      <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#eab308] opacity-75 animate-[spin_180s_linear_infinite]" />

      {/* Profile Photo image mask container */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-50 flex items-center justify-center">
        {avatar ? (
          <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-300 text-3xl font-bold font-sans">?</span>
        )}
      </div>
    </div>
  );
};

// ─── Education Grade/GPA Parsing Helper ──────────────────────────────────────────
const parseEducationGrade = (bullets: string) => {
  const lines = splitIntoBullets(bullets);
  let gradeText = '';
  let gradeType: 'gpa' | 'medalist' | 'none' = 'none';
  const remainingBullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Matches "GPA: 1.7 / 5" or "GPA 1.7 / 5" or "Medalist: 9.32 / 10" or "Medalist 9.32" or "Grade: A" or "Grade A"
    const gpaMatch = trimmed.match(/^(GPA|Grade|Medalist)\s*[:\-]?\s*(.*)$/i);
    if (gpaMatch) {
      gradeType = gpaMatch[1].toLowerCase() as any;
      const val = gpaMatch[2].trim();
      if (gradeType === 'gpa') {
        gradeText = val.toUpperCase().includes('GPA') ? val : `GPA\n${val}`;
      } else if (gradeType === 'medalist') {
        gradeText = val.toUpperCase().includes('MEDALIST') ? val : `Medalist 🏆\n${val}`;
      } else {
        gradeText = val.toUpperCase().includes('GRADE') ? val : `Grade\n${val}`;
      }
    } else {
      remainingBullets.push(line);
    }
  }

  return { gradeText, gradeType, remaining: remainingBullets.join('\n') };
};

// ─── Language Bubbles Renders 5 indicators ──────────────────────────────────────
const getLanguageBubbleCount = (levelText: string): number => {
  const l = levelText.toLowerCase();
  if (l.includes('native') || l.includes('fluent') || l.includes('bilingual') || l.includes('5')) return 5;
  if (l.includes('proficient') || l.includes('advanced') || l.includes('4') || l.includes('c1') || l.includes('c2')) return 4;
  if (l.includes('conversational') || l.includes('intermediate') || l.includes('upper') || l.includes('3') || l.includes('b1') || l.includes('b2')) return 3;
  if (l.includes('beginner') || l.includes('elementary') || l.includes('basic') || l.includes('1') || l.includes('2') || l.includes('a1') || l.includes('a2')) return 2;
  return 3;
};

const LanguageBubbles: React.FC<{ count: number; activeColor: string }> = ({ count, activeColor }) => {
  return (
    <div className="flex gap-1 items-center flex-shrink-0 font-sans">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="w-2.5 h-2.5 rounded-full border"
          style={{
            backgroundColor: i <= count ? activeColor : 'transparent',
            borderColor: i <= count ? activeColor : '#cbd5e1',
          }}
        />
      ))}
    </div>
  );
};

export const ResumeTemplateRenderer: React.FC<ResumeTemplateProps> = ({
  state, isEditable = false,
  onFieldChange, onExperienceChange, onEducationChange,
  onCertChange, onAchievementChange, onLanguageChange,
  onAddExperience, onDeleteExperience,
  onAddEducation, onDeleteEducation,
  onAddCert: _onAddCert, onDeleteCert: _onDeleteCert,
  onAddAchievement: _onAddAchievement, onDeleteAchievement: _onDeleteAchievement,
  onAddLanguage: _onAddLanguage, onDeleteLanguage: _onDeleteLanguage,
  onLayoutSettingsChange,
}) => {
  const {
    name, subtitle, phone, email, linkedin, location, avatar,
    resumeSummary, resumeSkills, resumeExperience, resumeEducation,
    resumeCerts, resumeAchievements, resumeLanguages, layoutSettings
  } = state;

  const {
    fontSize, paddingTopBottom, paddingLeftRight, sectionSpacing,
    lineHeight, template = 'navy', brandColor = '#314855',
    accentColor2,
    fontFamily = 'inter',
    headingFont,
    headerStyle = 'centered',
    showPhoto = true,
    bulletStyle = 'disc',
    skillsStyle = 'chips',
    summaryAlign = 'justify',
    experienceAlign = 'left',
    educationAlign = 'left',
    certsAlign = 'left',
    achievementsAlign = 'left',
    showLayoutBounds = false,
    designerLeftSections = ['experience', 'education'],
    designerRightSections = ['summary', 'skills', 'achievements', 'certs', 'languages']
  } = layoutSettings;

  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  // ─── Active section / item state (Enhance-CV three-tier backdrop system) ──
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const handleMoveItemUpDown = (sectionId: string, index: number, dir: 'up' | 'down') => {
    const newIdx = dir === 'up' ? index - 1 : index + 1;
    const swap = (arr: unknown[]): unknown[] => {
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      const a = [...arr];
      [a[index], a[newIdx]] = [a[newIdx], a[index]];
      return a;
    };
    if (sectionId === 'experience') onFieldChange?.('resumeExperience', swap(resumeExperience) as typeof resumeExperience);
    else if (sectionId === 'education') onFieldChange?.('resumeEducation', swap(resumeEducation) as typeof resumeEducation);
    else if (sectionId === 'certs') onFieldChange?.('resumeCerts', swap(resumeCerts ?? []) as typeof resumeCerts);
    else if (sectionId === 'achievements') onFieldChange?.('resumeAchievements', swap(resumeAchievements ?? []) as typeof resumeAchievements);
    else if (sectionId === 'languages') onFieldChange?.('resumeLanguages', swap(resumeLanguages ?? []) as typeof resumeLanguages);
  };

  const handleMoveSectionUpDown = (id: string, dir: 'up' | 'down') => {
    const leftCol = [...(designerLeftSections ?? [])];
    const rightCol = [...(designerRightSections ?? [])];
    const inLeft = leftCol.includes(id);
    const col = inLeft ? leftCol : rightCol;
    const colIdx = col.indexOf(id);
    const newColIdx = dir === 'up' ? colIdx - 1 : colIdx + 1;
    if (newColIdx < 0 || newColIdx >= col.length) return;
    [col[colIdx], col[newColIdx]] = [col[newColIdx], col[colIdx]];
    onFieldChange?.('layoutSettings', {
      ...layoutSettings,
      ...(inLeft ? { designerLeftSections: col } : { designerRightSections: col })
    });
  };

  const sectionContextValue = {
    activeSectionId, setActiveSectionId,
    activeItemId, setActiveItemId,
    handleMoveSectionUpDown,
    handleMoveItemUpDown,
  };

  // Class applied to pdf-sheet: drives the three-tier CSS backdrop
  const sheetActiveClass = isEditable
    ? (activeItemId ? 'has-active-item' : activeSectionId ? 'has-active-section' : '')
    : '';

  const clearActive = () => { setActiveSectionId(null); setActiveItemId(null); };

  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSectionId(sectionId);
  };

  const handleSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    setDragOverSectionId(sectionId);
  };

  const handleDragLeave = () => {
    setDragOverSectionId(null);
  };

  const handleSectionDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    setDragOverSectionId(null);
    if (!draggedSectionId || draggedSectionId === targetSectionId) return;

    const leftCol = [...designerLeftSections];
    const rightCol = [...designerRightSections];

    const srcInLeft = leftCol.includes(draggedSectionId);
    const destInLeft = leftCol.includes(targetSectionId);

    // Remove from source
    if (srcInLeft) {
      const idx = leftCol.indexOf(draggedSectionId);
      if (idx !== -1) leftCol.splice(idx, 1);
    } else {
      const idx = rightCol.indexOf(draggedSectionId);
      if (idx !== -1) rightCol.splice(idx, 1);
    }

    // Insert into destination
    if (destInLeft) {
      const idx = leftCol.indexOf(targetSectionId);
      if (idx !== -1) {
        leftCol.splice(idx, 0, draggedSectionId);
      } else {
        leftCol.push(draggedSectionId);
      }
    } else {
      const idx = rightCol.indexOf(targetSectionId);
      if (idx !== -1) {
        rightCol.splice(idx, 0, draggedSectionId);
      } else {
        rightCol.push(draggedSectionId);
      }
    }

    onFieldChange?.('layoutSettings', {
      ...layoutSettings,
      designerLeftSections: leftCol,
      designerRightSections: rightCol
    });
    setDraggedSectionId(null);
  };

  const handleColumnDrop = (e: React.DragEvent, targetColumn: 'left' | 'right') => {
    e.preventDefault();
    setDragOverSectionId(null);
    if (!draggedSectionId) return;

    const leftCol = [...designerLeftSections];
    const rightCol = [...designerRightSections];

    const srcInLeft = leftCol.includes(draggedSectionId);

    if ((srcInLeft && targetColumn === 'left') || (!srcInLeft && targetColumn === 'right')) {
      return;
    }

    // Remove from source
    if (srcInLeft) {
      const idx = leftCol.indexOf(draggedSectionId);
      if (idx !== -1) leftCol.splice(idx, 1);
    } else {
      const idx = rightCol.indexOf(draggedSectionId);
      if (idx !== -1) rightCol.splice(idx, 1);
    }

    // Append to target
    if (targetColumn === 'left') {
      leftCol.push(draggedSectionId);
    } else {
      rightCol.push(draggedSectionId);
    }

    onFieldChange?.('layoutSettings', {
      ...layoutSettings,
      designerLeftSections: leftCol,
      designerRightSections: rightCol
    });
    setDraggedSectionId(null);
  };

  const dragProps = {
    showLayoutBounds: showLayoutBounds ?? false,
    isEditable,
    onDragStart: handleSectionDragStart,
    onDragOver: handleSectionDragOver,
    onDrop: handleSectionDrop,
    dragOverId: dragOverSectionId,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave
  };

  const bodyFontCss    = FONT_CSS[fontFamily] ?? FONT_CSS.inter;
  const headingFontCss = headingFont ? FONT_CSS[headingFont] : bodyFontCss;

  const sheetStyle: React.CSSProperties = {
    fontSize: `${fontSize}pt`,
    padding: `${paddingTopBottom}mm ${paddingLeftRight}mm`,
    lineHeight,
    color: '#334155',
    fontFamily: bodyFontCss,
  };
  const sec: React.CSSProperties = { marginBottom: `${sectionSpacing}px` };
  const ec = isEditable ? 'outline-none hover:bg-slate-100/80 focus:bg-slate-100 rounded px-1 -mx-1 transition' : '';
  const ef = (field: keyof ResumeState) => (v: string) => onFieldChange?.(field, v);
  const showAvatar = showPhoto && !!avatar;

  // Shared TemplateHeader props factory
  const headerProps = {
    name:    { value: name,     onSave: ef('name') },
    subtitle:{ value: subtitle, onSave: ef('subtitle') },
    phone:   { value: phone,    onSave: ef('phone') },
    email:   { value: email,    onSave: ef('email') },
    location:{ value: location, onSave: ef('location') },
    linkedin:{ value: linkedin, onSave: ef('linkedin') },
    avatar, showAvatar, brandColor, headingFontCss,
    headerStyle: headerStyle as import('../types').HeaderStyle,
    isEditable, ec, sectionSpacing,
  };

  // accentColor2 badge style — falls back to brandColor if not set
  const badgeStyle = (i: number): React.CSSProperties => accentColor2
    ? { background: `${i % 2 === 0 ? accentColor2 : brandColor}22`, color: i % 2 === 0 ? accentColor2 : brandColor, borderColor: `${i % 2 === 0 ? accentColor2 : brandColor}44` }
    : { background: `${brandColor}18`, color: brandColor, borderColor: `${brandColor}30` };

  // Shared props for BottomSections — avoids repeating at every call site
  const bottomProps = {
    resumeCerts, resumeAchievements, resumeLanguages, sec, isEditable, ec,
    onCertChange, onAchievementChange, onLanguageChange,
    certsAlign, achievementsAlign
  };

  // ─── Render the correct template ────────────────────────────────────────────
  const renderTemplate = (): React.ReactElement | null => {

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. NAVY ELEGANT
  // ═══════════════════════════════════════════════════════════════════════════
  if (template === 'navy') {
    const H = 'text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2';
    return (
      <div className={`pdf-sheet ${sheetActiveClass}`} style={sheetStyle} id="resume-sheet"
        onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
        <TemplateHeader {...headerProps} />

        {(resumeSummary || isEditable) && (
          <section style={sec}>
            <h3 className={H} style={{ color: brandColor, borderColor: `${brandColor}40` }}>Profile Summary</h3>
            <E tag="p" value={resumeSummary || 'Professional summary...'} isEditable={isEditable} editableClass={ec}
              className={`text-xs text-${summaryAlign} text-slate-700 leading-relaxed`} onSave={ef('resumeSummary')} />
          </section>
        )}

        {(resumeSkills || isEditable) && (
          <section style={sec}>
            <h3 className={H} style={{ color: brandColor, borderColor: `${brandColor}40` }}>Skills</h3>
            <SkillsEditor
              value={resumeSkills}
              isEditable={isEditable}
              ec={ec}
              onSave={ef('resumeSkills')}
              accentColor2={accentColor2}
              brandColor={brandColor}
              badgeStyle={badgeStyle}
              defaultBadgeStyle={{ background: '#f1f5f9', color: '#1e293b', borderColor: '#e2e8f0' }}
              skillsStyle={skillsStyle}
            />
          </section>
        )}

        {(resumeExperience && resumeExperience.length > 0 || isEditable) && (
          <SectionWrapper
            id="experience" title="Professional Experience" isEditable={isEditable}
            align={experienceAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ experienceAlign: a })}
            onAddEntry={onAddExperience}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <section style={sec}>
              <h3 className={H} style={{ color: brandColor, borderColor: `${brandColor}40` }}>Professional Experience</h3>
              <div className="space-y-4">
                {resumeExperience.map((exp, idx) => (
                  <ItemWrapper
                    key={idx} sectionId="experience" index={idx} totalItems={resumeExperience.length}
                    isEditable={isEditable} onDelete={() => onDeleteExperience?.(idx)}
                    logo={exp.logo} onLogoChange={(logo) => onExperienceChange?.(idx, 'logo', logo)}
                    showLogo={layoutSettings?.showExperienceLogo ?? true}
                    placeholderIcon={<Building2 className="w-3.5 h-3.5" />} brandColor={brandColor}
                  >
                    <div className="text-xs">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          {(layoutSettings?.showExperienceLogo ?? true) && (
                            <ItemLogo logo={exp.logo} brandColor={brandColor} placeholderIcon={<Building2 className="w-3.5 h-3.5" />} />
                          )}
                          <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                        </span>
                        <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="text-slate-500 font-normal" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                      </div>
                      <div className="flex justify-between text-slate-600 italic mb-1.5">
                        <span className="flex items-center gap-1">
                          <E value={exp.company} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                          <WorkLink url={exp.url} brandColor={brandColor} />
                        </span>
                        <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                      </div>
                      <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                        onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700"
                        bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} />
                    </div>
                  </ItemWrapper>
                ))}
              </div>
            </section>
          </SectionWrapper>
        )}

        {(resumeEducation && resumeEducation.length > 0 || isEditable) && (
          <SectionWrapper
            id="education" title="Education" isEditable={isEditable}
            align={educationAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ educationAlign: a })}
            onAddEntry={onAddEducation}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <section style={sec}>
              <h3 className={H} style={{ color: brandColor, borderColor: `${brandColor}40` }}>Education</h3>
              <div className="space-y-3">
                {resumeEducation.map((edu, idx) => (
                  <ItemWrapper
                    key={idx} sectionId="education" index={idx} totalItems={resumeEducation.length}
                    isEditable={isEditable} onDelete={() => onDeleteEducation?.(idx)}
                    logo={edu.logo} onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                    showLogo={layoutSettings?.showEducationLogo ?? true}
                    placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} brandColor={brandColor}
                  >
                    <div className="text-xs">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          {(layoutSettings?.showEducationLogo ?? true) && (
                            <ItemLogo logo={edu.logo} brandColor={brandColor} placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} />
                          )}
                          <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                        </span>
                        <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="text-slate-500 font-normal" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                      </div>
                      <div className="flex justify-between text-slate-600 italic mb-1">
                        <E value={edu.school} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'school', v)} />
                        <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                      </div>
                      <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-700 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                    </div>
                  </ItemWrapper>
                ))}
              </div>
            </section>
          </SectionWrapper>
        )}

        <BottomSections {...bottomProps} accentColor={brandColor} headingClass={H} />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. HARVARD SERIF
  // ═══════════════════════════════════════════════════════════════════════════
  if (template === 'serif') {
    const H = 'text-[13px] font-bold text-center border-b pb-0.5 mb-3 uppercase tracking-widest text-slate-800';
    return (
      <div className={`pdf-sheet text-justify ${sheetActiveClass}`} style={sheetStyle} id="resume-sheet"
        onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
        <TemplateHeader {...headerProps} />

        {(resumeSummary || isEditable) && (
          <section style={sec}>
            <h3 className={H}>Profile</h3>
            <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
              className={`text-slate-800 leading-relaxed text-[13px] text-${summaryAlign}`} onSave={ef('resumeSummary')} />
          </section>
        )}

        {(resumeSkills || isEditable) && (
          <section style={sec} className="text-xs">
            <h3 className={H}>Skills &amp; Expertise</h3>
            <SkillsEditor
              value={resumeSkills}
              isEditable={isEditable}
              ec={ec}
              onSave={ef('resumeSkills')}
              accentColor2={accentColor2}
              brandColor={brandColor}
              badgeStyle={badgeStyle}
              className="text-center font-sans"
              skillsStyle={skillsStyle}
            />
          </section>
        )}

        {(resumeExperience && resumeExperience.length > 0 || isEditable) && (
          <SectionWrapper
            id="experience" title="Experience" isEditable={isEditable}
            align={experienceAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ experienceAlign: a })}
            onAddEntry={onAddExperience}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <section style={sec}>
              <h3 className={H}>Experience</h3>
              <div className="space-y-4">
                {resumeExperience.map((exp, idx) => (
                  <ItemWrapper
                    key={idx} sectionId="experience" index={idx} totalItems={resumeExperience.length}
                    isEditable={isEditable} onDelete={() => onDeleteExperience?.(idx)}
                    logo={exp.logo} onLogoChange={(logo) => onExperienceChange?.(idx, 'logo', logo)}
                    showLogo={layoutSettings?.showExperienceLogo ?? true}
                    placeholderIcon={<Building2 className="w-3.5 h-3.5" />} brandColor={brandColor}
                  >
                    <div className="text-xs">
                      <div className="flex justify-between font-bold text-slate-950">
                        <span className="flex items-center gap-1.5">
                          {(layoutSettings?.showExperienceLogo ?? true) && (
                            <ItemLogo logo={exp.logo} brandColor={brandColor} placeholderIcon={<Building2 className="w-3.5 h-3.5" />} />
                          )}
                          <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                          <span> — </span>
                          <E value={exp.company} isEditable={isEditable} editableClass={ec} className="font-normal italic text-slate-700" onSave={v => onExperienceChange?.(idx, 'company', v)} />
                          <WorkLink url={exp.url} brandColor={brandColor} />
                        </span>
                        <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-normal font-sans text-slate-500" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                      </div>
                      <div className="text-[11px] text-slate-500 italic mb-1.5 font-sans">
                        <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                      </div>
                      <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                        onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-800 leading-relaxed"
                        bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} />
                    </div>
                  </ItemWrapper>
                ))}
              </div>
            </section>
          </SectionWrapper>
        )}

        {(resumeEducation && resumeEducation.length > 0 || isEditable) && (
          <SectionWrapper
            id="education" title="Education" isEditable={isEditable}
            align={educationAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ educationAlign: a })}
            onAddEntry={onAddEducation}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <section style={sec}>
              <h3 className={H}>Education</h3>
              <div className="space-y-3">
                {resumeEducation.map((edu, idx) => (
                  <ItemWrapper
                    key={idx} sectionId="education" index={idx} totalItems={resumeEducation.length}
                    isEditable={isEditable} onDelete={() => onDeleteEducation?.(idx)}
                    logo={edu.logo} onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                    showLogo={layoutSettings?.showEducationLogo ?? true}
                    placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} brandColor={brandColor}
                  >
                    <div className="text-xs">
                      <div className="flex justify-between font-bold text-slate-950 font-serif">
                        <span className="flex items-center gap-1.5">
                          {(layoutSettings?.showEducationLogo ?? true) && (
                            <ItemLogo logo={edu.logo} brandColor={brandColor} placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} />
                          )}
                          <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                          <span> — </span>
                          <E value={edu.school} isEditable={isEditable} editableClass={ec} className="font-normal italic text-slate-700" onSave={v => onEducationChange?.(idx, 'school', v)} />
                        </span>
                        <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="font-normal font-sans text-slate-500" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 italic font-sans">
                        <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                      </div>
                      <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-700 mt-1 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                    </div>
                  </ItemWrapper>
                ))}
              </div>
            </section>
          </SectionWrapper>
        )}

        <BottomSections {...bottomProps} accentColor={brandColor}
          headingClass="text-[13px] font-bold text-center border-b pb-0.5 mb-2 uppercase tracking-widest text-slate-800" />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. CREATIVE SIDEBAR (two-column)
  // ═══════════════════════════════════════════════════════════════════════════
  if (template === 'sidebar') {
    const SH = 'text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2';
    const hasPhone = !!(phone && phone.trim());
    const hasEmail = !!(email && email.trim());
    const hasLocation = !!(location && location.trim());
    const hasLinkedin = !!(linkedin && linkedin.trim());
    const hasContact = hasPhone || hasEmail || hasLocation || hasLinkedin;

    return (
      <div className={`pdf-sheet p-0 text-slate-800 flex flex-row ${sheetActiveClass}`} style={{ ...sheetStyle, padding: 0 }} id="resume-sheet"
        onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
        {/* Left column */}
        <aside className="w-[220px] flex-shrink-0 flex flex-col gap-5 p-5" style={{ background: brandColor + '15', borderRight: `3px solid ${brandColor}` }}>
          {showAvatar && (
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2" style={{ borderColor: brandColor }}>
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>
          )}
          {hasContact && (
            <div>
              <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Contact</h4>
              <ul className="space-y-1.5 text-[11px] leading-relaxed">
                {hasPhone && <li className="flex items-center gap-1.5"><Phone className="w-3 h-3 flex-shrink-0 mt-[1px]" /><E value={phone} isEditable={isEditable} editableClass={ec} onSave={ef('phone')} /></li>}
                {hasEmail && <li className="flex items-center gap-1.5"><Mail className="w-3 h-3 flex-shrink-0 mt-[1px]" /><E value={email} isEditable={isEditable} editableClass={ec} onSave={ef('email')} href={`mailto:${email}`} /></li>}
                {hasLocation && <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 flex-shrink-0 mt-[1px]" /><E value={location} isEditable={isEditable} editableClass={ec} onSave={ef('location')} /></li>}
                {hasLinkedin && <li className="flex items-center gap-1.5"><LI /><E value={linkedin} isEditable={isEditable} editableClass={ec} onSave={ef('linkedin')} href={formatLinkedinUrl(linkedin)} /></li>}
              </ul>
            </div>
          )}

          {(resumeSkills || isEditable) && (
            <div>
              <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Skills</h4>
              <SkillsEditor
                value={resumeSkills}
                isEditable={isEditable}
                ec={ec}
                onSave={ef('resumeSkills')}
                accentColor2={accentColor2}
                brandColor={brandColor}
                badgeStyle={(i) => ({ ...badgeStyle(i), borderRadius: '9999px' })}
                defaultBadgeStyle={{ background: brandColor + 'cc', color: '#fff', borderRadius: '9999px' }}
                className="text-[10px] gap-1"
                skillsStyle={skillsStyle}
              />
            </div>
          )}

          {resumeCerts && resumeCerts.length > 0 && (
            <div>
              <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Certifications</h4>
              <ul className="space-y-2 text-[11px]">
                {resumeCerts.map((cert, idx) => (
                  <li key={idx} className={`text-${certsAlign}`}>
                    <span className={`flex items-center gap-1 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                      <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="block text-slate-900 font-bold" onSave={v => onCertChange?.(idx, 'title', v)} />
                      <WorkLink url={cert.url} brandColor={brandColor} />
                    </span>
                    <E tag="p" value={cert.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[10px] text-${certsAlign}`} onSave={v => onCertChange?.(idx, 'desc', v)} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resumeLanguages && resumeLanguages.length > 0 && (
            <div>
              <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Languages</h4>
              <ul className="space-y-1.5 text-[11px]">
                {resumeLanguages.map((lang, idx) => (
                  <li key={idx} className="flex justify-between">
                    <E tag="strong" value={lang.name} isEditable={isEditable} editableClass={ec} className="text-slate-900" onSave={v => onLanguageChange?.(idx, 'name', v)} />
                    <E value={lang.level} isEditable={isEditable} editableClass={ec} className="text-slate-500 italic" onSave={v => onLanguageChange?.(idx, 'level', v)} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resumeAchievements && resumeAchievements.length > 0 && (
            <div>
              <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Achievements</h4>
              <ul className="space-y-2 text-[11px]">
                {resumeAchievements.map((ach, idx) => (
                  <li key={idx} className={`text-${achievementsAlign}`}>
                    <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className={`block text-slate-900 text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'title', v)} />
                    <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[10px] text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'desc', v)} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Right column */}
        <main className="flex-1 p-6" style={{ lineHeight, fontFamily: bodyFontCss }}>
          <header className="mb-4 pb-3 border-b-2" style={{ borderColor: brandColor }}>
            <E tag="h1" value={name} isEditable={isEditable} editableClass={ec}
              className="text-3xl font-extrabold tracking-tight" style={{ color: brandColor, fontFamily: headingFontCss }} onSave={ef('name')} />
            <E tag="p" value={subtitle} isEditable={isEditable} editableClass={ec}
              className="text-sm font-medium text-slate-500 uppercase mt-1 tracking-wide" onSave={ef('subtitle')} />
          </header>

          {(resumeSummary || isEditable) && (
            <div style={sec}>
              <h3 className={SH} style={{ borderColor: `${brandColor}40`, color: brandColor }}>Profile</h3>
              <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
                className={`text-xs text-${summaryAlign} text-slate-700 leading-relaxed`} onSave={ef('resumeSummary')} />
            </div>
          )}

          {(resumeExperience && resumeExperience.length > 0 || isEditable) && (
            <SectionWrapper
              id="experience" title="Experience" isEditable={isEditable}
              align={experienceAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ experienceAlign: a })}
              onAddEntry={onAddExperience}
              layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
            >
              <div style={sec}>
                <h3 className={SH} style={{ borderColor: `${brandColor}40`, color: brandColor }}>Experience</h3>
                <div className="space-y-3">
                  {resumeExperience.map((exp, idx) => (
                    <ItemWrapper
                      key={idx} sectionId="experience" index={idx} totalItems={resumeExperience.length}
                      isEditable={isEditable} onDelete={() => onDeleteExperience?.(idx)}
                      logo={exp.logo} onLogoChange={(logo) => onExperienceChange?.(idx, 'logo', logo)}
                      showLogo={layoutSettings?.showExperienceLogo ?? true}
                      placeholderIcon={<Building2 className="w-3.5 h-3.5" />} brandColor={brandColor}
                    >
                      <div className="text-xs">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            {(layoutSettings?.showExperienceLogo ?? true) && (
                              <ItemLogo logo={exp.logo} brandColor={brandColor} placeholderIcon={<Building2 className="w-3.5 h-3.5" />} />
                            )}
                            <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                          </span>
                          <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="text-slate-400 font-normal" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                        </div>
                        <div className="flex justify-between text-slate-500 italic mb-1">
                          <span className="flex items-center gap-1">
                            <E value={exp.company} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                            <WorkLink url={exp.url} brandColor={brandColor} />
                          </span>
                          <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                        </div>
                        <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                          onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700"
                          bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} />
                      </div>
                    </ItemWrapper>
                  ))}
                </div>
              </div>
            </SectionWrapper>
          )}

          {(resumeEducation && resumeEducation.length > 0 || isEditable) && (
            <SectionWrapper
              id="education" title="Education" isEditable={isEditable}
              align={educationAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ educationAlign: a })}
              onAddEntry={onAddEducation}
              layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
            >
              <div style={sec}>
                <h3 className={SH} style={{ borderColor: `${brandColor}40`, color: brandColor }}>Education</h3>
                <div className="space-y-3">
                  {resumeEducation.map((edu, idx) => (
                    <ItemWrapper
                      key={idx} sectionId="education" index={idx} totalItems={resumeEducation.length}
                      isEditable={isEditable} onDelete={() => onDeleteEducation?.(idx)}
                      logo={edu.logo} onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                      showLogo={layoutSettings?.showEducationLogo ?? true}
                      placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} brandColor={brandColor}
                    >
                      <div className="text-xs">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            {(layoutSettings?.showEducationLogo ?? true) && (
                              <ItemLogo logo={edu.logo} brandColor={brandColor} placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} />
                            )}
                            <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                          </span>
                          <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="text-slate-400 font-normal" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                        </div>
                        <div className="flex justify-between text-slate-500 italic mb-1">
                          <E value={edu.school} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'school', v)} />
                          <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                        </div>
                        <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-600 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                      </div>
                    </ItemWrapper>
                  ))}
                </div>
              </div>
            </SectionWrapper>
          )}
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. TECH MONOSPACE
  // ═══════════════════════════════════════════════════════════════════════════
  if (template === 'tech') {
    const MH = 'font-mono text-xs font-bold text-slate-950 uppercase tracking-widest border-b pb-1 mb-2.5';
    return (
      <div className={`pdf-sheet ${sheetActiveClass}`} style={sheetStyle} id="resume-sheet"
        onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
        <TemplateHeader {...headerProps} />

        {(resumeSummary || isEditable) && (
          <section style={sec}>
            <div className={MH}>// Profile_Summary</div>
            <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
              className={`text-xs text-slate-700 leading-relaxed text-${summaryAlign}`} onSave={ef('resumeSummary')} />
          </section>
        )}

        {(resumeSkills || isEditable) && (
          <section style={sec}>
            <div className={MH}>// Core_Tech_Stack</div>
            <SkillsEditor
              value={resumeSkills}
              isEditable={isEditable}
              ec={ec}
              onSave={ef('resumeSkills')}
              accentColor2={accentColor2}
              brandColor={brandColor}
              badgeStyle={badgeStyle}
              defaultBadgeStyle={{ borderColor: '#cbd5e1', color: '#334155', background: '#f8fafc' }}
              className="font-mono text-[10px]"
              skillsStyle={skillsStyle}
            />
          </section>
        )}

        {(resumeExperience && resumeExperience.length > 0 || isEditable) && (
          <SectionWrapper
            id="experience" title="Experience Log" isEditable={isEditable}
            align={experienceAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ experienceAlign: a })}
            onAddEntry={onAddExperience}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <section style={sec}>
              <div className={MH}>// Experience_Log</div>
              <div className="space-y-4">
                {resumeExperience.map((exp, idx) => (
                  <ItemWrapper
                    key={idx} sectionId="experience" index={idx} totalItems={resumeExperience.length}
                    isEditable={isEditable} onDelete={() => onDeleteExperience?.(idx)}
                    logo={exp.logo} onLogoChange={(logo) => onExperienceChange?.(idx, 'logo', logo)}
                    showLogo={layoutSettings?.showExperienceLogo ?? true}
                    placeholderIcon={<Building2 className="w-3.5 h-3.5" />} brandColor={brandColor}
                  >
                    <div className="text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          {(layoutSettings?.showExperienceLogo ?? true) && (
                            <ItemLogo logo={exp.logo} brandColor={brandColor} placeholderIcon={<Building2 className="w-3.5 h-3.5" />} />
                          )}
                          <span className="flex items-center gap-1"><E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} /><span> @ </span><E value={exp.company} isEditable={isEditable} editableClass={ec} className="text-slate-600 font-normal" onSave={v => onExperienceChange?.(idx, 'company', v)} /><WorkLink url={exp.url} brandColor={brandColor} /></span>
                        </span>
                        <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                      </div>
                      <E value={exp.location} isEditable={isEditable} editableClass={ec} className="text-[11px] font-mono text-slate-500 italic mb-1.5 block" onSave={v => onExperienceChange?.(idx, 'location', v)} />
                      <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                        onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700"
                        bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} />
                    </div>
                  </ItemWrapper>
                ))}
              </div>
            </section>
          </SectionWrapper>
        )}

        {(resumeEducation && resumeEducation.length > 0 || isEditable) && (
          <SectionWrapper
            id="education" title="Academic Profile" isEditable={isEditable}
            align={educationAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ educationAlign: a })}
            onAddEntry={onAddEducation}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <section style={sec}>
              <div className={MH}>// Academic_Profile</div>
              <div className="space-y-3">
                {resumeEducation.map((edu, idx) => (
                  <ItemWrapper
                    key={idx} sectionId="education" index={idx} totalItems={resumeEducation.length}
                    isEditable={isEditable} onDelete={() => onDeleteEducation?.(idx)}
                    logo={edu.logo} onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                    showLogo={layoutSettings?.showEducationLogo ?? true}
                    placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} brandColor={brandColor}
                  >
                    <div className="text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          {(layoutSettings?.showEducationLogo ?? true) && (
                            <ItemLogo logo={edu.logo} brandColor={brandColor} placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} />
                          )}
                          <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                        </span>
                        <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="font-mono text-[10px] text-slate-400" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                      </div>
                      <E value={edu.school} isEditable={isEditable} editableClass={ec} className="text-[11px] font-mono text-slate-500 mb-1 block" onSave={v => onEducationChange?.(idx, 'school', v)} />
                      <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-600 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                    </div>
                  </ItemWrapper>
                ))}
              </div>
            </section>
          </SectionWrapper>
        )}

        {resumeCerts && resumeCerts.length > 0 && (
          <section style={sec}>
            <div className={MH}>// Certifications</div>
            <div className={`flex flex-wrap gap-2 text-xs ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
              {resumeCerts.map((cert, idx) => (
                <div key={idx} className={`border border-slate-200 rounded p-2 bg-slate-50 min-w-[140px] text-${certsAlign}`}>
                  <div className={`flex items-center gap-1 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                    <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 font-bold text-[11px]" onSave={v => onCertChange?.(idx, 'title', v)} />
                    <WorkLink url={cert.url} brandColor={brandColor} />
                  </div>
                  <E tag="p" value={cert.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[10px] mt-0.5 text-${certsAlign}`} onSave={v => onCertChange?.(idx, 'desc', v)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {resumeAchievements && resumeAchievements.length > 0 && (
          <section style={sec}>
            <div className={MH}>// Achievements</div>
            <div className="space-y-2 text-xs">
              {resumeAchievements.map((ach, idx) => (
                <div key={idx} className={`flex gap-2 items-start text-${achievementsAlign} ${achievementsAlign === 'right' ? 'flex-row-reverse' : ''}`}>
                  <Award className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className={`text-slate-800 block text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'title', v)} />
                    <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[11px] text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'desc', v)} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {resumeLanguages && resumeLanguages.length > 0 && (
          <section style={sec}>
            <div className={MH}>// Languages</div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {resumeLanguages.map((lang, idx) => (
                <span key={idx} className="border border-slate-200 bg-slate-50 px-2 py-0.5 rounded">
                  <E value={lang.name} isEditable={isEditable} editableClass={ec} className="font-semibold" onSave={v => onLanguageChange?.(idx, 'name', v)} />
                  <span className="text-slate-400">:</span>
                  <E value={lang.level} isEditable={isEditable} editableClass={ec} className="text-slate-500 ml-1" onSave={v => onLanguageChange?.(idx, 'level', v)} />
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. CLEAN ATS (maximum ATS compatibility — plain, single-column, no graphics)
  // ═══════════════════════════════════════════════════════════════════════════
  if (template === 'ats') {
    const H = 'text-xs font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2 text-slate-900';
    return (
      <div className={`pdf-sheet text-slate-900 ${sheetActiveClass}`} style={{ ...sheetStyle, color: '#1a1a1a' }} id="resume-sheet"
        onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
        <TemplateHeader {...headerProps} />

        {(resumeSummary || isEditable) && (
          <section style={sec}>
            <h2 className={H} style={{ borderColor: brandColor }}>Summary</h2>
            <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
              className={`text-xs text-slate-800 leading-relaxed text-${summaryAlign}`} onSave={ef('resumeSummary')} />
          </section>
        )}

        {(resumeSkills || isEditable) && (
          <section style={sec}>
            <h2 className={H} style={{ borderColor: brandColor }}>Core Competencies</h2>
            <SkillsEditor
              value={resumeSkills}
              isEditable={isEditable}
              ec={ec}
              onSave={ef('resumeSkills')}
              accentColor2={accentColor2}
              brandColor={brandColor}
              badgeStyle={badgeStyle}
              className="text-xs text-slate-800"
              skillsStyle={skillsStyle}
            />
          </section>
        )}

        {(resumeExperience && resumeExperience.length > 0 || isEditable) && (
          <SectionWrapper
            id="experience" title="Professional Experience" isEditable={isEditable}
            align={experienceAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ experienceAlign: a })}
            onAddEntry={onAddExperience}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <section style={sec}>
              <h2 className={H} style={{ borderColor: brandColor }}>Professional Experience</h2>
              <div className="space-y-4">
                {resumeExperience.map((exp, idx) => (
                  <ItemWrapper
                    key={idx} sectionId="experience" index={idx} totalItems={resumeExperience.length}
                    isEditable={isEditable} onDelete={() => onDeleteExperience?.(idx)}
                    logo={exp.logo} onLogoChange={(logo) => onExperienceChange?.(idx, 'logo', logo)}
                    showLogo={layoutSettings?.showExperienceLogo ?? true}
                    placeholderIcon={<Building2 className="w-3.5 h-3.5" />} brandColor={brandColor}
                  >
                    <div className="text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          {(layoutSettings?.showExperienceLogo ?? true) && (
                            <ItemLogo logo={exp.logo} brandColor={brandColor} placeholderIcon={<Building2 className="w-3.5 h-3.5" />} />
                          )}
                          <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                        </span>
                        <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-normal" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                      </div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span className="flex items-center gap-1">
                          <E value={exp.company} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                          <WorkLink url={exp.url} brandColor={brandColor} />
                        </span>
                        <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                      </div>
                      <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                        onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-800"
                        bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} />
                    </div>
                  </ItemWrapper>
                ))}
              </div>
            </section>
          </SectionWrapper>
        )}

        {(resumeEducation && resumeEducation.length > 0 || isEditable) && (
          <SectionWrapper
            id="education" title="Education" isEditable={isEditable}
            align={educationAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ educationAlign: a })}
            onAddEntry={onAddEducation}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <section style={sec}>
              <h2 className={H} style={{ borderColor: brandColor }}>Education</h2>
              <div className="space-y-2">
                {resumeEducation.map((edu, idx) => (
                  <ItemWrapper
                    key={idx} sectionId="education" index={idx} totalItems={resumeEducation.length}
                    isEditable={isEditable} onDelete={() => onDeleteEducation?.(idx)}
                    logo={edu.logo} onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                    showLogo={layoutSettings?.showEducationLogo ?? true}
                    placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} brandColor={brandColor}
                  >
                    <div className="text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          {(layoutSettings?.showEducationLogo ?? true) && (
                            <ItemLogo logo={edu.logo} brandColor={brandColor} placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} />
                          )}
                          <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                        </span>
                        <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="font-normal" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                      </div>
                      <div className="flex justify-between text-slate-700 mb-0.5">
                        <E value={edu.school} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'school', v)} />
                        <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                      </div>
                      <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-700 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                    </div>
                  </ItemWrapper>
                ))}
              </div>
            </section>
          </SectionWrapper>
        )}

        {resumeCerts && resumeCerts.length > 0 && (
          <section style={sec}>
            <h2 className={H} style={{ borderColor: brandColor }}>Certifications</h2>
            <ul className="space-y-1 text-xs">
              {resumeCerts.map((cert, idx) => (
                <li key={idx} className={`flex gap-1.5 text-${certsAlign} ${certsAlign === 'right' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-slate-400">▸</span>
                  <div className="flex-1 min-w-0">
                    <span className={`inline-flex items-center gap-1 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                      <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="text-slate-900 font-bold" onSave={v => onCertChange?.(idx, 'title', v)} />
                      <WorkLink url={cert.url} brandColor={brandColor} />
                    </span>
                    {cert.desc && <> — <E value={cert.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-600 text-${certsAlign}`} onSave={v => onCertChange?.(idx, 'desc', v)} /></>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {resumeAchievements && resumeAchievements.length > 0 && (
          <section style={sec}>
            <h2 className={H} style={{ borderColor: brandColor }}>Key Achievements</h2>
            <ul className="space-y-1 text-xs">
              {resumeAchievements.map((ach, idx) => (
                <li key={idx} className={`flex gap-1.5 text-${achievementsAlign} ${achievementsAlign === 'right' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-slate-400">▸</span>
                  <div className="flex-1 min-w-0">
                    <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className={`text-slate-900 text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'title', v)} />
                    {ach.desc && <> — <E value={ach.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-600 text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'desc', v)} /></>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {resumeLanguages && resumeLanguages.length > 0 && (
          <section style={sec}>
            <h2 className={H} style={{ borderColor: brandColor }}>Languages</h2>
            <p className="text-xs text-slate-800">
              {resumeLanguages.map((lang, idx) => (
                <span key={idx}>
                  <E tag="span" value={lang.name} isEditable={isEditable} editableClass={ec} className="font-semibold" onSave={v => onLanguageChange?.(idx, 'name', v)} />
                  {' ('}<E value={lang.level} isEditable={isEditable} editableClass={ec} onSave={v => onLanguageChange?.(idx, 'level', v)} />{')'}
                  {idx < resumeLanguages.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </section>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. MODERN DESIGNER
  // ═══════════════════════════════════════════════════════════════════════════
  if (template === 'designer') {
    const getAchievementIcon = (idx: number, title: string) => {
      const t = title.toLowerCase();
      if (t.includes('rockstar') || t.includes('award') || t.includes('first') || t.includes('place') || t.includes('won')) {
        return <Trophy className="w-4 h-4 text-[#007ACC] flex-shrink-0 mt-0.5" />;
      }
      if (t.includes('medal') || t.includes('bronze') || t.includes('silver') || t.includes('gold') || t.includes('academic') || t.includes('score')) {
        return <Award className="w-4 h-4 text-[#007ACC] flex-shrink-0 mt-0.5" />;
      }
      if (t.includes('hackathon') || t.includes('participat') || t.includes('world') || t.includes('smart')) {
        return <Target className="w-4 h-4 text-[#007ACC] flex-shrink-0 mt-0.5" />;
      }
      if (t.includes('digitalocean') || t.includes('github') || t.includes('open source') || t.includes('event') || t.includes('code') || t.includes('hacktoberfest')) {
        return <Terminal className="w-4 h-4 text-[#007ACC] flex-shrink-0 mt-0.5" />;
      }
      switch (idx % 4) {
        case 0: return <Trophy className="w-4 h-4 text-[#007ACC] flex-shrink-0 mt-0.5" />;
        case 1: return <Award className="w-4 h-4 text-[#007ACC] flex-shrink-0 mt-0.5" />;
        case 2: return <Target className="w-4 h-4 text-[#007ACC] flex-shrink-0 mt-0.5" />;
        case 3:
        default:
          return <Terminal className="w-4 h-4 text-[#007ACC] flex-shrink-0 mt-0.5" />;
      }
    };

    const showPhone = !!phone;
    const showEmail = !!email;
    const showLinkedin = !!linkedin;
    const showLocation = !!location;

    const renderSectionById = (secId: string) => {
      switch (secId) {
        case 'summary':
          if (!resumeSummary && !isEditable) return null;
          return (
            <DraggableSection key="summary" id="summary" {...dragProps}>
              <section style={sec}>
                <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2 text-slate-800" style={{ borderColor: brandColor, color: brandColor }}>Summary</h3>
                <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
                  className={`text-[11px] text-slate-700 leading-relaxed text-${summaryAlign}`} onSave={ef('resumeSummary')} />
              </section>
            </DraggableSection>
          );
        case 'skills':
          if (!resumeSkills && !isEditable) return null;
          return (
            <DraggableSection key="skills" id="skills" {...dragProps}>
              <section style={sec}>
                <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2 text-slate-800" style={{ borderColor: brandColor, color: brandColor }}>Skills</h3>
                <SkillsEditor
                  value={resumeSkills}
                  isEditable={isEditable}
                  ec={ec}
                  onSave={ef('resumeSkills')}
                  accentColor2={accentColor2}
                  brandColor={brandColor}
                  badgeStyle={() => ({ background: '#f8fafc', color: '#334155', borderColor: '#cbd5e1', borderRadius: '4px', borderStyle: 'solid', borderWidth: '1px' })}
                  defaultBadgeStyle={{ background: '#f8fafc', color: '#334155', borderColor: '#cbd5e1', borderRadius: '4px', borderStyle: 'solid', borderWidth: '1px' }}
                  className="text-[11px] gap-x-2 gap-y-1.5"
                  skillsStyle={skillsStyle}
                />
              </section>
            </DraggableSection>
          );
        case 'experience':
          if (!resumeExperience || (resumeExperience.length === 0 && !isEditable)) return null;
          return (
            <DraggableSection key="experience" id="experience" {...dragProps}>
              <SectionWrapper
                id="experience" title="Experience" isEditable={isEditable}
                align={experienceAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ experienceAlign: a })}
                onAddEntry={onAddExperience}
                layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
              >
                <section style={sec}>
                  <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2 text-slate-800" style={{ borderColor: brandColor, color: brandColor }}>Experience</h3>
                  <div className="space-y-4">
                    {resumeExperience.map((exp, idx) => (
                      <ItemWrapper
                        key={idx} sectionId="experience" index={idx} totalItems={resumeExperience.length}
                        isEditable={isEditable} onDelete={() => onDeleteExperience?.(idx)}
                        logo={exp.logo} onLogoChange={(logo) => onExperienceChange?.(idx, 'logo', logo)}
                        showLogo={layoutSettings?.showExperienceLogo ?? true}
                        placeholderIcon={<Building2 className="w-3.5 h-3.5" />} brandColor={brandColor}
                      >
                        <div className="text-[11px]">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span className="flex items-center gap-1.5">
                              {(layoutSettings?.showExperienceLogo ?? true) && (
                                <ItemLogo logo={exp.logo} brandColor={brandColor} placeholderIcon={<Building2 className="w-3.5 h-3.5" />} />
                              )}
                              <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                            </span>
                            <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-normal text-slate-500" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                          </div>
                          <div className="flex justify-between text-slate-600 mb-1 font-medium">
                            <span className="flex items-center gap-1">
                              <E value={exp.company} isEditable={isEditable} editableClass={ec} className="text-[#007ACC] font-semibold" onSave={v => onExperienceChange?.(idx, 'company', v)} />
                              <WorkLink url={exp.url} brandColor={brandColor} />
                            </span>
                            <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                          </div>
                          <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                            onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700 leading-relaxed"
                            bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} />
                        </div>
                      </ItemWrapper>
                    ))}
                  </div>
                </section>
              </SectionWrapper>
            </DraggableSection>
          );
        case 'education':
          if (!resumeEducation || (resumeEducation.length === 0 && !isEditable)) return null;
          return (
            <DraggableSection key="education" id="education" {...dragProps}>
              <SectionWrapper
                id="education" title="Education" isEditable={isEditable}
                align={educationAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ educationAlign: a })}
                onAddEntry={onAddEducation}
                layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
              >
                <section style={sec}>
                  <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2 text-slate-800" style={{ borderColor: brandColor, color: brandColor }}>Education</h3>
                  <div className="space-y-3">
                    {resumeEducation.map((edu, idx) => {
                      const { gradeText, remaining } = parseEducationGrade(edu.bullets);
                      return (
                        <ItemWrapper
                          key={idx} sectionId="education" index={idx} totalItems={resumeEducation.length}
                          isEditable={isEditable} onDelete={() => onDeleteEducation?.(idx)}
                          logo={edu.logo} onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                          showLogo={layoutSettings?.showEducationLogo ?? true}
                          placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} brandColor={brandColor}
                        >
                          <div className="text-[11px] flex gap-3 justify-between items-start">
                            <div className="flex-1">
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                {(layoutSettings?.showEducationLogo ?? true) && (
                                  <ItemLogo logo={edu.logo} brandColor={brandColor} placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} />
                                )}
                                <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                              </div>
                              <div className="flex justify-between text-slate-600 font-medium mb-1">
                                <E value={edu.school} isEditable={isEditable} editableClass={ec} className="text-[#007ACC] font-semibold" onSave={v => onEducationChange?.(idx, 'school', v)} />
                              </div>
                              <div className="flex justify-between text-slate-500 text-[10px] mb-1">
                                <E value={edu.dates} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'dates', v)} />
                                <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                              </div>
                              <E tag="p" value={remaining} isEditable={isEditable} editableClass={ec} className={`text-slate-600 leading-relaxed text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                            </div>
                            {gradeText && (
                              <div className="flex items-center gap-2 h-full flex-shrink-0 self-stretch mt-1">
                                <div className="w-[1px] bg-slate-300 self-stretch min-h-[30px]" />
                                <div className="text-[10px] font-bold text-[#007ACC] text-center whitespace-pre-line leading-tight px-1 min-w-[60px]">
                                  {gradeText}
                                </div>
                              </div>
                            )}
                          </div>
                        </ItemWrapper>
                      );
                    })}
                  </div>
                </section>
              </SectionWrapper>
            </DraggableSection>
          );
        case 'certs':
          if (!resumeCerts || resumeCerts.length === 0) return null;
          return (
            <DraggableSection key="certs" id="certs" {...dragProps}>
              <section style={sec}>
                <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2 text-slate-800" style={{ borderColor: brandColor, color: brandColor }}>Projects</h3>
                <ul className="space-y-3 text-[11px]">
                  {resumeCerts.map((cert, idx) => {
                    const desc = cert.desc || '';
                    const isTechIdx = desc.toLowerCase().indexOf('tech:');
                    let cleanDesc = desc;
                    let techStack = '';
                    if (isTechIdx !== -1) {
                      cleanDesc = desc.substring(0, isTechIdx).trim();
                      techStack = desc.substring(isTechIdx).trim();
                    }
                    return (
                      <li key={idx} className={`text-${certsAlign}`}>
                        <div className={`flex items-center gap-1 font-bold text-slate-800 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                          <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="font-bold text-slate-800"
                            onSave={v => onCertChange?.(idx, 'title', v)} />
                          <WorkLink url={cert.url} brandColor={brandColor} />
                        </div>
                        {cleanDesc && (
                          <E tag="p" value={cleanDesc} isEditable={isEditable} editableClass={ec} className={`text-slate-600 mt-0.5 leading-relaxed text-${certsAlign}`}
                            onSave={v => onCertChange?.(idx, 'desc', v)} />
                        )}
                        {techStack && (
                          <div className={`text-slate-500 italic mt-0.5 text-[10px] text-${certsAlign}`}>
                            {techStack}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            </DraggableSection>
          );
        case 'achievements':
          if (!resumeAchievements || resumeAchievements.length === 0) return null;
          return (
            <DraggableSection key="achievements" id="achievements" {...dragProps}>
              <section style={sec}>
                <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2 text-slate-800" style={{ borderColor: brandColor, color: brandColor }}>Key Achievements</h3>
                <ul className="space-y-3 text-[11px]">
                  {resumeAchievements.map((ach, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      {getAchievementIcon(idx, ach.title)}
                      <div className="flex-1 min-w-0">
                        <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 font-bold block"
                          onSave={v => onAchievementChange?.(idx, 'title', v)} />
                        <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className="text-slate-600 text-[10px] mt-0.5 leading-relaxed"
                          onSave={v => onAchievementChange?.(idx, 'desc', v)} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </DraggableSection>
          );
        case 'languages':
          if (!resumeLanguages || resumeLanguages.length === 0) return null;
          return (
            <DraggableSection key="languages" id="languages" {...dragProps}>
              <section style={sec}>
                <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2 text-slate-800" style={{ borderColor: brandColor, color: brandColor }}>Languages</h3>
                <div className="space-y-2">
                  {resumeLanguages.map((lang, idx) => {
                    const bubbles = getLanguageBubbleCount(lang.level);
                    return (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <div>
                          <E value={lang.name} isEditable={isEditable} editableClass={ec} className="font-semibold text-slate-800"
                            onSave={v => onLanguageChange?.(idx, 'name', v)} />
                          <div className="text-[10px] text-slate-500">
                            <E value={lang.level} isEditable={isEditable} editableClass={ec}
                              onSave={v => onLanguageChange?.(idx, 'level', v)} />
                          </div>
                        </div>
                        <LanguageBubbles count={bubbles} activeColor={brandColor} />
                      </div>
                    );
                  })}
                </div>
              </section>
            </DraggableSection>
          );
        default:
          return null;
      }
    };

    return (
      <div className={`pdf-sheet text-slate-800 font-sans ${sheetActiveClass}`} style={sheetStyle} id="resume-sheet"
        onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
        {/* Custom Header */}
        <header className="flex justify-between items-start border-b pb-4 mb-4" style={{ borderColor: `${brandColor}40` }}>
          <div className="flex-1">
            <E tag="h1" value={name} isEditable={isEditable} editableClass={ec}
              className="text-3xl font-extrabold tracking-tight" style={{ color: brandColor, fontFamily: headingFontCss }} onSave={ef('name')} />
            <E tag="p" value={subtitle} isEditable={isEditable} editableClass={ec}
              className="text-xs font-semibold uppercase mt-1.5 tracking-wider" style={{ color: accentColor2 || brandColor }} onSave={ef('subtitle')} />

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3.5 text-[10px] text-slate-500 font-medium">
              {showPhone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <E value={phone} isEditable={isEditable} editableClass={ec} onSave={ef('phone')} />
                </span>
              )}
              {showEmail && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <E value={email} isEditable={isEditable} editableClass={ec} onSave={ef('email')} />
                </span>
              )}
              {showLinkedin && (
                <span className="flex items-center gap-1.5">
                  <span className="text-slate-400 flex items-center justify-center w-3 h-3"><LI /></span>
                  <E value={linkedin} isEditable={isEditable} editableClass={ec} href={formatLinkedinUrl(linkedin)} onSave={ef('linkedin')} />
                </span>
              )}
              {showLocation && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <E value={location} isEditable={isEditable} editableClass={ec} onSave={ef('location')} />
                </span>
              )}
            </div>
          </div>
          {showPhoto && avatar && (
            <ProfilePhotoWithWaves avatar={avatar} brandColor={brandColor} accentColor2={accentColor2} />
          )}
        </header>

        {/* Two column split body */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-6 mt-4">
          <div 
            className={`designer-column space-y-4 min-h-[150px] transition-all duration-200 ${showLayoutBounds ? 'border-2 border-dashed border-slate-200 p-2 rounded-xl bg-slate-50/5' : ''}`}
            onDragOver={(e) => handleSectionDragOver(e)}
            onDrop={(e) => handleColumnDrop(e, 'left')}
          >
            {designerLeftSections.map(secId => renderSectionById(secId))}
          </div>

          <div 
            className={`designer-column space-y-4 min-h-[150px] transition-all duration-200 ${showLayoutBounds ? 'border-2 border-dashed border-slate-200 p-2 rounded-xl bg-slate-50/5' : ''}`}
            onDragOver={(e) => handleSectionDragOver(e)}
            onDrop={(e) => handleColumnDrop(e, 'right')}
          >
            {designerRightSections.map(secId => renderSectionById(secId))}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. EXECUTIVE (premium two-tone header, bold hierarchy)
  // ═══════════════════════════════════════════════════════════════════════════
  const H6 = 'text-xs font-bold uppercase tracking-widest pb-1 mb-2 border-b';
  return (
    <div className={`pdf-sheet ${sheetActiveClass}`} style={{ ...sheetStyle, color: '#1e293b' }} id="resume-sheet"
        onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
      {/* Full-width branded header band — now uses shared TemplateHeader */}
    <TemplateHeader {...headerProps} />

      {(resumeSummary || isEditable) && (
        <section style={sec}>
          <h3 className={H6} style={{ borderColor: brandColor, color: brandColor }}>Executive Summary</h3>
          <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
            className={`text-xs text-slate-700 leading-relaxed text-${summaryAlign}`} onSave={ef('resumeSummary')} />
        </section>
      )}

      {(resumeSkills || isEditable) && (
        <section style={sec}>
          <h3 className={H6} style={{ borderColor: brandColor, color: brandColor }}>Core Expertise</h3>
            <SkillsEditor
              value={resumeSkills}
              isEditable={isEditable}
              ec={ec}
              onSave={ef('resumeSkills')}
              accentColor2={accentColor2}
              brandColor={brandColor}
              badgeStyle={(i) => ({ ...badgeStyle(i), borderRadius: '9999px' })}
              defaultBadgeStyle={{ background: brandColor, color: '#fff', borderRadius: '9999px' }}
              className="text-[11px] gap-x-2 gap-y-1.5"
              skillsStyle={skillsStyle}
            />
        </section>
      )}

      {resumeExperience && resumeExperience.length > 0 && (
        <section style={sec}>
          <h3 className={H6} style={{ borderColor: brandColor, color: brandColor }}>Professional Experience</h3>
          <div className="space-y-4">
            {resumeExperience.map((exp, idx) => (
              <div key={idx} className="text-xs pl-3 border-l-2" style={{ borderColor: `${brandColor}50` }}>
                <div className="flex justify-between font-bold text-slate-900">
                  <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                  <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-normal text-slate-500" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                </div>
                <div className="flex justify-between text-slate-600 italic mb-1.5">
                  <span className="flex items-center gap-1">
                    <E value={exp.company} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                    <WorkLink url={exp.url} brandColor={brandColor} />
                  </span>
                  <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                </div>
                <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                  onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700"
                  bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} />
              </div>
            ))}
          </div>
        </section>
      )}

      {resumeEducation && resumeEducation.length > 0 && (
        <section style={sec}>
          <h3 className={H6} style={{ borderColor: brandColor, color: brandColor }}>Education</h3>
          <div className="space-y-2">
            {resumeEducation.map((edu, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                  <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="font-normal text-slate-500" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                </div>
                <div className="flex justify-between text-slate-600 italic mb-0.5">
                  <E value={edu.school} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'school', v)} />
                  <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                </div>
                <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-600 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
              </div>
            ))}
          </div>
        </section>
      )}

      <BottomSections {...bottomProps} accentColor={brandColor}
        headingClass={H6} />
    </div>
  );

  return null; // unreachable fallback
  }; // end renderTemplate

  return (
    <ActiveSectionContext.Provider value={sectionContextValue}>
      {renderTemplate()}
    </ActiveSectionContext.Provider>
  );
};

function formatMarkdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
