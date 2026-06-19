import React from 'react';
import {
  Phone, Mail, MapPin,
  Building2, GraduationCap,
} from 'lucide-react';
import { EditableText as E } from '../../shared/EditableText';
import { BulletList } from '../../shared/BulletList';
import { SkillsEditor } from '../../shared/SkillsEditor';
import { EntryIconPicker } from '../../shared/EntryIconPicker';
import { getDynamicAchievementIcon, getDynamicProjectIcon } from '../../shared/templateIconHelpers';
import { HeaderWaveLines } from '../../shared/HeaderWaveLines';
import { formatLinkedinUrl } from '../../../utils/linkedin';
import { EducationDescription } from '../../shared/EducationDescription';
import { HeaderWrapper } from '../../shared/HeaderWrapper';
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
import { ExperienceEntrySettings, EducationEntrySettings, CertEntrySettings, AchievementEntrySettings } from '../../shared/entrySettings';
import { isEntryFieldVisible } from '../../../utils/entryVisibility';

export const DesignerTemplate: React.FC = () => {
  const {
    sheetActiveClass, sheetStyle, isEditable, clearActive, sec, ec, ef,
    name, subtitle, phone, email, linkedin, location, avatar,
    resumeSummary, resumeSkills, resumeExperience, resumeEducation,
    resumeCerts, resumeAchievements, resumeLanguages, layoutSettings,
    brandColor, accentColor2, bulletStyle, skillsStyle, summaryAlign, badgeStyle,
    experienceAlign, educationAlign, certsAlign,
    showPhoto, headingFontCss, dragProps, handleSectionDragOver, handleColumnDrop,
    designerLeftSections, designerRightSections, showLayoutBounds,
    onLayoutSettingsChange, onAddExperience, onDeleteExperience,
    onExperienceChange, onAddEducation, onDeleteEducation, onEducationChange,
    onCertChange, onAchievementChange, onLanguageChange, onFieldChange,
    onEntryVisibilityChange, onDuplicateExperience, onAddSimilarExperience,
    onDuplicateEducation, onAddSimilarEducation,
    onAddCert, onDeleteCert, onAddAchievement, onDeleteAchievement, onAddLanguage, onDeleteLanguage,
  } = useTemplateRenderContext();

  const H = 'text-xs font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2 text-slate-800';
  const showTitle = layoutSettings?.showTitle ?? true;
  const uppercaseName = layoutSettings?.uppercaseName ?? false;
  const hasPhone = (layoutSettings?.showPhone ?? true) && !!(phone && phone.trim());
  const hasEmail = (layoutSettings?.showEmail ?? true) && !!(email && email.trim());
  const hasLocation = (layoutSettings?.showLocation ?? true) && !!(location && location.trim());
  const hasLinkedin = (layoutSettings?.showLinkedin ?? true) && !!(linkedin && linkedin.trim());

  const showExp = (exp: (typeof resumeExperience)[number], field: keyof NonNullable<(typeof resumeExperience)[number]['visibility']>) =>
    isEntryFieldVisible(exp.visibility, field);

  const showEdu = (edu: (typeof resumeEducation)[number], field: keyof NonNullable<(typeof resumeEducation)[number]['visibility']>) =>
    isEntryFieldVisible(edu.visibility, field);

  const showCert = (cert: NonNullable<typeof resumeCerts>[number], field: keyof NonNullable<NonNullable<typeof resumeCerts>[number]['visibility']>) =>
    isEntryFieldVisible(cert.visibility, field);

  const showAch = (ach: NonNullable<typeof resumeAchievements>[number], field: keyof NonNullable<NonNullable<typeof resumeAchievements>[number]['visibility']>) =>
    isEntryFieldVisible(ach.visibility, field);

  const showProjectIcons = layoutSettings?.showProjectIcons ?? true;
  const showProjectDesc = layoutSettings?.showProjectDesc ?? true;
  const showAchievementIcons = layoutSettings?.showAchievementIcons ?? true;
  const showAchievementDesc = layoutSettings?.showAchievementDesc ?? true;

  const handleAddSkill = () => {
    const list = resumeSkills ? resumeSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
    onFieldChange?.('resumeSkills', [...list, 'New Skill'].join(', '));
  };

  const renderSectionById = (secId: string) => {
    switch (secId) {
      case 'summary':
        if (!resumeSummary && !isEditable) return null;
        return (
          <DraggableSection key="summary" id="summary" {...dragProps}>
            <SectionWrapper
              id="summary" title="Summary" isEditable={isEditable}
              align={summaryAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ summaryAlign: a })}
            >
              <section style={sec}>
                <h3 className={H} style={{ borderColor: brandColor, color: brandColor }}>Summary</h3>
                <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
                  className={`text-[11px] text-slate-700 leading-relaxed text-${summaryAlign}`} onSave={ef('resumeSummary')} />
              </section>
            </SectionWrapper>
          </DraggableSection>
        );
      case 'skills':
        if (!resumeSkills && !isEditable) return null;
        return (
          <DraggableSection key="skills" id="skills" {...dragProps}>
            <SectionWrapper
              id="skills" title="Skills" isEditable={isEditable}
              align={undefined}
              skillsStyle={skillsStyle}
              onSkillsStyleChange={(s) => onLayoutSettingsChange?.({ skillsStyle: s })}
              onSkillsValueChange={ef('resumeSkills')}
              onAddEntry={handleAddSkill}
            >
              <section style={sec}>
                <h3 className={H} style={{ borderColor: brandColor, color: brandColor }}>Skills</h3>
                <SkillsEditor
                  value={resumeSkills}
                  isEditable={isEditable}
                  ec={ec}
                  onSave={ef('resumeSkills')}
                  badgeStyle={badgeStyle}
                  className="text-[11px]"
                  skillsStyle={skillsStyle}
                />
              </section>
            </SectionWrapper>
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
                <h3 className={H} style={{ borderColor: brandColor, color: brandColor }}>Experience</h3>
                <div className="space-y-4">
                  {resumeExperience.map((exp, idx) => {
                    const showLogo = (layoutSettings?.showExperienceLogo ?? true) && showExp(exp, 'logo');
                    const showDates = (layoutSettings?.showExperienceDates ?? true) && showExp(exp, 'dates');
                    const showLocation = (layoutSettings?.showExperienceLocation ?? true) && showExp(exp, 'location');
                    const showCompany = (layoutSettings?.showExperienceCompany ?? true) && showExp(exp, 'company');
                    const showBullets = showExp(exp, 'bullets');
                    const showLink = showExp(exp, 'link');

                    return (
                      <ItemWrapper
                        key={idx} sectionId="experience" index={idx} totalItems={resumeExperience.length}
                        isEditable={isEditable} onDelete={() => onDeleteExperience?.(idx)}
                        onDuplicate={() => onDuplicateExperience?.(idx)}
                        onAddSimilar={() => onAddSimilarExperience?.(idx)}
                        settingsPanel={(onClose) => (
                          <ExperienceEntrySettings
                            item={exp}
                            onToggle={(field, value) => onEntryVisibilityChange?.('experience', idx, field, value)}
                            onClose={onClose}
                            logo={exp.logo}
                            onLogoChange={(logo) => onExperienceChange?.(idx, 'logo', logo)}
                            placeholderIcon={<Building2 className="w-3.5 h-3.5" />}
                            brandColor={brandColor}
                            onUrlChange={(url) => onExperienceChange?.(idx, 'url', url)}
                          />
                        )}
                      >
                        <div className="text-[11px]">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span className="flex items-center gap-1.5">
                              {showLogo && (
                                <ItemLogo logo={exp.logo} brandColor={brandColor} placeholderIcon={<Building2 className="w-3.5 h-3.5" />} />
                              )}
                              <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                            </span>
                            {showDates && (
                              <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-normal text-slate-500" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                            )}
                          </div>
                          {(showCompany || showLocation || (showLink && exp.url)) && (
                            <div className="flex justify-between text-slate-600 mb-1 font-medium">
                              <span className="flex items-center gap-1">
                                {showCompany && (
                                  <E value={exp.company} isEditable={isEditable} editableClass={ec} className="text-[#007ACC] font-semibold" onSave={v => onExperienceChange?.(idx, 'company', v)} />
                                )}
                                {showLink && <WorkLink url={exp.url} brandColor={brandColor} />}
                              </span>
                              {showLocation && (
                                <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                              )}
                            </div>
                          )}
                          {showBullets && (
                            <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                              onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700 leading-relaxed"
                              bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} prefixId={`exp-${idx}`} />
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
                <h3 className={H} style={{ borderColor: brandColor, color: brandColor }}>Education</h3>
                <div className="space-y-3">
                  {resumeEducation.map((edu, idx) => {
                    const { gradeText } = parseEducationGrade(edu.bullets);
                    const showLogo = (layoutSettings?.showEducationLogo ?? true) && showEdu(edu, 'logo');
                    const showDates = (layoutSettings?.showEducationDates ?? true) && showEdu(edu, 'dates');
                    const showLocation = (layoutSettings?.showEducationLocation ?? true) && showEdu(edu, 'location');
                    const showGpa = (layoutSettings?.showEducationGpa ?? true) && showEdu(edu, 'gpa');
                    const showBullets = showEdu(edu, 'bullets');

                    return (
                      <ItemWrapper
                        key={idx} sectionId="education" index={idx} totalItems={resumeEducation.length}
                        isEditable={isEditable} onDelete={() => onDeleteEducation?.(idx)}
                        onDuplicate={() => onDuplicateEducation?.(idx)}
                        onAddSimilar={() => onAddSimilarEducation?.(idx)}
                        settingsPanel={(onClose) => (
                          <EducationEntrySettings
                            item={edu}
                            onToggle={(field, value) => onEntryVisibilityChange?.('education', idx, field, value)}
                            onClose={onClose}
                            logo={edu.logo}
                            onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                            placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />}
                            brandColor={brandColor}
                          />
                        )}
                      >
                        <div className="text-[11px] flex gap-3 justify-between items-start">
                          <div className="flex-1">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              {showLogo && (
                                <ItemLogo logo={edu.logo} brandColor={brandColor} placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} />
                              )}
                              <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                            </div>
                            {edu.school && (
                              <div className="flex justify-between text-slate-600 font-medium mb-1">
                                <E value={edu.school} isEditable={isEditable} editableClass={ec} className="text-[#007ACC] font-semibold" onSave={v => onEducationChange?.(idx, 'school', v)} />
                              </div>
                            )}
                            {(showDates || showLocation) && (
                              <div className="flex justify-between text-slate-500 text-[10px] mb-1">
                                {showDates && (
                                  <E value={edu.dates} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'dates', v)} />
                                )}
                                {showLocation && (
                                  <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                                )}
                              </div>
                            )}
                            <EducationDescription
                              bullets={edu.bullets}
                              isEditable={isEditable}
                              editableClass={ec}
                              onBulletChange={(v) => onEducationChange?.(idx, 'bullets', v)}
                              className={`text-slate-600 leading-relaxed text-${educationAlign}`}
                              bulletStyle={bulletStyle}
                              brandColor={brandColor}
                              align={educationAlign}
                              prefixId={`edu-${idx}`}
                              showBullets={showBullets}
                              splitGpa
                            />
                          </div>
                          {showGpa && gradeText && (
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
        if ((!resumeCerts || resumeCerts.length === 0) && !isEditable) return null;
        return (
          <DraggableSection key="certs" id="certs" {...dragProps}>
            <SectionWrapper
              id="certs" title="Projects" isEditable={isEditable}
              align={certsAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ certsAlign: a })}
              onAddEntry={onAddCert}
              layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
            >
              <section style={sec}>
                <h3 className={H} style={{ borderColor: brandColor, color: brandColor }}>Projects</h3>
                <ul className="space-y-3 text-[11px]">
                  {(resumeCerts ?? []).map((cert, idx) => {
                    const desc = cert.desc || '';
                    const isTechIdx = desc.toLowerCase().indexOf('tech:');
                    let cleanDesc = desc;
                    let techStack = '';
                    if (isTechIdx !== -1) {
                      cleanDesc = desc.substring(0, isTechIdx).trim();
                      techStack = desc.substring(isTechIdx).trim();
                    }
                    return (
                      <ItemWrapper
                        key={idx} sectionId="certs" index={idx} totalItems={(resumeCerts ?? []).length}
                        isEditable={isEditable} onDelete={() => onDeleteCert?.(idx)}
                        settingsPanel={(onClose) => (
                          <CertEntrySettings
                            item={cert}
                            onToggle={(field, value) => onEntryVisibilityChange?.('certs', idx, field, value)}
                            onClose={onClose}
                            onUrlChange={(url) => onCertChange?.(idx, 'url', url)}
                          />
                        )}
                      >
                        <li className={`flex gap-2 items-start text-${certsAlign}`}>
                          {showProjectIcons && showCert(cert, 'icon') && (
                            isEditable ? (
                              <EntryIconPicker
                                variant="project"
                                currentIcon={cert.icon || 'briefcase'}
                                onChange={(icon) => onCertChange?.(idx, 'icon', icon)}
                                isEditable={isEditable}
                              accentColor={brandColor}
                              accentColor2={accentColor2}
                              index={idx}
                              title={cert.title}
                            />
                          ) : (
                              getDynamicProjectIcon(idx, cert.title, cert.icon, brandColor, 'w-3 h-3 flex-shrink-0 mt-0.5', accentColor2)
                            )
                          )}
                          <div className="flex-1 min-w-0">
                          <div className={`flex items-center gap-1 font-bold text-slate-800 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                            <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="font-bold text-slate-800"
                              onSave={v => onCertChange?.(idx, 'title', v)} />
                            {showCert(cert, 'link') && <WorkLink url={cert.url} brandColor={brandColor} />}
                          </div>
                          {showProjectDesc && cleanDesc && (
                            <E tag="p" value={cleanDesc} isEditable={isEditable} editableClass={ec} className={`text-slate-600 mt-0.5 leading-relaxed text-${certsAlign}`}
                              onSave={v => onCertChange?.(idx, 'desc', v)} />
                          )}
                          {showProjectDesc && techStack && (
                            <div className={`text-slate-500 italic mt-0.5 text-[10px] text-${certsAlign}`}>
                              {techStack}
                            </div>
                          )}
                          </div>
                        </li>
                      </ItemWrapper>
                    );
                  })}
                </ul>
              </section>
            </SectionWrapper>
          </DraggableSection>
        );
      case 'achievements':
        if ((!resumeAchievements || resumeAchievements.length === 0) && !isEditable) return null;
        return (
          <DraggableSection key="achievements" id="achievements" {...dragProps}>
            <SectionWrapper
              id="achievements" title="Key Achievements" isEditable={isEditable}
              align={layoutSettings?.achievementsAlign ?? 'left'}
              onAlignChange={(a) => onLayoutSettingsChange?.({ achievementsAlign: a })}
              onAddEntry={onAddAchievement}
              layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
            >
              <section style={sec}>
                <h3 className={H} style={{ borderColor: brandColor, color: brandColor }}>Key Achievements</h3>
                <ul className="space-y-3 text-[11px]">
                  {(resumeAchievements ?? []).map((ach, idx) => {
                    const showLink = showAch(ach, 'link');
                    return (
                    <ItemWrapper
                      key={idx} sectionId="achievements" index={idx} totalItems={(resumeAchievements ?? []).length}
                      isEditable={isEditable} onDelete={() => onDeleteAchievement?.(idx)}
                      settingsPanel={(onClose) => (
                        <AchievementEntrySettings
                          item={ach}
                          onToggle={(field, value) => onEntryVisibilityChange?.('achievements', idx, field, value)}
                          onClose={onClose}
                          onUrlChange={(url) => onAchievementChange?.(idx, 'url', url)}
                        />
                      )}
                    >
                      <li className="flex gap-2.5 items-start">
                        {showAchievementIcons && showAch(ach, 'icon') && (
                          isEditable ? (
                            <EntryIconPicker
                              variant="achievement"
                              currentIcon={ach.icon || 'star'}
                              onChange={(icon) => onAchievementChange?.(idx, 'icon', icon)}
                              isEditable={isEditable}
                            accentColor={brandColor}
                            accentColor2={accentColor2}
                            index={idx}
                            title={ach.title}
                          />
                        ) : (
                            getDynamicAchievementIcon(idx, ach.title, ach.icon, brandColor, 'w-3 h-3 flex-shrink-0 mt-0.5', accentColor2)
                          )
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 font-bold"
                              onSave={v => onAchievementChange?.(idx, 'title', v)} />
                            {showLink && <WorkLink url={ach.url} brandColor={brandColor} />}
                          </div>
                          {showAchievementDesc && showAch(ach, 'desc') && (
                            <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className="text-slate-600 text-[10px] mt-0.5 leading-relaxed"
                              onSave={v => onAchievementChange?.(idx, 'desc', v)} />
                          )}
                        </div>
                      </li>
                    </ItemWrapper>
                    );
                  })}
                </ul>
              </section>
            </SectionWrapper>
          </DraggableSection>
        );
      case 'languages':
        if ((!resumeLanguages || resumeLanguages.length === 0) && !isEditable) return null;
        return (
          <DraggableSection key="languages" id="languages" {...dragProps}>
            <SectionWrapper
              id="languages" title="Languages" isEditable={isEditable}
              align={undefined}
              onAddEntry={onAddLanguage}
              layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
            >
              <section style={sec}>
                <h3 className={H} style={{ borderColor: brandColor, color: brandColor }}>Languages</h3>
                <div className="space-y-2">
                  {(resumeLanguages ?? []).map((lang, idx) => {
                    const bubbles = getLanguageBubbleCount(lang.level);
                    return (
                      <ItemWrapper
                        key={idx} sectionId="languages" index={idx} totalItems={(resumeLanguages ?? []).length}
                        isEditable={isEditable} onDelete={() => onDeleteLanguage?.(idx)}
                      >
                        <div className="flex justify-between items-center text-[11px]">
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
                      </ItemWrapper>
                    );
                  })}
                </div>
              </section>
            </SectionWrapper>
          </DraggableSection>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`pdf-sheet text-slate-800 font-sans ${sheetActiveClass}`} style={sheetStyle} id="resume-sheet"
      onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
      <HeaderWrapper
        isEditable={isEditable}
        layoutSettings={layoutSettings}
        onLayoutSettingsChange={(patch) => onLayoutSettingsChange?.({ ...layoutSettings, ...patch })}
        className="flex justify-between items-start border-b pb-4 mb-4 overflow-visible"
        style={{ borderColor: `${brandColor}40` }}
      >
        <HeaderWaveLines
          brandColor={brandColor}
          accentColor2={accentColor2}
          sheetPaddingRightMm={layoutSettings?.paddingLeftRight ?? 12}
        />
        <div className="flex-1 relative z-[1] min-w-0">
          <E tag="h1" value={name} isEditable={isEditable} editableClass={ec}
            className={`text-3xl font-extrabold tracking-tight ${uppercaseName ? 'uppercase' : ''}`}
            style={{ color: brandColor, fontFamily: headingFontCss }} onSave={ef('name')} />
          {showTitle && (
            <E tag="p" value={subtitle} isEditable={isEditable} editableClass={ec}
              className="text-xs font-semibold uppercase mt-1.5 tracking-wider" style={{ color: accentColor2 || brandColor }} onSave={ef('subtitle')} />
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3.5 text-[10px] text-slate-500 font-medium">
            {hasPhone && (
              <span className="inline-flex items-center gap-1.5 align-middle">
                <Phone className="w-3 h-3 text-slate-400 flex-shrink-0 inline-block" aria-hidden />
                <E value={phone} isEditable={isEditable} editableClass={ec} onSave={ef('phone')} />
              </span>
            )}
            {hasEmail && (
              <span className="inline-flex items-center gap-1.5 align-middle">
                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0 inline-block" aria-hidden />
                <E value={email} isEditable={isEditable} editableClass={ec} onSave={ef('email')} />
              </span>
            )}
            {hasLinkedin && (
              <span className="inline-flex items-center gap-1.5 align-middle">
                <span className="text-slate-400 inline-flex items-center justify-center w-3 h-3 flex-shrink-0" aria-hidden><LI /></span>
                <E value={linkedin} isEditable={isEditable} editableClass={ec} href={formatLinkedinUrl(linkedin)} onSave={ef('linkedin')} />
              </span>
            )}
            {hasLocation && (
              <span className="inline-flex items-center gap-1.5 align-middle">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 inline-block" aria-hidden />
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
      </HeaderWrapper>

      <div
        data-testid="designer-column-grid"
        className="grid grid-cols-[1.4fr_1fr] mt-4"
        style={{ gap: `${layoutSettings?.columnGap ?? 16}px` }}
      >
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
