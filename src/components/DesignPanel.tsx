import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Type, Layout, SlidersHorizontal, Image, List, Tag, AlignLeft, AlignCenter, AlignRight, AlignJustify, Layers, RotateCcw } from 'lucide-react';
import type { LayoutSettings, FontFamily, HeaderStyle } from '../types';
import { AccordionSection, ToggleSwitch } from './ui';
import { FONT_OPTIONS, FONT_CSS } from '../config/fonts';
import { TEMPLATES_FOR_DESIGN } from '../config/templates';

const HEADER_STYLES: { id: HeaderStyle; label: string; desc: string }[] = [
  { id: 'centered', label: 'Centered',   desc: 'Name & contact centered' },
  { id: 'left',     label: 'Left Align', desc: 'Name left, contact right' },
  { id: 'banner',   label: 'Full Banner',desc: 'Coloured full-width header' },
  { id: 'minimal',  label: 'Minimal',    desc: 'Name only, no border' },
  { id: 'enhancv',  label: 'Enhance CV',  desc: 'Modern split grid style' },
];

const BULLET_STYLES: { id: LayoutSettings['bulletStyle']; label: string; preview: string }[] = [
  { id: 'disc', label: 'Disc', preview: '●' },
  { id: 'circle', label: 'Circle', preview: '○' },
  { id: 'square', label: 'Square', preview: '■' },
  { id: 'dash', label: 'Dash', preview: '—' },
  { id: 'arrow', label: 'Arrow', preview: '➤' },
  { id: 'number', label: 'Numbered', preview: '1.' },
  { id: 'none', label: 'None', preview: '(none)' },
];

const COLOR_PRESETS = [
  '#314855','#1e293b','#0284c7','#10b981','#6366f1','#b45309',
  '#dc2626','#7c3aed','#0891b2','#059669','#d97706','#be185d',
  '#3E3E3E','#4B5563','#6B7280','#374151',
];

interface DesignPanelProps {
  layout: LayoutSettings & { columnGap?: number };
  onChange: (patch: Partial<LayoutSettings & { columnGap?: number }>) => void;
  docType: 'resume' | 'coverletter';
  focusSection?: string | null;
  onFocusHandled?: () => void;
  onReset?: () => void;
}

const ColorPicker: React.FC<{
  value: string;
  onChange: (v: string) => void;
  label: string;
}> = ({ value, onChange, label }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded border border-border-color shadow-sm" style={{ background: value }} />
        <span className="text-[10px] font-mono text-text-muted">{value}</span>
      </div>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {COLOR_PRESETS.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          title={c}
          className={`w-5 h-5 rounded transition cursor-pointer hover:scale-110 ${value === c ? 'ring-2 ring-offset-1 ring-brand-accent' : ''}`}
          style={{ background: c }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-5 h-5 rounded border border-border-color/60 cursor-pointer bg-transparent"
        title="Custom colour"
      />
    </div>
  </div>
);

const FontPicker: React.FC<{
  value: FontFamily | undefined;
  onChange: (v: FontFamily) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const active = value ?? 'inter';
  return (
    <div className="space-y-1.5">
      <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">{label}</span>
      <div className="grid grid-cols-1 gap-1.5">
        {FONT_OPTIONS.map(f => (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className={`px-2.5 py-2 rounded-lg border text-left transition cursor-pointer ${
              active === f.id
                ? 'border-brand-accent bg-brand-accent/8 text-brand-accent'
                : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
            }`}
          >
            <span className="block text-[11px] font-bold" style={{ fontFamily: FONT_CSS[f.id] }}>{f.label}</span>
            <span className="block text-[9px] opacity-70">{f.preview}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const Slider: React.FC<{
  label: string; value: number; unit: string;
  min: number; max: number; step: number;
  onChange: (v: number) => void;
  parse?: (s: string) => number;
}> = ({ label, value, unit, min, max, step, onChange, parse = parseFloat }) => (
  <div>
    <div className="flex justify-between text-[10px] text-text-muted mb-1 font-semibold">
      <span>{label}</span>
      <span className="font-mono">{value}{unit}</span>
    </div>
    <input
      type="range"
      aria-label={label}
      min={min} max={max} step={step} value={value}
      onChange={e => onChange(parse(e.target.value))}
      className="w-full accent-brand-accent h-1.5 rounded-full"
    />
  </div>
);

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

export const DesignPanel: React.FC<DesignPanelProps> = ({
  layout,
  onChange,
  docType,
  focusSection,
  onFocusHandled,
  onReset,
}) => {
  const [open, setOpen] = useState<string>('template');
  const [resetConfirm, setResetConfirm] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const activeOpen = focusSection ?? open;
  const toggle = (s: string) => {
    onFocusHandled?.();
    setOpen(p => p === s ? '' : s);
  };

  React.useEffect(() => {
    if (!focusSection) return;
    const t = window.setTimeout(() => {
      setOpen(focusSection);
      scrollRef.current?.querySelector(`#design-section-${focusSection}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      onFocusHandled?.();
    }, 50);
    return () => window.clearTimeout(t);
  }, [focusSection, onFocusHandled]);

  const brand   = layout.brandColor   ?? '#314855';
  const accent2 = layout.accentColor2 ?? '#0284c7';
  const isDesigner = (layout.template ?? 'navy') === 'designer';

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5 pb-32 space-y-3 w-full flex flex-col"
    >

      {/* ── Reset to defaults ──────────────────────────────────────────────── */}
      {onReset && isDesigner && (
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-border-color/40 bg-sidebar">
          <span className="text-[10px] text-text-muted leading-tight">
            Restore Figma design defaults<br />
            <span className="opacity-60">Raleway · Open Sans · Heading #343334 · Accent #00B6CB</span>
          </span>
          {resetConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onReset(); setResetConfirm(false); }}
                className="px-2 py-1 rounded text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white cursor-pointer transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="px-2 py-1 rounded text-[10px] font-semibold border border-border-color/60 text-text-muted hover:text-text-main cursor-pointer transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border-color/60 hover:border-brand-accent/60 text-text-muted hover:text-brand-accent transition cursor-pointer text-[10px] font-semibold shrink-0"
              title="Reset all style settings to Figma defaults"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      )}

      <AccordionSection
        id="template"
        icon={Layout}
        label="Template"
        openSection={activeOpen}
        onToggle={toggle}
        variant="design"
        bodyClassName="p-3 border-t border-border-color/40 grid grid-cols-2 gap-2"
      >
        {TEMPLATES_FOR_DESIGN.map(t => {
          const isActive = (layout.template ?? 'navy') === t.id;
          return (
            <motion.button
              key={t.id}
              onClick={() => onChange({ template: t.id })}
              whileTap={{ scale: 0.96 }}
              className={`relative flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left cursor-pointer transition ${
                isActive
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-border-color/60 hover:border-brand-accent/50 text-text-muted hover:text-text-main'
              }`}
              style={isActive ? { background: t.accent } : {}}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: isActive ? 'rgba(255,255,255,0.6)' : t.accent }} />
              <span className="text-[10px] font-semibold truncate">{t.name}</span>
              {t.badge && (
                <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold px-1 py-0.5 rounded-full text-white"
                  style={{ background: t.accent }}>
                  {t.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </AccordionSection>

      <AccordionSection
        id="colours"
        icon={Palette}
        label="Colours"
        openSection={activeOpen}
        onToggle={toggle}
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

      <AccordionSection
        id="typography"
        icon={Type}
        label="Typography"
        openSection={activeOpen}
        onToggle={toggle}
        variant="design"
        bodyClassName={`p-3 border-t border-border-color/40 grid gap-4 ${isDesigner ? 'grid-cols-2' : 'grid-cols-2'}`}
      >
        <FontPicker label="Heading Font" value={layout.headingFont} onChange={v => onChange({ headingFont: v })} />
        {isDesigner ? (
          <FontPicker label="Title Font" value={layout.titleFont} onChange={v => onChange({ titleFont: v })} />
        ) : (
          <FontPicker label="Body Font" value={layout.fontFamily} onChange={v => onChange({ fontFamily: v })} />
        )}
        {isDesigner && (
          <>
            <FontPicker label="Accent Font" value={layout.accentFont} onChange={v => onChange({ accentFont: v })} />
            <FontPicker label="Body Font" value={layout.fontFamily} onChange={v => onChange({ fontFamily: v })} />
          </>
        )}
      </AccordionSection>

      <AccordionSection
        id="header"
        icon={Layout}
        label="Header Style"
        openSection={activeOpen}
        onToggle={toggle}
        variant="design"
        bodyClassName="p-3 border-t border-border-color/40 space-y-3"
      >
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {(isDesigner
            ? [
                { id: 'left'     as const, label: 'Photo Right', desc: 'Name left, photo right' },
                { id: 'centered' as const, label: 'Centered',    desc: 'Photo above, centered layout' },
                { id: 'minimal'  as const, label: 'Minimal',     desc: 'Full-width, no photo' },
              ]
            : HEADER_STYLES
          ).map(h => {
            const isActive = (layout.headerStyle ?? (isDesigner ? 'left' : 'centered')) === h.id;
            return (
              <button
                key={h.id}
                onClick={() => onChange({ headerStyle: h.id })}
                className={`px-2 py-2 rounded-lg border text-left transition cursor-pointer ${
                  isActive
                    ? 'border-brand-accent bg-brand-accent/8 text-brand-accent'
                    : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
                }`}
              >
                <span className="block text-[10px] font-bold">{h.label}</span>
                <span className="block text-[9px] opacity-70 leading-tight">{h.desc}</span>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-text-muted leading-relaxed border-t border-border-color/30 pt-3">
          Contact field visibility, photo, and uppercase name are in the document header gear on the canvas.
        </p>
      </AccordionSection>

      <AccordionSection
        id="spacing"
        icon={SlidersHorizontal}
        label="Spacing"
        openSection={activeOpen}
        onToggle={toggle}
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

      {docType === 'resume' && (
        <AccordionSection
          id="bullets"
          icon={List}
          label="Bullet Style"
          openSection={activeOpen}
          onToggle={toggle}
          variant="design"
          bodyClassName="p-3 border-t border-border-color/40 grid grid-cols-2 gap-1.5"
        >
          {BULLET_STYLES.map(b => {
            const isActive = (layout.bulletStyle ?? 'disc') === b.id;
            return (
              <button
                key={b.id ?? 'disc'}
                onClick={() => onChange({ bulletStyle: b.id })}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg border text-left transition cursor-pointer ${
                  isActive
                    ? 'border-brand-accent bg-brand-accent/8 text-brand-accent font-bold'
                    : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
                }`}
              >
                <span className="text-[10px] font-semibold">{b.label}</span>
                <span className="text-xs font-semibold opacity-80" style={{ color: isActive ? undefined : layout.brandColor }}>{b.preview}</span>
              </button>
            );
          })}
        </AccordionSection>
      )}

      {docType === 'resume' && (
        <AccordionSection
          id="skillsStyle"
          icon={Tag}
          label="Skills Style"
          openSection={activeOpen}
          onToggle={toggle}
          variant="design"
          bodyClassName="p-3 border-t border-border-color/40 grid grid-cols-3 gap-1.5"
        >
          <button
            onClick={() => onChange({ skillsStyle: 'chips' })}
            className={`px-2.5 py-2 rounded-lg border text-left transition cursor-pointer ${
              (layout.skillsStyle ?? 'chips') === 'chips'
                ? 'border-brand-accent bg-brand-accent/8 text-brand-accent font-bold'
                : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
            }`}
          >
            <span className="text-[10px] font-semibold block">Chips</span>
            <span className="text-[8px] opacity-70 leading-tight block mt-0.5">Styled pill badges</span>
          </button>
          <button
            onClick={() => onChange({ skillsStyle: 'normal' })}
            className={`px-2.5 py-2 rounded-lg border text-left transition cursor-pointer ${
              (layout.skillsStyle ?? 'chips') === 'normal'
                ? 'border-brand-accent bg-brand-accent/8 text-brand-accent font-bold'
                : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
            }`}
          >
            <span className="text-[10px] font-semibold block">Plain Text</span>
            <span className="text-[8px] opacity-70 leading-tight block mt-0.5">Comma-separated list</span>
          </button>
          <button
            onClick={() => onChange({ skillsStyle: 'grid' })}
            className={`px-2.5 py-2 rounded-lg border text-left transition cursor-pointer ${
              (layout.skillsStyle ?? 'chips') === 'grid'
                ? 'border-brand-accent bg-brand-accent/8 text-brand-accent font-bold'
                : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
            }`}
          >
            <span className="text-[10px] font-semibold block">Grid Table</span>
            <span className="text-[8px] opacity-70 leading-tight block mt-0.5">4-col ATS layout</span>
          </button>
        </AccordionSection>
      )}

      <AccordionSection
        id="textAlignment"
        icon={AlignLeft}
        label="Text Alignment"
        openSection={activeOpen}
        onToggle={toggle}
        variant="design"
        bodyClassName="p-3 border-t border-border-color/40 space-y-4"
      >
        <AlignmentPicker title="Summary Alignment" value={layout.summaryAlign} defaultValue="justify" onChange={align => onChange({ summaryAlign: align })} />
        <AlignmentPicker title="Experience Alignment" value={layout.experienceAlign} defaultValue="left" onChange={align => onChange({ experienceAlign: align })} />
        <AlignmentPicker title="Education Alignment" value={layout.educationAlign} defaultValue="left" onChange={align => onChange({ educationAlign: align })} />
        <AlignmentPicker title="Certifications Alignment" value={layout.certsAlign} defaultValue="left" onChange={align => onChange({ certsAlign: align })} />
        <AlignmentPicker title="Achievements Alignment" value={layout.achievementsAlign} defaultValue="left" onChange={align => onChange({ achievementsAlign: align })} />
      </AccordionSection>

      <AccordionSection
        id="photo"
        icon={Image}
        label="Photo"
        openSection={activeOpen}
        onToggle={toggle}
        variant="design"
        bodyClassName="p-3 border-t border-border-color/40"
      >
        <p className="text-[10px] text-text-muted leading-relaxed">
          Show or hide the profile photo and pick its shape using the gear icon on the document header in the canvas preview.
        </p>
      </AccordionSection>

      {docType === 'resume' && (
        <AccordionSection
          id="layout-outlines"
          icon={Layers}
          label="Layout Outlines"
          openSection={activeOpen}
          onToggle={toggle}
          variant="design"
          bodyClassName="p-3 border-t border-border-color/40 space-y-3"
        >
          <ToggleSwitch label="Show layout outlines" checked={layout.showLayoutBounds ?? false} onChange={v => onChange({ showLayoutBounds: v })} />
          <p className="text-[10px] text-text-muted leading-relaxed">
            Displays dotted borders around components. Drag and drop sections on the sheet to reorder them! (Invisible on download)
          </p>
        </AccordionSection>
      )}

    </div>
  );
};
