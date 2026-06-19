import React from 'react';
import { Settings, Trash2 } from 'lucide-react';
import { deleteIconBtnCls, settingsIconBtnCls } from '../../constants/formClasses';

interface ItemActionBarProps {
  onSettings?: () => void;
  onDelete: () => void;
  settingsActive?: boolean;
  className?: string;
  settingsTitle?: string;
  deleteTitle?: string;
}

export const ItemActionBar: React.FC<ItemActionBarProps> = ({
  onSettings,
  onDelete,
  settingsActive = false,
  className = '',
  settingsTitle = 'Item Settings',
  deleteTitle = 'Delete Item',
}) => (
  <div
    className={`absolute right-3 top-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition z-10 ${className}`}
  >
    {onSettings && (
      <button
        type="button"
        onClick={onSettings}
        className={`${settingsIconBtnCls} ${settingsActive ? 'text-brand-accent' : ''}`}
        title={settingsTitle}
      >
        <Settings className="w-3.5 h-3.5" />
      </button>
    )}
    <button type="button" onClick={onDelete} className={deleteIconBtnCls} title={deleteTitle}>
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </div>
);
