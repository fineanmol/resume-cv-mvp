import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { AccordionSection } from '../ui';
import Slider from '../ui/Slider';
import type { LayoutSettings } from '../../types';

interface Props {
  layout: Pick<
    LayoutSettings,
    | 'template'
    | 'fontSize'
    | 'lineHeight'
    | 'paddingTopBottom'
    | 'paddingLeftRight'
    | 'sectionSpacing'
    | 'entrySpacing'
    | 'columnGap'
  >;
  onChange: (patch: Partial<LayoutSettings & { columnGap?: number }>) => void;
  docType: 'resume' | 'coverletter';
  openSection: string;
  onToggle: (id: string) => void;
}

const DesignSpacingSection: React.FC<Props> = ({ layout, onChange, docType, openSection, onToggle }) => {
  const isDesigner = (layout.template ?? 'navy') === 'designer';

  return (
    <AccordionSection
      id="spacing"
      icon={SlidersHorizontal}
      label="Spacing"
      openSection={openSection}
      onToggle={onToggle}
      variant="design"
      bodyClassName="p-3 border-t border-border-color/40 space-y-3"
    >
      <Slider label="Font Size" value={layout.fontSize} unit="pt" min={6} max={18} step={0.5} onChange={v => onChange({ fontSize: v })} />
      <Slider label="Line Height" value={layout.lineHeight} unit="" min={1.0} max={2.0} step={0.05} onChange={v => onChange({ lineHeight: v })} />
      <Slider label="Pad Top/Bottom" value={layout.paddingTopBottom} unit="mm" min={2} max={24} step={1} onChange={v => onChange({ paddingTopBottom: v })} parse={parseInt} />
      <Slider label="Pad Left/Right" value={layout.paddingLeftRight} unit="mm" min={2} max={24} step={1} onChange={v => onChange({ paddingLeftRight: v })} parse={parseInt} />
      <Slider label="Section Gap" value={layout.sectionSpacing} unit="px" min={0} max={24} step={1} onChange={v => onChange({ sectionSpacing: v })} parse={parseInt} />
      <Slider label="Entry Gap" value={layout.entrySpacing ?? 12} unit="px" min={0} max={28} step={1} onChange={v => onChange({ entrySpacing: v })} parse={parseInt} />
      {docType === 'resume' && isDesigner && (
        <Slider
          label="Column Gap"
          value={layout.columnGap ?? 16}
          unit="px"
          min={4}
          max={32}
          step={1}
          onChange={v => onChange({ columnGap: v })}
          parse={parseInt}
        />
      )}
    </AccordionSection>
  );
};

export default DesignSpacingSection;
