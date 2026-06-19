import React from 'react';
import type { AchievementEntryVisibility, AchievementItem } from '../../../types';
import { isEntryFieldVisible } from '../../../utils/entryVisibility';
import { SettingsPanelShell } from './SettingsPanelShell';

interface AchievementEntrySettingsProps {
  item: AchievementItem;
  onToggle: (field: keyof AchievementEntryVisibility, value: boolean) => void;
  onClose: () => void;
}

export const AchievementEntrySettings: React.FC<AchievementEntrySettingsProps> = ({
  item,
  onToggle,
  onClose,
}) => {
  const v = item.visibility;
  const row = (id: keyof AchievementEntryVisibility, label: string) => ({
    id,
    label,
    checked: isEntryFieldVisible(v, id),
    onChange: (checked: boolean) => onToggle(id, checked),
  });

  return (
    <SettingsPanelShell
      onClose={onClose}
      rows={[
        row('desc', 'Show Description'),
        row('icon', 'Show Icon'),
      ]}
    />
  );
};
