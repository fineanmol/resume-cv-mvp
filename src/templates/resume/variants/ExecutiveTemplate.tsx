import React from 'react';
import { Building2, GraduationCap } from 'lucide-react';
import { EditableText as E } from '../../shared/EditableText';
import { BulletList } from '../../shared/BulletList';
import { SkillsEditor } from '../../shared/SkillsEditor';
import { TemplateHeader } from '../../TemplateHeader';
import { useTemplateRenderContext } from '../useTemplateSetup';
import {
  BottomSections,
  ItemLogo,
  ItemWrapper,
  SectionWrapper,
  WorkLink,
} from '../shared';
import { ExperienceEntrySettings, EducationEntrySettings } from '../../shared/entrySettings';
import { isEntryFieldVisible } from '../../../utils/entryVisibility';
import { EducationDescription } from '../../shared/EducationDescription';

export const ExecutiveTemplate: React.FC = () => {
  const {
    sheetActiveClass, sheetStyle, isEditable, clearActive, headerProps,
    resumeSummary, sec, brandColor, summaryAlign, ec, ef, onFieldChange,
    resumeSkills, skillsStyle, badgeStyle,
    resumeExperience, experienceAlign, onLayoutSettingsChange, onAddExperience,
    layoutSettings, onExperienceChange, onDeleteExperience, bulletStyle,
    resumeEducation, educationAlign, onAddEducation, onEducationChange, onDeleteEducation,
    onEntryVisibilityChange, onDuplicateExperience, onAddSimilarExperience,
    onDuplicateEducation, onAddSimilarEducation,
    bottomProps,
  } = useTemplateRenderContext();

  const H6 = 'text-xs font-bold uppercase tracking-widest pb-1 mb-2 border-b';

  const showExp = (exp: (typeof resumeExperience)[number], field: keyof NonNullable<(typeof resumeExperience)[number]['visibility']>) =>
    isEntryFieldVisible(exp.visibility, field);

  const showEdu = (edu: (typeof resumeEducation)[number], field: keyof NonNullable<(typeof resumeEducation)[number]['visibility']>) =>
    isEntryFieldVisible(edu.visibility, field);

  const handleAddSkill = () => {
    const list = resumeSkills ? resumeSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
    onFieldChange?.('resumeSkills', [...list, 'New Skill'].join(', '));
  };

  return (
    <div className={`pdf-sheet ${sheetActiveClass}`} style={{ ...sheetStyle, color: '#1e293b' }} id="resume-sheet"
        onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
      <TemplateHeader {...headerProps} />

      {(resumeSummary || isEditable) && (
        <SectionWrapper
          id="summary" title="Executive Summary" isEditable={isEditable}
          align={summaryAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ summaryAlign: a })}
        >
          <section style={sec}>
            <h3 className={H6} style={{ borderColor: brandColor, color: brandColor }}>Executive Summary</h3>
            <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
              className={`text-xs text-slate-700 leading-relaxed text-${summaryAlign}`} onSave={ef('resumeSummary')} />
          </section>
        </SectionWrapper>
      )}

      {(resumeSkills || isEditable) && (
        <SectionWrapper
          id="skills" title="Core Expertise" isEditable={isEditable}
          align={undefined}
          skillsStyle={skillsStyle}
          onSkillsStyleChange={(s) => onLayoutSettingsChange?.({ skillsStyle: s })}
          onSkillsValueChange={ef('resumeSkills')}
          onAddEntry={handleAddSkill}
        >
          <section style={sec}>
            <h3 className={H6} style={{ borderColor: brandColor, color: brandColor }}>Core Expertise</h3>
            <SkillsEditor
              value={resumeSkills}
              isEditable={isEditable}
              ec={ec}
              onSave={ef('resumeSkills')}
              badgeStyle={() => ({ ...badgeStyle(), borderRadius: '9999px' })}
              className="text-[11px] gap-x-2 gap-y-1.5"
              skillsStyle={skillsStyle}
            />
          </section>
        </SectionWrapper>
      )}

      {(resumeExperience && resumeExperience.length > 0 || isEditable) && (
        <SectionWrapper
          id="experience" title="Professional Experience" isEditable={isEditable}
          align={experienceAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ experienceAlign: a })}
          onAddEntry={onAddExperience}
          layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
        >
          <section style={sec}>
            <h3 className={H6} style={{ borderColor: brandColor, color: brandColor }}>Professional Experience</h3>
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
                    <div className="text-xs pl-3 border-l-2" style={{ borderColor: `${brandColor}50` }}>
                      <div className="flex justify-between font-bold text-slate-900">
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
                        <div className="flex justify-between text-slate-600 italic mb-1.5">
                          <span className="flex items-center gap-1">
                            {showCompany && (
                              <E value={exp.company} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'company', v)} />
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
                          onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700"
                          bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} prefixId={`exp-${idx}`} />
                      )}
                    </div>
                  </ItemWrapper>
                );
              })}
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
            <h3 className={H6} style={{ borderColor: brandColor, color: brandColor }}>Education</h3>
            <div className="space-y-2">
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
                        placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />}
                        brandColor={brandColor}
                      />
                    )}
                  >
                    <div className="text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          {showLogo && (
                            <ItemLogo logo={edu.logo} brandColor={brandColor} placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} />
                          )}
                          <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                        </span>
                        {showDates && (
                          <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="font-normal text-slate-500" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                        )}
                      </div>
                      {(showLocation || edu.school) && (
                        <div className="flex justify-between text-slate-600 italic mb-0.5">
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
          </section>
        </SectionWrapper>
      )}

      <BottomSections {...bottomProps} accentColor={brandColor}
        headingClass={H6} />
    </div>
  );
};
