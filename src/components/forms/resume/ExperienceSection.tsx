import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Loader, Sparkles } from 'lucide-react';
import type { ResumeState } from '../../../types';
import { AccordionSection } from '../../ui/AccordionSection';
import { AddItemButton } from '../../ui/AddItemButton';
import { BulletEditor } from '../../ui/BulletEditor';
import { ImageUploadField } from '../../ui/ImageUploadField';
import { ItemActionBar } from '../../ui/ItemActionBar';
import { ITEM_ANIM } from '../../../constants/animations';
import {
  aiButtonCls,
  inputCls,
  itemCardCls,
} from '../../../constants/formClasses';

const DEFAULT_EXPERIENCE = {
  title: 'Job Title',
  company: 'Company',
  dates: 'Jan 2022 – Present',
  location: 'City, Country',
  bullets: 'Describe your key responsibilities and achievements here',
};

interface ExperienceSectionProps {
  state: ResumeState;
  onChange: (newState: ResumeState | ((prev: ResumeState) => ResumeState)) => void;
  openSection: string;
  onToggle: (id: string) => void;
  onImproveBullet: (idx: number, currentText: string) => Promise<void>;
  aiLoading: boolean;
  isOnline: boolean;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  state,
  onChange,
  openSection,
  onToggle,
  onImproveBullet,
  aiLoading,
  isOnline,
}) => {
  const [openSettingsIdx, setOpenSettingsIdx] = useState<number | null>(null);

  const clean = (t: string) => t.replace(/\*\*|\*/g, '');

  const updExp = (idx: number, k: string, v: string) =>
    onChange((prev) => {
      const u = [...prev.resumeExperience];
      u[idx] = {
        ...u[idx],
        [k]: k === 'bullets' || k === 'url' || k === 'logo' ? v : clean(v),
      };
      return { ...prev, resumeExperience: u };
    });

  const addExperience = () =>
    onChange((prev) => ({
      ...prev,
      resumeExperience: [...prev.resumeExperience, { ...DEFAULT_EXPERIENCE }],
    }));

  const removeExperience = (idx: number) =>
    onChange((prev) => ({
      ...prev,
      resumeExperience: prev.resumeExperience.filter((_, i) => i !== idx),
    }));

  return (
    <AccordionSection
      id="experience"
      icon={Briefcase}
      label="Work History"
      badge={state.resumeExperience.length}
      openSection={openSection}
      onToggle={onToggle}
      bodyClassName="p-4 border-t border-border-color/40 space-y-3"
    >
      <AddItemButton label="Add Experience" onClick={addExperience} />
      <AnimatePresence>
        {state.resumeExperience.map((exp, idx) => (
          <motion.div key={idx} {...ITEM_ANIM} className={itemCardCls}>
            <ItemActionBar
              onSettings={() => setOpenSettingsIdx(openSettingsIdx === idx ? null : idx)}
              onDelete={() => removeExperience(idx)}
              settingsActive={openSettingsIdx === idx}
              settingsTitle="Item Settings"
              deleteTitle="Delete Experience"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={exp.title}
                onChange={(e) => updExp(idx, 'title', e.target.value)}
                className={inputCls}
                placeholder="Job Title"
              />
              <input
                value={exp.company}
                onChange={(e) => updExp(idx, 'company', e.target.value)}
                className={inputCls}
                placeholder="Company"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={exp.dates}
                onChange={(e) => updExp(idx, 'dates', e.target.value)}
                className={inputCls}
                placeholder="Dates"
              />
              <input
                value={exp.location}
                onChange={(e) => updExp(idx, 'location', e.target.value)}
                className={inputCls}
                placeholder="Location"
              />
            </div>

            {openSettingsIdx === idx && (
              <div className="p-3 bg-slate-50/5 rounded-lg border border-border-color/50 space-y-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Experience Settings
                </div>
                <div>
                  <label className="block text-[9px] text-text-muted mb-1 font-semibold">
                    Website / Project URL
                  </label>
                  <input
                    value={exp.url || ''}
                    onChange={(e) => updExp(idx, 'url', e.target.value)}
                    className={inputCls}
                    placeholder="https://company.com"
                  />
                </div>
                <ImageUploadField
                  label="Company Logo / Icon"
                  value={exp.logo || ''}
                  onChange={(logo) => updExp(idx, 'logo', logo)}
                  placeholderIcon={Briefcase}
                  shape="square"
                  size="sm"
                  urlPlaceholder="Paste logo URL"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Responsibilities & Achievements
              </label>
              <BulletEditor
                value={exp.bullets}
                onChange={(v) => updExp(idx, 'bullets', v)}
                prefixId={`exp-bullet-${idx}`}
                placeholder="Describe responsibility or achievement... (Use **bold** for emphasis)"
              />
            </div>
            {isOnline && (
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => onImproveBullet(idx, exp.bullets)}
                className={aiButtonCls}
              >
                {aiLoading ? (
                  <Loader className="w-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                )}
                Improve with AI
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </AccordionSection>
  );
};
