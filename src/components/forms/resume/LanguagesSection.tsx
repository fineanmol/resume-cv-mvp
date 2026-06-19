import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Trash2 } from 'lucide-react';
import type { ResumeState } from '../../../types';
import type { UndoRedoSetter } from '../../../hooks/useUndoRedo';
import { AccordionSection } from '../../ui/AccordionSection';
import { AddItemButton } from '../../ui/AddItemButton';
import { ITEM_ANIM } from '../../../constants/animations';
import { deleteIconBtnCls, inputCls } from '../../../constants/formClasses';

const DEFAULT_LANGUAGE = {
  name: 'Language',
  level: 'Native / Fluent',
};

interface LanguagesSectionProps {
  state: ResumeState;
  onChange: UndoRedoSetter<ResumeState>;
  onCommit: () => void;
  openSection: string;
  onToggle: (id: string) => void;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  state,
  onChange,
  onCommit,
  openSection,
  onToggle,
}) => {
  const clean = (t: string) => t.replace(/\*\*|\*/g, '');

  const updLang = (idx: number, k: string, v: string) =>
    onChange((prev) => {
      const u = [...prev.resumeLanguages];
      u[idx] = { ...u[idx], [k]: clean(v) };
      return { ...prev, resumeLanguages: u };
    }, true);

  const addLanguage = () =>
    onChange((prev) => ({
      ...prev,
      resumeLanguages: [...prev.resumeLanguages, { ...DEFAULT_LANGUAGE }],
    }));

  const removeLanguage = (idx: number) =>
    onChange((prev) => ({
      ...prev,
      resumeLanguages: prev.resumeLanguages.filter((_, i) => i !== idx),
    }));

  return (
    <AccordionSection
      id="languages"
      icon={Globe}
      label="Languages"
      badge={state.resumeLanguages.length}
      openSection={openSection}
      onToggle={onToggle}
      bodyClassName="p-4 border-t border-border-color/40 space-y-3"
    >
      <AddItemButton label="Add Language" onClick={addLanguage} />
      <AnimatePresence>
        {state.resumeLanguages.map((lang, idx) => (
          <motion.div
            key={idx}
            {...ITEM_ANIM}
            className="flex gap-2 items-center relative group"
          >
            <button
              type="button"
              onClick={() => removeLanguage(idx)}
              className={`${deleteIconBtnCls} opacity-0 group-hover:opacity-100 transition flex-shrink-0`}
              title="Delete Language"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <input
              value={lang.name}
              onChange={(e) => updLang(idx, 'name', e.target.value)}
              onBlur={onCommit}
              className={`${inputCls} flex-1`}
              placeholder="Language"
            />
            <input
              value={lang.level}
              onChange={(e) => updLang(idx, 'level', e.target.value)}
              onBlur={onCommit}
              className={`${inputCls} flex-1`}
              placeholder="Level"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </AccordionSection>
  );
};
