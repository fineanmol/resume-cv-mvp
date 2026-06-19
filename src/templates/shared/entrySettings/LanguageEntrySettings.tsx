import React from 'react';
import type { LanguageEntryVisibility, LanguageItem } from '../../../types';
import { isEntryFieldVisible } from '../../../utils/entryVisibility';
import { SettingsPanelShell } from './SettingsPanelShell';

interface LanguageEntrySettingsProps {
  item: LanguageItem;
  onToggle: (field: keyof LanguageEntryVisibility, value: boolean) => void;
  onClose: () => void;
}

export const LanguageEntrySettings: React.FC<LanguageEntrySettingsProps> = ({
  item,
  onToggle,
  onClose,
}) => {
  const v = item.visibility;
  const row = (id: keyof LanguageEntryVisibility, label: string) => ({
    id,
    label,
    checked: isEntryFieldVisible(v, id),
    onChange: (checked: boolean) => onToggle(id, checked),
  });

  return (
    <SettingsPanelShell
      onClose={onClose}
      rows={[
        row('level', 'Show Proficiency'),
        row('slider', 'Compact Slider'),
      ]}
    />
  );
};
