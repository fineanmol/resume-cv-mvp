import React, { useEffect, useRef } from 'react';
import { ToggleSwitch } from '../../../components/ui/ToggleSwitch';

export interface SettingsRow {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface SettingsPanelShellProps {
  rows: SettingsRow[];
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const SettingsPanelShell: React.FC<SettingsPanelShellProps> = ({
  rows,
  onClose,
  children,
  className = '',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className={`bg-white rounded-md shadow-lg border border-slate-200 w-64 p-4 space-y-3 edit-only relative z-[110] ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {rows.map((row) => (
        <ToggleSwitch
          key={row.id}
          id={row.id}
          label={row.label}
          checked={row.checked}
          onChange={row.onChange}
          variant="teal"
        />
      ))}
      {children}
    </div>
  );
};
