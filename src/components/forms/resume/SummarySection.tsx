import React from 'react';
import { AlignLeft } from 'lucide-react';
import type { ResumeState } from '../../../types';
import { AccordionSection } from '../../ui/AccordionSection';

interface SummarySectionProps {
  state: ResumeState;
  onChange: (newState: ResumeState | ((prev: ResumeState) => ResumeState)) => void;
  openSection: string;
  onToggle: (id: string) => void;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  state,
  onChange,
  openSection,
  onToggle,
}) => (
  <AccordionSection
    id="summary"
    icon={AlignLeft}
    label="Profile Summary"
    openSection={openSection}
    onToggle={onToggle}
  >
    <textarea
      rows={5}
      className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:border-brand-accent resize-y"
      placeholder="Write a 2–4 sentence professional summary highlighting your expertise, achievements, and career goals."
      value={state.resumeSummary}
      onChange={(e) => onChange((p) => ({ ...p, resumeSummary: e.target.value }))}
    />
  </AccordionSection>
);
