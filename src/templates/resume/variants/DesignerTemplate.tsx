import React from 'react';
import {
  Phone, Mail, MapPin,
} from 'lucide-react';
import { EditableText as E } from '../../shared/EditableText';
import { formatLinkedinUrl } from '../../../utils/linkedin';
import { HeaderWrapper } from '../../shared/HeaderWrapper';
import { isEntryFieldVisible } from '../../../utils/entryVisibility';
import { useTemplateRenderContext } from '../useTemplateSetup';
import {
  LI,
  ProfilePhotoWithWaves,
} from '../shared';
import { DesignerSummarySection } from './designer/DesignerSummarySection';
import { DesignerSkillsSection } from './designer/DesignerSkillsSection';
import { DesignerExperienceSection } from './designer/DesignerExperienceSection';
import { DesignerEducationSection } from './designer/DesignerEducationSection';
import { DesignerProjectsSection } from './designer/DesignerProjectsSection';
import { DesignerAchievementsSection } from './designer/DesignerAchievementsSection';
import { DesignerLanguagesSection } from './designer/DesignerLanguagesSection';

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

  const sectionGap = layoutSettings?.sectionSpacing ?? 8;
  // Column flex gap drives section spacing — clear sec's marginBottom to avoid doubling
  const dsec: React.CSSProperties = {};

  const sectionStyleProps = { H, FG, C_HEAD, C_TITLE, C_COMPANY, dsec };

  const renderSectionById = (secId: string): React.ReactNode => {
    switch (secId) {
      case 'summary':
        return (
          <DesignerSummarySection
            key="summary"
            resumeSummary={resumeSummary}
            isEditable={isEditable}
            dragProps={dragProps}
            summaryAlign={summaryAlign}
            onLayoutSettingsChange={onLayoutSettingsChange}
            layoutSettings={layoutSettings}
            ec={ec}
            ef={ef}
            bulletStyle={bulletStyle}
            showSummaryBullets={showSummaryBullets}
            {...sectionStyleProps}
          />
        );
      case 'skills':
        return (
          <DesignerSkillsSection
            key="skills"
            resumeSkills={resumeSkills}
            isEditable={isEditable}
            dragProps={dragProps}
            skillsStyle={skillsStyle}
            onLayoutSettingsChange={onLayoutSettingsChange}
            ec={ec}
            ef={ef}
            onAddSkill={handleAddSkill}
            badgeStyle={badgeStyle}
            scale={scale}
            bodyFontFamily={_OS}
            C_BODY={C_BODY}
            {...sectionStyleProps}
          />
        );
      case 'experience':
        return (
          <DesignerExperienceSection
            key="experience"
            resumeExperience={resumeExperience}
            isEditable={isEditable}
            dragProps={dragProps}
            experienceAlign={experienceAlign}
            onLayoutSettingsChange={onLayoutSettingsChange}
            layoutSettings={layoutSettings}
            onAddExperience={onAddExperience}
            ec={ec}
            entrySpacing={entrySpacing}
            brandColor={brandColor}
            bulletStyle={bulletStyle}
            showExp={showExp}
            onDeleteExperience={onDeleteExperience}
            onDuplicateExperience={onDuplicateExperience}
            onAddSimilarExperience={onAddSimilarExperience}
            onEntryVisibilityChange={onEntryVisibilityChange}
            onExperienceChange={onExperienceChange}
            {...sectionStyleProps}
          />
        );
      case 'education':
        return (
          <DesignerEducationSection
            key="education"
            resumeEducation={resumeEducation}
            isEditable={isEditable}
            dragProps={dragProps}
            educationAlign={educationAlign}
            onLayoutSettingsChange={onLayoutSettingsChange}
            layoutSettings={layoutSettings}
            onAddEducation={onAddEducation}
            ec={ec}
            entrySpacing={entrySpacing}
            brandColor={brandColor}
            bulletStyle={bulletStyle}
            showEdu={showEdu}
            onDeleteEducation={onDeleteEducation}
            onDuplicateEducation={onDuplicateEducation}
            onAddSimilarEducation={onAddSimilarEducation}
            onEntryVisibilityChange={onEntryVisibilityChange}
            onEducationChange={onEducationChange}
            {...sectionStyleProps}
          />
        );
      case 'certs':
        return (
          <DesignerProjectsSection
            key="certs"
            resumeCerts={resumeCerts}
            isEditable={isEditable}
            dragProps={dragProps}
            certsAlign={certsAlign}
            onLayoutSettingsChange={onLayoutSettingsChange}
            layoutSettings={layoutSettings}
            onAddCert={onAddCert}
            ec={ec}
            entrySpacing={entrySpacing}
            bulletStyle={bulletStyle}
            showCert={showCert}
            showProjectIcons={showProjectIcons}
            showProjectDesc={showProjectDesc}
            showProjectBullets={showProjectBullets}
            onDeleteCert={onDeleteCert}
            onEntryVisibilityChange={onEntryVisibilityChange}
            onCertChange={onCertChange}
            {...sectionStyleProps}
          />
        );
      case 'achievements':
        return (
          <DesignerAchievementsSection
            key="achievements"
            resumeAchievements={resumeAchievements}
            isEditable={isEditable}
            dragProps={dragProps}
            onLayoutSettingsChange={onLayoutSettingsChange}
            layoutSettings={layoutSettings}
            onAddAchievement={onAddAchievement}
            ec={ec}
            entrySpacing={entrySpacing}
            bulletStyle={bulletStyle}
            showAch={showAch}
            showAchievementIcons={showAchievementIcons}
            showAchievementDesc={showAchievementDesc}
            showAchievementBullets={showAchievementBullets}
            onDeleteAchievement={onDeleteAchievement}
            onEntryVisibilityChange={onEntryVisibilityChange}
            onAchievementChange={onAchievementChange}
            {...sectionStyleProps}
          />
        );
      case 'languages':
        return (
          <DesignerLanguagesSection
            key="languages"
            resumeLanguages={resumeLanguages}
            isEditable={isEditable}
            dragProps={dragProps}
            onLayoutSettingsChange={onLayoutSettingsChange}
            layoutSettings={layoutSettings}
            onAddLanguage={onAddLanguage}
            ec={ec}
            entrySpacing={entrySpacing}
            onDeleteLanguage={onDeleteLanguage}
            onEntryVisibilityChange={onEntryVisibilityChange}
            onLanguageChange={onLanguageChange}
            {...sectionStyleProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`pdf-sheet text-slate-800 font-sans ${sheetActiveClass}`}
      style={{
        ...sheetStyle,
        ['--entry-gap' as string]: `${entrySpacing}px`,
        ['--section-gap' as string]: `${sectionGap}px`,
      } as React.CSSProperties}
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

        {/* Left / enhancv / banner: photo on the right */}
        {(['left', 'enhancv', 'banner'] as string[]).includes(layoutSettings?.headerStyle ?? 'left') && showPhoto && (
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
