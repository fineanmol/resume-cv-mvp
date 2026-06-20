import React from 'react';
import { Palette } from 'lucide-react';
import { AccordionSection } from '../ui';
import ColorPicker from '../ui/ColorPicker';
import type { LayoutSettings } from '../../types';

interface Props {
  layout: Pick<LayoutSettings, 'template' | 'brandColor' | 'accentColor2' | 'titleColor' | 'bodyTextColor'>;
  onChange: (patch: Partial<LayoutSettings>) => void;
  openSection: string;
  onToggle: (id: string) => void;
}

const DesignColorsSection: React.FC<Props> = ({ layout, onChange, openSection, onToggle }) => {
  const isDesigner = (layout.template ?? 'navy') === 'designer';
  const brand   = layout.brandColor   ?? '#314855';
  const accent2 = layout.accentColor2 ?? '#0284c7';

  return (
    <AccordionSection
      id="colours"
      icon={Palette}
      label="Colours"
      openSection={openSection}
      onToggle={onToggle}
      variant="design"
      bodyClassName="p-3 border-t border-border-color/40 space-y-4"
    >
      <ColorPicker
        label={isDesigner ? 'Heading Color' : 'Primary Accent'}
        value={brand}
        onChange={v => onChange({ brandColor: v })}
      />
      {isDesigner && (
        <ColorPicker
          label="Title Color"
          value={layout.titleColor ?? '#343334'}
          onChange={v => onChange({ titleColor: v })}
        />
      )}
      <ColorPicker
        label={isDesigner ? 'Accent Color' : 'Secondary Accent'}
        value={accent2}
        onChange={v => onChange({ accentColor2: v })}
      />
      {isDesigner && (
        <ColorPicker
          label="Body Color"
          value={layout.bodyTextColor ?? '#3E3E3E'}
          onChange={v => onChange({ bodyTextColor: v })}
        />
      )}
    </AccordionSection>
  );
};

export default DesignColorsSection;
