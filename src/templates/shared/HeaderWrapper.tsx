import React, { useContext, useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import type { LayoutSettings } from '../../types';
import { ActiveSectionContext } from './ActiveSectionContext';
import { HeaderSettingsPanel } from './HeaderSettingsPanel';

export interface HeaderWrapperProps {
  isEditable: boolean;
  layoutSettings?: LayoutSettings;
  onLayoutSettingsChange?: (patch: Partial<LayoutSettings>) => void;
  /** When false, marks the header so PDF export can strip the subtitle row. */
  showTitle?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const HeaderWrapper: React.FC<HeaderWrapperProps> = ({
  isEditable,
  layoutSettings,
  onLayoutSettingsChange,
  showTitle,
  className = '',
  style,
  children,
}) => {
  const context = useContext(ActiveSectionContext);
  const isActive = context?.activeSectionId === 'header';
  const [showSettings, setShowSettings] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSettings) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showSettings]);

  const handleSelect = (e: React.MouseEvent) => {
    if (!isEditable) return;
    e.stopPropagation();
    context?.setActiveItemId(null);
    context?.setActiveSectionId('header');
  };

  const hasSettings = isEditable && layoutSettings && onLayoutSettingsChange;

  return (
    <header
      onClick={handleSelect}
      data-show-title={showTitle === false ? 'false' : 'true'}
      className={`relative group/header overflow-visible ${isEditable ? 'cursor-pointer' : ''} ${isActive ? 'header-active' : ''} ${className}`}
      style={style}
    >
      {children}

      {hasSettings && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute -top-2 right-0 transition-all flex items-center gap-0.5 bg-white border border-slate-200 shadow-lg rounded-lg px-2 py-1 z-40 edit-only ${
            isActive ? 'opacity-100 visible' : 'opacity-0 invisible group-hover/header:opacity-100 group-hover/header:visible'
          } ${showSettings ? '!z-[100]' : ''}`}
        >
          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                context?.setActiveItemId(null);
                context?.setActiveSectionId('header');
                setShowSettings(!showSettings);
              }}
              className={`p-1 hover:bg-slate-100 rounded cursor-pointer transition flex items-center justify-center ${
                showSettings ? 'bg-slate-100 text-teal-600' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Header Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-full mt-1 z-[110] edit-only">
                <HeaderSettingsPanel
                  layoutSettings={layoutSettings}
                  onChange={onLayoutSettingsChange}
                  onClose={() => setShowSettings(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
