import React from 'react';
import type { ExperienceEntryVisibility, ExperienceItem } from '../../../types';
import { isEntryFieldVisible } from '../../../utils/entryVisibility';
import { ItemLogo } from '../ItemLogo';
import { SettingsPanelShell } from './SettingsPanelShell';

interface ExperienceEntrySettingsProps {
  item: ExperienceItem;
  onToggle: (field: keyof ExperienceEntryVisibility, value: boolean) => void;
  onClose: () => void;
  logo?: string;
  onLogoChange?: (logo: string) => void;
  placeholderIcon?: React.ReactNode;
  brandColor?: string;
}

export const ExperienceEntrySettings: React.FC<ExperienceEntrySettingsProps> = ({
  item,
  onToggle,
  onClose,
  logo,
  onLogoChange,
  placeholderIcon,
  brandColor = '#314855',
}) => {
  const v = item.visibility;
  const row = (id: keyof ExperienceEntryVisibility, label: string) => ({
    id,
    label,
    checked: isEntryFieldVisible(v, id),
    onChange: (checked: boolean) => onToggle(id, checked),
  });

  return (
    <SettingsPanelShell
      onClose={onClose}
      rows={[
        row('dates', 'Show Period'),
        row('location', 'Show Location'),
        row('company', 'Show Company'),
        row('logo', 'Show Logo'),
        row('bullets', 'Show Bullets'),
        row('link', 'Show Link'),
      ]}
    >
      {onLogoChange && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Logo</p>
          <ItemLogo
            logo={logo}
            brandColor={brandColor}
            isEditable
            onLogoChange={onLogoChange}
            placeholderIcon={placeholderIcon}
          />
        </div>
      )}
    </SettingsPanelShell>
  );
};
