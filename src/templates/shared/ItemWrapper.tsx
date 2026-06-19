import React, { useState, useEffect, useRef, useContext } from 'react';
import { ArrowUp, ArrowDown, Settings, Trash2 } from 'lucide-react';
import { ActiveSectionContext } from './ActiveSectionContext';
import { ItemLogo } from './ItemLogo';

export interface ItemWrapperProps {
  sectionId: string;
  index: number;
  totalItems: number;
  isEditable: boolean;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: React.ReactNode;
  logo?: string;
  onLogoChange?: (logo: string) => void;
  showLogo?: boolean;
  placeholderIcon?: React.ReactNode;
  brandColor?: string;
}

export const ItemWrapper: React.FC<ItemWrapperProps> = ({
  sectionId, index, totalItems, isEditable, onDelete, onMoveUp, onMoveDown, children,
  logo, onLogoChange, showLogo, placeholderIcon, brandColor = '#314855',
}) => {
  const context = useContext(ActiveSectionContext);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const itemId = `${sectionId}-${index}`;
  const isItemActive = context?.activeItemId === itemId;

  useEffect(() => {
    if (!showSettings) return;
    const handleOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showSettings]);

  if (!isEditable) return <>{children}</>;

  const handleMoveUp = onMoveUp ?? (context?.handleMoveItemUpDown ? () => context.handleMoveItemUpDown(sectionId, index, 'up') : undefined);
  const handleMoveDown = onMoveDown ?? (context?.handleMoveItemUpDown ? () => context.handleMoveItemUpDown(sectionId, index, 'down') : undefined);

  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    context?.setActiveSectionId(sectionId);
    context?.setActiveItemId(itemId);
  };

  return (
    <div
      className={`relative group/item rounded transition-all duration-200 ${isItemActive ? 'p-2 -m-2 item-active' : 'p-0'}`}
      onClick={handleItemClick}
    >
      {children}

      <div className="edit-only absolute -top-2 right-0 flex items-center gap-0.5 bg-white border border-slate-200 shadow-md rounded-md px-1 py-0.5 opacity-0 group-hover/item:opacity-100 transition-all duration-150 z-30">
        {index > 0 && handleMoveUp && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleMoveUp(); }}
            className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded cursor-pointer transition"
            title="Move Up"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
        )}
        {index < totalItems - 1 && handleMoveDown && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleMoveDown(); }}
            className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded cursor-pointer transition"
            title="Move Down"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        )}

        {showLogo && onLogoChange && (
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
              className={`p-0.5 hover:bg-slate-100 rounded cursor-pointer transition ${showSettings ? 'bg-slate-100 text-teal-600' : 'text-slate-400 hover:text-slate-700'}`}
              title="Settings"
            >
              <Settings className="w-3 h-3" />
            </button>
            {showSettings && (
              <div className="absolute right-0 top-5 z-50 bg-white border border-slate-200 shadow-xl rounded-lg p-3 w-64 flex flex-col gap-2.5 edit-only">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Logo</p>
                <ItemLogo
                  logo={logo}
                  brandColor={brandColor}
                  isEditable={true}
                  onLogoChange={onLogoChange}
                  placeholderIcon={placeholderIcon}
                />
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-0.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded cursor-pointer transition"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
