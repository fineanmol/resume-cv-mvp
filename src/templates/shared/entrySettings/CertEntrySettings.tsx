import React from 'react';
import type { CertEntryVisibility, CertItem } from '../../../types';
import { isEntryFieldVisible } from '../../../utils/entryVisibility';
import { SettingsPanelShell } from './SettingsPanelShell';

interface CertEntrySettingsProps {
  item: CertItem;
  onToggle: (field: keyof CertEntryVisibility, value: boolean) => void;
  onClose: () => void;
}

export const CertEntrySettings: React.FC<CertEntrySettingsProps> = ({
  item,
  onToggle,
  onClose,
}) => {
  const v = item.visibility;
  const row = (id: keyof CertEntryVisibility, label: string) => ({
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
        row('link', 'Show Link'),
        row('icon', 'Show Icon'),
      ]}
    />
  );
};
