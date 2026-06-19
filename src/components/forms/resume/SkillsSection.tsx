import React from 'react';
import { FileText } from 'lucide-react';
import type { ResumeState } from '../../../types';
import type { UndoRedoSetter } from '../../../hooks/useUndoRedo';
import { AccordionSection } from '../../ui/AccordionSection';

interface SkillsSectionProps {
  state: ResumeState;
  onChange: UndoRedoSetter<ResumeState>;
  onCommit: () => void;
  openSection: string;
  onToggle: (id: string) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  state,
  onChange,
  onCommit,
  openSection,
  onToggle,
}) => (
  <AccordionSection
    id="skills"
    icon={FileText}
    label="Skills"
    openSection={openSection}
    onToggle={onToggle}
  >
    <p className="text-[10px] text-text-muted mb-2">
      Comma-separated list of skills. ATS keyword frequency is calculated from this field.
    </p>
    <textarea
      rows={3}
      className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:border-brand-accent resize-y"
      placeholder="React, TypeScript, Node.js, AWS, Python, Docker..."
      value={state.resumeSkills}
      onChange={(e) => onChange((p) => ({ ...p, resumeSkills: e.target.value }), true)}
      onBlur={onCommit}
    />
  </AccordionSection>
);
