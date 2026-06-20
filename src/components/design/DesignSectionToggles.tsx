import React from 'react';
import { Layers } from 'lucide-react';
import { AccordionSection, ToggleSwitch } from '../ui';
import type { LayoutSettings } from '../../types';

interface Props {
  layout: Pick<LayoutSettings, 'showLayoutBounds'>;
  onChange: (patch: Partial<LayoutSettings>) => void;
  docType: 'resume' | 'coverletter';
  openSection: string;
  onToggle: (id: string) => void;
}

const DesignSectionToggles: React.FC<Props> = ({ layout, onChange, docType, openSection, onToggle }) => {
  if (docType !== 'resume') return null;

  return (
    <AccordionSection
      id="layout-outlines"
      icon={Layers}
      label="Layout Outlines"
      openSection={openSection}
      onToggle={onToggle}
      variant="design"
      bodyClassName="p-3 border-t border-border-color/40 space-y-3"
    >
      <ToggleSwitch
        label="Show layout outlines"
        checked={layout.showLayoutBounds ?? false}
        onChange={v => onChange({ showLayoutBounds: v })}
      />
      <p className="text-[10px] text-text-muted leading-relaxed">
        Displays dotted borders around components. Drag and drop sections on the sheet to reorder them! (Invisible on download)
      </p>
    </AccordionSection>
  );
};

export default DesignSectionToggles;
