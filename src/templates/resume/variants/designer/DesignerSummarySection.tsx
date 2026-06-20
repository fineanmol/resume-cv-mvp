import React from 'react';
import { SummaryContent } from '../../../shared/SummaryContent';
import { DraggableSection, SectionWrapper } from '../../shared';
import type { DesignerDragProps, DesignerFG, DesignerLayoutSettings } from './designerSectionTypes';

export interface DesignerSummarySectionProps {
  resumeSummary: string | undefined;
  isEditable: boolean;
  dragProps: DesignerDragProps;
  summaryAlign: string;
  onLayoutSettingsChange?: (patch: Partial<DesignerLayoutSettings>) => void;
  layoutSettings: DesignerLayoutSettings;
  ec: string;
  ef: (field: keyof import('../../../../types').ResumeState) => (v: string) => void;
  H: string;
  FG: DesignerFG;
  C_HEAD: string;
  dsec: React.CSSProperties;
  bulletStyle: string;
  showSummaryBullets: boolean;
}

export const DesignerSummarySection: React.FC<DesignerSummarySectionProps> = ({
  resumeSummary,
  isEditable,
  dragProps,
  summaryAlign,
  onLayoutSettingsChange,
  layoutSettings,
  ec,
  ef,
  H,
  FG,
  C_HEAD,
  dsec,
  bulletStyle,
  showSummaryBullets,
}) => {
  if (!resumeSummary && !isEditable) return null;
  return (
    <DraggableSection key="summary" id="summary" {...dragProps}>
      <SectionWrapper
        id="summary" title="Summary" isEditable={isEditable}
        align={summaryAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ summaryAlign: a })}
        layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
      >
        <section style={dsec}>
          <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Summary</h3>
          <div style={FG.body}>
            <SummaryContent
              value={resumeSummary || ''}
              isEditable={isEditable}
              editableClass={ec}
              onSave={ef('resumeSummary')}
              className={`leading-relaxed text-${summaryAlign}`}
              bulletStyle={bulletStyle}
              align={summaryAlign}
              showBullets={showSummaryBullets}
            />
          </div>
        </section>
      </SectionWrapper>
    </DraggableSection>
  );
};
