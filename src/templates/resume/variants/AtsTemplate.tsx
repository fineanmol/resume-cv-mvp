import React from 'react';
import { Building2, GraduationCap } from 'lucide-react';
import { EditableText as E } from '../../shared/EditableText';
import { BulletList } from '../../shared/BulletList';
import { SkillsEditor } from '../../shared/SkillsEditor';
import { TemplateHeader } from '../../TemplateHeader';
import { useTemplateRenderContext } from '../useTemplateSetup';
import {
  ItemLogo,
  ItemWrapper,
  SectionWrapper,
  WorkLink,
} from '../shared';

export const AtsTemplate: React.FC = () => {
  const {
    sheetActiveClass, sheetStyle, isEditable, clearActive, headerProps,
    resumeSummary, sec, summaryAlign, ec, ef,
    resumeSkills, skillsStyle, badgeStyle, accentColor2, brandColor,
    resumeExperience, experienceAlign, onLayoutSettingsChange, onAddExperience,
    layoutSettings, onExperienceChange, onDeleteExperience, bulletStyle,
    resumeEducation, educationAlign, onAddEducation, onEducationChange, onDeleteEducation,
    resumeCerts, resumeAchievements, resumeLanguages,
    certsAlign, achievementsAlign,
    onCertChange, onAchievementChange, onLanguageChange,
  } = useTemplateRenderContext();

  const H = 'text-xs font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-2 text-slate-900';

  return (
    <div className={`pdf-sheet text-slate-900 ${sheetActiveClass}`} style={{ ...sheetStyle, color: '#1a1a1a' }} id="resume-sheet"
      onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
      <TemplateHeader {...headerProps} />

      {(resumeSummary || isEditable) && (
        <section style={sec}>
          <h2 className={H} style={{ borderColor: brandColor }}>Summary</h2>
          <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
            className={`text-xs text-slate-800 leading-relaxed text-${summaryAlign}`} onSave={ef('resumeSummary')} />
        </section>
      )}

      {(resumeSkills || isEditable) && (
        <section style={sec}>
          <h2 className={H} style={{ borderColor: brandColor }}>Core Competencies</h2>
          <SkillsEditor
            value={resumeSkills}
            isEditable={isEditable}
            ec={ec}
            onSave={ef('resumeSkills')}
            accentColor2={accentColor2}
            brandColor={brandColor}
            badgeStyle={badgeStyle}
            className="text-xs text-slate-800"
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
            <h2 className={H} style={{ borderColor: brandColor }}>Professional Experience</h2>
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
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        {(layoutSettings?.showExperienceLogo ?? true) && (
                          <ItemLogo logo={exp.logo} brandColor={brandColor} placeholderIcon={<Building2 className="w-3.5 h-3.5" />} />
                        )}
                        <E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                      </span>
                      <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-normal" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                    </div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span className="flex items-center gap-1">
                        <E value={exp.company} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                        <WorkLink url={exp.url} brandColor={brandColor} />
                      </span>
                      <E value={exp.location} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                    </div>
                    <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                      onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-800"
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
            <h2 className={H} style={{ borderColor: brandColor }}>Education</h2>
            <div className="space-y-2">
              {resumeEducation.map((edu, idx) => (
                <ItemWrapper
                  key={idx} sectionId="education" index={idx} totalItems={resumeEducation.length}
                  isEditable={isEditable} onDelete={() => onDeleteEducation?.(idx)}
                  logo={edu.logo} onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                  showLogo={layoutSettings?.showEducationLogo ?? true}
                  placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} brandColor={brandColor}
                >
                  <div className="text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        {(layoutSettings?.showEducationLogo ?? true) && (
                          <ItemLogo logo={edu.logo} brandColor={brandColor} placeholderIcon={<GraduationCap className="w-3.5 h-3.5" />} />
                        )}
                        <E value={edu.degree} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                      </span>
                      <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="font-normal" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                    </div>
                    <div className="flex justify-between text-slate-700 mb-0.5">
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

      {resumeCerts && resumeCerts.length > 0 && (
        <section style={sec}>
          <h2 className={H} style={{ borderColor: brandColor }}>Certifications</h2>
          <ul className="space-y-1 text-xs">
            {resumeCerts.map((cert, idx) => (
              <li key={idx} className={`flex gap-1.5 text-${certsAlign} ${certsAlign === 'right' ? 'flex-row-reverse' : ''}`}>
                <span className="text-slate-400">▸</span>
                <div className="flex-1 min-w-0">
                  <span className={`inline-flex items-center gap-1 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                    <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="text-slate-900 font-bold" onSave={v => onCertChange?.(idx, 'title', v)} />
                    <WorkLink url={cert.url} brandColor={brandColor} />
                  </span>
                  {cert.desc && <> — <E value={cert.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-600 text-${certsAlign}`} onSave={v => onCertChange?.(idx, 'desc', v)} /></>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {resumeAchievements && resumeAchievements.length > 0 && (
        <section style={sec}>
          <h2 className={H} style={{ borderColor: brandColor }}>Key Achievements</h2>
          <ul className="space-y-1 text-xs">
            {resumeAchievements.map((ach, idx) => (
              <li key={idx} className={`flex gap-1.5 text-${achievementsAlign} ${achievementsAlign === 'right' ? 'flex-row-reverse' : ''}`}>
                <span className="text-slate-400">▸</span>
                <div className="flex-1 min-w-0">
                  <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className={`text-slate-900 text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'title', v)} />
                  {ach.desc && <> — <E value={ach.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-600 text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'desc', v)} /></>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {resumeLanguages && resumeLanguages.length > 0 && (
        <section style={sec}>
          <h2 className={H} style={{ borderColor: brandColor }}>Languages</h2>
          <p className="text-xs text-slate-800">
            {resumeLanguages.map((lang, idx) => (
              <span key={idx}>
                <E tag="span" value={lang.name} isEditable={isEditable} editableClass={ec} className="font-semibold" onSave={v => onLanguageChange?.(idx, 'name', v)} />
                {' ('}<E value={lang.level} isEditable={isEditable} editableClass={ec} onSave={v => onLanguageChange?.(idx, 'level', v)} />{')'}
                {idx < resumeLanguages.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        </section>
      )}
    </div>
  );
};
