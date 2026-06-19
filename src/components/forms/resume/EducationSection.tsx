import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import type { ResumeState } from '../../../types';
import { AccordionSection } from '../../ui/AccordionSection';
import { AddItemButton } from '../../ui/AddItemButton';
import { BulletEditor } from '../../ui/BulletEditor';
import { ImageUploadField } from '../../ui/ImageUploadField';
import { ItemActionBar } from '../../ui/ItemActionBar';
import { ITEM_ANIM } from '../../../constants/animations';
import { inputCls, itemCardCls } from '../../../constants/formClasses';

const DEFAULT_EDUCATION = {
  degree: 'Degree / Major',
  school: 'University',
  dates: '2018 – 2022',
  location: 'City, Country',
  bullets: 'Relevant coursework or achievements',
};

interface EducationSectionProps {
  state: ResumeState;
  onChange: (newState: ResumeState | ((prev: ResumeState) => ResumeState)) => void;
  openSection: string;
  onToggle: (id: string) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  state,
  onChange,
  openSection,
  onToggle,
}) => {
  const [openSettingsIdx, setOpenSettingsIdx] = useState<number | null>(null);

  const clean = (t: string) => t.replace(/\*\*|\*/g, '');

  const updEdu = (idx: number, k: string, v: string) =>
    onChange((prev) => {
      const u = [...prev.resumeEducation];
      u[idx] = {
        ...u[idx],
        [k]: k === 'bullets' || k === 'logo' ? v : clean(v),
      };
      return { ...prev, resumeEducation: u };
    });

  const addEducation = () =>
    onChange((prev) => ({
      ...prev,
      resumeEducation: [...prev.resumeEducation, { ...DEFAULT_EDUCATION }],
    }));

  const removeEducation = (idx: number) =>
    onChange((prev) => ({
      ...prev,
      resumeEducation: prev.resumeEducation.filter((_, i) => i !== idx),
    }));

  return (
    <AccordionSection
      id="education"
      icon={GraduationCap}
      label="Education"
      badge={state.resumeEducation.length}
      openSection={openSection}
      onToggle={onToggle}
      bodyClassName="p-4 border-t border-border-color/40 space-y-3"
    >
      <AddItemButton label="Add Education" onClick={addEducation} />
      <AnimatePresence>
        {state.resumeEducation.map((edu, idx) => (
          <motion.div key={idx} {...ITEM_ANIM} className={itemCardCls}>
            <ItemActionBar
              onSettings={() => setOpenSettingsIdx(openSettingsIdx === idx ? null : idx)}
              onDelete={() => removeEducation(idx)}
              settingsActive={openSettingsIdx === idx}
              settingsTitle="Item Settings"
              deleteTitle="Delete Education"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={edu.degree}
                onChange={(e) => updEdu(idx, 'degree', e.target.value)}
                className={inputCls}
                placeholder="Degree"
              />
              <input
                value={edu.school}
                onChange={(e) => updEdu(idx, 'school', e.target.value)}
                className={inputCls}
                placeholder="School"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={edu.dates}
                onChange={(e) => updEdu(idx, 'dates', e.target.value)}
                className={inputCls}
                placeholder="Dates"
              />
              <input
                value={edu.location}
                onChange={(e) => updEdu(idx, 'location', e.target.value)}
                className={inputCls}
                placeholder="Location"
              />
            </div>

            {openSettingsIdx === idx && (
              <div className="p-3 bg-slate-50/5 rounded-lg border border-border-color/50 space-y-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Education Settings
                </div>
                <ImageUploadField
                  label="School Logo / Icon"
                  value={edu.logo || ''}
                  onChange={(logo) => updEdu(idx, 'logo', logo)}
                  placeholderIcon={GraduationCap}
                  shape="square"
                  size="sm"
                  urlPlaceholder="Paste logo URL"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">
                coursework, GPA, honors...
              </label>
              <BulletEditor
                value={edu.bullets}
                onChange={(v) => updEdu(idx, 'bullets', v)}
                prefixId={`edu-bullet-${idx}`}
                placeholder="GPA: 3.8/4.0, Relevant coursework, honors..."
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </AccordionSection>
  );
};
