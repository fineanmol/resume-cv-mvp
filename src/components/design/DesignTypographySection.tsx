import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { AccordionSection } from '../ui';
import FontPicker from '../ui/FontPicker';
import type { LayoutSettings, FontFamily } from '../../types';

const ALIGN_OPTIONS = ['left', 'center', 'right', 'justify'] as const;
type AlignOption = (typeof ALIGN_OPTIONS)[number];

const ALIGN_ICONS = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
} as const;

const AlignmentPicker: React.FC<{
  title: string;
  value: AlignOption | undefined;
  defaultValue: AlignOption;
  onChange: (align: AlignOption) => void;
}> = ({ title, value, defaultValue, onChange }) => (
  <div className="space-y-1.5">
    <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">{title}</span>
    <div className="grid grid-cols-4 gap-1">
      {ALIGN_OPTIONS.map(align => {
        const Icon = ALIGN_ICONS[align];
        const isActive = (value ?? defaultValue) === align;
        return (
          <button
            key={align}
            onClick={() => onChange(align)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition cursor-pointer capitalize ${
              isActive
                ? 'border-brand-accent bg-brand-accent/8 text-brand-accent font-semibold'
                : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
            }`}
            title={`Align ${align}`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="text-[8px]">{align}</span>
          </button>
        );
      })}
    </div>
  </div>
);

interface Props {
  layout: Pick<
    LayoutSettings,
    | 'template'
    | 'headingFont'
    | 'titleFont'
    | 'fontFamily'
    | 'accentFont'
    | 'summaryAlign'
    | 'experienceAlign'
    | 'educationAlign'
    | 'certsAlign'
    | 'achievementsAlign'
  >;
  onChange: (patch: Partial<LayoutSettings>) => void;
  openSection: string;
  onToggle: (id: string) => void;
}

const DesignTypographySection: React.FC<Props> = ({ layout, onChange, openSection, onToggle }) => {
  const isDesigner = (layout.template ?? 'navy') === 'designer';

  return (
    <>
      <AccordionSection
        id="typography"
        icon={Type}
        label="Typography"
        openSection={openSection}
        onToggle={onToggle}
        variant="design"
        bodyClassName={`p-3 border-t border-border-color/40 grid gap-4 ${isDesigner ? 'grid-cols-2' : 'grid-cols-2'}`}
      >
        <FontPicker label="Heading Font" value={layout.headingFont} onChange={v => onChange({ headingFont: v as FontFamily })} />
        {isDesigner ? (
          <FontPicker label="Title Font" value={layout.titleFont} onChange={v => onChange({ titleFont: v as FontFamily })} />
        ) : (
          <FontPicker label="Body Font" value={layout.fontFamily} onChange={v => onChange({ fontFamily: v as FontFamily })} />
        )}
        {isDesigner && (
          <>
            <FontPicker label="Accent Font" value={layout.accentFont} onChange={v => onChange({ accentFont: v as FontFamily })} />
            <FontPicker label="Body Font" value={layout.fontFamily} onChange={v => onChange({ fontFamily: v as FontFamily })} />
          </>
        )}
      </AccordionSection>

      <AccordionSection
        id="textAlignment"
        icon={AlignLeft}
        label="Text Alignment"
        openSection={openSection}
        onToggle={onToggle}
        variant="design"
        bodyClassName="p-3 border-t border-border-color/40 space-y-4"
      >
        <AlignmentPicker title="Summary Alignment" value={layout.summaryAlign} defaultValue="justify" onChange={align => onChange({ summaryAlign: align })} />
        <AlignmentPicker title="Experience Alignment" value={layout.experienceAlign} defaultValue="left" onChange={align => onChange({ experienceAlign: align })} />
        <AlignmentPicker title="Education Alignment" value={layout.educationAlign} defaultValue="left" onChange={align => onChange({ educationAlign: align })} />
        <AlignmentPicker title="Certifications Alignment" value={layout.certsAlign} defaultValue="left" onChange={align => onChange({ certsAlign: align })} />
        <AlignmentPicker title="Achievements Alignment" value={layout.achievementsAlign} defaultValue="left" onChange={align => onChange({ achievementsAlign: align })} />
      </AccordionSection>
    </>
  );
};

export default DesignTypographySection;
