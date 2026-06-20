import React from 'react';
import { Phone, Mail, MapPin, Building2, GraduationCap } from 'lucide-react';
import { EditableText as E } from '../../shared/EditableText';
import { BulletList } from '../../shared/BulletList';
import { SummaryContent } from '../../shared/SummaryContent';
import { SkillsEditor } from '../../shared/SkillsEditor';
import { EducationDescription } from '../../shared/EducationDescription';
import { HeaderWrapper } from '../../shared/HeaderWrapper';
import { formatMarkdownBold } from '../../../utils/markdown';
import { formatLinkedinUrl } from '../../../utils/linkedin';
import { AvatarCircleEditable } from '../../TemplateHeader';
import { useTemplateRenderContext } from '../useTemplateSetup';
import {
  ItemLogo,
  ItemWrapper,
  LI,
  SectionWrapper,
  WorkLink,
} from '../shared';
import { ExperienceEntrySettings, EducationEntrySettings } from '../../shared/entrySettings';
import { isEntryFieldVisible } from '../../../utils/entryVisibility';

export const SidebarTemplate: React.FC = () => {
  const {
    sheetActiveClass, sheetStyle, isEditable, clearActive, sec, ec, ef,
    name, subtitle, phone, email, linkedin, location, avatar,
    resumeSummary, resumeSkills, resumeExperience, resumeEducation,
    resumeCerts, resumeAchievements, resumeLanguages, layoutSettings,
    brandColor, bulletStyle, skillsStyle, summaryAlign,
    experienceAlign, educationAlign, certsAlign, achievementsAlign,
    showPhoto, bodyFontCss, headingFontCss, lineHeight, badgeStyle,
    onLayoutSettingsChange, onAddExperience, onDeleteExperience,
    onExperienceChange, onAddEducation, onDeleteEducation, onEducationChange,
    onCertChange, onAchievementChange, onLanguageChange, onFieldChange,
    onEntryVisibilityChange, onDuplicateExperience, onAddSimilarExperience,
    onDuplicateEducation, onAddSimilarEducation,
    onAddCert, onDeleteCert, onAddAchievement, onDeleteAchievement, onAddLanguage, onDeleteLanguage,
  } = useTemplateRenderContext();

  const SH = 'text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2';
  const showTitle = layoutSettings?.showTitle ?? true;
  const uppercaseName = layoutSettings?.uppercaseName ?? false;
  const hasPhone = (layoutSettings?.showPhone ?? true) && !!(phone && phone.trim());
  const hasEmail = (layoutSettings?.showEmail ?? true) && !!(email && email.trim());
  const hasLocation = (layoutSettings?.showLocation ?? true) && !!(location && location.trim());
  const hasLinkedin = (layoutSettings?.showLinkedin ?? true) && !!(linkedin && linkedin.trim());
  const hasContact = hasPhone || hasEmail || hasLocation || hasLinkedin;

  const showExp = (exp: (typeof resumeExperience)[number], field: keyof NonNullable<(typeof resumeExperience)[number]['visibility']>) =>
    isEntryFieldVisible(exp.visibility, field);

  const showEdu = (edu: (typeof resumeEducation)[number], field: keyof NonNullable<(typeof resumeEducation)[number]['visibility']>) =>
    isEntryFieldVisible(edu.visibility, field);

  const showSummaryBullets = layoutSettings?.showSummaryBullets ?? true;

  const handleAddSkill = () => {
    const list = resumeSkills ? resumeSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
    onFieldChange?.('resumeSkills', [...list, 'New Skill'].join(', '));
  };

  return (
    <div className={`pdf-sheet p-0 text-slate-800 flex flex-row ${sheetActiveClass}`} style={{ ...sheetStyle, padding: 0 }} id="resume-sheet"
      onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
      <aside className="w-[220px] flex-shrink-0 flex flex-col gap-5 p-5" style={{ background: brandColor + '15', borderRight: `3px solid ${brandColor}` }}>
        {(layoutSettings?.showPhoto ?? showPhoto) && (
          <div className="mx-auto">
            <AvatarCircleEditable
              src={avatar}
              name={name}
              size="w-20 h-20"
              border={brandColor}
              isEditable={isEditable}
              onAvatarChange={(url) => onFieldChange?.('avatar', url)}
              layoutSettings={layoutSettings}
              onLayoutSettingsChange={onLayoutSettingsChange}
            />
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
          <SectionWrapper
            id="skills" title="Skills" isEditable={isEditable}
            align={undefined}
            skillsStyle={skillsStyle}
            onSkillsStyleChange={(s) => onLayoutSettingsChange?.({ skillsStyle: s })}
            onSkillsValueChange={ef('resumeSkills')}
            onAddEntry={handleAddSkill}
          >
            <div>
              <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Skills</h4>
              <SkillsEditor
                value={resumeSkills}
                isEditable={isEditable}
                ec={ec}
                onSave={ef('resumeSkills')}
                badgeStyle={() => ({ ...badgeStyle(), borderRadius: '9999px' })}
                className="text-[10px]"
                skillsStyle={skillsStyle}
              />
            </div>
          </SectionWrapper>
        )}

        {(resumeCerts && resumeCerts.length > 0 || isEditable) && (
          <SectionWrapper
            id="certs" title="Certifications" isEditable={isEditable}
            align={certsAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ certsAlign: a })}
            onAddEntry={onAddCert}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <div>
              <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Certifications</h4>
              <ul className="space-y-2 text-[11px]">
                {(resumeCerts ?? []).map((cert, idx) => (
                  <ItemWrapper
                    key={idx} sectionId="certs" index={idx} totalItems={(resumeCerts ?? []).length}
                    isEditable={isEditable} onDelete={() => onDeleteCert?.(idx)}
                  >
                    <li className={`text-${certsAlign}`}>
                      <span className={`flex items-center gap-1 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                        <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="block text-slate-900 font-bold" onSave={v => onCertChange?.(idx, 'title', v)} />
                        <WorkLink url={cert.url} brandColor={brandColor} />
                      </span>
                      <E tag="p" value={cert.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[10px] text-${certsAlign}`} onSave={v => onCertChange?.(idx, 'desc', v)} dangerousInnerHtml={isEditable ? undefined : formatMarkdownBold(cert.desc)} />
                    </li>
                  </ItemWrapper>
                ))}
              </ul>
            </div>
          </SectionWrapper>
        )}

        {(resumeLanguages && resumeLanguages.length > 0 || isEditable) && (
          <SectionWrapper
            id="languages" title="Languages" isEditable={isEditable}
            align={undefined}
            onAddEntry={onAddLanguage}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <div>
              <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Languages</h4>
              <ul className="space-y-1.5 text-[11px]">
                {(resumeLanguages ?? []).map((lang, idx) => (
                  <ItemWrapper
                    key={idx} sectionId="languages" index={idx} totalItems={(resumeLanguages ?? []).length}
                    isEditable={isEditable} onDelete={() => onDeleteLanguage?.(idx)}
                  >
                    <li className="flex justify-between">
                      <E tag="strong" value={lang.name} isEditable={isEditable} editableClass={ec} className="text-slate-900" onSave={v => onLanguageChange?.(idx, 'name', v)} />
                      <E value={lang.level} isEditable={isEditable} editableClass={ec} className="text-slate-500 italic" onSave={v => onLanguageChange?.(idx, 'level', v)} />
                    </li>
                  </ItemWrapper>
                ))}
              </ul>
            </div>
          </SectionWrapper>
        )}

        {(resumeAchievements && resumeAchievements.length > 0 || isEditable) && (
          <SectionWrapper
            id="achievements" title="Achievements" isEditable={isEditable}
            align={achievementsAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ achievementsAlign: a })}
            onAddEntry={onAddAchievement}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <div>
              <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Achievements</h4>
              <ul className="space-y-2 text-[11px]">
                {(resumeAchievements ?? []).map((ach, idx) => (
                  <ItemWrapper
                    key={idx} sectionId="achievements" index={idx} totalItems={(resumeAchievements ?? []).length}
                    isEditable={isEditable} onDelete={() => onDeleteAchievement?.(idx)}
                  >
                    <li className={`text-${achievementsAlign}`}>
                      <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className={`block text-slate-900 text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'title', v)} />
                      <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[10px] text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'desc', v)} dangerousInnerHtml={isEditable ? undefined : formatMarkdownBold(ach.desc)} />
                    </li>
                  </ItemWrapper>
                ))}
              </ul>
            </div>
          </SectionWrapper>
        )}
      </aside>

      <main className="flex-1 p-6" style={{ lineHeight, fontFamily: bodyFontCss }}>
        <HeaderWrapper
          isEditable={isEditable}
          layoutSettings={layoutSettings}
          onLayoutSettingsChange={(patch) => onLayoutSettingsChange?.({ ...layoutSettings, ...patch })}
          className="mb-4 pb-3 border-b-2"
          style={{ borderColor: brandColor }}
        >
          <E tag="h1" value={name} isEditable={isEditable} editableClass={ec}
            className={`text-3xl font-extrabold tracking-tight ${uppercaseName ? 'uppercase' : ''}`}
            style={{ color: brandColor, fontFamily: headingFontCss }} onSave={ef('name')} />
          {showTitle && (
            <E tag="p" value={subtitle} isEditable={isEditable} editableClass={ec}
              className="text-sm font-medium text-slate-500 uppercase mt-1 tracking-wide" onSave={ef('subtitle')} />
          )}
        </HeaderWrapper>

        {(resumeSummary || isEditable) && (
          <SectionWrapper
            id="summary" title="Profile" isEditable={isEditable}
            align={summaryAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ summaryAlign: a })}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <div style={sec}>
              <h3 className={SH} style={{ borderColor: `${brandColor}40`, color: brandColor }}>Profile</h3>
              <SummaryContent
                value={resumeSummary || ''}
                isEditable={isEditable}
                editableClass={ec}
                onSave={ef('resumeSummary')}
                className={`text-xs text-${summaryAlign} text-slate-700 leading-relaxed`}
                bulletStyle={bulletStyle}
                align={summaryAlign}
                showBullets={showSummaryBullets}
              />
            </div>
          </SectionWrapper>
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
                          placeholderIconName="building-2"
                          brandColor={brandColor}
                          onUrlChange={(url) => onExperienceChange?.(idx, 'url', url)}
                        />
                      )}
                    >
                      <div className="text-xs">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            {showLogo && (
                              <ItemLogo logo={exp.logo} brandColor={brandColor} placeholderIconName="building-2" />
                            )}
                            <E field="experience.title" value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                          </span>
                          {showDates && (
                            <E field="experience.dates" value={exp.dates} isEditable={isEditable} editableClass={ec} className="text-slate-400 font-normal" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                          )}
                        </div>
                        {(showCompany || showLocation || (showLink && exp.url)) && (
                          <div className="flex justify-between text-slate-500 italic mb-1">
                            <span className="flex items-center gap-1">
                              {showCompany && (
                                <E field="experience.company" value={exp.company} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                              )}
                              {showLink && <WorkLink url={exp.url} brandColor={brandColor} />}
                            </span>
                            {showLocation && (
                              <E field="experience.location" value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                            )}
                          </div>
                        )}
                        {showBullets && (
                          <BulletList field="experience.bullets" bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                            onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700"
                            bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} prefixId={`exp-${idx}`} />
                        )}
                      </div>
                    </ItemWrapper>
                  );
                })}
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
                {resumeEducation.map((edu, idx) => {
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
                          placeholderIconName="graduation-cap"
                          brandColor={brandColor}
                        />
                      )}
                    >
                      <div className="text-xs">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            {showLogo && (
                              <ItemLogo logo={edu.logo} brandColor={brandColor} placeholderIconName="graduation-cap" />
                            )}
                            <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                          </span>
                          {showDates && (
                            <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="text-slate-400 font-normal" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                          )}
                        </div>
                        {(edu.school || showLocation) && (
                          <div className="flex justify-between text-slate-500 italic mb-1">
                            <E value={edu.school} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'school', v)} />
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
                          className={`text-slate-600 text-${educationAlign}`}
                          bulletStyle={bulletStyle}
                          brandColor={brandColor}
                          align={educationAlign}
                          prefixId={`edu-${idx}`}
                          showGpa={showGpa}
                          showBullets={showBullets}
                        />
                      </div>
                    </ItemWrapper>
                  );
                })}
              </div>
            </div>
          </SectionWrapper>
        )}
      </main>
    </div>
  );
};
