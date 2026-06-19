import React from 'react';
import { Building2, GraduationCap } from 'lucide-react';
import { EditableText as E } from '../../shared/EditableText';
import { BulletList } from '../../shared/BulletList';
import { SkillsEditor } from '../../shared/SkillsEditor';
import { EducationDescription } from '../../shared/EducationDescription';
import { parseEducationGrade } from '../../shared/parseEducationGrade';
import { TemplateHeader } from '../../TemplateHeader';
import { useTemplateRenderContext } from '../useTemplateSetup';
import {
  BottomSections,
  ItemLogo,
  ItemWrapper,
  SectionWrapper,
  WorkLink,
} from '../shared';

export const SerifTemplate: React.FC = () => {
  const {
    sheetActiveClass, sheetStyle, isEditable, clearActive, headerProps,
    resumeSummary, sec, summaryAlign, ec, ef, onFieldChange,
    resumeSkills, skillsStyle, badgeStyle, brandColor,
    resumeExperience, experienceAlign, onLayoutSettingsChange, onAddExperience,
    layoutSettings, onExperienceChange, onDeleteExperience, bulletStyle,
    resumeEducation, educationAlign, onAddEducation, onEducationChange, onDeleteEducation,
    bottomProps,
  } = useTemplateRenderContext();

  const H = 'text-[13px] font-bold text-center border-b pb-0.5 mb-3 uppercase tracking-widest text-slate-800';
  const showExpDates = layoutSettings?.showExperienceDates ?? true;
  const showExpCompany = layoutSettings?.showExperienceCompany ?? true;
  const showExpLocation = layoutSettings?.showExperienceLocation ?? true;
  const showEduDates = layoutSettings?.showEducationDates ?? true;
  const showEduLocation = layoutSettings?.showEducationLocation ?? true;
  const showEduGpa = layoutSettings?.showEducationGpa ?? true;

  const handleAddSkill = () => {
    const list = resumeSkills ? resumeSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
    onFieldChange?.('resumeSkills', [...list, 'New Skill'].join(', '));
  };

  return (
    <div className={`pdf-sheet text-justify ${sheetActiveClass}`} style={sheetStyle} id="resume-sheet"
      onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
      <TemplateHeader {...headerProps} />

      {(resumeSummary || isEditable) && (
        <SectionWrapper
          id="summary" title="Profile" isEditable={isEditable}
          align={summaryAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ summaryAlign: a })}
        >
          <section style={sec}>
            <h3 className={H}>Profile</h3>
            <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
              className={`text-slate-800 leading-relaxed text-[13px] text-${summaryAlign}`} onSave={ef('resumeSummary')} />
          </section>
        </SectionWrapper>
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
          <section style={sec} className="text-xs">
            <h3 className={H}>Skills &amp; Expertise</h3>
            <SkillsEditor
              value={resumeSkills}
              isEditable={isEditable}
              ec={ec}
              onSave={ef('resumeSkills')}
              badgeStyle={badgeStyle}
              className="font-sans"
              skillsStyle={skillsStyle}
            />
          </section>
        </SectionWrapper>
      )}

      {(resumeExperience && resumeExperience.length > 0 || isEditable) && (
        <SectionWrapper
          id="experience" title="Experience" isEditable={isEditable}
          align={experienceAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ experienceAlign: a })}
          onAddEntry={onAddExperience}
          layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
        >
          <section style={sec}>
            <h3 className={H}>Experience</h3>
            <div className="space-y-4">
              {resumeExperience.map((exp, idx) => (
                <ItemWrapper
                  key={idx} sectionId="experience" index={idx} totalItems={resumeExperience.length}
                  isEditable={isEditable} onDelete={() => onDeleteExperience?.(idx)}
                  logo={exp.logo} onLogoChange={(logo) => onExperienceChange?.(idx, 'logo', logo)}
                  showLogo={layoutSettings?.showExperienceLogo ?? true}
                  placeholderIcon={<Building2 className="w-3.5 h-3.5" />} brandColor={brandColor}
                >
                  <div className="text-xs">
                    <div className="flex justify-between font-bold text-slate-950">
                      <span className="flex items-center gap-1.5 flex-wrap">
                        {(layoutSettings?.showExperienceLogo ?? true) && (
                          <ItemLogo logo={exp.logo} brandColor={brandColor} placeholderIcon={<Building2 className="w-3.5 h-3.5" />} />
                        )}
                        <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                        {showExpCompany && (
                          <>
                            <span> — </span>
                            <E value={exp.company} isEditable={isEditable} editableClass={ec} className="font-normal italic text-slate-700" onSave={v => onExperienceChange?.(idx, 'company', v)} />
                            <WorkLink url={exp.url} brandColor={brandColor} />
                          </>
                        )}
                      </span>
                      {showExpDates && (
                        <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-normal font-sans text-slate-500" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                      )}
                    </div>
                    {showExpLocation && (
                      <div className="text-[11px] text-slate-500 italic mb-1.5 font-sans">
                        <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                      </div>
                    )}
                    <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                      onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-800 leading-relaxed"
                      bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} />
                  </div>
                </ItemWrapper>
              ))}
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
            <h3 className={H}>Education</h3>
            <div className="space-y-3">
              {resumeEducation.map((edu, idx) => {
                const { gradeText } = parseEducationGrade(edu.bullets);
                return (
                  <ItemWrapper
                    key={idx} sectionId="education" index={idx} totalItems={resumeEducation.length}
                    isEditable={isEditable} onDelete={() => onDeleteEducation?.(idx)}
                    logo={edu.logo} onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                    showLogo={layoutSettings?.showEducationLogo ?? true}
                    placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} brandColor={brandColor}
                  >
                    <div className="text-xs flex gap-3 justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between font-bold text-slate-950 font-serif">
                          <span className="flex items-center gap-1.5 flex-wrap">
                            {(layoutSettings?.showEducationLogo ?? true) && (
                              <ItemLogo logo={edu.logo} brandColor={brandColor} placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} />
                            )}
                            <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                            <span> — </span>
                            <E value={edu.school} isEditable={isEditable} editableClass={ec} className="font-normal italic text-slate-700" onSave={v => onEducationChange?.(idx, 'school', v)} />
                          </span>
                          {showEduDates && (
                            <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="font-normal font-sans text-slate-500" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                          )}
                        </div>
                        {showEduLocation && (
                          <div className="flex justify-between text-[11px] text-slate-500 italic font-sans">
                            <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                          </div>
                        )}
                        <EducationDescription
                          bullets={edu.bullets}
                          isEditable={isEditable}
                          editableClass={ec}
                          onBulletChange={(v) => onEducationChange?.(idx, 'bullets', v)}
                          className="text-slate-700 mt-1"
                          bulletStyle={bulletStyle}
                          brandColor={brandColor}
                          align={educationAlign}
                          prefixId={`edu-${idx}`}
                          splitGpa
                        />
                      </div>
                      {showEduGpa && gradeText && (
                        <div className="flex items-center gap-2 flex-shrink-0 self-stretch mt-1">
                          <div className="w-px bg-slate-300 self-stretch min-h-[30px]" />
                          <div className="text-[10px] font-bold text-center whitespace-pre-line leading-tight px-1 min-w-[60px]" style={{ color: brandColor }}>
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
      )}

      <BottomSections {...bottomProps} accentColor={brandColor}
        headingClass="text-[13px] font-bold text-center border-b pb-0.5 mb-2 uppercase tracking-widest text-slate-800" />
    </div>
  );
};
