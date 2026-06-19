import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Plus, Settings, Trash2, ArrowLeft, ArrowRight,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from 'lucide-react';
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

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id, title, isEditable, align, onAlignChange, onAddEntry, onMoveLeft, onMoveRight, onDeleteSection,
  isActive: propIsActive, onSelect: propOnSelect, onMoveUp: propOnMoveUp, onMoveDown: propOnMoveDown, children,
  skillsStyle, onSkillsStyleChange, onSkillsValueChange,
  layoutSettings, onLayoutSettingsChange,
}) => {
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

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      className={`relative group/section rounded transition-all duration-200 ${
        isActive
          ? 'bg-white z-[30] p-2 -m-2 section-active'
          : 'border border-dashed border-transparent hover:border-gray-200 hover:bg-slate-50/30 p-2 -m-2'
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
              <div className="absolute right-0 top-full mt-1 z-[110] bg-white border border-slate-200 shadow-xl rounded-lg p-3 flex flex-col gap-2.5 edit-only w-64">
                {onAlignChange && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Alignment</span>
                    <div className="flex gap-1">
                      {(['left', 'center', 'right', 'justify'] as const).map(alignVal => (
                        <button key={alignVal} type="button"
                          onClick={(e) => { e.stopPropagation(); onAlignChange(alignVal); setShowSettings(false); }}
                          className={`p-1 hover:bg-slate-100 rounded cursor-pointer transition flex items-center justify-center ${align === alignVal ? 'bg-slate-100 text-teal-500 font-bold' : 'text-slate-500'}`}
                        >
                          {alignVal === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                          {alignVal === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                          {alignVal === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                          {alignVal === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isSkills && onSkillsStyleChange && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Layout Style</span>
                    <div className="flex gap-1.5">
                      {(['chips', 'normal'] as const).map(style => (
                        <button key={style} type="button"
                          onClick={(e) => { e.stopPropagation(); onSkillsStyleChange(style); }}
                          className={`flex-1 px-2 py-1 rounded text-[10px] font-semibold border cursor-pointer transition ${skillsStyle === style ? 'bg-teal-500 text-white border-teal-500' : 'text-slate-500 border-slate-200 hover:border-slate-400'}`}
                        >
                          {style === 'chips' ? 'Chips' : 'List'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'experience' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Visibility</span>
                    {[
                      { key: 'showExperienceDates', label: 'Show Dates' },
                      { key: 'showExperienceCompany', label: 'Show Company' },
                      { key: 'showExperienceLocation', label: 'Show Location' },
                      { key: 'showExperienceLogo', label: 'Show Company Logo' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                        <input type="checkbox"
                          checked={layoutSettings[key] ?? true}
                          onChange={(e) => onLayoutSettingsChange({ [key]: e.target.checked })}
                          className="rounded"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'education' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Visibility</span>
                    {[
                      { key: 'showEducationDates', label: 'Show Dates' },
                      { key: 'showEducationLocation', label: 'Show Location' },
                      { key: 'showEducationGpa', label: 'Show GPA Badge' },
                      { key: 'showEducationLogo', label: 'Show School Logo' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                        <input type="checkbox"
                          checked={layoutSettings[key] ?? true}
                          onChange={(e) => onLayoutSettingsChange({ [key]: e.target.checked })}
                          className="rounded"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'certs' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Visibility</span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                      <input type="checkbox"
                        checked={layoutSettings.showProjectIcons ?? true}
                        onChange={(e) => onLayoutSettingsChange({ showProjectIcons: e.target.checked })}
                        className="rounded"
                      />
                      Show Project Icons
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                      <input type="checkbox"
                        checked={layoutSettings.showProjectDesc ?? true}
                        onChange={(e) => onLayoutSettingsChange({ showProjectDesc: e.target.checked })}
                        className="rounded"
                      />
                      Show Project Description
                    </label>
                  </div>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'achievements' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Visibility</span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                      <input type="checkbox"
                        checked={layoutSettings.showAchievementIcons ?? true}
                        onChange={(e) => onLayoutSettingsChange({ showAchievementIcons: e.target.checked })}
                        className="rounded"
                      />
                      Show Icons
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                      <input type="checkbox"
                        checked={layoutSettings.showAchievementDesc ?? true}
                        onChange={(e) => onLayoutSettingsChange({ showAchievementDesc: e.target.checked })}
                        className="rounded"
                      />
                      Show Description
                    </label>
                  </div>
                )}

                {layoutSettings && onLayoutSettingsChange && id === 'languages' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Visibility</span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                      <input type="checkbox"
                        checked={layoutSettings.showLanguageLevel ?? true}
                        onChange={(e) => onLayoutSettingsChange({ showLanguageLevel: e.target.checked })}
                        className="rounded"
                      />
                      Show Proficiency Level
                    </label>
                  </div>
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
};
