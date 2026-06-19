import React from 'react';
import type { AchievementEntryVisibility, AchievementItem } from '../../../types';
import { isEntryFieldVisible } from '../../../utils/entryVisibility';
import { SettingsPanelShell } from './SettingsPanelShell';
import { EntryLinkField } from './EntryLinkField';

interface AchievementEntrySettingsProps {
  item: AchievementItem;
  onToggle: (field: keyof AchievementEntryVisibility, value: boolean) => void;
  onClose: () => void;
  onUrlChange?: (url: string) => void;
}

export const AchievementEntrySettings: React.FC<AchievementEntrySettingsProps> = ({
  item,
  onToggle,
  onClose,
  onUrlChange,
}) => {
  const v = item.visibility;
  const showLink = isEntryFieldVisible(v, 'link');

  const row = (id: keyof AchievementEntryVisibility, label: string) => ({
    id,
    label,
    checked: isEntryFieldVisible(v, id),
    onChange: (checked: boolean) => onToggle(id, checked),
  });

  return (
    <SettingsPanelShell
      onClose={onClose}
      rows={[row('link', 'Show Link')]}
    >
      {showLink && onUrlChange && (
        <EntryLinkField
          url={item.url}
          onChange={onUrlChange}
          placeholder="https://example.com/award"
        />
      )}
    </SettingsPanelShell>
  );
};
