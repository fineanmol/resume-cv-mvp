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

export const NavyTemplate: React.FC = () => {
  const {
    sheetActiveClass, sheetStyle, isEditable, clearActive, headerProps,
    resumeSummary, sec, brandColor, summaryAlign, ec, ef,
    resumeSkills, skillsStyle, badgeStyle, accentColor2,
    resumeExperience, experienceAlign, onLayoutSettingsChange, onAddExperience,
    layoutSettings, onExperienceChange, onDeleteExperience, bulletStyle,
    resumeEducation, educationAlign, onAddEducation, onEducationChange, onDeleteEducation,
    bottomProps,
  } = useTemplateRenderContext();

  const H = 'text-sm font-bold uppercase tracking-wider border-b pb-1 mb-2';

  return (
    <div className={`pdf-sheet ${sheetActiveClass}`} style={sheetStyle} id="resume-sheet"
        onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
        <TemplateHeader {...headerProps} />

        {(resumeSummary || isEditable) && (
          <section style={sec}>
            <h3 className={H} style={{ color: brandColor, borderColor: `${brandColor}40` }}>Profile Summary</h3>
            <E tag="p" value={resumeSummary || 'Professional summary...'} isEditable={isEditable} editableClass={ec}
              className={`text-xs text-${summaryAlign} text-slate-700 leading-relaxed`} onSave={ef('resumeSummary')} />
          </section>
        )}

        {(resumeSkills || isEditable) && (
          <section style={sec}>
            <h3 className={H} style={{ color: brandColor, borderColor: `${brandColor}40` }}>Skills</h3>
            <SkillsEditor
              value={resumeSkills}
              isEditable={isEditable}
              ec={ec}
              onSave={ef('resumeSkills')}
              accentColor2={accentColor2}
              brandColor={brandColor}
              badgeStyle={badgeStyle}
              defaultBadgeStyle={{ background: '#f1f5f9', color: '#1e293b', borderColor: '#e2e8f0' }}
              skillsStyle={skillsStyle}
            />
          </section>
        )}

        {(resumeExperience && resumeExperience.length > 0 || isEditable) && (
          <SectionWrapper
            id="experience" title="Professional Experience" isEditable={isEditable}
            align={experienceAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ experienceAlign: a })}
            onAddEntry={onAddExperience}
            layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
          >
            <section style={sec}>
              <h3 className={H} style={{ color: brandColor, borderColor: `${brandColor}40` }}>Professional Experience</h3>
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
                      <div className="flex justify-between font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          {(layoutSettings?.showExperienceLogo ?? true) && (
                            <ItemLogo logo={exp.logo} brandColor={brandColor} placeholderIcon={<Building2 className="w-3.5 h-3.5" />} />
                          )}
                          <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                        </span>
                        <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="text-slate-500 font-normal" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                      </div>
                      <div className="flex justify-between text-slate-600 italic mb-1.5">
                        <span className="flex items-center gap-1">
                          <E value={exp.company} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                          <WorkLink url={exp.url} brandColor={brandColor} />
                        </span>
                        <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                      </div>
                      <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                        onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700"
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
              <h3 className={H} style={{ color: brandColor, borderColor: `${brandColor}40` }}>Education</h3>
              <div className="space-y-3">
                {resumeEducation.map((edu, idx) => (
                  <ItemWrapper
                    key={idx} sectionId="education" index={idx} totalItems={resumeEducation.length}
                    isEditable={isEditable} onDelete={() => onDeleteEducation?.(idx)}
                    logo={edu.logo} onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                    showLogo={layoutSettings?.showEducationLogo ?? true}
                    placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} brandColor={brandColor}
                  >
                    <div className="text-xs">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          {(layoutSettings?.showEducationLogo ?? true) && (
                            <ItemLogo logo={edu.logo} brandColor={brandColor} placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} />
                          )}
                          <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                        </span>
                        <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="text-slate-500 font-normal" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                      </div>
                      <div className="flex justify-between text-slate-600 italic mb-1">
                        <E value={edu.school} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'school', v)} />
                        <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                      </div>
                      <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-700 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                    </div>
                  </ItemWrapper>
                ))}
              </div>
            </section>
          </SectionWrapper>
        )}

        <BottomSections {...bottomProps} accentColor={brandColor} headingClass={H} />
      </div>
    );
};
