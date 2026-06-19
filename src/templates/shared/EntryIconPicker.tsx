import React, { useState, useEffect, useRef } from 'react';
import { getDynamicAchievementIcon, getDynamicProjectIcon } from './templateIconHelpers';
import { ACHIEVEMENT_ICON_NAMES, PROJECT_ICON_NAMES } from './entryIcons';

export type EntryIconVariant = 'achievement' | 'project';

export const EntryIconPicker: React.FC<{
  variant?: EntryIconVariant;
  currentIcon: string;
  onChange: (icon: string) => void;
  isEditable: boolean;
  accentColor?: string;
  accentColor2?: string;
  index?: number;
  title?: string;
}> = ({
  variant = 'achievement',
  currentIcon,
  onChange,
  isEditable,
  accentColor,
  accentColor2,
  index = 0,
  title = '',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const icons = variant === 'project' ? PROJECT_ICON_NAMES : ACHIEVEMENT_ICON_NAMES;
  const defaultIcon = variant === 'project' ? 'briefcase' : 'star';

  const renderIcon = (iconName: string, className = 'w-3 h-3 flex-shrink-0 mt-0.5') =>
    variant === 'project'
      ? getDynamicProjectIcon(index, title, iconName, accentColor, className, accentColor2)
      : getDynamicAchievementIcon(index, title, iconName, accentColor, className, accentColor2);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  if (!isEditable) {
    return renderIcon(currentIcon || defaultIcon);
  }

  return (
    <div className="relative inline-flex edit-only flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="rounded-md cursor-pointer transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60"
        title="Change icon"
      >
        {renderIcon(currentIcon || defaultIcon, 'w-3 h-3 flex-shrink-0 mt-0.5')}
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-[120] bg-white border border-slate-200 shadow-lg rounded-md p-1.5 grid grid-cols-6 gap-0.5 edit-only w-[11rem] max-h-[9.5rem] overflow-y-auto scrollbar-thin"
          onClick={(e) => e.stopPropagation()}
        >
          {icons.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => { onChange(icon); setOpen(false); }}
              className={`p-0.5 rounded cursor-pointer transition-colors flex items-center justify-center ${
                currentIcon === icon ? 'bg-teal-50 ring-1 ring-teal-400/50' : 'hover:bg-slate-50'
              }`}
              title={icon}
            >
              {renderIcon(icon, 'w-3 h-3 flex-shrink-0 !mt-0')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/** @deprecated Use EntryIconPicker */
export const AchievementIconPicker = EntryIconPicker;
