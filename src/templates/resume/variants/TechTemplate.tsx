import React from 'react';
import { Building2, GraduationCap } from 'lucide-react';
import { EditableText as E } from '../../shared/EditableText';
import { BulletList } from '../../shared/BulletList';
import { SkillsEditor } from '../../shared/SkillsEditor';
import { EducationDescription } from '../../shared/EducationDescription';
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

export const TechTemplate: React.FC = () => {
  const {
    sheetActiveClass, sheetStyle, isEditable, clearActive, headerProps,
    resumeSummary, sec, summaryAlign, ec, ef, onFieldChange,
    resumeSkills, skillsStyle, badgeStyle, brandColor,
    resumeExperience, experienceAlign, onLayoutSettingsChange, onAddExperience,
    layoutSettings, onExperienceChange, onDeleteExperience, bulletStyle,
    resumeEducation, educationAlign, onAddEducation, onEducationChange, onDeleteEducation,
    onEntryVisibilityChange, onDuplicateExperience, onAddSimilarExperience,
    onDuplicateEducation, onAddSimilarEducation,
    bottomProps,
  } = useTemplateRenderContext();

  const MH = 'font-mono text-xs font-bold text-slate-950 uppercase tracking-widest border-b pb-1 mb-2.5';

  const showExp = (exp: (typeof resumeExperience)[number], field: keyof NonNullable<(typeof resumeExperience)[number]['visibility']>) =>
    isEntryFieldVisible(exp.visibility, field);

  const showEdu = (edu: (typeof resumeEducation)[number], field: keyof NonNullable<(typeof resumeEducation)[number]['visibility']>) =>
    isEntryFieldVisible(edu.visibility, field);

  const handleAddSkill = () => {
    const list = resumeSkills ? resumeSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
    onFieldChange?.('resumeSkills', [...list, 'New Skill'].join(', '));
  };

  return (
    <div className={`pdf-sheet ${sheetActiveClass}`} style={sheetStyle} id="resume-sheet"
      onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
      <TemplateHeader {...headerProps} />

      {(resumeSummary || isEditable) && (
        <SectionWrapper
          id="summary" title="Profile Summary" isEditable={isEditable}
          align={summaryAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ summaryAlign: a })}
        >
          <section style={sec}>
            <div className={MH}>// Profile_Summary</div>
            <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
              className={`text-xs text-slate-700 leading-relaxed text-${summaryAlign}`} onSave={ef('resumeSummary')} />
          </section>
        </SectionWrapper>
      )}

      {(resumeSkills || isEditable) && (
        <SectionWrapper
          id="skills" title="Core Tech Stack" isEditable={isEditable}
          align={undefined}
          skillsStyle={skillsStyle}
          onSkillsStyleChange={(s) => onLayoutSettingsChange?.({ skillsStyle: s })}
          onSkillsValueChange={ef('resumeSkills')}
          onAddEntry={handleAddSkill}
        >
          <section style={sec}>
            <div className={MH}>// Core_Tech_Stack</div>
            <SkillsEditor
              value={resumeSkills}
              isEditable={isEditable}
              ec={ec}
              onSave={ef('resumeSkills')}
              badgeStyle={badgeStyle}
              className="font-mono text-[10px]"
              skillsStyle={skillsStyle}
            />
          </section>
        </SectionWrapper>
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
                    <div className="text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          {showLogo && (
                            <ItemLogo logo={exp.logo} brandColor={brandColor} placeholderIcon={<Building2 className="w-3.5 h-3.5" />} />
                          )}
                          <span className="flex items-center gap-1">
                            <E field="experience.title" value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                            {showCompany && (
                              <>
                                <span> @ </span>
                                <E field="experience.company" value={exp.company} isEditable={isEditable} editableClass={ec} className="text-slate-600 font-normal" onSave={v => onExperienceChange?.(idx, 'company', v)} />
                                {showLink && <WorkLink url={exp.url} brandColor={brandColor} />}
                              </>
                            )}
                          </span>
                        </span>
                        {showDates && (
                          <E field="experience.dates" value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                        )}
                      </div>
                      {showLocation && (
                        <E field="experience.location" value={exp.location} isEditable={isEditable} editableClass={ec} className="text-[11px] font-mono text-slate-500 italic mb-1.5 block" onSave={v => onExperienceChange?.(idx, 'location', v)} />
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
                          <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="font-mono text-[10px] text-slate-400" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                        )}
                      </div>
                      {edu.school && (
                        <E value={edu.school} isEditable={isEditable} editableClass={ec} className="text-[11px] font-mono text-slate-500 mb-1 block" onSave={v => onEducationChange?.(idx, 'school', v)} />
                      )}
                      {showLocation && (
                        <E value={edu.location} isEditable={isEditable} editableClass={ec} className="text-[11px] font-mono text-slate-500 mb-1 block" onSave={v => onEducationChange?.(idx, 'location', v)} />
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

      <BottomSections {...bottomProps} accentColor={brandColor} headingClass={MH} />
    </div>
  );
};
