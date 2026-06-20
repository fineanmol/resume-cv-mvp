import React from 'react';
import { EditableText as E } from '../../../shared/EditableText';
import { BulletList } from '../../../shared/BulletList';
import { DateRangePicker } from '../../../shared/DateRangePicker';
import { ExperienceEntrySettings } from '../../../shared/entrySettings';
import { DraggableSection, ItemLogo, ItemWrapper, SectionWrapper, WorkLink } from '../../shared';
import type { ResumeState } from '../../../../types';
import type { DesignerDragProps, DesignerFG, DesignerLayoutSettings } from './designerSectionTypes';

export interface DesignerExperienceSectionProps {
  resumeExperience: ResumeState['resumeExperience'];
  isEditable: boolean;
  dragProps: DesignerDragProps;
  experienceAlign: string;
  onLayoutSettingsChange?: (patch: Partial<DesignerLayoutSettings>) => void;
  layoutSettings: DesignerLayoutSettings;
  onAddExperience?: () => void;
  ec: string;
  H: string;
  FG: DesignerFG;
  C_HEAD: string;
  C_TITLE: string;
  C_COMPANY: string;
  dsec: React.CSSProperties;
  entrySpacing: number;
  brandColor: string | undefined;
  bulletStyle: string;
  showExp: (exp: ResumeState['resumeExperience'][number], field: keyof NonNullable<ResumeState['resumeExperience'][number]['visibility']>) => boolean;
  onDeleteExperience?: (idx: number) => void;
  onDuplicateExperience?: (idx: number) => void;
  onAddSimilarExperience?: (idx: number) => void;
  onEntryVisibilityChange?: (section: string, idx: number, field: string, value: boolean) => void;
  onExperienceChange?: (idx: number, field: string, value: string) => void;
}

export const DesignerExperienceSection: React.FC<DesignerExperienceSectionProps> = ({
  resumeExperience,
  isEditable,
  dragProps,
  experienceAlign,
  onLayoutSettingsChange,
  layoutSettings,
  onAddExperience,
  ec,
  H,
  FG,
  C_HEAD,
  C_TITLE,
  C_COMPANY,
  dsec,
  entrySpacing,
  brandColor,
  bulletStyle,
  showExp,
  onDeleteExperience,
  onDuplicateExperience,
  onAddSimilarExperience,
  onEntryVisibilityChange,
  onExperienceChange,
}) => {
  if (!resumeExperience || (resumeExperience.length === 0 && !isEditable)) return null;
  return (
    <DraggableSection key="experience" id="experience" {...dragProps}>
      <SectionWrapper
        id="experience" title="Experience" isEditable={isEditable}
        align={experienceAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ experienceAlign: a })}
        onAddEntry={onAddExperience}
        layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
      >
        <section style={dsec}>
          <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Experience</h3>
          <div className="flex flex-col" style={{ gap: `${entrySpacing}px` }}>
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
                      placeholderIconName="building-2"
                      brandColor={brandColor}
                      onUrlChange={(url) => onExperienceChange?.(idx, 'url', url)}
                    />
                  )}
                >
                  <div style={FG.body}>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 flex-1 min-w-0">
                        {showLogo && (
                          <ItemLogo
                            logo={exp.logo}
                            brandColor={C_COMPANY}
                            placeholderIconName="building-2"
                            isEditable={isEditable}
                            onLogoChange={(logo) => onExperienceChange?.(idx, 'logo', logo)}
                          />
                        )}
                        <E field="experience.title" value={exp.title} isEditable={isEditable} editableClass={ec} className="min-w-0 break-words leading-snug" style={{ ...FG.entry, color: C_TITLE }} onSave={v => onExperienceChange?.(idx, 'title', v)} />
                      </span>
                      {showDates && (
                        <DateRangePicker
                          value={exp.dates}
                          isEditable={isEditable}
                          onSave={v => onExperienceChange?.(idx, 'dates', v)}
                          style={FG.meta}
                          className="text-right"
                        />
                      )}
                    </div>
                    {(showCompany || showLocation || (showLink && exp.url)) && (
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <span className="flex items-center gap-1 flex-1 min-w-0">
                          {showCompany && (
                            <E field="experience.company" value={exp.company} isEditable={isEditable} editableClass={ec} className="min-w-0 break-words" style={{ ...FG.company, color: C_COMPANY }} onSave={v => onExperienceChange?.(idx, 'company', v)} />
                          )}
                          {showLink && <WorkLink url={exp.url} brandColor={C_COMPANY} />}
                        </span>
                        {showLocation && (
                          <E field="experience.location" value={exp.location} isEditable={isEditable} editableClass={ec} className="shrink-0 text-right whitespace-nowrap" style={FG.meta} onSave={v => onExperienceChange?.(idx, 'location', v)} />
                        )}
                      </div>
                    )}
                    {showBullets && (
                      <BulletList field="experience.bullets" bullets={exp.bullets} isEditable={isEditable} editableClass={ec}
                        onBulletChange={v => onExperienceChange?.(idx, 'bullets', v)}
                        className={`leading-snug${showLogo ? ' [&_li>span:first-child]:!w-3' : ''}`}
                        bulletStyle={bulletStyle} align={experienceAlign} prefixId={`exp-${idx}`} />
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
