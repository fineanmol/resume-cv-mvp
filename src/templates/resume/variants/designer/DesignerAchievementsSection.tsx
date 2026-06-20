import React from 'react';
import { formatMarkdownBold } from '../../../../utils/markdown';
import { EditableText as E } from '../../../shared/EditableText';
import { BulletList } from '../../../shared/BulletList';
import { EntryIconPicker } from '../../../shared/EntryIconPicker';
import { getDynamicAchievementIcon } from '../../../shared/templateIconHelpers';
import { AchievementEntrySettings } from '../../../shared/entrySettings';
import { DraggableSection, ItemWrapper, SectionWrapper, WorkLink } from '../../shared';
import type { ResumeState } from '../../../../types';
import type { DesignerDragProps, DesignerFG, DesignerLayoutSettings } from './designerSectionTypes';

type ResumeAchievement = NonNullable<ResumeState['resumeAchievements']>[number];

export interface DesignerAchievementsSectionProps {
  resumeAchievements: ResumeState['resumeAchievements'];
  isEditable: boolean;
  dragProps: DesignerDragProps;
  onLayoutSettingsChange?: (patch: Partial<DesignerLayoutSettings>) => void;
  layoutSettings: DesignerLayoutSettings;
  onAddAchievement?: () => void;
  ec: string;
  H: string;
  FG: DesignerFG;
  C_HEAD: string;
  C_TITLE: string;
  C_COMPANY: string;
  dsec: React.CSSProperties;
  entrySpacing: number;
  bulletStyle: string;
  showAch: (ach: ResumeAchievement, field: keyof NonNullable<ResumeAchievement['visibility']>) => boolean;
  showAchievementIcons: boolean;
  showAchievementDesc: boolean;
  showAchievementBullets: boolean;
  onDeleteAchievement?: (idx: number) => void;
  onEntryVisibilityChange?: (section: string, idx: number, field: string, value: boolean) => void;
  onAchievementChange?: (idx: number, field: string, value: string) => void;
}

export const DesignerAchievementsSection: React.FC<DesignerAchievementsSectionProps> = ({
  resumeAchievements,
  isEditable,
  dragProps,
  onLayoutSettingsChange,
  layoutSettings,
  onAddAchievement,
  ec,
  H,
  FG,
  C_HEAD,
  C_TITLE,
  C_COMPANY,
  dsec,
  entrySpacing,
  bulletStyle,
  showAch,
  showAchievementIcons,
  showAchievementDesc,
  showAchievementBullets,
  onDeleteAchievement,
  onEntryVisibilityChange,
  onAchievementChange,
}) => {
  if ((!resumeAchievements || resumeAchievements.length === 0) && !isEditable) return null;
  const achievementsAlign = layoutSettings?.achievementsAlign ?? 'left';
  return (
    <DraggableSection key="achievements" id="achievements" {...dragProps}>
      <SectionWrapper
        id="achievements" title="Key Achievements" isEditable={isEditable}
        align={achievementsAlign}
        onAlignChange={(a) => onLayoutSettingsChange?.({ achievementsAlign: a })}
        onAddEntry={onAddAchievement}
        layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
      >
        <section style={dsec}>
          <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Key Achievements</h3>
          <ul className="flex flex-col" style={{ ...FG.body, gap: `${entrySpacing - 4}px` }}>
            {(resumeAchievements ?? []).map((ach, idx) => {
              const showLink = showAch(ach, 'link');
              return (
              <ItemWrapper
                key={idx} sectionId="achievements" index={idx} totalItems={(resumeAchievements ?? []).length}
                isEditable={isEditable} onDelete={() => onDeleteAchievement?.(idx)}
                settingsPanel={(onClose) => (
                  <AchievementEntrySettings
                    item={ach}
                    onToggle={(field, value) => onEntryVisibilityChange?.('achievements', idx, field, value)}
                    onClose={onClose}
                    onUrlChange={(url) => onAchievementChange?.(idx, 'url', url)}
                  />
                )}
              >
                <li className={`text-${achievementsAlign}`}>
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-1.5 leading-snug ${achievementsAlign === 'center' ? 'justify-center' : achievementsAlign === 'right' ? 'justify-end' : ''}`}>
                      {showAchievementIcons && (
                        isEditable ? (
                          <EntryIconPicker
                            variant="achievement"
                            currentIcon={ach.icon || 'star'}
                            onChange={(icon) => onAchievementChange?.(idx, 'icon', icon)}
                            isEditable={isEditable}
                            accentColor={C_TITLE}
                            accentColor2={C_COMPANY}
                            index={idx}
                            title={ach.title}
                            iconClassName="w-3 h-3 shrink-0"
                            wrapperClassName="shrink-0"
                          />
                        ) : (
                          getDynamicAchievementIcon(idx, ach.title, ach.icon, C_TITLE, 'w-3 h-3 shrink-0', C_COMPANY)
                        )
                      )}
                      <div className={`flex items-center gap-1 min-w-0 flex-1 ${achievementsAlign === 'center' ? 'justify-center' : achievementsAlign === 'right' ? 'justify-end' : ''}`}>
                        <E tag="strong" field="achievements.title" value={ach.title} isEditable={isEditable} editableClass={ec}
                          style={{ ...FG.entryTitle, color: C_TITLE }}
                          onSave={v => onAchievementChange?.(idx, 'title', v)} />
                        {showLink && <WorkLink url={ach.url} brandColor={C_COMPANY} />}
                      </div>
                    </div>
                      {showAchievementDesc && (ach.desc || isEditable) && (
                        showAchievementBullets ? (
                          <BulletList
                            field="achievements.description"
                            bullets={ach.desc || ''}
                            isEditable={isEditable}
                            editableClass={ec}
                            onBulletChange={(v) => onAchievementChange?.(idx, 'desc', v)}
                            className={`mt-0.5 leading-snug text-${achievementsAlign}`}
                            bulletStyle={bulletStyle}
                            align={achievementsAlign}
                            prefixId={`ach-${idx}`}
                          />
                        ) : (
                          <E tag="p" field="achievements.description" value={ach.desc || ''} isEditable={isEditable} editableClass={ec}
                            className={`mt-0.5 leading-snug text-${achievementsAlign}`}
                            style={FG.body}
                            onSave={(v) => onAchievementChange?.(idx, 'desc', v)}
                            dangerousInnerHtml={isEditable ? undefined : formatMarkdownBold(ach.desc || '')} />
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
    </DraggableSection>
  );
};
