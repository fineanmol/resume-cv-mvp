import React, { useCallback, useState, lazy, Suspense } from 'react';
import type { ResumeState } from '../types';
import type { UndoRedoSetter } from '../hooks/useUndoRedo';
import { ContactSection } from './forms/resume/ContactSection';
import { SummarySection } from './forms/resume/SummarySection';
import { SkillsSection } from './forms/resume/SkillsSection';
import { ExperienceSection } from './forms/resume/ExperienceSection';
import { EducationSection } from './forms/resume/EducationSection';
import { CertsSection } from './forms/resume/CertsSection';
import { AchievementsSection } from './forms/resume/AchievementsSection';
import { LanguagesSection } from './forms/resume/LanguagesSection';
const PdfImportBlock = lazy(() =>
  import('./forms/resume/PdfImportBlock').then(m => ({ default: m.PdfImportBlock }))
);

interface ResumeFormProps {
  state: ResumeState;
  onChange: UndoRedoSetter<ResumeState>;
  onCommit: () => void;
  onImproveBullet: (idx: number, currentText: string) => Promise<void>;
  aiLoading: boolean;
  isOnline: boolean;
  geminiKey: string;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({
  state,
  onChange,
  onCommit,
  onImproveBullet,
  aiLoading,
  isOnline,
  geminiKey,
}) => {
  const [openSection, setOpenSection] = useState<string>('personal');
  const toggle = (s: string) => setOpenSection((p) => (p === s ? '' : s));

  const handleChange = useCallback<UndoRedoSetter<ResumeState>>(
    (updater, skipHistory = false) => onChange(updater, skipHistory),
    [onChange]
  );

  return (
    <div className="w-full min-h-0 flex-1 flex flex-col overflow-y-auto overscroll-contain p-5 space-y-5">
      <Suspense fallback={<div className="h-24 rounded-xl bg-card/50 animate-pulse border border-border-color/40" aria-hidden />}>
        <PdfImportBlock
          geminiKey={geminiKey}
          onImport={(parsed, avatar) =>
            handleChange((prev) => ({ ...prev, avatar: avatar || prev.avatar || '', ...parsed }) as ResumeState)
          }
        />
      </Suspense>

      <div className="space-y-3">
        <ContactSection
          state={state}
          onChange={handleChange}
          onCommit={onCommit}
          openSection={openSection}
          onToggle={toggle}
        />

        <SummarySection
          state={state}
          onChange={handleChange}
          onCommit={onCommit}
          openSection={openSection}
          onToggle={toggle}
        />

        <SkillsSection
          state={state}
          onChange={handleChange}
          onCommit={onCommit}
          openSection={openSection}
          onToggle={toggle}
        />

        <ExperienceSection
          state={state}
          onChange={handleChange}
          onCommit={onCommit}
          openSection={openSection}
          onToggle={toggle}
          onImproveBullet={onImproveBullet}
          aiLoading={aiLoading}
          isOnline={isOnline}
        />

        <EducationSection
          state={state}
          onChange={handleChange}
          onCommit={onCommit}
          openSection={openSection}
          onToggle={toggle}
        />

        <CertsSection
          state={state}
          onChange={handleChange}
          onCommit={onCommit}
          openSection={openSection}
          onToggle={toggle}
        />

        <AchievementsSection
          state={state}
          onChange={handleChange}
          onCommit={onCommit}
          openSection={openSection}
          onToggle={toggle}
        />

        <LanguagesSection
          state={state}
          onChange={handleChange}
          onCommit={onCommit}
          openSection={openSection}
          onToggle={toggle}
        />
      </div>
    </div>
  );
};
