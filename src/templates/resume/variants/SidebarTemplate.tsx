import React from 'react';
import { Phone, Mail, MapPin, Building2, GraduationCap } from 'lucide-react';
import { EditableText as E } from '../../shared/EditableText';
import { BulletList } from '../../shared/BulletList';
import { SkillsEditor } from '../../shared/SkillsEditor';
import { formatLinkedinUrl } from '../../../utils/linkedin';
import { useTemplateRenderContext } from '../useTemplateSetup';
import {
  ItemLogo,
  ItemWrapper,
  LI,
  SectionWrapper,
  WorkLink,
} from '../shared';

export const SidebarTemplate: React.FC = () => {
  const {
    sheetActiveClass, sheetStyle, isEditable, clearActive, sec, ec, ef,
    name, subtitle, phone, email, linkedin, location, avatar,
    resumeSummary, resumeSkills, resumeExperience, resumeEducation,
    resumeCerts, resumeAchievements, resumeLanguages, layoutSettings,
    brandColor, accentColor2, bulletStyle, skillsStyle, summaryAlign,
    experienceAlign, educationAlign, certsAlign, achievementsAlign,
    showAvatar, bodyFontCss, headingFontCss, lineHeight, badgeStyle,
    onLayoutSettingsChange, onAddExperience, onDeleteExperience,
    onExperienceChange, onAddEducation, onDeleteEducation, onEducationChange,
    onCertChange, onAchievementChange, onLanguageChange,
  } = useTemplateRenderContext();

  const SH = 'text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2';
  const hasPhone = !!(phone && phone.trim());
  const hasEmail = !!(email && email.trim());
  const hasLocation = !!(location && location.trim());
  const hasLinkedin = !!(linkedin && linkedin.trim());
  const hasContact = hasPhone || hasEmail || hasLocation || hasLinkedin;

  return (
    <div className={`pdf-sheet p-0 text-slate-800 flex flex-row ${sheetActiveClass}`} style={{ ...sheetStyle, padding: 0 }} id="resume-sheet"
      onClick={(e) => { if (e.target === e.currentTarget && isEditable) clearActive(); }}>
      <aside className="w-[220px] flex-shrink-0 flex flex-col gap-5 p-5" style={{ background: brandColor + '15', borderRight: `3px solid ${brandColor}` }}>
        {showAvatar && (
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2" style={{ borderColor: brandColor }}>
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
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
          <div>
            <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Skills</h4>
            <SkillsEditor
              value={resumeSkills}
              isEditable={isEditable}
              ec={ec}
              onSave={ef('resumeSkills')}
              accentColor2={accentColor2}
              brandColor={brandColor}
              badgeStyle={(i) => ({ ...badgeStyle(i), borderRadius: '9999px' })}
              defaultBadgeStyle={{ background: brandColor + 'cc', color: '#fff', borderRadius: '9999px' }}
              className="text-[10px] gap-1"
              skillsStyle={skillsStyle}
            />
          </div>
        )}

        {resumeCerts && resumeCerts.length > 0 && (
          <div>
            <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Certifications</h4>
            <ul className="space-y-2 text-[11px]">
              {resumeCerts.map((cert, idx) => (
                <li key={idx} className={`text-${certsAlign}`}>
                  <span className={`flex items-center gap-1 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                    <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="block text-slate-900 font-bold" onSave={v => onCertChange?.(idx, 'title', v)} />
                    <WorkLink url={cert.url} brandColor={brandColor} />
                  </span>
                  <E tag="p" value={cert.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[10px] text-${certsAlign}`} onSave={v => onCertChange?.(idx, 'desc', v)} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {resumeLanguages && resumeLanguages.length > 0 && (
          <div>
            <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Languages</h4>
            <ul className="space-y-1.5 text-[11px]">
              {resumeLanguages.map((lang, idx) => (
                <li key={idx} className="flex justify-between">
                  <E tag="strong" value={lang.name} isEditable={isEditable} editableClass={ec} className="text-slate-900" onSave={v => onLanguageChange?.(idx, 'name', v)} />
                  <E value={lang.level} isEditable={isEditable} editableClass={ec} className="text-slate-500 italic" onSave={v => onLanguageChange?.(idx, 'level', v)} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {resumeAchievements && resumeAchievements.length > 0 && (
          <div>
            <h4 className={SH} style={{ borderColor: `${brandColor}60`, color: brandColor }}>Achievements</h4>
            <ul className="space-y-2 text-[11px]">
              {resumeAchievements.map((ach, idx) => (
                <li key={idx} className={`text-${achievementsAlign}`}>
                  <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className={`block text-slate-900 text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'title', v)} />
                  <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[10px] text-${achievementsAlign}`} onSave={v => onAchievementChange?.(idx, 'desc', v)} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <main className="flex-1 p-6" style={{ lineHeight, fontFamily: bodyFontCss }}>
        <header className="mb-4 pb-3 border-b-2" style={{ borderColor: brandColor }}>
          <E tag="h1" value={name} isEditable={isEditable} editableClass={ec}
            className="text-3xl font-extrabold tracking-tight" style={{ color: brandColor, fontFamily: headingFontCss }} onSave={ef('name')} />
          <E tag="p" value={subtitle} isEditable={isEditable} editableClass={ec}
            className="text-sm font-medium text-slate-500 uppercase mt-1 tracking-wide" onSave={ef('subtitle')} />
        </header>

        {(resumeSummary || isEditable) && (
          <div style={sec}>
            <h3 className={SH} style={{ borderColor: `${brandColor}40`, color: brandColor }}>Profile</h3>
            <E tag="p" value={resumeSummary || 'Summary...'} isEditable={isEditable} editableClass={ec}
              className={`text-xs text-${summaryAlign} text-slate-700 leading-relaxed`} onSave={ef('resumeSummary')} />
          </div>
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
                        <E value={exp.dates} isEditable={isEditable} editableClass={ec} className="text-slate-400 font-normal" onSave={v => onExperienceChange?.(idx, 'dates', v)} />
                      </div>
                      <div className="flex justify-between text-slate-500 italic mb-1">
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
                        <E value={edu.dates} isEditable={isEditable} editableClass={ec} className="text-slate-400 font-normal" onSave={v => onEducationChange?.(idx, 'dates', v)} />
                      </div>
                      <div className="flex justify-between text-slate-500 italic mb-1">
                        <E value={edu.school} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'school', v)} />
                        <E value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                      </div>
                      <E tag="p" value={edu.bullets} isEditable={isEditable} editableClass={ec} className={`text-slate-600 text-${educationAlign}`} onSave={v => onEducationChange?.(idx, 'bullets', v)} />
                    </div>
                  </ItemWrapper>
                ))}
              </div>
            </div>
          </SectionWrapper>
        )}
      </main>
    </div>
  );
};
