import React from 'react';
import type { CertEntryVisibility, CertItem } from '../../../types';
import { isEntryFieldVisible } from '../../../utils/entryVisibility';
import { SettingsPanelShell } from './SettingsPanelShell';
import { EntryLinkField } from './EntryLinkField';

interface CertEntrySettingsProps {
  item: CertItem;
  onToggle: (field: keyof CertEntryVisibility, value: boolean) => void;
  onClose: () => void;
  onUrlChange?: (url: string) => void;
}

export const CertEntrySettings: React.FC<CertEntrySettingsProps> = ({
  item,
  onToggle,
  onClose,
  onUrlChange,
}) => {
  const v = item.visibility;
  const showLink = isEntryFieldVisible(v, 'link');

  const row = (id: keyof CertEntryVisibility, label: string) => ({
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
          placeholder="https://github.com/you/project"
        />
      )}
    </SettingsPanelShell>
  );
};
