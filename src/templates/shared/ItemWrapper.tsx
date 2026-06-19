import React, { useState, useEffect, useRef, useContext } from 'react';
import { ArrowUp, ArrowDown, Settings, Trash2, Copy, CopyPlus } from 'lucide-react';
import { ActiveSectionContext } from './ActiveSectionContext';

export interface ItemWrapperProps {
  sectionId: string;
  index: number;
  totalItems: number;
  isEditable: boolean;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onAddSimilar?: () => void;
  children: React.ReactNode;
  settingsPanel?: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  /** @deprecated Logo upload lives in entry settings panels; kept for backward compatibility */
  logo?: string;
  /** @deprecated */
  onLogoChange?: (logo: string) => void;
  /** @deprecated */
  showLogo?: boolean;
  /** @deprecated */
  placeholderIcon?: React.ReactNode;
  brandColor?: string;
}

export const ItemWrapper: React.FC<ItemWrapperProps> = ({
  sectionId, index, totalItems, isEditable, onDelete, onMoveUp, onMoveDown,
  onDuplicate, onAddSimilar, children, settingsPanel,
}) => {
  const context = useContext(ActiveSectionContext);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const itemId = `${sectionId}-${index}`;
  const isItemActive = context?.activeItemId === itemId;
  const hasSettings = Boolean(settingsPanel);

  useEffect(() => {
    if (!showSettings) return;
    const handleOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showSettings]);

  if (!isEditable) return <>{children}</>;

  const handleMoveUp = onMoveUp ?? (context?.handleMoveItemUpDown ? () => context.handleMoveItemUpDown(sectionId, index, 'up') : undefined);
  const handleMoveDown = onMoveDown ?? (context?.handleMoveItemUpDown ? () => context.handleMoveItemUpDown(sectionId, index, 'down') : undefined);

  const handleItemActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    context?.setActiveSectionId(sectionId);
    context?.setActiveItemId(itemId);
  };

  const closeSettings = () => setShowSettings(false);
  const panelContent = settingsPanel
    ? (typeof settingsPanel === 'function' ? settingsPanel(closeSettings) : settingsPanel)
    : null;

  return (
    <div
      className={`relative group/item rounded ${
        isItemActive ? 'item-active' : ''
      } ${showSettings ? 'z-[100]' : ''}`}
      onMouseDown={handleItemActivate}
      onClick={(e) => e.stopPropagation()}
    >
      {children}

      <div className="edit-only absolute -top-2 right-0 flex items-center gap-0.5 bg-white border border-slate-200 shadow-md rounded-md px-1 py-0.5 opacity-0 group-hover/item:opacity-100 transition-all duration-150 z-[90]">
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

        {onDuplicate && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded cursor-pointer transition"
            title="Duplicate"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}

        {onAddSimilar && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddSimilar(); }}
            className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded cursor-pointer transition"
            title="Add Similar"
          >
            <CopyPlus className="w-3 h-3" />
          </button>
        )}

        {hasSettings && (
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
              className={`p-0.5 hover:bg-slate-100 rounded cursor-pointer transition ${showSettings ? 'bg-slate-100 text-teal-600' : 'text-slate-400 hover:text-slate-700'}`}
              title="Settings"
            >
              <Settings className="w-3 h-3" />
            </button>
            {showSettings && panelContent && (
              <div className="absolute right-0 top-full mt-1 z-[110]">
                {panelContent}
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
