import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Plus, Settings, Trash2, ArrowLeft, ArrowRight,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from 'lucide-react';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { ActiveSectionContext } from './ActiveSectionContext';
import type { LayoutSettings } from '../../types';

export interface SectionWrapperProps {
  id: string;
  title: string;
  isEditable: boolean;
  align: 'left' | 'center' | 'right' | 'justify' | undefined;
  onAlignChange?: (align: 'left' | 'center' | 'right' | 'justify') => void;
  onAddEntry?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onDeleteSection?: () => void;
  isActive?: boolean;
  onSelect?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: React.ReactNode;
  skillsStyle?: 'chips' | 'normal';
  onSkillsStyleChange?: (style: 'chips' | 'normal') => void;
  skillsValue?: string;
  onSkillsValueChange?: (val: string) => void;
  layoutSettings?: LayoutSettings;
  onLayoutSettingsChange?: (patch: Partial<LayoutSettings>) => void;
}

export const SectionWrapper = React.memo<SectionWrapperProps>(function SectionWrapper({
  id, title, isEditable, align, onAlignChange, onAddEntry, onMoveLeft, onMoveRight, onDeleteSection,
  isActive: propIsActive, onSelect: propOnSelect, onMoveUp: propOnMoveUp, onMoveDown: propOnMoveDown, children,
  skillsStyle, onSkillsStyleChange, onSkillsValueChange,
  layoutSettings, onLayoutSettingsChange,
}) {
  const context = useContext(ActiveSectionContext);
  const isActive = propIsActive ?? (context?.activeSectionId === id);
  const onSelect = propOnSelect ?? (() => context?.setActiveSectionId(id));
  const onMoveUp = propOnMoveUp ?? (context?.handleMoveSectionUpDown ? () => context.handleMoveSectionUpDown(id, 'up') : undefined);
  const onMoveDown = propOnMoveDown ?? (context?.handleMoveSectionUpDown ? () => context.handleMoveSectionUpDown(id, 'down') : undefined);

  const [showSettings, setShowSettings] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSettings) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showSettings]);

  if (!isEditable) return <>{children}</>;

  const isSkills = id === 'skills';
  const hasSettings = !!onAlignChange ||
    (isSkills && !!onSkillsStyleChange && !!onSkillsValueChange) ||
    (!!layoutSettings && !!onLayoutSettingsChange && ['achievements', 'certs', 'experience', 'education', 'languages'].includes(id));

  const popoverClass = 'absolute right-0 top-full mt-1 z-[110] bg-white border border-slate-200 shadow-lg rounded-md p-2 flex flex-col gap-1.5 edit-only w-[172px]';
  const sectionLabelClass = 'text-[9px] font-semibold text-slate-400 uppercase tracking-wide select-none leading-none';

  const visibilityToggles = (
    rows: { key: keyof LayoutSettings; label: string }[],
  ) => (
    <div className="flex flex-col gap-1">
      {rows.map(({ key, label }) => (
        <ToggleSwitch
          key={key}
          id={`${id}-${key}`}
          label={label}
          checked={(layoutSettings?.[key] as boolean | undefined) ?? true}
          onChange={(checked) => onLayoutSettingsChange?.({ [key]: checked })}
          variant="teal"
          compact
        />
      ))}
    </div>
  );

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      className={`relative group/section rounded overflow-visible ${
        isActive
          ? 'z-[30] section-active'
          : 'border border-dashed border-transparent hover:border-gray-200 hover:bg-slate-50/30'
      } ${showSettings ? '!z-[100]' : ''}`}
    >
      {children}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute -top-10 left-1/2 -translate-x-1/2 transition-all flex items-center gap-0.5 bg-white border border-slate-200 shadow-lg rounded-lg px-2 py-1 z-40 edit-only ${
          isActive ? 'opacity-100 visible' : 'opacity-0 invisible group-hover/section:opacity-100 group-hover/section:visible'
        }`}
      >
        {onAddEntry && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddEntry(); }}
            className="flex items-center gap-1 px-2.5 py-1 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded text-[10px] cursor-pointer shadow-sm transition"
            type="button"
            title={id === 'skills' ? 'Add Skill' : `Add entry to ${title}`}
          >
            <Plus className="w-3 h-3" /> {id === 'skills' ? 'Add Skill' : 'Add'}
          </button>
        )}

        {onMoveUp && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded cursor-pointer transition flex items-center justify-center"
            type="button" title="Move Up"
          >
            <ArrowLeft className="w-3.5 h-3.5 rotate-90" />
          </button>
        )}

        {onMoveDown && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded cursor-pointer transition flex items-center justify-center"
            type="button" title="Move Down"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-90" />
          </button>
        )}

        {onMoveLeft && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}
            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded cursor-pointer transition flex items-center justify-center"
            type="button" title="Move Left"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {onMoveRight && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded cursor-pointer transition flex items-center justify-center"
            type="button" title="Move Right"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {hasSettings && (
          <div className="relative" ref={ref}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
              className={`p-1 hover:bg-slate-100 rounded cursor-pointer transition flex items-center justify-center ${showSettings ? 'bg-slate-100 text-teal-600' : 'text-slate-500 hover:text-slate-800'}`}
              type="button" title="Section Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {showSettings && (
              <div className={popoverClass}>
                {onAlignChange && (
                  <div className="flex flex-col gap-1">
                    <span className={sectionLabelClass}>Alignment</span>
                    <div className="flex gap-0.5">
                      {(['left', 'center', 'right', 'justify'] as const).map(alignVal => (
                        <button key={alignVal} type="button"
                          onClick={(e) => { e.stopPropagation(); onAlignChange(alignVal); setShowSettings(false); }}
                          className={`p-1 hover:bg-slate-100 rounded cursor-pointer transition flex items-center justify-center ${align === alignVal ? 'bg-slate-100 text-teal-500' : 'text-slate-500'}`}
                        >
                          {alignVal === 'left' && <AlignLeft className="w-3 h-3" />}
                          {alignVal === 'center' && <AlignCenter className="w-3 h-3" />}
                          {alignVal === 'right' && <AlignRight className="w-3 h-3" />}
                          {alignVal === 'justify' && <AlignJustify className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isSkills && onSkillsStyleChange && (
                  <div className="flex flex-col gap-1">
                    <span className={sectionLabelClass}>Layout</span>
                    <div className="flex gap-1">
                      {(['chips', 'normal'] as const).map(style => (
                        <button key={style} type="button"
                          onClick={(e) => { e.stopPropagation(); onSkillsStyleChange(style); }}
                          className={`flex-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border cursor-pointer transition ${skillsStyle === style ? 'bg-teal-500 text-white border-teal-500' : 'text-slate-500 border-slate-200 hover:border-slate-400'}`}
                        >
                          {style === 'chips' ? 'Chips' : 'List'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'experience' && (
                  <>
                    {onAlignChange && <div className="border-t border-slate-100 pt-1" />}
                    <span className={sectionLabelClass}>Visibility</span>
                    {visibilityToggles([
                      { key: 'showExperienceDates', label: 'Dates' },
                      { key: 'showExperienceCompany', label: 'Company' },
                      { key: 'showExperienceLocation', label: 'Location' },
                      { key: 'showExperienceLogo', label: 'Logo' },
                    ])}
                  </>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'education' && (
                  <>
                    {onAlignChange && <div className="border-t border-slate-100 pt-1" />}
                    <span className={sectionLabelClass}>Visibility</span>
                    {visibilityToggles([
                      { key: 'showEducationDates', label: 'Dates' },
                      { key: 'showEducationLocation', label: 'Location' },
                      { key: 'showEducationGpa', label: 'GPA' },
                      { key: 'showEducationLogo', label: 'Logo' },
                    ])}
                  </>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'certs' && (
                  <>
                    {onAlignChange && <div className="border-t border-slate-100 pt-1" />}
                    <span className={sectionLabelClass}>Visibility</span>
                    {visibilityToggles([
                      { key: 'showProjectIcons', label: 'Icons' },
                      { key: 'showProjectDesc', label: 'Description' },
                    ])}
                  </>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'achievements' && (
                  <>
                    {onAlignChange && <div className="border-t border-slate-100 pt-1" />}
                    <span className={sectionLabelClass}>Visibility</span>
                    {visibilityToggles([
                      { key: 'showAchievementIcons', label: 'Icons' },
                      { key: 'showAchievementDesc', label: 'Description' },
                    ])}
                  </>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'languages' && (
                  <>
                    {onAlignChange && <div className="border-t border-slate-100 pt-1" />}
                    <span className={sectionLabelClass}>Visibility</span>
                    {visibilityToggles([
                      { key: 'showLanguageLevel', label: 'Proficiency' },
                    ])}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {onDeleteSection && (
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteSection(); }}
            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded cursor-pointer transition flex items-center justify-center"
            type="button" title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});
