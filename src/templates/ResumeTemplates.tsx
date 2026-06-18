import React from 'react';
import type { ResumeState, ExperienceItem, EducationItem, CertItem, AchievementItem, LanguageItem } from '../types';
import { Mail, Phone, MapPin, Star } from 'lucide-react';

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

export const ResumeTemplateRenderer: React.FC<ResumeTemplateProps> = ({
  state,
  isEditable = false,
  onFieldChange,
  onExperienceChange,
  onEducationChange,
  onCertChange,
  onAchievementChange,
  onLanguageChange
}) => {
  const {
    name,
    subtitle,
    phone,
    email,
    linkedin,
    location,
    avatar,
    resumeSummary,
    resumeSkills,
    resumeExperience,
    resumeEducation,
    resumeCerts,
    resumeAchievements,
    resumeLanguages,
    layoutSettings
  } = state;

  const {
    fontSize,
    paddingTopBottom,
    paddingLeftRight,
    sectionSpacing,
    lineHeight,
    template = 'navy',
    brandColor = '#314855'
  } = layoutSettings;

  // Custom inline styling based on user sliders
  const sheetStyle: React.CSSProperties = {
    fontSize: `${fontSize}pt`,
    padding: `${paddingTopBottom}mm ${paddingLeftRight}mm`,
    lineHeight: lineHeight,
    color: '#334155'
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: `${sectionSpacing}px`
  };

  // Split skills by comma
  const skillsList = resumeSkills ? resumeSkills.split(',').map(s => s.trim()).filter(Boolean) : [];

  const editableClass = isEditable ? "outline-none hover:bg-slate-100/80 focus:bg-slate-100 rounded px-1 -mx-1 transition" : "";

  // -------------------------------------------------------------
  // 1. NAVY TEMPLATE (Navy Elegant)
  // -------------------------------------------------------------
  if (template === 'navy') {
    return (
      <div className="pdf-sheet font-sans" style={sheetStyle} id="resume-sheet">
        {/* Header Section */}
        <header className="text-center border-b-2 pb-4 mb-4" style={{ borderColor: brandColor }}>
          <h1
            className={`text-3xl font-bold tracking-tight text-slate-800 ${editableClass}`}
            style={{ color: brandColor }}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('name', e.currentTarget.textContent || '')}
          >
            {name}
          </h1>
          <p
            className={`text-sm font-medium text-slate-500 uppercase mt-1 tracking-wide ${editableClass}`}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('subtitle', e.currentTarget.textContent || '')}
          >
            {subtitle}
          </p>
          
          {/* Contact Bar */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-3">
            { (phone || isEditable) && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('phone', e.currentTarget.textContent || '')}
                >
                  {phone || 'Phone'}
                </span>
              </span>
            )}
            { (email || isEditable) && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('email', e.currentTarget.textContent || '')}
                >
                  {email || 'Email'}
                </span>
              </span>
            )}
            { (location || isEditable) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('location', e.currentTarget.textContent || '')}
                >
                  {location || 'Location'}
                </span>
              </span>
            )}
            { (linkedin || isEditable) && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('linkedin', e.currentTarget.textContent || '')}
                >
                  {linkedin || 'LinkedIn'}
                </span>
              </span>
            )}
          </div>
        </header>

        {/* Profile Summary */}
        {(resumeSummary || isEditable) && (
          <section style={sectionStyle}>
            <p
              className={`text-justify text-slate-700 ${editableClass}`}
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
              onBlur={(e) => onFieldChange?.('resumeSummary', e.currentTarget.textContent || '')}
            >
              {resumeSummary || 'Profile Summary'}
            </p>
          </section>
        )}

        {/* Skills Section */}
        {(resumeSkills || isEditable) && (
          <section style={sectionStyle}>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: brandColor, borderColor: `${brandColor}40` }}>Skills</h3>
            {isEditable ? (
              <div
                className={`text-xs p-2 bg-slate-50 border border-dashed border-slate-200 text-slate-800 ${editableClass}`}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => onFieldChange?.('resumeSkills', e.currentTarget.textContent || '')}
              >
                {resumeSkills}
              </div>
            ) : (
              <div className="flex flex-wrap gap-x-2 gap-y-1.5 text-xs">
                {skillsList.map((skill, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium border border-slate-200">{skill}</span>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Experience Section */}
        {resumeExperience && resumeExperience.length > 0 && (
          <section style={sectionStyle}>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: brandColor, borderColor: `${brandColor}40` }}>Professional Experience</h3>
            <div className="space-y-4">
              {resumeExperience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onExperienceChange?.(idx, 'title', e.currentTarget.textContent || '')}
                    >
                      {exp.title}
                    </span>
                    <span
                      className={`text-slate-500 font-normal ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onExperienceChange?.(idx, 'dates', e.currentTarget.textContent || '')}
                    >
                      {exp.dates}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 italic mb-1.5">
                    <span
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onExperienceChange?.(idx, 'company', e.currentTarget.textContent || '')}
                    >
                      {exp.company}
                    </span>
                    <span
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onExperienceChange?.(idx, 'location', e.currentTarget.textContent || '')}
                    >
                      {exp.location}
                    </span>
                  </div>
                  <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700">
                    {exp.bullets.split('\n').map((bullet, bIdx) => (
                      isEditable ? (
                        <li
                          key={bIdx}
                          className={editableClass}
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => {
                            if (!onExperienceChange) return;
                            const newBullets = exp.bullets.split('\n');
                            newBullets[bIdx] = e.currentTarget.textContent || '';
                            onExperienceChange(idx, 'bullets', newBullets.join('\n'));
                          }}
                        >
                          {bullet}
                        </li>
                      ) : (
                        <li key={bIdx} dangerouslySetInnerHTML={{ __html: formatMarkdownBold(bullet) }}></li>
                      )
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {resumeEducation && resumeEducation.length > 0 && (
          <section style={sectionStyle}>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: brandColor, borderColor: `${brandColor}40` }}>Education</h3>
            <div className="space-y-3">
              {resumeEducation.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onEducationChange?.(idx, 'degree', e.currentTarget.textContent || '')}
                    >
                      {edu.degree}
                    </span>
                    <span
                      className={`text-slate-500 font-normal ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onEducationChange?.(idx, 'dates', e.currentTarget.textContent || '')}
                    >
                      {edu.dates}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 italic mb-1">
                    <span
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onEducationChange?.(idx, 'school', e.currentTarget.textContent || '')}
                    >
                      {edu.school}
                    </span>
                    <span
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onEducationChange?.(idx, 'location', e.currentTarget.textContent || '')}
                    >
                      {edu.location}
                    </span>
                  </div>
                  <p
                    className={`text-slate-700 ${editableClass}`}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onEducationChange?.(idx, 'bullets', e.currentTarget.textContent || '')}
                  >
                    {edu.bullets}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Grid: Certifications, Achievements, Languages */}
        <div className="grid grid-cols-2 gap-4" style={sectionStyle}>
          {/* Certifications */}
          {resumeCerts && resumeCerts.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: brandColor, borderColor: `${brandColor}40` }}>Certifications</h3>
              <ul className="space-y-2 text-xs">
                {resumeCerts.map((cert, idx) => (
                  <li key={idx}>
                    <strong
                      className={`text-slate-800 block ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onCertChange?.(idx, 'title', e.currentTarget.textContent || '')}
                    >
                      {cert.title}
                    </strong>
                    <p
                      className={`text-slate-600 text-[11px] mt-0.5 ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onCertChange?.(idx, 'desc', e.currentTarget.textContent || '')}
                    >
                      {cert.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Achievements & Languages */}
          <div className="space-y-4">
            {resumeAchievements && resumeAchievements.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: brandColor, borderColor: `${brandColor}40` }}>Achievements</h3>
                <ul className="space-y-2 text-xs">
                  {resumeAchievements.map((ach, idx) => (
                    <li key={idx} className="flex gap-2">
                      <Star className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <strong
                          className={`text-slate-800 block ${editableClass}`}
                          contentEditable={isEditable}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => onAchievementChange?.(idx, 'title', e.currentTarget.textContent || '')}
                        >
                          {ach.title}
                        </strong>
                        <p
                          className={`text-slate-600 text-[11px] ${editableClass}`}
                          contentEditable={isEditable}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => onAchievementChange?.(idx, 'desc', e.currentTarget.textContent || '')}
                        >
                          {ach.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resumeLanguages && resumeLanguages.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: brandColor, borderColor: `${brandColor}40` }}>Languages</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {resumeLanguages.map((lang, idx) => (
                    <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200 flex gap-1 items-center">
                      <strong
                        className={editableClass}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onLanguageChange?.(idx, 'name', e.currentTarget.textContent || '')}
                      >
                        {lang.name}
                      </strong>
                      <span>(</span>
                      <span
                        className={editableClass}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onLanguageChange?.(idx, 'level', e.currentTarget.textContent || '')}
                      >
                        {lang.level}
                      </span>
                      <span>)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. SERIF TEMPLATE (Harvard Classic Serif)
  // -------------------------------------------------------------
  if (template === 'serif') {
    return (
      <div className="pdf-sheet font-serif text-justify" style={sheetStyle} id="resume-sheet">
        <header className="text-center mb-6">
          <h1
            className={`text-3xl font-normal tracking-wide text-slate-900 ${editableClass}`}
            style={{ color: brandColor }}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('name', e.currentTarget.textContent || '')}
          >
            {name}
          </h1>
          <p
            className={`text-xs italic text-slate-500 mt-1 ${editableClass}`}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('subtitle', e.currentTarget.textContent || '')}
          >
            {subtitle}
          </p>
          <div className="flex justify-center gap-x-3 text-xs text-slate-600 mt-2 font-sans flex-wrap">
            { (phone || isEditable) && (
              <>
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('phone', e.currentTarget.textContent || '')}
                >
                  {phone || 'Phone'}
                </span>
                <span>&bull;</span>
              </>
            )}
            { (email || isEditable) && (
              <>
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('email', e.currentTarget.textContent || '')}
                >
                  {email || 'Email'}
                </span>
                <span>&bull;</span>
              </>
            )}
            { (location || isEditable) && (
              <>
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('location', e.currentTarget.textContent || '')}
                >
                  {location || 'Location'}
                </span>
              </>
            )}
            { (linkedin || isEditable) && (
              <>
                <span>&bull;</span>
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('linkedin', e.currentTarget.textContent || '')}
                >
                  {linkedin || 'LinkedIn'}
                </span>
              </>
            )}
          </div>
        </header>

        {(resumeSummary || isEditable) && (
          <section style={sectionStyle}>
            <p
              className={`text-slate-800 leading-relaxed text-[13px] ${editableClass}`}
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
              onBlur={(e) => onFieldChange?.('resumeSummary', e.currentTarget.textContent || '')}
            >
              {resumeSummary || 'Profile Summary'}
            </p>
          </section>
        )}

        {(resumeSkills || isEditable) && (
          <section style={sectionStyle} className="text-xs">
            <h3 className="text-[13px] font-bold text-center border-b pb-0.5 mb-2 uppercase tracking-widest text-slate-800">Skills &amp; Expertise</h3>
            {isEditable ? (
              <div
                className={`text-xs p-2 bg-slate-50 border border-dashed border-slate-200 text-slate-800 text-center font-sans ${editableClass}`}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => onFieldChange?.('resumeSkills', e.currentTarget.textContent || '')}
              >
                {resumeSkills}
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed text-center font-sans">
                {skillsList.join('  •  ')}
              </p>
            )}
          </section>
        )}

        {resumeExperience && resumeExperience.length > 0 && (
          <section style={sectionStyle}>
            <h3 className="text-[13px] font-bold text-center border-b pb-0.5 mb-3 uppercase tracking-widest text-slate-800">Experience</h3>
            <div className="space-y-4">
              {resumeExperience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-950">
                    <span>
                      <span
                        className={editableClass}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onExperienceChange?.(idx, 'title', e.currentTarget.textContent || '')}
                      >
                        {exp.title}
                      </span>
                      <span> — </span>
                      <span
                        className={`font-normal italic text-slate-700 ${editableClass}`}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onExperienceChange?.(idx, 'company', e.currentTarget.textContent || '')}
                      >
                        {exp.company}
                      </span>
                    </span>
                    <span
                      className={`font-normal font-sans text-slate-500 ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onExperienceChange?.(idx, 'dates', e.currentTarget.textContent || '')}
                    >
                      {exp.dates}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 italic mb-1.5 flex justify-between font-sans">
                    <span
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onExperienceChange?.(idx, 'location', e.currentTarget.textContent || '')}
                    >
                      {exp.location}
                    </span>
                  </div>
                  <ul className="list-disc list-outside pl-4 space-y-1 text-slate-800 leading-relaxed">
                    {exp.bullets.split('\n').map((bullet, bIdx) => (
                      isEditable ? (
                        <li
                          key={bIdx}
                          className={editableClass}
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => {
                            if (!onExperienceChange) return;
                            const newBullets = exp.bullets.split('\n');
                            newBullets[bIdx] = e.currentTarget.textContent || '';
                            onExperienceChange(idx, 'bullets', newBullets.join('\n'));
                          }}
                        >
                          {bullet}
                        </li>
                      ) : (
                        <li key={bIdx} dangerouslySetInnerHTML={{ __html: formatMarkdownBold(bullet) }}></li>
                      )
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {resumeEducation && resumeEducation.length > 0 && (
          <section style={sectionStyle}>
            <h3 className="text-[13px] font-bold text-center border-b pb-0.5 mb-3 uppercase tracking-widest text-slate-800">Education</h3>
            <div className="space-y-3">
              {resumeEducation.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-955 font-serif">
                    <span>
                      <span
                        className={editableClass}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onEducationChange?.(idx, 'degree', e.currentTarget.textContent || '')}
                      >
                        {edu.degree}
                      </span>
                      <span> — </span>
                      <span
                        className={`font-normal italic text-slate-700 ${editableClass}`}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onEducationChange?.(idx, 'school', e.currentTarget.textContent || '')}
                      >
                        {edu.school}
                      </span>
                    </span>
                    <span
                      className={`font-normal font-sans text-slate-500 ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onEducationChange?.(idx, 'dates', e.currentTarget.textContent || '')}
                    >
                      {edu.dates}
                    </span>
                  </div>
                  <p
                    className={`text-slate-700 mt-1 ${editableClass}`}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onEducationChange?.(idx, 'bullets', e.currentTarget.textContent || '')}
                  >
                    {edu.bullets}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. SIDEBAR TEMPLATE (Creative Two-Column)
  // -------------------------------------------------------------
  if (template === 'sidebar') {
    return (
      <div className="pdf-sheet p-0 font-sans text-slate-800 flex flex-row min-h-[1123px] w-[794px]" style={{ fontSize: `${fontSize}pt` }} id="resume-sheet">
        {/* Left Column (Sidebar) */}
        <aside className="w-[230px] bg-slate-50 border-r border-slate-200/60 p-6 flex flex-col gap-6 flex-shrink-0 text-slate-700">
          {avatar && (
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-slate-300">
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>
          )}
          
          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">Contact</h4>
            <ul className="space-y-2 text-[11px] leading-relaxed">
              { (phone || isEditable) && (
                <li className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span
                    className={editableClass}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onFieldChange?.('phone', e.currentTarget.textContent || '')}
                  >
                    {phone || 'Phone'}
                  </span>
                </li>
              )}
              { (email || isEditable) && (
                <li className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span
                    className={editableClass}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onFieldChange?.('email', e.currentTarget.textContent || '')}
                  >
                    {email || 'Email'}
                  </span>
                </li>
              )}
              { (location || isEditable) && (
                <li className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span
                    className={editableClass}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onFieldChange?.('location', e.currentTarget.textContent || '')}
                  >
                    {location || 'Location'}
                  </span>
                </li>
              )}
              { (linkedin || isEditable) && (
                <li className="flex items-center gap-1.5 truncate">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  <span
                    className={editableClass}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onFieldChange?.('linkedin', e.currentTarget.textContent || '')}
                  >
                    {linkedin || 'LinkedIn'}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Skills Badges */}
          {(resumeSkills || isEditable) && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2.5">Skills</h4>
              {isEditable ? (
                <div
                  className={`text-[10px] p-2 bg-white border border-dashed border-slate-200 text-slate-800 ${editableClass}`}
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('resumeSkills', e.currentTarget.textContent || '')}
                >
                  {resumeSkills}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {skillsList.map((skill, idx) => (
                    <span key={idx} className="bg-slate-200/60 text-slate-800 px-2 py-0.5 rounded-full border border-slate-300/40 font-medium">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Languages */}
          {resumeLanguages && resumeLanguages.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">Languages</h4>
              <ul className="space-y-1.5 text-[11px]">
                {resumeLanguages.map((lang, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <strong
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onLanguageChange?.(idx, 'name', e.currentTarget.textContent || '')}
                    >
                      {lang.name}
                    </strong>
                    <span
                      className={`text-slate-500 ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onLanguageChange?.(idx, 'level', e.currentTarget.textContent || '')}
                    >
                      {lang.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Right Column (Main Content) */}
        <main className="flex-1 p-8" style={{ lineHeight: lineHeight }}>
          <header className="mb-6">
            <h1
              className={`text-3xl font-extrabold tracking-tight ${editableClass}`}
              style={{ color: brandColor }}
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
              onBlur={(e) => onFieldChange?.('name', e.currentTarget.textContent || '')}
            >
              {name}
            </h1>
            <p
              className={`text-sm font-medium text-slate-500 uppercase mt-1 tracking-wide ${editableClass}`}
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
              onBlur={(e) => onFieldChange?.('subtitle', e.currentTarget.textContent || '')}
            >
              {subtitle}
            </p>
          </header>

          { (resumeSummary || isEditable) && (
            <div className="text-xs text-justify text-slate-700 leading-relaxed mb-6">
              <p
                className={editableClass}
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onBlur={(e) => onFieldChange?.('resumeSummary', e.currentTarget.textContent || '')}
              >
                {resumeSummary || 'Profile Summary'}
              </p>
            </div>
          )}

          {/* Experience */}
          {resumeExperience && resumeExperience.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-3">Experience</h3>
              <div className="space-y-4">
                {resumeExperience.map((exp, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span
                        className={editableClass}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onExperienceChange?.(idx, 'title', e.currentTarget.textContent || '')}
                      >
                        {exp.title}
                      </span>
                      <span
                        className={`text-slate-400 font-normal ${editableClass}`}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onExperienceChange?.(idx, 'dates', e.currentTarget.textContent || '')}
                      >
                        {exp.dates}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 italic mb-1.5">
                      <span
                        className={editableClass}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onExperienceChange?.(idx, 'company', e.currentTarget.textContent || '')}
                      >
                        {exp.company}
                      </span>
                      <span
                        className={editableClass}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onExperienceChange?.(idx, 'location', e.currentTarget.textContent || '')}
                      >
                        {exp.location}
                      </span>
                    </div>
                    <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700">
                      {exp.bullets.split('\n').map((bullet, bIdx) => (
                        isEditable ? (
                          <li
                            key={bIdx}
                            className={editableClass}
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => {
                              if (!onExperienceChange) return;
                              const newBullets = exp.bullets.split('\n');
                              newBullets[bIdx] = e.currentTarget.textContent || '';
                              onExperienceChange(idx, 'bullets', newBullets.join('\n'));
                            }}
                          >
                            {bullet}
                          </li>
                        ) : (
                          <li key={bIdx} dangerouslySetInnerHTML={{ __html: formatMarkdownBold(bullet) }}></li>
                        )
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeEducation && resumeEducation.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-3">Education</h3>
              <div className="space-y-3">
                {resumeEducation.map((edu, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span
                        className={editableClass}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onEducationChange?.(idx, 'degree', e.currentTarget.textContent || '')}
                      >
                        {edu.degree}
                      </span>
                      <span
                        className={`text-slate-400 font-normal ${editableClass}`}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onEducationChange?.(idx, 'dates', e.currentTarget.textContent || '')}
                      >
                        {edu.dates}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 italic mb-1">
                      <span
                        className={editableClass}
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onEducationChange?.(idx, 'school', e.currentTarget.textContent || '')}
                      >
                        {edu.school}
                      </span>
                    </div>
                    <p
                      className={`text-slate-600 ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onEducationChange?.(idx, 'bullets', e.currentTarget.textContent || '')}
                    >
                      {edu.bullets}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. TECH TEMPLATE (Modern Monospace Developer style)
  // -------------------------------------------------------------
  return (
    <div className="pdf-sheet font-sans" style={sheetStyle} id="resume-sheet">
      <header className="border-l-4 pl-4 py-1 mb-6" style={{ borderColor: brandColor }}>
        <h1
          className={`text-3xl font-extrabold tracking-tight text-slate-900 ${editableClass}`}
          contentEditable={isEditable}
          suppressContentEditableWarning={true}
          onBlur={(e) => onFieldChange?.('name', e.currentTarget.textContent || '')}
        >
          {name}
        </h1>
        <p
          className={`text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider ${editableClass}`}
          contentEditable={isEditable}
          suppressContentEditableWarning={true}
          onBlur={(e) => onFieldChange?.('subtitle', e.currentTarget.textContent || '')}
        >
          &gt; {subtitle}
        </p>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-600 mt-3">
          { (phone || isEditable) && (
            <span>
              [phone]{' '}
              <span
                className={editableClass}
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onBlur={(e) => onFieldChange?.('phone', e.currentTarget.textContent || '')}
              >
                {phone || 'Phone'}
              </span>
            </span>
          )}
          { (email || isEditable) && (
            <span>
              [email]{' '}
              <span
                className={editableClass}
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onBlur={(e) => onFieldChange?.('email', e.currentTarget.textContent || '')}
              >
                {email || 'Email'}
              </span>
            </span>
          )}
          { (location || isEditable) && (
            <span>
              [loc]{' '}
              <span
                className={editableClass}
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onBlur={(e) => onFieldChange?.('location', e.currentTarget.textContent || '')}
              >
                {location || 'Location'}
              </span>
            </span>
          )}
          { (linkedin || isEditable) && (
            <span>
              [li]{' '}
              <span
                className={editableClass}
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onBlur={(e) => onFieldChange?.('linkedin', e.currentTarget.textContent || '')}
              >
                {linkedin || 'LinkedIn'}
              </span>
            </span>
          )}
        </div>
      </header>

      {(resumeSummary || isEditable) && (
        <section className="mb-6">
          <p
            className={`text-xs text-slate-700 leading-relaxed ${editableClass}`}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('resumeSummary', e.currentTarget.textContent || '')}
          >
            {resumeSummary || 'Profile Summary'}
          </p>
        </section>
      )}

      {(resumeSkills || isEditable) && (
        <section className="mb-6">
          <div className="font-mono text-xs font-bold text-slate-950 uppercase tracking-widest border-b pb-1 mb-2.5">// Core_Tech_Stack</div>
          {isEditable ? (
            <div
              className={`text-[10px] font-mono p-2 bg-slate-50 border border-dashed border-slate-200 text-slate-800 ${editableClass}`}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => onFieldChange?.('resumeSkills', e.currentTarget.textContent || '')}
            >
              {resumeSkills}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
              {skillsList.map((skill, idx) => (
                <span key={idx} className="border border-slate-300 rounded px-2 py-0.5 text-slate-700 bg-slate-50">{skill}</span>
              ))}
            </div>
          )}
        </section>
      )}

      {resumeExperience && resumeExperience.length > 0 && (
        <section className="mb-6">
          <div className="font-mono text-xs font-bold text-slate-950 uppercase tracking-widest border-b pb-1 mb-3">// Experience_Log</div>
          <div className="space-y-4">
            {resumeExperience.map((exp, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between font-bold text-slate-900 font-sans">
                  <span>
                    <span
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onExperienceChange?.(idx, 'title', e.currentTarget.textContent || '')}
                    >
                      {exp.title}
                    </span>
                    <span> @ </span>
                    <span
                      className={`text-slate-600 ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onExperienceChange?.(idx, 'company', e.currentTarget.textContent || '')}
                    >
                      {exp.company}
                    </span>
                  </span>
                  <span
                    className={`font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 ${editableClass}`}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onExperienceChange?.(idx, 'dates', e.currentTarget.textContent || '')}
                  >
                    {exp.dates}
                  </span>
                </div>
                <div
                  className={`text-[11px] font-mono text-slate-500 italic mb-1.5 ${editableClass}`}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onExperienceChange?.(idx, 'location', e.currentTarget.textContent || '')}
                >
                  {exp.location}
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {exp.bullets.split('\n').map((bullet, bIdx) => (
                    isEditable ? (
                      <li
                        key={bIdx}
                        className={editableClass}
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                          if (!onExperienceChange) return;
                          const newBullets = exp.bullets.split('\n');
                          newBullets[bIdx] = e.currentTarget.textContent || '';
                          onExperienceChange(idx, 'bullets', newBullets.join('\n'));
                        }}
                      >
                        {bullet}
                      </li>
                    ) : (
                      <li key={bIdx} dangerouslySetInnerHTML={{ __html: formatMarkdownBold(bullet) }}></li>
                    )
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {resumeEducation && resumeEducation.length > 0 && (
        <section className="mb-6">
          <div className="font-mono text-xs font-bold text-slate-950 uppercase tracking-widest border-b pb-1 mb-3">// Academic_Profile</div>
          <div className="space-y-3">
            {resumeEducation.map((edu, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span
                    className={editableClass}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onEducationChange?.(idx, 'degree', e.currentTarget.textContent || '')}
                  >
                    {edu.degree}
                  </span>
                  <span
                    className={`font-mono text-[10px] text-slate-400 ${editableClass}`}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onEducationChange?.(idx, 'dates', e.currentTarget.textContent || '')}
                  >
                    {edu.dates}
                  </span>
                </div>
                <div
                  className={`text-[11px] font-mono text-slate-500 mb-1 ${editableClass}`}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onEducationChange?.(idx, 'school', e.currentTarget.textContent || '')}
                >
                  {edu.school}
                </div>
                <p
                  className={`text-slate-600 ${editableClass}`}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onEducationChange?.(idx, 'bullets', e.currentTarget.textContent || '')}
                >
                  {edu.bullets}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// Pure utility helper to format markdown bolding **text** to HTML <strong>text</strong>
function formatMarkdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
