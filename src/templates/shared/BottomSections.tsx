import React from 'react';
import { Award, Star } from 'lucide-react';
import type { ResumeState, CertItem, AchievementItem, LanguageItem, LayoutSettings } from '../../types';
import { EditableText as E } from './EditableText';
import { WorkLink } from './WorkLink';
import { SectionWrapper } from './SectionWrapper';
import { ItemWrapper } from './ItemWrapper';

export interface BottomSectionsProps {
  resumeCerts: ResumeState['resumeCerts'];
  resumeAchievements: ResumeState['resumeAchievements'];
  resumeLanguages: ResumeState['resumeLanguages'];
  sec: React.CSSProperties;
  isEditable: boolean;
  ec: string;
  accentColor: string;
  headingClass: string;
  layoutSettings?: LayoutSettings;
  onLayoutSettingsChange?: (patch: Partial<LayoutSettings>) => void;
  onCertChange?: (index: number, field: keyof CertItem, value: string) => void;
  onAchievementChange?: (index: number, field: keyof AchievementItem, value: string) => void;
  onLanguageChange?: (index: number, field: keyof LanguageItem, value: string) => void;
  onAddCert?: () => void;
  onDeleteCert?: (index: number) => void;
  onAddAchievement?: () => void;
  onDeleteAchievement?: (index: number) => void;
  onAddLanguage?: () => void;
  onDeleteLanguage?: (index: number) => void;
  certsAlign?: 'left' | 'center' | 'right' | 'justify';
  achievementsAlign?: 'left' | 'center' | 'right' | 'justify';
}

export const BottomSections: React.FC<BottomSectionsProps> = ({
  resumeCerts, resumeAchievements, resumeLanguages,
  sec, isEditable, ec, accentColor, headingClass,
  layoutSettings, onLayoutSettingsChange,
  onCertChange, onAchievementChange, onLanguageChange,
  onAddCert, onDeleteCert, onAddAchievement, onDeleteAchievement,
  onAddLanguage, onDeleteLanguage,
  certsAlign = 'left', achievementsAlign = 'left',
}) => {
  const showProjectIcons = layoutSettings?.showProjectIcons ?? true;
  const showProjectDesc = layoutSettings?.showProjectDesc ?? true;
  const showAchievementIcons = layoutSettings?.showAchievementIcons ?? true;
  const showAchievementDesc = layoutSettings?.showAchievementDesc ?? true;
  const showLanguageLevel = layoutSettings?.showLanguageLevel ?? true;

  const certs = resumeCerts ?? [];
  const achievements = resumeAchievements ?? [];
  const languages = resumeLanguages ?? [];

  return (
    <>
      {(certs.length > 0 || isEditable) && (
        <SectionWrapper
          id="certs" title="Certifications" isEditable={isEditable}
          align={certsAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ certsAlign: a })}
          onAddEntry={onAddCert}
          layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
        >
          <section style={sec}>
            <h3 className={headingClass} style={{ color: accentColor, borderColor: `${accentColor}40` }}>Certifications</h3>
            <ul className="space-y-1.5 text-xs">
              {certs.map((cert, idx) => (
                <ItemWrapper
                  key={idx} sectionId="certs" index={idx} totalItems={certs.length}
                  isEditable={isEditable} onDelete={() => onDeleteCert?.(idx)}
                >
                  <li className={`text-${certsAlign}`}>
                    <div className={`flex items-center gap-1 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                      {showProjectIcons && (
                        <Award className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      )}
                      <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 font-bold"
                        onSave={v => onCertChange?.(idx, 'title', v)} />
                      <WorkLink url={cert.url} brandColor={accentColor} />
                    </div>
                    {showProjectDesc && (
                      <E tag="p" value={cert.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[11px] mt-0.5 text-${certsAlign}`}
                        onSave={v => onCertChange?.(idx, 'desc', v)} />
                    )}
                  </li>
                </ItemWrapper>
              ))}
            </ul>
          </section>
        </SectionWrapper>
      )}

      {(achievements.length > 0 || isEditable) && (
        <SectionWrapper
          id="achievements" title="Achievements" isEditable={isEditable}
          align={achievementsAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ achievementsAlign: a })}
          onAddEntry={onAddAchievement}
          layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
        >
          <section style={sec}>
            <h3 className={headingClass} style={{ color: accentColor, borderColor: `${accentColor}40` }}>Achievements</h3>
            <ul className="space-y-2 text-xs">
              {achievements.map((ach, idx) => (
                <ItemWrapper
                  key={idx} sectionId="achievements" index={idx} totalItems={achievements.length}
                  isEditable={isEditable} onDelete={() => onDeleteAchievement?.(idx)}
                >
                  <li className={`flex gap-2 text-${achievementsAlign} ${achievementsAlign === 'right' ? 'flex-row-reverse' : ''}`}>
                    {showAchievementIcons && (
                      <Star className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 block"
                        onSave={v => onAchievementChange?.(idx, 'title', v)} />
                      {showAchievementDesc && (
                        <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className="text-slate-500 text-[11px]"
                          onSave={v => onAchievementChange?.(idx, 'desc', v)} />
                      )}
                    </div>
                  </li>
                </ItemWrapper>
              ))}
            </ul>
          </section>
        </SectionWrapper>
      )}

      {(languages.length > 0 || isEditable) && (
        <SectionWrapper
          id="languages" title="Languages" isEditable={isEditable}
          align={undefined}
          onAddEntry={onAddLanguage}
          layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
        >
          <section style={sec}>
            <h3 className={headingClass} style={{ color: accentColor, borderColor: `${accentColor}40` }}>Languages</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {languages.map((lang, idx) => (
                <ItemWrapper
                  key={idx} sectionId="languages" index={idx} totalItems={languages.length}
                  isEditable={isEditable} onDelete={() => onDeleteLanguage?.(idx)}
                >
                  <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <E value={lang.name} isEditable={isEditable} editableClass={ec} className="font-semibold text-slate-800"
                      onSave={v => onLanguageChange?.(idx, 'name', v)} />
                    {showLanguageLevel && (
                      <>
                        <span className="text-slate-400">/</span>
                        <E value={lang.level} isEditable={isEditable} editableClass={ec} className="text-slate-500"
                          onSave={v => onLanguageChange?.(idx, 'level', v)} />
                      </>
                    )}
                  </span>
                </ItemWrapper>
              ))}
            </div>
          </section>
        </SectionWrapper>
      )}
    </>
  );
};
