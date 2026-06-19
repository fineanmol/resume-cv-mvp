import React from 'react';
import type {
  ResumeState,
  CertItem,
  AchievementItem,
  LanguageItem,
  LayoutSettings,
  EntrySection,
} from '../../types';
import { EditableText as E } from './EditableText';
import { WorkLink } from './WorkLink';
import { SectionWrapper } from './SectionWrapper';
import { ItemWrapper } from './ItemWrapper';
import { BulletList } from './BulletList';
import { AchievementIconPicker } from './AchievementIconPicker';
import { LanguageBubbles } from './LanguageBubbles';
import {
  CertEntrySettings,
  AchievementEntrySettings,
  LanguageEntrySettings,
} from './entrySettings';
import { isEntryFieldVisible } from '../../utils/entryVisibility';
import { splitIntoBullets } from '../../utils/bullets';
import { getLanguageBubbleCount } from '../../utils/languageLevel';
import { getDynamicAchievementIcon, getDynamicProjectIcon } from './templateIconHelpers';

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
  bulletStyle?: LayoutSettings['bulletStyle'];
  onLayoutSettingsChange?: (patch: Partial<LayoutSettings>) => void;
  onCertChange?: (index: number, field: keyof CertItem, value: string) => void;
  onAchievementChange?: (index: number, field: keyof AchievementItem, value: string) => void;
  onLanguageChange?: (index: number, field: keyof LanguageItem, value: string) => void;
  onAddCert?: () => void;
  onDeleteCert?: (index: number) => void;
  onDuplicateCert?: (index: number) => void;
  onAddSimilarCert?: (index: number) => void;
  onAddAchievement?: () => void;
  onDeleteAchievement?: (index: number) => void;
  onDuplicateAchievement?: (index: number) => void;
  onAddSimilarAchievement?: (index: number) => void;
  onAddLanguage?: () => void;
  onDeleteLanguage?: (index: number) => void;
  onDuplicateLanguage?: (index: number) => void;
  onAddSimilarLanguage?: (index: number) => void;
  onEntryVisibilityChange?: (section: EntrySection, index: number, field: string, value: boolean) => void;
  certsAlign?: 'left' | 'center' | 'right' | 'justify';
  achievementsAlign?: 'left' | 'center' | 'right' | 'justify';
}

const BULLET_MARKER_REGEX = /[•●▪◦\u2022\u25cf\u25aa\u25e6\u2043\u25a0✦■⁃]|\s+[-*]\s+/;

function descUsesBulletList(desc: string): boolean {
  if (!desc) return false;
  if (/\r?\n/.test(desc)) return true;
  if (BULLET_MARKER_REGEX.test(desc)) return true;
  return splitIntoBullets(desc).length > 1;
}

export const BottomSections: React.FC<BottomSectionsProps> = ({
  resumeCerts, resumeAchievements, resumeLanguages,
  sec, isEditable, ec, accentColor, headingClass,
  layoutSettings, bulletStyle = 'disc', onLayoutSettingsChange,
  onCertChange, onAchievementChange, onLanguageChange,
  onAddCert, onDeleteCert, onDuplicateCert, onAddSimilarCert,
  onAddAchievement, onDeleteAchievement, onDuplicateAchievement, onAddSimilarAchievement,
  onAddLanguage, onDeleteLanguage, onDuplicateLanguage, onAddSimilarLanguage,
  onEntryVisibilityChange,
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

  const showCert = (cert: CertItem, field: keyof NonNullable<CertItem['visibility']>) =>
    isEntryFieldVisible(cert.visibility, field);

  const showAch = (ach: AchievementItem, field: keyof NonNullable<AchievementItem['visibility']>) =>
    isEntryFieldVisible(ach.visibility, field);

  const showLang = (lang: LanguageItem, field: keyof NonNullable<LanguageItem['visibility']>) =>
    isEntryFieldVisible(lang.visibility, field);

  const certDescContent = (cert: CertItem, idx: number, showDesc: boolean) => {
    if (!showDesc || !cert.desc) return null;
    if (descUsesBulletList(cert.desc)) {
      return (
        <BulletList
          bullets={cert.desc}
          isEditable={isEditable}
          editableClass={ec}
          onBulletChange={(v) => onCertChange?.(idx, 'desc', v)}
          className={`text-slate-500 text-[11px] mt-0.5 text-${certsAlign}`}
          bulletStyle={bulletStyle}
          brandColor={accentColor}
          align={certsAlign}
          prefixId={`cert-${idx}`}
        />
      );
    }
    return (
      <E
        tag="p"
        value={cert.desc}
        isEditable={isEditable}
        editableClass={ec}
        className={`text-slate-500 text-[11px] mt-0.5 text-${certsAlign}`}
        onSave={(v) => onCertChange?.(idx, 'desc', v)}
      />
    );
  };

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
              {certs.map((cert, idx) => {
                const showIcon = showProjectIcons && showCert(cert, 'icon');
                const showDesc = showProjectDesc && showCert(cert, 'desc');
                const showLink = showCert(cert, 'link');

                return (
                  <ItemWrapper
                    key={idx} sectionId="certs" index={idx} totalItems={certs.length}
                    isEditable={isEditable} onDelete={() => onDeleteCert?.(idx)}
                    onDuplicate={() => onDuplicateCert?.(idx)}
                    onAddSimilar={() => onAddSimilarCert?.(idx)}
                    settingsPanel={(onClose) => (
                      <CertEntrySettings
                        item={cert}
                        onToggle={(field, value) => onEntryVisibilityChange?.('certs', idx, field, value)}
                        onClose={onClose}
                      />
                    )}
                  >
                    <li className={`text-${certsAlign}`}>
                      <div className={`flex items-center gap-1 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                        {showIcon && (
                          isEditable ? (
                            <AchievementIconPicker
                              currentIcon={cert.icon || 'award'}
                              onChange={(icon) => onCertChange?.(idx, 'icon', icon)}
                              isEditable={isEditable}
                              accentColor={accentColor}
                            />
                          ) : (
                            getDynamicProjectIcon(idx, cert.title, cert.icon, accentColor, 'w-3 h-3 flex-shrink-0')
                          )
                        )}
                        <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 font-bold"
                          onSave={(v) => onCertChange?.(idx, 'title', v)} />
                        {showLink && <WorkLink url={cert.url} brandColor={accentColor} />}
                      </div>
                      {certDescContent(cert, idx, showDesc)}
                    </li>
                  </ItemWrapper>
                );
              })}
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
              {achievements.map((ach, idx) => {
                const showIcon = showAchievementIcons && showAch(ach, 'icon');
                const showDesc = showAchievementDesc && showAch(ach, 'desc');

                return (
                  <ItemWrapper
                    key={idx} sectionId="achievements" index={idx} totalItems={achievements.length}
                    isEditable={isEditable} onDelete={() => onDeleteAchievement?.(idx)}
                    onDuplicate={() => onDuplicateAchievement?.(idx)}
                    onAddSimilar={() => onAddSimilarAchievement?.(idx)}
                    settingsPanel={(onClose) => (
                      <AchievementEntrySettings
                        item={ach}
                        onToggle={(field, value) => onEntryVisibilityChange?.('achievements', idx, field, value)}
                        onClose={onClose}
                      />
                    )}
                  >
                    <li className={`flex gap-2 text-${achievementsAlign} ${achievementsAlign === 'right' ? 'flex-row-reverse' : ''}`}>
                      {showIcon && (
                        isEditable ? (
                          <AchievementIconPicker
                            currentIcon={ach.icon || 'star'}
                            onChange={(icon) => onAchievementChange?.(idx, 'icon', icon)}
                            isEditable={isEditable}
                            accentColor={accentColor}
                          />
                        ) : (
                          getDynamicAchievementIcon(idx, ach.title, ach.icon, accentColor, 'w-3 h-3 flex-shrink-0 mt-0.5')
                        )
                      )}
                      <div className="flex-1 min-w-0">
                        <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 block"
                          onSave={(v) => onAchievementChange?.(idx, 'title', v)} />
                        {showDesc && (
                          descUsesBulletList(ach.desc) ? (
                            <BulletList
                              bullets={ach.desc}
                              isEditable={isEditable}
                              editableClass={ec}
                              onBulletChange={(v) => onAchievementChange?.(idx, 'desc', v)}
                              className="text-slate-500 text-[11px]"
                              bulletStyle={bulletStyle}
                              brandColor={accentColor}
                              align={achievementsAlign}
                              prefixId={`ach-${idx}`}
                            />
                          ) : (
                            <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className="text-slate-500 text-[11px]"
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
              {languages.map((lang, idx) => {
                const showLevel = showLanguageLevel && showLang(lang, 'level');
                const showSlider = showLevel && showLang(lang, 'slider');
                const bubbles = getLanguageBubbleCount(lang.level);

                return (
                  <ItemWrapper
                    key={idx} sectionId="languages" index={idx} totalItems={languages.length}
                    isEditable={isEditable} onDelete={() => onDeleteLanguage?.(idx)}
                    onDuplicate={() => onDuplicateLanguage?.(idx)}
                    onAddSimilar={() => onAddSimilarLanguage?.(idx)}
                    settingsPanel={(onClose) => (
                      <LanguageEntrySettings
                        item={lang}
                        onToggle={(field, value) => onEntryVisibilityChange?.('languages', idx, field, value)}
                        onClose={onClose}
                      />
                    )}
                  >
                    <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      <E value={lang.name} isEditable={isEditable} editableClass={ec} className="font-semibold text-slate-800"
                        onSave={(v) => onLanguageChange?.(idx, 'name', v)} />
                      {showLevel && !showSlider && (
                        <>
                          <span className="text-slate-400">/</span>
                          <E value={lang.level} isEditable={isEditable} editableClass={ec} className="text-slate-500"
                            onSave={(v) => onLanguageChange?.(idx, 'level', v)} />
                        </>
                      )}
                      {showSlider && (
                        <>
                          {isEditable ? (
                            <E value={lang.level} isEditable={isEditable} editableClass={ec} className="text-slate-500 text-[10px]"
                              onSave={(v) => onLanguageChange?.(idx, 'level', v)} />
                          ) : null}
                          <LanguageBubbles count={bubbles} activeColor={accentColor} />
                        </>
                      )}
                    </span>
                  </ItemWrapper>
                );
              })}
            </div>
          </section>
        </SectionWrapper>
      )}
    </>
  );
};
