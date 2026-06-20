import React from 'react';
import { SkillsEditor } from '../../../shared/SkillsEditor';
import { DraggableSection, SectionWrapper } from '../../shared';
import type { DesignerDragProps, DesignerFG } from './designerSectionTypes';

export interface DesignerSkillsSectionProps {
  resumeSkills: string | undefined;
  isEditable: boolean;
  dragProps: DesignerDragProps;
  skillsStyle: string;
  onLayoutSettingsChange?: (patch: Partial<import('../../../../types').ResumeLayoutSettings>) => void;
  ec: string;
  ef: (field: keyof import('../../../../types').ResumeState) => (v: string) => void;
  onAddSkill: () => void;
  H: string;
  FG: DesignerFG;
  C_HEAD: string;
  dsec: React.CSSProperties;
  badgeStyle: () => React.CSSProperties;
  scale: number;
  bodyFontFamily: string;
  C_BODY: string;
}

export const DesignerSkillsSection: React.FC<DesignerSkillsSectionProps> = ({
  resumeSkills,
  isEditable,
  dragProps,
  skillsStyle,
  onLayoutSettingsChange,
  ec,
  ef,
  onAddSkill,
  H,
  FG,
  C_HEAD,
  dsec,
  badgeStyle,
  scale,
  bodyFontFamily,
  C_BODY,
}) => {
  if (!resumeSkills && !isEditable) return null;
  return (
    <DraggableSection key="skills" id="skills" {...dragProps}>
      <SectionWrapper
        id="skills" title="Skills" isEditable={isEditable}
        align={undefined}
        skillsStyle={skillsStyle}
        onSkillsStyleChange={(s) => onLayoutSettingsChange?.({ skillsStyle: s })}
        onSkillsValueChange={ef('resumeSkills')}
        onAddEntry={onAddSkill}
      >
        <section style={dsec}>
          <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Skills</h3>
          <SkillsEditor
            value={resumeSkills}
            isEditable={isEditable}
            ec={ec}
            onSave={ef('resumeSkills')}
            badgeStyle={badgeStyle}
            skillsStyle={skillsStyle}
            fontScale={scale}
            gridFontFamily={bodyFontFamily}
            gridTextColor={C_BODY}
            chipFontFamily={bodyFontFamily}
            chipTextColor={C_BODY}
          />
        </section>
      </SectionWrapper>
    </DraggableSection>
  );
};
