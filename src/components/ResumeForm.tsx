import React, { useState } from 'react';
import type { ResumeState } from '../types';
import { ContactSection } from './forms/resume/ContactSection';
import { SummarySection } from './forms/resume/SummarySection';
import { SkillsSection } from './forms/resume/SkillsSection';
import { ExperienceSection } from './forms/resume/ExperienceSection';
import { EducationSection } from './forms/resume/EducationSection';
import { CertsSection } from './forms/resume/CertsSection';
import { AchievementsSection } from './forms/resume/AchievementsSection';
import { LanguagesSection } from './forms/resume/LanguagesSection';
import { PdfImportBlock } from './forms/resume/PdfImportBlock';

interface ResumeFormProps {
  state: ResumeState;
  onChange: (newState: ResumeState | ((prev: ResumeState) => ResumeState)) => void;
  onImproveBullet: (idx: number, currentText: string) => Promise<void>;
  aiLoading: boolean;
  isOnline: boolean;
  geminiKey: string;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({
  state,
  onChange,
  onImproveBullet,
  aiLoading,
  isOnline,
  geminiKey,
}) => {
  const [openSection, setOpenSection] = useState<string>('personal');
  const toggle = (s: string) => setOpenSection((p) => (p === s ? '' : s));

  return (
    <div className="w-full flex-1 flex flex-col overflow-y-auto p-5 space-y-5">
      <PdfImportBlock onChange={onChange} geminiKey={geminiKey} />

      <div className="space-y-3">
        <ContactSection
          state={state}
          onChange={onChange}
          openSection={openSection}
          onToggle={toggle}
        />

        <SummarySection
          state={state}
          onChange={onChange}
          openSection={openSection}
          onToggle={toggle}
        />

        <SkillsSection
          state={state}
          onChange={onChange}
          openSection={openSection}
          onToggle={toggle}
        />

        <ExperienceSection
          state={state}
          onChange={onChange}
          openSection={openSection}
          onToggle={toggle}
          onImproveBullet={onImproveBullet}
          aiLoading={aiLoading}
          isOnline={isOnline}
        />

        <EducationSection
          state={state}
          onChange={onChange}
          openSection={openSection}
          onToggle={toggle}
        />

        <CertsSection
          state={state}
          onChange={onChange}
          openSection={openSection}
          onToggle={toggle}
        />

        <AchievementsSection
          state={state}
          onChange={onChange}
          openSection={openSection}
          onToggle={toggle}
        />

        <LanguagesSection
          state={state}
          onChange={onChange}
          openSection={openSection}
          onToggle={toggle}
        />
      </div>
    </div>
  );
};
