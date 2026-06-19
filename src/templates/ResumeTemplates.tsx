import React, { useState, useEffect } from 'react';
import type { ResumeState, ExperienceItem, EducationItem, CertItem, AchievementItem, LanguageItem } from '../types';
import { Star, Award, Phone, Mail, MapPin, ExternalLink, Trophy, Target, Terminal } from 'lucide-react';
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
  editClassName?: string;
  skillsStyle?: 'chips' | 'normal';
}> = ({ value, isEditable, ec, onSave, accentColor2, brandColor, badgeStyle, defaultBadgeStyle, className = '', editClassName = '', skillsStyle = 'chips' }) => {
  const [editing, setEditing] = useState(false);
  const skillsList = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    if (editing) {
      const el = document.querySelector('.skills-editable-area[contenteditable="true"]') as HTMLElement | null;
      if (el) {
        el.focus();
        try {
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(el);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        } catch (err) {
          console.warn('Failed to set selection range:', err);
        }
      }
    }
  }, [editing]);

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
      <div className={`flex flex-wrap gap-x-2 gap-y-1.5 text-xs ${className}`}>
        {skillsList.map((s, i) => {
          const baseStyle = accentColor2 ? badgeStyle(i) : fallbackDefaultStyle;
          return (
            <span key={i} className="inline-block align-middle text-center px-2.5 rounded font-medium border"
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
      {editing ? (
        <div className="space-y-1">
          <div className="text-[9px] text-brand-accent font-semibold select-none">Editing skills (comma-separated):</div>
          <E
            tag="div"
            value={value}
            isEditable={true}
            editableClass={`${ec} skills-editable-area`}
            className={`text-xs p-2 bg-slate-50 border border-dashed border-slate-200 text-slate-800 w-full ${editClassName}`}
            onSave={(v) => {
              onSave(v);
              setEditing(false);
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1 w-full">
          <div className={`flex flex-wrap gap-x-2 gap-y-1.5 text-xs w-full ${className}`}>
            {skillsList.length > 0 ? (
              skillsList.map((s, i) => {
                const baseStyle = accentColor2 ? badgeStyle(i) : fallbackDefaultStyle;
                return (
                  <span
                    key={i}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, i)}
                    className="inline-block align-middle text-center px-2.5 rounded font-medium border select-none cursor-grab active:cursor-grabbing hover:scale-105 hover:border-slate-400 transition-all duration-150"
                    style={{ ...baseStyle, height: '1.8em', lineHeight: '1.8em', paddingTop: 0, paddingBottom: 0 }}
                    title="Drag to reorder"
                  >
                    {s}
                  </span>
                );
              })
            ) : (
              <span className="text-slate-400 italic select-none">No skills added...</span>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="self-start text-[10px] text-brand-accent hover:underline cursor-pointer font-semibold mt-1"
          >
            Edit List
          </button>
        </div>
      )}
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
  onCertChange, onAchievementChange, onLanguageChange
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
    : { background: undefined };

  // Shared props for BottomSections — avoids repeating at every call site
  const bottomProps = {
    resumeCerts, resumeAchievements, resumeLanguages, sec, isEditable, ec,
    onCertChange, onAchievementChange, onLanguageChange,
    certsAlign, achievementsAlign
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. NAVY ELEGANT
  // ═══════════════════════════════════════════════════════════════════════════
  if (template === 'navy') {
    const H = 'text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2';
    return (
      <div className="pdf-sheet" style={sheetStyle} id="resume-sheet">
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

        {resumeExperience && resumeExperience.length > 0 && (
          <section style={sec}>
            <h3 className={H} style={{ color: brandColor, borderColor: `${brandColor}40` }}>Professional Experience</h3>
            <div className="space-y-4">
              {resumeExperience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
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
              ))}
            </div>
          </section>
        )}

        {resumeEducation && resumeEducation.length > 0 && (
          <section style={sec}>
            <h3 className={H} style={{ color: brandColor, borderColor: `${brandColor}40` }}>Education</h3>
            <div className="space-y-3">
              {resumeEducation.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                    <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="text-slate-500 font-normal" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                  </div>
                  <div className="flex justify-between text-slate-600 italic mb-1">
                    <E value={edu.school} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'school', v)} />
                    <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                  </div>
                  <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-700 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                </div>
              ))}
            </div>
          </section>
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
      <div className="pdf-sheet text-justify" style={sheetStyle} id="resume-sheet">
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
              editClassName="text-xs p-2 bg-slate-50 border border-dashed border-slate-200 font-sans text-center"
              skillsStyle={skillsStyle}
            />
          </section>
        )}

        {resumeExperience && resumeExperience.length > 0 && (
          <section style={sec}>
            <h3 className={H}>Experience</h3>
            <div className="space-y-4">
              {resumeExperience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-950">
                    <span className="flex items-center gap-1">
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
              ))}
            </div>
          </section>
        )}

        {resumeEducation && resumeEducation.length > 0 && (
          <section style={sec}>
            <h3 className={H}>Education</h3>
            <div className="space-y-3">
              {resumeEducation.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-950 font-serif">
                    <span>
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
              ))}
            </div>
          </section>
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
      <div className="pdf-sheet p-0 text-slate-800 flex flex-row" style={{ ...sheetStyle, padding: 0 }} id="resume-sheet">
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
                editClassName="text-[10px] p-1 bg-white/50 border border-dashed border-slate-300"
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

          {resumeExperience && resumeExperience.length > 0 && (
            <div style={sec}>
              <h3 className={SH} style={{ borderColor: `${brandColor}40`, color: brandColor }}>Experience</h3>
              <div className="space-y-3">
                {resumeExperience.map((exp, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
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
                ))}
              </div>
            </div>
          )}

          {resumeEducation && resumeEducation.length > 0 && (
            <div style={sec}>
              <h3 className={SH} style={{ borderColor: `${brandColor}40`, color: brandColor }}>Education</h3>
              <div className="space-y-3">
                {resumeEducation.map((edu, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                      <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="text-slate-400 font-normal" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                    </div>
                    <div className="flex justify-between text-slate-500 italic mb-1">
                      <E value={edu.school} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'school', v)} />
                      <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                    </div>
                    <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-600 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                  </div>
                ))}
              </div>
            </div>
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
      <div className="pdf-sheet" style={sheetStyle} id="resume-sheet">
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
              editClassName="text-[10px] font-mono p-2 bg-slate-50 border border-dashed border-slate-200"
              skillsStyle={skillsStyle}
            />
          </section>
        )}

        {resumeExperience && resumeExperience.length > 0 && (
          <section style={sec}>
            <div className={MH}>// Experience_Log</div>
            <div className="space-y-4">
              {resumeExperience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1"><E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} /><span> @ </span><E value={exp.company} isEditable={isEditable} editableClass={ec} className="text-slate-600 font-normal" onSave={v => onExperienceChange?.(idx, 'company', v)} /><WorkLink url={exp.url} brandColor={brandColor} /></span>
                    <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                  </div>
                  <E value={exp.location} isEditable={isEditable} editableClass={ec} className="text-[11px] font-mono text-slate-500 italic mb-1.5 block" onSave={v => onExperienceChange?.(idx, 'location', v)} />
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
            <div className={MH}>// Academic_Profile</div>
            <div className="space-y-3">
              {resumeEducation.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                    <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="font-mono text-[10px] text-slate-400" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                  </div>
                  <E value={edu.school} isEditable={isEditable} editableClass={ec} className="text-[11px] font-mono text-slate-500 mb-1 block" onSave={v => onEducationChange?.(idx, 'school', v)} />
                  <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-600 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                </div>
              ))}
            </div>
          </section>
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
      <div className="pdf-sheet text-slate-900" style={{ ...sheetStyle, color: '#1a1a1a' }} id="resume-sheet">
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
              editClassName="text-xs p-1 bg-slate-50 border border-dashed border-slate-200"
              skillsStyle={skillsStyle}
            />
          </section>
        )}

        {resumeExperience && resumeExperience.length > 0 && (
          <section style={sec}>
            <h2 className={H} style={{ borderColor: brandColor }}>Professional Experience</h2>
            <div className="space-y-4">
              {resumeExperience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
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
              ))}
            </div>
          </section>
        )}

        {resumeEducation && resumeEducation.length > 0 && (
          <section style={sec}>
            <h2 className={H} style={{ borderColor: brandColor }}>Education</h2>
            <div className="space-y-2">
              {resumeEducation.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                    <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="font-normal" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                  </div>
                  <div className="flex justify-between text-slate-700 mb-0.5">
                    <E value={edu.school} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'school', v)} />
                    <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                  </div>
                  <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-700 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                </div>
              ))}
            </div>
          </section>
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
                  editClassName="text-xs p-2 bg-slate-50 border border-dashed border-slate-200"
                  skillsStyle={skillsStyle}
                />
              </section>
            </DraggableSection>
          );
        case 'experience':
          if (!resumeExperience || resumeExperience.length === 0) return null;
          return (
            <DraggableSection key="experience" id="experience" {...dragProps}>
              <section style={sec}>
                <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2 text-slate-800" style={{ borderColor: brandColor, color: brandColor }}>Experience</h3>
                <div className="space-y-4">
                  {resumeExperience.map((exp, idx) => (
                    <div key={idx} className="text-[11px]">
                      <div className="flex justify-between font-bold text-slate-800">
                        <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
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
                  ))}
                </div>
              </section>
            </DraggableSection>
          );
        case 'education':
          if (!resumeEducation || resumeEducation.length === 0) return null;
          return (
            <DraggableSection key="education" id="education" {...dragProps}>
              <section style={sec}>
                <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2 text-slate-800" style={{ borderColor: brandColor, color: brandColor }}>Education</h3>
                <div className="space-y-3">
                  {resumeEducation.map((edu, idx) => {
                    const { gradeText, remaining } = parseEducationGrade(edu.bullets);
                    return (
                      <div key={idx} className="text-[11px] flex gap-3 justify-between items-start">
                        <div className="flex-1">
                          <div className="font-bold text-slate-800">
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
                    );
                  })}
                </div>
              </section>
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
      <div className="pdf-sheet text-slate-800 font-sans" style={sheetStyle} id="resume-sheet">
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
    <div className="pdf-sheet" style={{ ...sheetStyle, color: '#1e293b' }} id="resume-sheet">
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
              editClassName="text-xs p-2 bg-slate-50 border border-dashed border-slate-200"
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
};

function formatMarkdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
