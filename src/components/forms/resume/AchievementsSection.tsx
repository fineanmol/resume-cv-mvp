import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Award,
  Flag,
  Check,
  Trophy,
  Target,
  Terminal,
  Trash2,
} from 'lucide-react';
import type { ResumeState } from '../../../types';
import { AccordionSection } from '../../ui/AccordionSection';
import { AddItemButton } from '../../ui/AddItemButton';
import { ITEM_ANIM } from '../../../constants/animations';
import { deleteIconBtnCls, itemCardCls } from '../../../constants/formClasses';

const DEFAULT_ACHIEVEMENT = {
  title: 'Achievement Title',
  desc: 'Brief description of impact or scale',
  icon: 'star' as const,
};

const ICON_OPTIONS = [
  { key: 'star', icon: Star },
  { key: 'award', icon: Award },
  { key: 'flag', icon: Flag },
  { key: 'check', icon: Check },
  { key: 'trophy', icon: Trophy },
  { key: 'target', icon: Target },
  { key: 'terminal', icon: Terminal },
] as const;

interface AchievementsSectionProps {
  state: ResumeState;
  onChange: (newState: ResumeState | ((prev: ResumeState) => ResumeState)) => void;
  openSection: string;
  onToggle: (id: string) => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  state,
  onChange,
  openSection,
  onToggle,
}) => {
  const clean = (t: string) => t.replace(/\*\*|\*/g, '');

  const updAch = (idx: number, k: string, v: string) =>
    onChange((prev) => {
      const u = [...prev.resumeAchievements];
      u[idx] = { ...u[idx], [k]: clean(v) };
      return { ...prev, resumeAchievements: u };
    });

  const addAchievement = () =>
    onChange((prev) => ({
      ...prev,
      resumeAchievements: [...prev.resumeAchievements, { ...DEFAULT_ACHIEVEMENT }],
    }));

  const removeAchievement = (idx: number) =>
    onChange((prev) => ({
      ...prev,
      resumeAchievements: prev.resumeAchievements.filter((_, i) => i !== idx),
    }));

  return (
    <AccordionSection
      id="achievements"
      icon={Star}
      label="Achievements"
      badge={state.resumeAchievements.length}
      openSection={openSection}
      onToggle={onToggle}
      bodyClassName="p-4 border-t border-border-color/40 space-y-3"
    >
      <AddItemButton label="Add Achievement" onClick={addAchievement} />
      <AnimatePresence>
        {state.resumeAchievements.map((ach, idx) => (
          <motion.div key={idx} {...ITEM_ANIM} className={itemCardCls}>
            <button
              type="button"
              onClick={() => removeAchievement(idx)}
              className={`absolute right-3 top-3 ${deleteIconBtnCls} opacity-0 group-hover:opacity-100 transition z-10`}
              title="Delete Achievement"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <input
              value={ach.title}
              onChange={(e) => updAch(idx, 'title', e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-border-color/30 text-xs font-semibold text-text-main focus:outline-none w-full"
              placeholder="Achievement Title"
            />
            <input
              value={ach.desc}
              onChange={(e) => updAch(idx, 'desc', e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-border-color/30 text-[11px] text-text-muted focus:outline-none w-full"
              placeholder="Impact / scale (e.g. Increased revenue by 30%)"
            />
            <input
              value={ach.url || ''}
              onChange={(e) => updAch(idx, 'url', e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-border-color/30 text-[11px] text-text-muted focus:outline-none w-full mt-1"
              placeholder="Link URL (optional)"
            />
            <div className="flex flex-wrap gap-1.5 items-center mt-2.5 pt-1.5 border-t border-border-color/20">
              <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mr-1.5">
                Icon:
              </span>
              {ICON_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSel = (ach.icon || 'star') === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => updAch(idx, 'icon', opt.key)}
                    title={opt.key}
                    className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                      isSel
                        ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                        : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </AccordionSection>
  );
};
