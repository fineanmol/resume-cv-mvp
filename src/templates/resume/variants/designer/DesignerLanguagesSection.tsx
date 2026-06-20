import React from 'react';
import { EditableText as E } from '../../../shared/EditableText';
import { LanguageEntrySettings } from '../../../shared/entrySettings';
import { getLanguageBubbleCount, getLanguageLevelFromBubbleCount } from '../../../../utils/languageLevel';
import { isEntryFieldVisible } from '../../../../utils/entryVisibility';
import { DraggableSection, ItemWrapper, LanguageBubbles, SectionWrapper } from '../../shared';
import type { ResumeState } from '../../../../types';
import type { DesignerDragProps, DesignerFG, DesignerLayoutSettings } from './designerSectionTypes';

export interface DesignerLanguagesSectionProps {
  resumeLanguages: ResumeState['resumeLanguages'];
  isEditable: boolean;
  dragProps: DesignerDragProps;
  onLayoutSettingsChange?: (patch: Partial<DesignerLayoutSettings>) => void;
  layoutSettings: DesignerLayoutSettings;
  onAddLanguage?: () => void;
  ec: string;
  H: string;
  FG: DesignerFG;
  C_HEAD: string;
  C_TITLE: string;
  dsec: React.CSSProperties;
  entrySpacing: number;
  onDeleteLanguage?: (idx: number) => void;
  onEntryVisibilityChange?: (section: string, idx: number, field: string, value: boolean) => void;
  onLanguageChange?: (idx: number, field: string, value: string) => void;
}

export const DesignerLanguagesSection: React.FC<DesignerLanguagesSectionProps> = ({
  resumeLanguages,
  isEditable,
  dragProps,
  onLayoutSettingsChange,
  layoutSettings,
  onAddLanguage,
  ec,
  H,
  FG,
  C_HEAD,
  C_TITLE,
  dsec,
  entrySpacing,
  onDeleteLanguage,
  onEntryVisibilityChange,
  onLanguageChange,
}) => {
  if ((!resumeLanguages || resumeLanguages.length === 0) && !isEditable) return null;
  return (
    <DraggableSection key="languages" id="languages" {...dragProps}>
      <SectionWrapper
        id="languages" title="Languages" isEditable={isEditable}
        align={undefined}
        onAddEntry={onAddLanguage}
        layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
      >
        <section style={dsec}>
          <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Languages</h3>
          <div className="grid grid-cols-2 gap-x-3 items-start" style={{ rowGap: `${entrySpacing - 4}px` }}>
            {(resumeLanguages ?? []).map((lang, idx) => {
              const bubbles = getLanguageBubbleCount(lang.level);
              const showLevel = (layoutSettings?.showLanguageLevel ?? true) && isEntryFieldVisible(lang.visibility, 'level');
              const showSlider = isEntryFieldVisible(lang.visibility, 'slider') !== false;
              return (
                <ItemWrapper
                  key={idx} sectionId="languages" index={idx} totalItems={(resumeLanguages ?? []).length}
                  isEditable={isEditable} onDelete={() => onDeleteLanguage?.(idx)}
                  settingsPanel={(onClose) => (
                    <LanguageEntrySettings
                      item={lang}
                      onToggle={(field, value) => onEntryVisibilityChange?.('languages', idx, field, value)}
                      onClose={onClose}
                    />
                  )}
                >
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <E tag="p" field="languages.name" value={lang.name} isEditable={isEditable} editableClass={ec}
                        style={{ ...FG.entry, color: C_TITLE }}
                        onSave={v => onLanguageChange?.(idx, 'name', v)} />
                      {showLevel && (
                        <E tag="p" field="languages.level" value={lang.level} isEditable={isEditable} editableClass={ec}
                          style={FG.meta}
                          onSave={v => onLanguageChange?.(idx, 'level', v)} />
                      )}
                    </div>
                    {showSlider && (
                      <LanguageBubbles
                        count={bubbles}
                        activeColor={C_TITLE}
                        isEditable={isEditable}
                        onCountChange={(bubbleCount) =>
                          onLanguageChange?.(idx, 'level', getLanguageLevelFromBubbleCount(bubbleCount))
                        }
                      />
                    )}
                  </div>
                </ItemWrapper>
              );
            })}
          </div>
        </section>
      </SectionWrapper>
    </DraggableSection>
  );
};
