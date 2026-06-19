import React from 'react';
import {
  Award, Phone, Mail, MapPin, Trophy, Target, Terminal,
  Building2, GraduationCap,
} from 'lucide-react';
import { EditableText as E } from '../../shared/EditableText';
import { BulletList } from '../../shared/BulletList';
import { SkillsEditor } from '../../shared/SkillsEditor';
import { formatLinkedinUrl } from '../../../utils/linkedin';
import { parseEducationGrade } from '../../shared/parseEducationGrade';
import { getLanguageBubbleCount } from '../../../utils/languageLevel';
import { useTemplateRenderContext } from '../useTemplateSetup';
import {
  DraggableSection,
  ItemLogo,
  ItemWrapper,
  LI,
  LanguageBubbles,
  ProfilePhotoWithWaves,
  SectionWrapper,
  WorkLink,
} from '../shared';

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

export const DesignerTemplate: React.FC = () => {
  const {
    sheetActiveClass, sheetStyle, isEditable, clearActive, sec, ec, ef,
    name, subtitle, phone, email, linkedin, location, avatar,
    resumeSummary, resumeSkills, resumeExperience, resumeEducation,
    resumeCerts, resumeAchievements, resumeLanguages, layoutSettings,
    brandColor, accentColor2, bulletStyle, skillsStyle, summaryAlign,
    experienceAlign, educationAlign, certsAlign,
    showPhoto, headingFontCss, dragProps, handleSectionDragOver, handleColumnDrop,
    designerLeftSections, designerRightSections, showLayoutBounds,
    onLayoutSettingsChange, onAddExperience, onDeleteExperience,
    onExperienceChange, onAddEducation, onDeleteEducation, onEducationChange,
    onCertChange, onAchievementChange, onLanguageChange, onFieldChange,
  } = useTemplateRenderContext();

  const showTitle = layoutSettings?.showTitle ?? true;
  const uppercaseName = layoutSettings?.uppercaseName ?? false;
  const hasPhone = (layoutSettings?.showPhone ?? true) && !!(phone && phone.trim());
  const hasEmail = (layoutSettings?.showEmail ?? true) && !!(email && email.trim());
  const hasLocation = (layoutSettings?.showLocation ?? true) && !!(location && location.trim());
  const hasLinkedin = (layoutSettings?.showLinkedin ?? true) && !!(linkedin && linkedin.trim());

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
                          bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} prefixId={`exp-${idx}`} />
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
      <header className="flex justify-between items-start border-b pb-4 mb-4" style={{ borderColor: `${brandColor}40` }}>
        <div className="flex-1">
          <E tag="h1" value={name} isEditable={isEditable} editableClass={ec}
            className={`text-3xl font-extrabold tracking-tight ${uppercaseName ? 'uppercase' : ''}`}
            style={{ color: brandColor, fontFamily: headingFontCss }} onSave={ef('name')} />
          {showTitle && (
            <E tag="p" value={subtitle} isEditable={isEditable} editableClass={ec}
              className="text-xs font-semibold uppercase mt-1.5 tracking-wider" style={{ color: accentColor2 || brandColor }} onSave={ef('subtitle')} />
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3.5 text-[10px] text-slate-500 font-medium">
            {hasPhone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <E value={phone} isEditable={isEditable} editableClass={ec} onSave={ef('phone')} />
              </span>
            )}
            {hasEmail && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <E value={email} isEditable={isEditable} editableClass={ec} onSave={ef('email')} />
              </span>
            )}
            {hasLinkedin && (
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400 flex items-center justify-center w-3 h-3"><LI /></span>
                <E value={linkedin} isEditable={isEditable} editableClass={ec} href={formatLinkedinUrl(linkedin)} onSave={ef('linkedin')} />
              </span>
            )}
            {hasLocation && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <E value={location} isEditable={isEditable} editableClass={ec} onSave={ef('location')} />
              </span>
            )}
          </div>
        </div>
        {showPhoto && (
          <ProfilePhotoWithWaves
            avatar={avatar}
            name={name}
            brandColor={brandColor}
            accentColor2={accentColor2}
            isEditable={isEditable}
            onAvatarChange={(url) => onFieldChange?.('avatar', url)}
            layoutSettings={layoutSettings}
            onLayoutSettingsChange={onLayoutSettingsChange}
          />
        )}
      </header>

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
};
