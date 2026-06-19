import React, { useState, useEffect, useRef } from 'react';
import { getDynamicAchievementIcon } from './templateIconHelpers';

export const AchievementIconPicker: React.FC<{
  currentIcon: string;
  onChange: (icon: string) => void;
  isEditable: boolean;
  accentColor?: string;
}> = ({ currentIcon, onChange, isEditable, accentColor }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);
  const icons = ['star', 'award', 'trophy', 'target', 'terminal', 'flag', 'check'] as const;
  if (!isEditable) return getDynamicAchievementIcon(0, '', currentIcon, accentColor, "w-3 h-3 flex-shrink-0 mt-0.5");
  return (
    <div className="relative inline-block edit-only" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="hover:scale-125 transition flex-shrink-0 mt-0.5 flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 p-0.5 rounded cursor-pointer"
        type="button" title="Change Icon"
      >
        {getDynamicAchievementIcon(0, '', currentIcon, accentColor, "w-3.5 h-3.5")}
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-40 bg-white border border-slate-200 shadow-lg rounded-md p-1.5 flex gap-1 edit-only">
          {icons.map(icon => (
            <button key={icon} type="button"
              onClick={() => { onChange(icon); setOpen(false); }}
              className={`p-1 hover:bg-slate-100 rounded cursor-pointer transition-colors ${currentIcon === icon ? 'bg-slate-100' : ''}`}
            >
              {getDynamicAchievementIcon(0, '', icon, accentColor, "w-3.5 h-3.5")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
