import React from 'react';
import type { ResumeState, ExperienceItem, EducationItem, CertItem, AchievementItem, LanguageItem } from '../types';
import { Star, Award, Phone, Mail, MapPin } from 'lucide-react';
import { FONT_CSS } from '../config/fonts';
import { TemplateHeader } from './TemplateHeader';

interface ResumeTemplateProps {
  state: ResumeState;
  isEditable?: boolean;
  onFieldChange?: (field: keyof ResumeState, value: string) => void;
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
  tag?: 'span' | 'p' | 'strong' | 'div' | 'h1' | 'h2' | 'h3';
  style?: React.CSSProperties;
  dangerousInnerHtml?: string;
}
const E: React.FC<EditableProps> = ({ value, className, onSave, isEditable, editableClass, tag = 'span', style, dangerousInnerHtml }) => {
  const Tag = tag;
  if (isEditable) {
    return (
      <Tag
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
  if (dangerousInnerHtml !== undefined) {
    return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: dangerousInnerHtml }} />;
  }
  return <Tag className={className} style={style}>{value}</Tag>;
};

// ─── Bullet list renderer ─────────────────────────────────────────────────────
function BulletList({
  bullets, isEditable, editableClass, onBulletChange, className = ''
}: {
  bullets: string; isEditable: boolean; editableClass: string;
  onBulletChange: (updated: string) => void; className?: string;
}) {
  const lines = bullets.split('\n').filter(l => l.trim());
  if (!lines.length) return null;
  return (
    <ul className={`list-disc list-outside pl-4 space-y-0.5 ${className}`}>
      {lines.map((bullet, bIdx) =>
        isEditable ? (
          <li key={bIdx} className={`${editableClass}`}
            contentEditable={true} suppressContentEditableWarning={true}
            onBlur={(e) => {
              const updated = bullets.split('\n');
              updated[bIdx] = (e.currentTarget as HTMLElement).textContent || '';
              onBulletChange(updated.join('\n'));
            }}
          >{bullet}</li>
        ) : (
          <li key={bIdx} dangerouslySetInnerHTML={{ __html: formatMarkdownBold(bullet) }} />
        )
      )}
    </ul>
  );
}

// ─── LinkedIn icon — module-level so it's not recreated each render ──────────
const LI: React.FC = () => (
  <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);

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
}

const BottomSections: React.FC<BottomSectionsProps> = ({
  resumeCerts, resumeAchievements, resumeLanguages,
  sec, isEditable, ec, accentColor, headingClass,
  onCertChange, onAchievementChange, onLanguageChange,
}) => (
  <>
    {resumeCerts && resumeCerts.length > 0 && (
      <section style={sec}>
        <h3 className={headingClass} style={{ color: accentColor, borderColor: `${accentColor}40` }}>Certifications</h3>
        <ul className="space-y-1.5 text-xs">
          {resumeCerts.map((cert, idx) => (
            <li key={idx}>
              <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 block"
                onSave={v => onCertChange?.(idx, 'title', v)} />
              <E tag="p" value={cert.desc} isEditable={isEditable} editableClass={ec} className="text-slate-500 text-[11px] mt-0.5"
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
            <li key={idx} className="flex gap-2">
              <Star className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
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
  } = layoutSettings;

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
  const skillsList = resumeSkills ? resumeSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
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
  const bottomProps = { resumeCerts, resumeAchievements, resumeLanguages, sec, isEditable, ec, onCertChange, onAchievementChange, onLanguageChange };

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
              className="text-xs text-justify text-slate-700 leading-relaxed" onSave={ef('resumeSummary')} />
          </section>
        )}

        {(resumeSkills || isEditable) && (
          <section style={sec}>
            <h3 className={H} style={{ color: brandColor, borderColor: `${brandColor}40` }}>Skills</h3>
            {isEditable
              ? <E tag="div" value={resumeSkills} isEditable={isEditable} editableClass={ec}
                  className="text-xs p-2 bg-slate-50 border border-dashed border-slate-200 text-slate-800"
                  onSave={ef('resumeSkills')} />
              : <div className="flex flex-wrap gap-x-2 gap-y-1.5 text-xs">
                  {skillsList.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded font-medium border"
                      style={accentColor2 ? badgeStyle(i) : { background: '#f1f5f9', color: '#1e293b', borderColor: '#e2e8f0' }}>
                      {s}
                    </span>
                  ))}
                </div>
            }
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
                    <E value={exp.company} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                    <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                  </div>
                  <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                    onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700" />
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
                  <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className="text-slate-700" onSave={v => onEducationChange?.(idx, 'bullets', v)} />
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
              className="text-slate-800 leading-relaxed text-[13px]" onSave={ef('resumeSummary')} />
          </section>
        )}

        {(resumeSkills || isEditable) && (
          <section style={sec} className="text-xs">
            <h3 className={H}>Skills &amp; Expertise</h3>
            {isEditable
              ? <E tag="div" value={resumeSkills} isEditable={isEditable} editableClass={ec}
                  className="text-xs p-2 bg-slate-50 border border-dashed border-slate-200 font-sans text-center"
                  onSave={ef('resumeSkills')} />
              : accentColor2
                ? <div className="flex flex-wrap justify-center gap-x-2 gap-y-1.5 text-xs font-sans">
                    {skillsList.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded font-medium border" style={badgeStyle(i)}>{s}</span>
                    ))}
                  </div>
                : <p className="text-slate-700 leading-relaxed text-center font-sans">{skillsList.join('  •  ')}</p>
            }
          </section>
        )}

        {resumeExperience && resumeExperience.length > 0 && (
          <section style={sec}>
            <h3 className={H}>Experience</h3>
            <div className="space-y-4">
              {resumeExperience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-950">
                    <span>
                      <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                      <span> — </span>
                      <E value={exp.company} isEditable={isEditable} editableClass={ec} className="font-normal italic text-slate-700" onSave={v => onExperienceChange?.(idx, 'company', v)} />
                    </span>
                    <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-normal font-sans text-slate-500" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                  </div>
                  <div className="text-[11px] text-slate-500 italic mb-1.5 font-sans">
                    <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                  </div>
                  <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                    onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-800 leading-relaxed" />
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
                  <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className="text-slate-700 mt-1" onSave={v => onEducationChange?.(idx, 'bullets', v)} />
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
    return (
      <div className="pdf-sheet p-0 text-slate-800 flex flex-row" style={{ ...sheetStyle, padding: 0 }} id="resume-sheet">
        {/* Left column */}
        <aside className="w-[220px] flex-shrink-0 flex flex-col gap-5 p-5" style={{ background: brandColor + '15', borderRight: `3px solid ${brandColor}` }}>
          {showAvatar && (
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2" style={{ borderColor: brandColor }}>
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Contact</h4>
            <ul className="space-y-1.5 text-[11px] leading-relaxed">
              {(phone || isEditable) && <li className="flex items-center gap-1.5"><Phone className="w-3 h-3 flex-shrink-0" /><E value={phone || 'Phone'} isEditable={isEditable} editableClass={ec} onSave={ef('phone')} /></li>}
              {(email || isEditable) && <li className="flex items-center gap-1.5"><Mail className="w-3 h-3 flex-shrink-0" /><E value={email || 'Email'} isEditable={isEditable} editableClass={ec} onSave={ef('email')} /></li>}
              {(location || isEditable) && <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 flex-shrink-0" /><E value={location || 'Location'} isEditable={isEditable} editableClass={ec} onSave={ef('location')} /></li>}
              {(linkedin || isEditable) && <li className="flex items-center gap-1.5"><LI /><E value={linkedin || 'LinkedIn'} isEditable={isEditable} editableClass={ec} onSave={ef('linkedin')} /></li>}
            </ul>
          </div>

          {(resumeSkills || isEditable) && (
            <div>
              <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Skills</h4>
              {isEditable
                ? <E tag="div" value={resumeSkills} isEditable={isEditable} editableClass={ec}
                    className="text-[10px] p-1 bg-white/50 border border-dashed border-slate-300" onSave={ef('resumeSkills')} />
                : <div className="flex flex-wrap gap-1 text-[10px]">
                    {skillsList.map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded-full font-medium"
                        style={accentColor2 ? badgeStyle(i) : { background: brandColor + 'cc', color: '#fff' }}>
                        {s}
                      </span>
                    ))}
                  </div>
              }
            </div>
          )}

          {resumeCerts && resumeCerts.length > 0 && (
            <div>
              <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Certifications</h4>
              <ul className="space-y-2 text-[11px]">
                {resumeCerts.map((cert, idx) => (
                  <li key={idx}>
                    <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="block text-slate-900" onSave={v => onCertChange?.(idx, 'title', v)} />
                    <E tag="p" value={cert.desc} isEditable={isEditable} editableClass={ec} className="text-slate-500 text-[10px]" onSave={v => onCertChange?.(idx, 'desc', v)} />
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
                  <li key={idx}>
                    <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className="block text-slate-900" onSave={v => onAchievementChange?.(idx, 'title', v)} />
                    <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className="text-slate-500 text-[10px]" onSave={v => onAchievementChange?.(idx, 'desc', v)} />
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
                className="text-xs text-justify text-slate-700 leading-relaxed" onSave={ef('resumeSummary')} />
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
                      <E value={exp.company} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                      <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                    </div>
                    <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                      onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700" />
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
                    <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className="text-slate-600" onSave={v => onEducationChange?.(idx, 'bullets', v)} />
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
              className="text-xs text-slate-700 leading-relaxed" onSave={ef('resumeSummary')} />
          </section>
        )}

        {(resumeSkills || isEditable) && (
          <section style={sec}>
            <div className={MH}>// Core_Tech_Stack</div>
            {isEditable
              ? <E tag="div" value={resumeSkills} isEditable={isEditable} editableClass={ec}
                  className="text-[10px] font-mono p-2 bg-slate-50 border border-dashed border-slate-200" onSave={ef('resumeSkills')} />
              : <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  {skillsList.map((s, i) => (
                    <span key={i} className="border rounded px-2 py-0.5"
                      style={accentColor2 ? badgeStyle(i) : { borderColor: '#cbd5e1', color: '#334155', background: '#f8fafc' }}>
                      {s}
                    </span>
                  ))}
                </div>
            }
          </section>
        )}

        {resumeExperience && resumeExperience.length > 0 && (
          <section style={sec}>
            <div className={MH}>// Experience_Log</div>
            <div className="space-y-4">
              {resumeExperience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span><E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} /><span> @ </span><E value={exp.company} isEditable={isEditable} editableClass={ec} className="text-slate-600 font-normal" onSave={v => onExperienceChange?.(idx, 'company', v)} /></span>
                    <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                  </div>
                  <E value={exp.location} isEditable={isEditable} editableClass={ec} className="text-[11px] font-mono text-slate-500 italic mb-1.5 block" onSave={v => onExperienceChange?.(idx, 'location', v)} />
                  <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                    onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700" />
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
                  <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className="text-slate-600" onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {resumeCerts && resumeCerts.length > 0 && (
          <section style={sec}>
            <div className={MH}>// Certifications</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {resumeCerts.map((cert, idx) => (
                <div key={idx} className="border border-slate-200 rounded p-2 bg-slate-50 min-w-[140px]">
                  <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 block text-[11px]" onSave={v => onCertChange?.(idx, 'title', v)} />
                  <E tag="p" value={cert.desc} isEditable={isEditable} editableClass={ec} className="text-slate-500 text-[10px] mt-0.5" onSave={v => onCertChange?.(idx, 'desc', v)} />
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
                <div key={idx} className="flex gap-2 items-start">
                  <Award className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className="text-slate-800" onSave={v => onAchievementChange?.(idx, 'title', v)} />
                    <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className="text-slate-500 text-[11px]" onSave={v => onAchievementChange?.(idx, 'desc', v)} />
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
              className="text-xs text-slate-800 leading-relaxed" onSave={ef('resumeSummary')} />
          </section>
        )}

        {(resumeSkills || isEditable) && (
          <section style={sec}>
            <h2 className={H} style={{ borderColor: brandColor }}>Core Competencies</h2>
            {isEditable
              ? <E tag="div" value={resumeSkills} isEditable={isEditable} editableClass={ec}
                  className="text-xs p-1 bg-slate-50 border border-dashed border-slate-200" onSave={ef('resumeSkills')} />
              : accentColor2
                ? <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
                    {skillsList.map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded border" style={badgeStyle(i)}>{s}</span>
                    ))}
                  </div>
                : <p className="text-xs text-slate-800 leading-relaxed">{skillsList.join(' • ')}</p>
            }
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
                    <E value={exp.company} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                    <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                  </div>
                  <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                    onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-800" />
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
                  <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className="text-slate-700" onSave={v => onEducationChange?.(idx, 'bullets', v)} />
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
                <li key={idx} className="flex gap-1.5">
                  <span className="text-slate-400">▸</span>
                  <div>
                    <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="text-slate-900" onSave={v => onCertChange?.(idx, 'title', v)} />
                    {cert.desc && <> — <E value={cert.desc} isEditable={isEditable} editableClass={ec} className="text-slate-600" onSave={v => onCertChange?.(idx, 'desc', v)} /></>}
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
                <li key={idx} className="flex gap-1.5">
                  <span className="text-slate-400">▸</span>
                  <div>
                    <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className="text-slate-900" onSave={v => onAchievementChange?.(idx, 'title', v)} />
                    {ach.desc && <> — <E value={ach.desc} isEditable={isEditable} editableClass={ec} className="text-slate-600" onSave={v => onAchievementChange?.(idx, 'desc', v)} /></>}
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
            className="text-xs text-slate-700 leading-relaxed text-justify" onSave={ef('resumeSummary')} />
        </section>
      )}

      {(resumeSkills || isEditable) && (
        <section style={sec}>
          <h3 className={H6} style={{ borderColor: brandColor, color: brandColor }}>Core Expertise</h3>
          {isEditable
            ? <E tag="div" value={resumeSkills} isEditable={isEditable} editableClass={ec}
                className="text-xs p-2 bg-slate-50 border border-dashed border-slate-200" onSave={ef('resumeSkills')} />
            : <div className="flex flex-wrap gap-x-2 gap-y-1.5 text-xs">
                {skillsList.map((s, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                    style={accentColor2 ? { ...badgeStyle(i), borderRadius: '9999px' } : { background: brandColor, color: '#fff' }}>
                    {s}
                  </span>
                ))}
              </div>
          }
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
                  <E value={exp.company} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                  <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                </div>
                <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                  onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700" />
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
                <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className="text-slate-600" onSave={v => onEducationChange?.(idx, 'bullets', v)} />
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
