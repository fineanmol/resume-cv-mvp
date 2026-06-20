import React from 'react';
import { EditableText as E } from '../../../shared/EditableText';
import { DateRangePicker } from '../../../shared/DateRangePicker';
import { EducationDescription } from '../../../shared/EducationDescription';
import { EducationEntrySettings } from '../../../shared/entrySettings';
import { parseEducationGrade } from '../../../shared/parseEducationGrade';
import { DraggableSection, ItemLogo, ItemWrapper, SectionWrapper } from '../../shared';
import type { ResumeState } from '../../../../types';
import type { DesignerDragProps, DesignerFG, DesignerLayoutSettings } from './designerSectionTypes';

export interface DesignerEducationSectionProps {
  resumeEducation: ResumeState['resumeEducation'];
  isEditable: boolean;
  dragProps: DesignerDragProps;
  educationAlign: string;
  onLayoutSettingsChange?: (patch: Partial<DesignerLayoutSettings>) => void;
  layoutSettings: DesignerLayoutSettings;
  onAddEducation?: () => void;
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
  showEdu: (edu: ResumeState['resumeEducation'][number], field: keyof NonNullable<ResumeState['resumeEducation'][number]['visibility']>) => boolean;
  onDeleteEducation?: (idx: number) => void;
  onDuplicateEducation?: (idx: number) => void;
  onAddSimilarEducation?: (idx: number) => void;
  onEntryVisibilityChange?: (section: string, idx: number, field: string, value: boolean) => void;
  onEducationChange?: (idx: number, field: string, value: string) => void;
}

export const DesignerEducationSection: React.FC<DesignerEducationSectionProps> = ({
  resumeEducation,
  isEditable,
  dragProps,
  educationAlign,
  onLayoutSettingsChange,
  layoutSettings,
  onAddEducation,
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
  showEdu,
  onDeleteEducation,
  onDuplicateEducation,
  onAddSimilarEducation,
  onEntryVisibilityChange,
  onEducationChange,
}) => {
  if (!resumeEducation || (resumeEducation.length === 0 && !isEditable)) return null;
  return (
    <DraggableSection key="education" id="education" {...dragProps}>
      <SectionWrapper
        id="education" title="Education" isEditable={isEditable}
        align={educationAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ educationAlign: a })}
        onAddEntry={onAddEducation}
        layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
      >
        <section style={dsec}>
          <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Education</h3>
          <div className="flex flex-col" style={{ gap: `${entrySpacing}px` }}>
            {resumeEducation.map((edu, idx) => {
              const { gradeText } = parseEducationGrade(edu.bullets);
              const showLogo = (layoutSettings?.showEducationLogo ?? true) && showEdu(edu, 'logo');
              const showDates = (layoutSettings?.showEducationDates ?? true) && showEdu(edu, 'dates');
              const showLocation = (layoutSettings?.showEducationLocation ?? true) && showEdu(edu, 'location');
              const showGpa = (layoutSettings?.showEducationGpa ?? true) && showEdu(edu, 'gpa');
              const showBullets = showEdu(edu, 'bullets');

              return (
                <ItemWrapper
                  key={idx} sectionId="education" index={idx} totalItems={resumeEducation.length}
                  isEditable={isEditable} onDelete={() => onDeleteEducation?.(idx)}
                  onDuplicate={() => onDuplicateEducation?.(idx)}
                  onAddSimilar={() => onAddSimilarEducation?.(idx)}
                  settingsPanel={(onClose) => (
                    <EducationEntrySettings
                      item={edu}
                      onToggle={(field, value) => onEntryVisibilityChange?.('education', idx, field, value)}
                      onClose={onClose}
                      logo={edu.logo}
                      onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                      placeholderIconName="graduation-cap"
                      brandColor={brandColor}
                    />
                  )}
                >
                  <div className="flex gap-3 justify-between items-start" style={FG.body}>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 leading-snug">
                        {showLogo && (
                          <ItemLogo
                            logo={edu.logo}
                            brandColor={C_COMPANY}
                            placeholderIconName="graduation-cap"
                            isEditable={isEditable}
                            onLogoChange={(logo) => onEducationChange?.(idx, 'logo', logo)}
                          />
                        )}
                        <E field="education.degree" value={edu.degree} isEditable={isEditable} editableClass={ec} className="break-words" style={{ ...FG.entry, color: C_TITLE }} onSave={v => onEducationChange?.(idx, 'degree', v)} />
                      </div>
                      {(edu.school || isEditable) && (
                        <div className="flex justify-between leading-snug">
                          <E field="education.school" value={edu.school} isEditable={isEditable} editableClass={ec} style={{ ...FG.company, color: C_COMPANY }} onSave={v => onEducationChange?.(idx, 'school', v)} />
                        </div>
                      )}
                      {(showDates || showLocation) && (
                        <div className="flex justify-between leading-snug" style={FG.meta}>
                          {showDates && (
                            <DateRangePicker
                              value={edu.dates}
                              isEditable={isEditable}
                              onSave={v => onEducationChange?.(idx, 'dates', v)}
                              style={FG.meta}
                            />
                          )}
                          {showLocation && (
                            <E field="education.location" value={edu.location} isEditable={isEditable} editableClass={ec} onSave={v => onEducationChange?.(idx, 'location', v)} />
                          )}
                        </div>
                      )}
                      <EducationDescription
                        bullets={edu.bullets}
                        isEditable={isEditable}
                        editableClass={ec}
                        onBulletChange={(v) => onEducationChange?.(idx, 'bullets', v)}
                        className={`leading-snug text-${educationAlign}`}
                        bulletStyle={bulletStyle}
                        align={educationAlign}
                        prefixId={`edu-${idx}`}
                        showBullets={showBullets || isEditable}
                        splitGpa
                      />
                    </div>
                    {showGpa && gradeText && (
                      <div className="flex items-center gap-2 h-full flex-shrink-0 self-stretch mt-1">
                        <div className="w-[1px] bg-slate-300 self-stretch min-h-[30px]" />
                        <div className="text-center whitespace-pre-line leading-tight px-1 min-w-[60px]" style={{ ...FG.company, color: C_COMPANY }}>
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
    </DraggableSection>
  );
};
