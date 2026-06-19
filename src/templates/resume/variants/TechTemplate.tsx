import React from 'react';
import { Award, Building2, GraduationCap } from 'lucide-react';
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

export const TechTemplate: React.FC = () => {
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

  const MH = 'font-mono text-xs font-bold text-slate-950 uppercase tracking-widest border-b pb-1 mb-2.5';

  return (
    <div className={`pdf-sheet ${sheetActiveClass}`} style={sheetStyle} id="resume-sheet"
      onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
      <TemplateHeader {...headerProps} />

      {(resumeSummary || isEditable) && (
        <section style={sec}>
          <div className={MH}>// Profile_Summary</div>
          <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
            className={`text-xs text-slate-700 leading-relaxed text-${summaryAlign}`} onSave={ef('resumeSummary')} />
        </section>
      )}

      {(resumeSkills || isEditable) && (
        <section style={sec}>
          <div className={MH}>// Core_Tech_Stack</div>
          <SkillsEditor
            value={resumeSkills}
            isEditable={isEditable}
            ec={ec}
            onSave={ef('resumeSkills')}
            accentColor2={accentColor2}
            brandColor={brandColor}
            badgeStyle={badgeStyle}
            defaultBadgeStyle={{ borderColor: '#cbd5e1', color: '#334155', background: '#f8fafc' }}
            className="font-mono text-[10px]"
            skillsStyle={skillsStyle}
          />
        </section>
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
                        <span className="flex items-center gap-1"><E value={exp.title} isEditable={isEditable} editableClass={ec} onSave={v => onExperienceChange?.(idx, 'title', v)} /><span> @ </span><E value={exp.company} isEditable={isEditable} editableClass={ec} className="text-slate-600 font-normal" onSave={v => onExperienceChange?.(idx, 'company', v)} /><WorkLink url={exp.url} brandColor={brandColor} /></span>
                      </span>
                      <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                    </div>
                    <E value={exp.location} isEditable={isEditable} editableClass={ec} className="text-[11px] font-mono text-slate-500 italic mb-1.5 block" onSave={v => onExperienceChange?.(idx, 'location', v)} />
                    <BulletList bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                      onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)} className="text-slate-700"
                      bulletStyle={bulletStyle} brandColor={brandColor} align={experienceAlign} prefixId={`exp-${idx}`} />
                  </div>
                </ItemWrapper>
              ))}
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
                      <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="font-mono text-[10px] text-slate-400" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                    </div>
                    <E value={edu.school} isEditable={isEditable} editableClass={ec} className="text-[11px] font-mono text-slate-500 mb-1 block" onSave={v => onEducationChange?.(idx, 'school', v)} />
                    <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-600 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                  </div>
                </ItemWrapper>
              ))}
            </div>
          </section>
        </SectionWrapper>
      )}

      {resumeCerts && resumeCerts.length > 0 && (
        <section style={sec}>
          <div className={MH}>// Certifications</div>
          <div className={`flex flex-wrap gap-2 text-xs ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
            {resumeCerts.map((cert, idx) => (
              <div key={idx} className={`border border-slate-200 rounded p-2 bg-slate-50 min-w-[140px] text-${certsAlign}`}>
                <div className={`flex items-center gap-1 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                  <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 font-bold text-[11px]" onSave={v => onCertChange?.(idx, 'title', v)} />
                  <WorkLink url={cert.url} brandColor={brandColor} />
                </div>
                <E tag="p" value={cert.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[10px] mt-0.5 text-${certsAlign}`} onSave={v => onCertChange?.(idx, 'desc', v)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {resumeAchievements && resumeAchievements.length > 0 && (
        <section style={sec}>
          <div className={MH}>// Achievements</div>
          <div className="space-y-2 text-xs">
            {resumeAchievements.map((ach, idx) => (
              <div key={idx} className={`flex gap-2 items-start text-${achievementsAlign} ${achievementsAlign === 'right' ? 'flex-row-reverse' : ''}`}>
                <Award className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className={`text-slate-800 block text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'title', v)} />
                  <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[11px] text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'desc', v)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {resumeLanguages && resumeLanguages.length > 0 && (
        <section style={sec}>
          <div className={MH}>// Languages</div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {resumeLanguages.map((lang, idx) => (
              <span key={idx} className="border border-slate-200 bg-slate-50 px-2 py-0.5 rounded">
                <E value={lang.name} isEditable={isEditable} editableClass={ec} className="font-semibold" onSave={v => onLanguageChange?.(idx, 'name', v)} />
                <span className="text-slate-400">:</span>
                <E value={lang.level} isEditable={isEditable} editableClass={ec} className="text-slate-500 ml-1" onSave={v => onLanguageChange?.(idx, 'level', v)} />
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
