import React from 'react';
import {
  Phone, Mail, MapPin,
  Building2, GraduationCap,
} from 'lucide-react';
import { EditableText as E } from '../../shared/EditableText';
import { BulletList } from '../../shared/BulletList';
import { SummaryContent } from '../../shared/SummaryContent';
import { SkillsEditor } from '../../shared/SkillsEditor';
import { EntryIconPicker } from '../../shared/EntryIconPicker';
import { DateRangePicker } from '../../shared/DateRangePicker';
import { getDynamicAchievementIcon, getDynamicProjectIcon } from '../../shared/templateIconHelpers';
import { formatLinkedinUrl } from '../../../utils/linkedin';
import { EducationDescription } from '../../shared/EducationDescription';
import { HeaderWrapper } from '../../shared/HeaderWrapper';
import { parseEducationGrade, mergeProjectDescription } from '../../shared/parseEducationGrade';
import { getLanguageBubbleCount, getLanguageLevelFromBubbleCount } from '../../../utils/languageLevel';
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
import { ExperienceEntrySettings, EducationEntrySettings, CertEntrySettings, AchievementEntrySettings, LanguageEntrySettings } from '../../shared/entrySettings';
import { isEntryFieldVisible } from '../../../utils/entryVisibility';

export const DesignerTemplate: React.FC = () => {
  const {
    sheetActiveClass, sheetStyle, isEditable, clearActive, ec, ef,
    name, subtitle, phone, email, linkedin, location, avatar,
    resumeSummary, resumeSkills, resumeExperience, resumeEducation,
    resumeCerts, resumeAchievements, resumeLanguages, layoutSettings,
    brandColor, accentColor2, bulletStyle, skillsStyle, summaryAlign, badgeStyle,
    experienceAlign, educationAlign, certsAlign,
    showPhoto, headingFontCss, bodyFontCss, titleFontCss, accentFontCss, dragProps, handleSectionDragOver, handleColumnDrop,
    designerLeftSections, designerRightSections, showLayoutBounds,
    onLayoutSettingsChange, onAddExperience, onDeleteExperience,
    onExperienceChange, onAddEducation, onDeleteEducation, onEducationChange,
    onCertChange, onAchievementChange, onLanguageChange, onFieldChange,
    onEntryVisibilityChange, onDuplicateExperience, onAddSimilarExperience,
    onDuplicateEducation, onAddSimilarEducation,
    onAddCert, onDeleteCert, onAddAchievement, onDeleteAchievement, onAddLanguage, onDeleteLanguage,
    entrySpacing, lineHeight,
  } = useTemplateRenderContext();

  // ── Figma design tokens (Anmol Agarwal resume) ─────────────────────────────
  // Font families respond to the 4 font pickers: Heading / Title / Accent / Body.
  // Font sizes scale with the Font Size slider (base = 10pt).
  const _HEAD   = headingFontCss;  // Heading Font picker (default: Raleway)  → name, section h3
  const _TITLE  = titleFontCss;    // Title Font picker   (default: Raleway)  → entry titles
  const _ACCENT = accentFontCss;   // Accent Font picker  (default: Open Sans) → company/school, subtitle
  const _OS     = bodyFontCss;     // Body Font picker    (default: Open Sans) → descriptions
  const scale = (layoutSettings?.fontSize ?? 10) / 10;
  const lh = lineHeight;        // Line Height slider
  const C_BODY  = layoutSettings?.bodyTextColor ?? '#3E3E3E'; // Body text color picker
  const FG = {
    name:       { fontFamily: _HEAD,   fontSize: `${(21.5  * scale).toFixed(2)}pt`, fontWeight: 700, lineHeight: lh } as React.CSSProperties,
    subtitle:   { fontFamily: _ACCENT, fontSize: `${(10.78 * scale).toFixed(2)}pt`, fontWeight: 700, lineHeight: lh } as React.CSSProperties,
    section:    { fontFamily: _HEAD,   fontSize: `${(11.4  * scale).toFixed(2)}pt`, fontWeight: 700, lineHeight: lh } as React.CSSProperties,
    entry:      { fontFamily: _TITLE,  fontSize: `${(9.5   * scale).toFixed(2)}pt`, fontWeight: 400, lineHeight: lh } as React.CSSProperties,
    entryTitle: { fontFamily: _TITLE,  fontSize: `${(9.5   * scale).toFixed(2)}pt`, fontWeight: 400, lineHeight: lh } as React.CSSProperties,
    company:    { fontFamily: _ACCENT, fontSize: `${(8.88  * scale).toFixed(2)}pt`, fontWeight: 700, lineHeight: lh } as React.CSSProperties,
    body:       { fontFamily: _OS,     fontSize: `${(7.61  * scale).toFixed(2)}pt`, fontWeight: 400, color: C_BODY, lineHeight: lh } as React.CSSProperties,
    contact:    { fontFamily: _OS,     fontSize: `${(7.6   * scale).toFixed(2)}pt`, fontWeight: 700, color: C_BODY, lineHeight: lh } as React.CSSProperties,
    meta:       { fontFamily: _OS,     fontSize: `${(7     * scale).toFixed(2)}pt`, fontWeight: 400, color: C_BODY, lineHeight: lh } as React.CSSProperties,
  };
  // Colour defaults — user's brandColor / accentColor2 / titleColor override the Figma defaults
  const C_HEAD    = brandColor                      ?? '#343334';  // name + section headings + borders
  const C_TITLE   = layoutSettings?.titleColor      ?? C_HEAD;     // entry titles (job role, degree, etc.)
  const C_COMPANY = accentColor2                    ?? '#00B6CB';  // company / school name

  const H = 'font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2';
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
  const showProjectBullets = layoutSettings?.showProjectBullets ?? true;
  const showAchievementIcons = layoutSettings?.showAchievementIcons ?? true;
  const showAchievementDesc = layoutSettings?.showAchievementDesc ?? true;
  const showAchievementBullets = layoutSettings?.showAchievementBullets ?? true;
  const showSummaryBullets = layoutSettings?.showSummaryBullets ?? true;

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
              layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
            >
              <section style={dsec}>
                <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Summary</h3>
                <div style={FG.body}>
                  <SummaryContent
                    value={resumeSummary || ''}
                    isEditable={isEditable}
                    editableClass={ec}
                    onSave={ef('resumeSummary')}
                    className={`leading-relaxed text-${summaryAlign}`}
                    bulletStyle={bulletStyle}
                    align={summaryAlign}
                    showBullets={showSummaryBullets}
                  />
                </div>
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
              <section style={dsec}>
                <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Skills</h3>
                <SkillsEditor
                  value={resumeSkills}
                  isEditable={isEditable}
                  ec={ec}
                  onSave={ef('resumeSkills')}
                  badgeStyle={badgeStyle}
                  skillsStyle={skillsStyle}
                  fontScale={scale}
                  gridFontFamily={_OS}
                  gridTextColor={C_BODY}
                  chipFontFamily={_OS}
                  chipTextColor={C_BODY}
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
              <section style={dsec}>
                <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Experience</h3>
                <div className="flex flex-col" style={{ gap: `${entrySpacing}px` }}>
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
                        <div style={FG.body}>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 flex-1 min-w-0">
                              {showLogo && (
                                <ItemLogo
                                  logo={exp.logo}
                                  brandColor={C_COMPANY}
                                  placeholderIconName="building-2"
                                  isEditable={isEditable}
                                  onLogoChange={(logo) => onExperienceChange?.(idx, 'logo', logo)}
                                />
                              )}
                              <E field="experience.title" value={exp.title} isEditable={isEditable} editableClass={ec} className="min-w-0 break-words leading-snug" style={{ ...FG.entry, color: C_TITLE }} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                            </span>
                            {showDates && (
                              <DateRangePicker
                                value={exp.dates}
                                isEditable={isEditable}
                                onSave={v => onExperienceChange?.(idx, 'dates', v)}
                                style={FG.meta}
                                className="text-right"
                              />
                            )}
                          </div>
                          {(showCompany || showLocation || (showLink && exp.url)) && (
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <span className="flex items-center gap-1 flex-1 min-w-0">
                                {showCompany && (
                                  <E field="experience.company" value={exp.company} isEditable={isEditable} editableClass={ec} className="min-w-0 break-words" style={{ ...FG.company, color: C_COMPANY }} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                                )}
                                {showLink && <WorkLink url={exp.url} brandColor={C_COMPANY} />}
                              </span>
                              {showLocation && (
                                <E field="experience.location" value={exp.location} isEditable={isEditable} editableClass={ec} className="shrink-0 text-right whitespace-nowrap" style={FG.meta} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                              )}
                            </div>
                          )}
                          {showBullets && (
                            <BulletList field="experience.bullets" bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                              onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)}
                              className={`leading-snug${showLogo ? ' [&_li>span:first-child]:!w-3' : ''}`}
                              bulletStyle={bulletStyle} align={experienceAlign} prefixId={`exp-${idx}`} />
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
              <section style={dsec}>
                <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Education</h3>
                <div className="flex flex-col" style={{ gap: `${entrySpacing}px` }}>
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
                            placeholderIconName="graduation-cap"
                            brandColor={brandColor}
                          />
                        )}
                      >
                        <div className="flex gap-3 justify-between items-start" style={FG.body}>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5 leading-snug">
                              {showLogo && (
                                <ItemLogo
                                  logo={edu.logo}
                                  brandColor={C_COMPANY}
                                  placeholderIconName="graduation-cap"
                                  isEditable={isEditable}
                                  onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                                />
                              )}
                              <E field="education.degree" value={edu.degree} isEditable={isEditable} editableClass={ec} className="break-words" style={{ ...FG.entry, color: C_TITLE }} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                            </div>
                            {(edu.school || isEditable) && (
                              <div className="flex justify-between leading-snug">
                                <E field="education.school" value={edu.school} isEditable={isEditable} editableClass={ec} style={{ ...FG.company, color: C_COMPANY }} onSave={v => onEducationChange?.(idx, 'school', v)} />
                              </div>
                            )}
                            {(showDates || showLocation) && (
                              <div className="flex justify-between leading-snug" style={FG.meta}>
                                {showDates && (
                                  <DateRangePicker
                                    value={edu.dates}
                                    isEditable={isEditable}
                                    onSave={v => onEducationChange?.(idx, 'dates', v)}
                                    style={FG.meta}
                                  />
                                )}
                                {showLocation && (
                                  <E field="education.location" value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                                )}
                              </div>
                            )}
                            <EducationDescription
                              bullets={edu.bullets}
                              isEditable={isEditable}
                              editableClass={ec}
                              onBulletChange={(v) => onEducationChange?.(idx, 'bullets', v)}
                              className={`leading-snug text-${educationAlign}`}
                              bulletStyle={bulletStyle}
                              align={educationAlign}
                              prefixId={`edu-${idx}`}
                              showBullets={showBullets || isEditable}
                              splitGpa
                            />
                          </div>
                          {showGpa && gradeText && (
                            <div className="flex items-center gap-2 h-full flex-shrink-0 self-stretch mt-1">
                              <div className="w-[1px] bg-slate-300 self-stretch min-h-[30px]" />
                              <div className="text-center whitespace-pre-line leading-tight px-1 min-w-[60px]" style={{ ...FG.company, color: C_COMPANY }}>
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
              <section style={dsec}>
                <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Projects</h3>
                <ul className="flex flex-col" style={{ ...FG.body, gap: `${entrySpacing - 4}px` }}>
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
                        <li className={`text-${certsAlign}`}>
                          <div className="flex-1 min-w-0">
                            <div className={`flex items-center gap-1.5 leading-snug ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                              {showProjectIcons && (
                                isEditable ? (
                                  <EntryIconPicker
                                    variant="project"
                                    currentIcon={cert.icon || 'briefcase'}
                                    onChange={(icon) => onCertChange?.(idx, 'icon', icon)}
                                    isEditable={isEditable}
                                    accentColor={C_TITLE}
                                    accentColor2={C_COMPANY}
                                    index={idx}
                                    title={cert.title}
                                    iconClassName="w-3 h-3 shrink-0"
                                    wrapperClassName="shrink-0"
                                  />
                                ) : (
                                  getDynamicProjectIcon(idx, cert.title, cert.icon, C_TITLE, 'w-3 h-3 shrink-0', C_COMPANY)
                                )
                              )}
                              <div className={`flex items-center gap-1 min-w-0 flex-1 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                                <E tag="strong" field="projects.title" value={cert.title} isEditable={isEditable} editableClass={ec}
                                  style={{ ...FG.entryTitle, color: C_TITLE }}
                                  onSave={v => onCertChange?.(idx, 'title', v)} />
                                {showCert(cert, 'link') && <WorkLink url={cert.url} brandColor={C_COMPANY} />}
                              </div>
                            </div>
                              {showProjectDesc && (cleanDesc || isEditable) && (
                                showProjectBullets ? (
                                  <BulletList
                                    field="projects.description"
                                    bullets={cleanDesc}
                                    isEditable={isEditable}
                                    editableClass={ec}
                                    onBulletChange={(v) => {
                                      onCertChange?.(idx, 'desc', mergeProjectDescription(v, techStack));
                                    }}
                                    className={`mt-0.5 leading-snug text-${certsAlign}`}
                                    bulletStyle={bulletStyle}
                                    align={certsAlign}
                                    prefixId={`cert-${idx}`}
                                  />
                                ) : (
                                <E tag="p" field="projects.description" value={cleanDesc} isEditable={isEditable} editableClass={ec}
                                  className={`mt-0.5 leading-snug text-${certsAlign}`}
                                  style={FG.body}
                                  onSave={(v) => onCertChange?.(idx, 'desc', techStack ? `${v}\n${techStack}` : v)} />
                                )
                              )}
                              {showProjectDesc && techStack && (
                                <div className={`italic mt-0.5 text-${certsAlign}`} style={FG.meta}>
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
              <section style={dsec}>
                <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Key Achievements</h3>
                <ul className="flex flex-col" style={{ ...FG.body, gap: `${entrySpacing - 4}px` }}>
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
                      <li className={`text-${layoutSettings?.achievementsAlign ?? 'left'}`}>
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-center gap-1.5 leading-snug ${(layoutSettings?.achievementsAlign ?? 'left') === 'center' ? 'justify-center' : (layoutSettings?.achievementsAlign ?? 'left') === 'right' ? 'justify-end' : ''}`}>
                            {showAchievementIcons && (
                              isEditable ? (
                                <EntryIconPicker
                                  variant="achievement"
                                  currentIcon={ach.icon || 'star'}
                                  onChange={(icon) => onAchievementChange?.(idx, 'icon', icon)}
                                  isEditable={isEditable}
                                  accentColor={C_TITLE}
                                  accentColor2={C_COMPANY}
                                  index={idx}
                                  title={ach.title}
                                  iconClassName="w-3 h-3 shrink-0"
                                  wrapperClassName="shrink-0"
                                />
                              ) : (
                                getDynamicAchievementIcon(idx, ach.title, ach.icon, C_TITLE, 'w-3 h-3 shrink-0', C_COMPANY)
                              )
                            )}
                            <div className={`flex items-center gap-1 min-w-0 flex-1 ${(layoutSettings?.achievementsAlign ?? 'left') === 'center' ? 'justify-center' : (layoutSettings?.achievementsAlign ?? 'left') === 'right' ? 'justify-end' : ''}`}>
                              <E tag="strong" field="achievements.title" value={ach.title} isEditable={isEditable} editableClass={ec}
                                style={{ ...FG.entryTitle, color: C_TITLE }}
                                onSave={v => onAchievementChange?.(idx, 'title', v)} />
                              {showLink && <WorkLink url={ach.url} brandColor={C_COMPANY} />}
                            </div>
                          </div>
                            {showAchievementDesc && (ach.desc || isEditable) && (
                              showAchievementBullets ? (
                                <BulletList
                                  field="achievements.description"
                                  bullets={ach.desc || ''}
                                  isEditable={isEditable}
                                  editableClass={ec}
                                  onBulletChange={(v) => onAchievementChange?.(idx, 'desc', v)}
                                  className={`mt-0.5 leading-snug text-${layoutSettings?.achievementsAlign ?? 'left'}`}
                                  bulletStyle={bulletStyle}
                                  align={layoutSettings?.achievementsAlign ?? 'left'}
                                  prefixId={`ach-${idx}`}
                                />
                              ) : (
                                <E tag="p" field="achievements.description" value={ach.desc || ''} isEditable={isEditable} editableClass={ec}
                                  className={`mt-0.5 leading-snug text-${layoutSettings?.achievementsAlign ?? 'left'}`}
                                  style={FG.body}
                                  onSave={(v) => onAchievementChange?.(idx, 'desc', v)} />
                              )
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
              <section style={dsec}>
                <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Languages</h3>
                <div className="grid grid-cols-2 gap-x-3" style={{ rowGap: `${entrySpacing - 4}px` }}>
                  {(resumeLanguages ?? []).map((lang, idx) => {
                    const bubbles = getLanguageBubbleCount(lang.level);
                    const showLevel = (layoutSettings?.showLanguageLevel ?? true) && isEntryFieldVisible(lang.visibility, 'level');
                    const showSlider = isEntryFieldVisible(lang.visibility, 'slider') !== false;
                    return (
                      <ItemWrapper
                        key={idx} sectionId="languages" index={idx} totalItems={(resumeLanguages ?? []).length}
                        isEditable={isEditable} onDelete={() => onDeleteLanguage?.(idx)}
                        settingsPanel={(onClose) => (
                          <LanguageEntrySettings
                            item={lang}
                            onToggle={(field, value) => onEntryVisibilityChange?.('languages', idx, field, value)}
                            onClose={onClose}
                          />
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <E tag="p" field="languages.name" value={lang.name} isEditable={isEditable} editableClass={ec}
                              style={{ ...FG.entry, color: C_TITLE }}
                              onSave={v => onLanguageChange?.(idx, 'name', v)} />
                            {showLevel && (
                              <E tag="p" field="languages.level" value={lang.level} isEditable={isEditable} editableClass={ec}
                                style={FG.meta}
                                onSave={v => onLanguageChange?.(idx, 'level', v)} />
                            )}
                          </div>
                          {showSlider && (
                            <LanguageBubbles
                              count={bubbles}
                              activeColor={C_TITLE}
                              isEditable={isEditable}
                              onCountChange={(bubbleCount) =>
                                onLanguageChange?.(idx, 'level', getLanguageLevelFromBubbleCount(bubbleCount))
                              }
                            />
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
      default:
        return null;
    }
  };

  const sectionGap = layoutSettings?.sectionSpacing ?? 8;
  // Column flex gap drives section spacing — clear sec's marginBottom to avoid doubling
  const dsec: React.CSSProperties = {};

  return (
    <div className={`pdf-sheet text-slate-800 font-sans ${sheetActiveClass}`}
      style={{ ...sheetStyle, ['--entry-gap' as string]: `${entrySpacing}px` } as React.CSSProperties}
      id="resume-sheet"
      onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
      <HeaderWrapper
        isEditable={isEditable}
        layoutSettings={layoutSettings}
        showTitle={showTitle}
        onLayoutSettingsChange={onLayoutSettingsChange}
        className={`pb-2 mb-2 overflow-visible ${
          (layoutSettings?.headerStyle ?? 'left') === 'centered'
            ? 'flex flex-col items-center text-center'
            : 'flex justify-between items-start'
        }`}
      >
        {/* Centered: photo above name */}
        {(layoutSettings?.headerStyle ?? 'left') === 'centered' && showPhoto && (
          <ProfilePhotoWithWaves
            avatar={avatar}
            name={name}
            brandColor={brandColor}
            accentColor2={accentColor2}
            isEditable={isEditable}
            onAvatarChange={(url) => onFieldChange?.('avatar', url)}
            layoutSettings={layoutSettings}
            onLayoutSettingsChange={onLayoutSettingsChange}
            size="w-20 h-20"
          />
        )}

        {/* Name / subtitle / contact — shared across all variants */}
        <div className={`relative z-[3] min-w-0 ${
          (layoutSettings?.headerStyle ?? 'left') === 'centered'
            ? 'flex flex-col items-center mt-2'
            : (layoutSettings?.headerStyle ?? 'left') === 'minimal'
              ? 'flex-1 flex flex-col'
              : 'flex-1 pr-4'
        }`}>
          <E tag="h1" field="header.name" value={name} isEditable={isEditable} editableClass={ec}
            className={`tracking-tight leading-tight ${uppercaseName ? 'uppercase' : ''}`}
            style={{ ...FG.name, color: C_HEAD }} onSave={ef('name')} />
          {showTitle && (
            <span data-header-subtitle className="contents">
              <E tag="p" field="header.subtitle" value={subtitle} isEditable={isEditable} editableClass={ec}
                className="uppercase mt-1 tracking-wider" style={{ ...FG.subtitle, color: C_COMPANY }} onSave={ef('subtitle')} />
            </span>
          )}

          <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-2 ${
            (layoutSettings?.headerStyle ?? 'left') === 'centered' ? 'justify-center' : ''
          }`} style={FG.contact}>
            {hasPhone && (
              <span className="inline-flex items-center gap-1.5 align-middle">
                <Phone className="w-3 h-3 text-slate-400 flex-shrink-0 inline-block" aria-hidden />
                <E field="header.phone" value={phone} isEditable={isEditable} editableClass={ec} onSave={ef('phone')} />
              </span>
            )}
            {hasEmail && (
              <span className="inline-flex items-center gap-1.5 align-middle">
                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0 inline-block" aria-hidden />
                <E field="header.email" value={email} isEditable={isEditable} editableClass={ec} onSave={ef('email')} />
              </span>
            )}
            {hasLinkedin && (
              <span className="inline-flex items-center gap-1.5 align-middle">
                <span className="text-slate-400 inline-flex items-center justify-center w-3 h-3 flex-shrink-0" aria-hidden><LI /></span>
                <E field="header.linkedin" value={linkedin} isEditable={isEditable} editableClass={ec} href={formatLinkedinUrl(linkedin)} onSave={ef('linkedin')} />
              </span>
            )}
            {hasLocation && (
              <span className="inline-flex items-center gap-1.5 align-middle">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 inline-block" aria-hidden />
                <E field="header.location" value={location} isEditable={isEditable} editableClass={ec} onSave={ef('location')} />
              </span>
            )}
          </div>
        </div>

        {/* Left (default): photo right */}
        {(layoutSettings?.headerStyle ?? 'left') === 'left' && showPhoto && (
          <ProfilePhotoWithWaves
            avatar={avatar}
            name={name}
            brandColor={brandColor}
            accentColor2={accentColor2}
            isEditable={isEditable}
            onAvatarChange={(url) => onFieldChange?.('avatar', url)}
            layoutSettings={layoutSettings}
            onLayoutSettingsChange={onLayoutSettingsChange}
            size="w-28 h-28"
          />
        )}
        {/* Minimal: no photo rendered */}
      </HeaderWrapper>

      <div
        data-testid="designer-column-grid"
        className="grid grid-cols-[1.4fr_1fr] mt-2"
        style={{ gap: `${layoutSettings?.columnGap ?? 16}px` }}
      >
        <div
          className={`designer-column flex flex-col min-h-[150px] transition-all duration-200 ${showLayoutBounds ? 'border-2 border-dashed border-slate-200 p-2 rounded-xl bg-slate-50/5' : ''}`}
          style={{ gap: `${sectionGap}px` }}
          onDragOver={(e) => handleSectionDragOver(e)}
          onDrop={(e) => handleColumnDrop(e, 'left')}
        >
          {designerLeftSections.map(secId => renderSectionById(secId))}
        </div>

        <div
          className={`designer-column flex flex-col min-h-[150px] transition-all duration-200 ${showLayoutBounds ? 'border-2 border-dashed border-slate-200 p-2 rounded-xl bg-slate-50/5' : ''}`}
          style={{ gap: `${sectionGap}px` }}
          onDragOver={(e) => handleSectionDragOver(e)}
          onDrop={(e) => handleColumnDrop(e, 'right')}
        >
          {designerRightSections.map(secId => renderSectionById(secId))}
        </div>
      </div>
    </div>
  );
};
