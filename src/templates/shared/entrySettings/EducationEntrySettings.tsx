import React from 'react';
import type { EducationEntryVisibility, EducationItem } from '../../../types';
import { isEntryFieldVisible } from '../../../utils/entryVisibility';
import { ItemLogo } from '../ItemLogo';
import { SettingsPanelShell } from './SettingsPanelShell';

interface EducationEntrySettingsProps {
  item: EducationItem;
  onToggle: (field: keyof EducationEntryVisibility, value: boolean) => void;
  onClose: () => void;
  logo?: string;
  onLogoChange?: (logo: string) => void;
  placeholderIcon?: React.ReactNode;
  brandColor?: string;
}

export const EducationEntrySettings: React.FC<EducationEntrySettingsProps> = ({
  item,
  onToggle,
  onClose,
  logo,
  onLogoChange,
  placeholderIcon,
  brandColor = '#314855',
}) => {
  const v = item.visibility;
  const showLogo = isEntryFieldVisible(v, 'logo');

  const row = (id: keyof EducationEntryVisibility, label: string) => ({
    id,
    label,
    checked: isEntryFieldVisible(v, id),
    onChange: (checked: boolean) => onToggle(id, checked),
  });

  return (
    <SettingsPanelShell
      onClose={onClose}
      rows={[
        row('gpa', 'Show GPA'),
        row('location', 'Show Location'),
        row('dates', 'Show Period'),
        row('bullets', 'Show Bullets'),
        row('logo', 'Show Logo'),
      ]}
    >
      {showLogo && onLogoChange && (
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
