import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Type, Layout, SlidersHorizontal, Image, List, Tag, AlignLeft, AlignCenter, AlignRight, AlignJustify, Layers } from 'lucide-react';
import type { LayoutSettings, FontFamily, HeaderStyle, TemplateId } from '../types';
import { SectionHeader } from './SectionHeader';
import { FONT_OPTIONS, FONT_CSS } from '../config/fonts';

// ─── Template data ────────────────────────────────────────────────────────────
const TEMPLATES: { id: TemplateId; name: string; accent: string; badge?: string }[] = [
  { id: 'navy',      name: 'Navy Elegant',    accent: '#314855' },
  { id: 'serif',     name: 'Harvard Serif',   accent: '#1e293b' },
  { id: 'sidebar',   name: 'Creative Sidebar',accent: '#0284c7' },
  { id: 'tech',      name: 'Tech Monospace',  accent: '#10b981' },
  { id: 'ats',       name: 'Clean ATS',       accent: '#6366f1', badge: 'ATS' },
  { id: 'executive', name: 'Executive',       accent: '#b45309', badge: '★' },
  { id: 'designer',  name: 'Modern Designer', accent: '#007ACC', badge: 'New' },
];

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

// ─── Shared accordion animation ───────────────────────────────────────────────
const SECTION_ANIM = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { duration: 0.2 } },
  exit:    { opacity: 0, height: 0,    transition: { duration: 0.15 } },
} as const;

// ─── Colour swatch presets ────────────────────────────────────────────────────
const COLOR_PRESETS = [
  '#314855','#1e293b','#0284c7','#10b981','#6366f1','#b45309',
  '#dc2626','#7c3aed','#0891b2','#059669','#d97706','#be185d',
];

interface DesignPanelProps {
  layout: LayoutSettings & { columnGap?: number };
  onChange: (patch: Partial<LayoutSettings & { columnGap?: number }>) => void;
  docType: 'resume' | 'coverletter';
}

// ─── Small colour picker with swatches ───────────────────────────────────────
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

// ─── Font picker ──────────────────────────────────────────────────────────────
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

// ─── Slider row ───────────────────────────────────────────────────────────────
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
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parse(e.target.value))}
      className="w-full accent-brand-accent h-1.5 rounded-full"
    />
  </div>
);

// ─── Main panel ───────────────────────────────────────────────────────────────
export const DesignPanel: React.FC<DesignPanelProps> = ({ layout, onChange, docType }) => {
  const [open, setOpen] = useState<string>('template');
  const toggle = (s: string) => setOpen(p => p === s ? '' : s);

  const brand   = layout.brandColor   ?? '#314855';
  const accent2 = layout.accentColor2 ?? '#0284c7';

  return (
    <div className="flex-1 overflow-y-auto p-3.5 pb-24 space-y-3 w-full flex flex-col">

        {/* ── TEMPLATE ──────────────────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="template" icon={Layout} label="Template" openSection={open} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {open === 'template' && (
              <motion.div key="template" {...SECTION_ANIM} style={{ overflow: 'hidden' }}>
                <div className="p-3 border-t border-border-color/40 grid grid-cols-2 gap-2">
                  {TEMPLATES.map(t => {
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── COLOURS ───────────────────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="colours" icon={Palette} label="Colours" openSection={open} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {open === 'colours' && (
              <motion.div key="colours" {...SECTION_ANIM} style={{ overflow: 'hidden' }}>
                <div className="p-3 border-t border-border-color/40 space-y-4">
                  <ColorPicker label="Primary Accent" value={brand}   onChange={v => onChange({ brandColor: v })} />
                  <ColorPicker label="Secondary Accent" value={accent2} onChange={v => onChange({ accentColor2: v })} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── TYPOGRAPHY ────────────────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="typography" icon={Type} label="Typography" openSection={open} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {open === 'typography' && (
              <motion.div key="typography" {...SECTION_ANIM} style={{ overflow: 'hidden' }}>
                <div className="p-3 border-t border-border-color/40 grid grid-cols-2 gap-4">
                  <FontPicker label="Heading Font" value={layout.headingFont} onChange={v => onChange({ headingFont: v })} />
                  <FontPicker label="Body Font"    value={layout.fontFamily}  onChange={v => onChange({ fontFamily: v })} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── HEADER STYLE ──────────────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="header" icon={Layout} label="Header Style" openSection={open} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {open === 'header' && (
              <motion.div key="header" {...SECTION_ANIM} style={{ overflow: 'hidden' }}>
                <div className="p-3 border-t border-border-color/40 space-y-3">
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {HEADER_STYLES.map(h => {
                      const isActive = (layout.headerStyle ?? 'centered') === h.id;
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

                  <div className="border-t border-border-color/30 pt-3 space-y-2.5">
                    <span className="block text-[9px] text-text-muted uppercase font-bold tracking-wider">Field Visibility</span>
                    
                    {/* Show Title */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-text-main font-medium">Show Title</span>
                      <button
                        role="switch"
                        aria-checked={layout.showTitle ?? true}
                        onClick={() => onChange({ showTitle: !(layout.showTitle ?? true) })}
                        className={`relative w-9 h-5 rounded-full transition cursor-pointer ${(layout.showTitle ?? true) ? 'bg-brand-accent' : 'bg-border-color'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(layout.showTitle ?? true) ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </label>

                    {/* Show Phone */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-text-main font-medium">Show Phone</span>
                      <button
                        role="switch"
                        aria-checked={layout.showPhone ?? true}
                        onClick={() => onChange({ showPhone: !(layout.showPhone ?? true) })}
                        className={`relative w-9 h-5 rounded-full transition cursor-pointer ${(layout.showPhone ?? true) ? 'bg-brand-accent' : 'bg-border-color'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(layout.showPhone ?? true) ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </label>

                    {/* Show Email */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-text-main font-medium">Show Email</span>
                      <button
                        role="switch"
                        aria-checked={layout.showEmail ?? true}
                        onClick={() => onChange({ showEmail: !(layout.showEmail ?? true) })}
                        className={`relative w-9 h-5 rounded-full transition cursor-pointer ${(layout.showEmail ?? true) ? 'bg-brand-accent' : 'bg-border-color'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(layout.showEmail ?? true) ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </label>

                    {/* Show Location */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-text-main font-medium">Show Location</span>
                      <button
                        role="switch"
                        aria-checked={layout.showLocation ?? true}
                        onClick={() => onChange({ showLocation: !(layout.showLocation ?? true) })}
                        className={`relative w-9 h-5 rounded-full transition cursor-pointer ${(layout.showLocation ?? true) ? 'bg-brand-accent' : 'bg-border-color'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(layout.showLocation ?? true) ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </label>

                    {/* Show LinkedIn */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-text-main font-medium">Show LinkedIn</span>
                      <button
                        role="switch"
                        aria-checked={layout.showLinkedin ?? true}
                        onClick={() => onChange({ showLinkedin: !(layout.showLinkedin ?? true) })}
                        className={`relative w-9 h-5 rounded-full transition cursor-pointer ${(layout.showLinkedin ?? true) ? 'bg-brand-accent' : 'bg-border-color'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(layout.showLinkedin ?? true) ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </label>

                    {/* Uppercase Name */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-text-main font-medium">Uppercase Name</span>
                      <button
                        role="switch"
                        aria-checked={layout.uppercaseName ?? false}
                        onClick={() => onChange({ uppercaseName: !(layout.uppercaseName ?? false) })}
                        className={`relative w-9 h-5 rounded-full transition cursor-pointer ${(layout.uppercaseName ?? false) ? 'bg-brand-accent' : 'bg-border-color'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(layout.uppercaseName ?? false) ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SPACING ───────────────────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="spacing" icon={SlidersHorizontal} label="Spacing" openSection={open} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {open === 'spacing' && (
              <motion.div key="spacing" {...SECTION_ANIM} style={{ overflow: 'hidden' }}>
                <div className="p-3 border-t border-border-color/40 space-y-3">
                  <Slider label="Font Size"        value={layout.fontSize}          unit="pt" min={8}   max={14}  step={0.5}  onChange={v => onChange({ fontSize: v })} />
                  <Slider label="Line Height"      value={layout.lineHeight}        unit=""   min={1.1} max={2.0} step={0.05} onChange={v => onChange({ lineHeight: v })} />
                  <Slider label="Pad Top/Bottom"   value={layout.paddingTopBottom}  unit="mm" min={6}   max={25}  step={1}    onChange={v => onChange({ paddingTopBottom: v })} parse={parseInt} />
                  <Slider label="Pad Left/Right"   value={layout.paddingLeftRight}  unit="mm" min={6}   max={25}  step={1}    onChange={v => onChange({ paddingLeftRight: v })} parse={parseInt} />
                  <Slider label="Section Gap"      value={layout.sectionSpacing}    unit="px" min={4}   max={28}  step={1}    onChange={v => onChange({ sectionSpacing: v })} parse={parseInt} />
                  {docType === 'resume' && layout.columnGap !== undefined && (
                    <Slider label="Column Gap" value={layout.columnGap} unit="px" min={8} max={30} step={1} onChange={v => onChange({ columnGap: v })} parse={parseInt} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── BULLET STYLE ──────────────────────────────────────── */}
        {docType === 'resume' && (
          <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
            <SectionHeader id="bullets" icon={List} label="Bullet Style" openSection={open} onToggle={toggle} />
            <AnimatePresence initial={false}>
              {open === 'bullets' && (
                <motion.div key="bullets" {...SECTION_ANIM} style={{ overflow: 'hidden' }}>
                  <div className="p-3 border-t border-border-color/40 grid grid-cols-2 gap-1.5">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── SKILLS STYLE ──────────────────────────────────────── */}
        {docType === 'resume' && (
          <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
            <SectionHeader id="skillsStyle" icon={Tag} label="Skills Style" openSection={open} onToggle={toggle} />
            <AnimatePresence initial={false}>
              {open === 'skillsStyle' && (
                <motion.div key="skillsStyle" {...SECTION_ANIM} style={{ overflow: 'hidden' }}>
                  <div className="p-3 border-t border-border-color/40 grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onChange({ skillsStyle: 'chips' })}
                      className={`px-2.5 py-2 rounded-lg border text-left transition cursor-pointer ${
                        (layout.skillsStyle ?? 'chips') === 'chips'
                          ? 'border-brand-accent bg-brand-accent/8 text-brand-accent font-bold'
                          : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
                      }`}
                    >
                      <span className="text-[10px] font-semibold block">Chips / Badges</span>
                      <span className="text-[8px] opacity-70 leading-tight block mt-0.5">Styled pill layout</span>
                    </button>
                    <button
                      onClick={() => onChange({ skillsStyle: 'normal' })}
                      className={`px-2.5 py-2 rounded-lg border text-left transition cursor-pointer ${
                        (layout.skillsStyle ?? 'chips') === 'normal'
                          ? 'border-brand-accent bg-brand-accent/8 text-brand-accent font-bold'
                          : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
                      }`}
                    >
                      <span className="text-[10px] font-semibold block">Normal Text</span>
                      <span className="text-[8px] opacity-70 leading-tight block mt-0.5">Plain comma-separated list</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── TEXT ALIGNMENT ────────────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="textAlignment" icon={AlignLeft} label="Text Alignment" openSection={open} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {open === 'textAlignment' && (
              <motion.div key="textAlignment" {...SECTION_ANIM} style={{ overflow: 'hidden' }}>
                <div className="p-3 border-t border-border-color/40 space-y-4">
                  {/* Summary Alignment */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">Summary Alignment</span>
                    <div className="grid grid-cols-4 gap-1">
                      {(['left', 'center', 'right', 'justify'] as const).map(align => {
                        const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : align === 'right' ? AlignRight : AlignJustify;
                        const isActive = (layout.summaryAlign ?? 'justify') === align;
                        return (
                          <button
                            key={align}
                            onClick={() => onChange({ summaryAlign: align })}
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

                  {/* Experience Alignment */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">Experience Alignment</span>
                    <div className="grid grid-cols-4 gap-1">
                      {(['left', 'center', 'right', 'justify'] as const).map(align => {
                        const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : align === 'right' ? AlignRight : AlignJustify;
                        const isActive = (layout.experienceAlign ?? 'left') === align;
                        return (
                          <button
                            key={align}
                            onClick={() => onChange({ experienceAlign: align })}
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

                  {/* Education Alignment */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">Education Alignment</span>
                    <div className="grid grid-cols-4 gap-1">
                      {(['left', 'center', 'right', 'justify'] as const).map(align => {
                        const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : align === 'right' ? AlignRight : AlignJustify;
                        const isActive = (layout.educationAlign ?? 'left') === align;
                        return (
                          <button
                            key={align}
                            onClick={() => onChange({ educationAlign: align })}
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

                  {/* Certifications Alignment */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">Certifications Alignment</span>
                    <div className="grid grid-cols-4 gap-1">
                      {(['left', 'center', 'right', 'justify'] as const).map(align => {
                        const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : align === 'right' ? AlignRight : AlignJustify;
                        const isActive = (layout.certsAlign ?? 'left') === align;
                        return (
                          <button
                            key={align}
                            onClick={() => onChange({ certsAlign: align })}
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

                  {/* Achievements Alignment */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">Achievements Alignment</span>
                    <div className="grid grid-cols-4 gap-1">
                      {(['left', 'center', 'right', 'justify'] as const).map(align => {
                        const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : align === 'right' ? AlignRight : AlignJustify;
                        const isActive = (layout.achievementsAlign ?? 'left') === align;
                        return (
                          <button
                            key={align}
                            onClick={() => onChange({ achievementsAlign: align })}
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── PHOTO ─────────────────────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="photo" icon={Image} label="Photo" openSection={open} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {open === 'photo' && (
              <motion.div key="photo" {...SECTION_ANIM} style={{ overflow: 'hidden' }}>
                <div className="p-3 border-t border-border-color/40">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-text-main font-medium">Show photo on document</span>
                    <button
                      role="switch"
                      aria-checked={layout.showPhoto ?? true}
                      onClick={() => onChange({ showPhoto: !(layout.showPhoto ?? true) })}
                      className={`relative w-9 h-5 rounded-full transition cursor-pointer ${
                        (layout.showPhoto ?? true) ? 'bg-brand-accent' : 'bg-border-color'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        (layout.showPhoto ?? true) ? 'left-4' : 'left-0.5'
                      }`} />
                    </button>
                  </label>
                  <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
                    Only visible in templates with a photo area (Sidebar, Executive, Modern Designer). Upload via Import PDF or edit directly.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── LAYOUT BOUNDS ────────────────────────────────────── */}
        {docType === 'resume' && (
          <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
            <SectionHeader id="layout-outlines" icon={Layers} label="Layout Outlines" openSection={open} onToggle={toggle} />
            <AnimatePresence initial={false}>
              {open === 'layout-outlines' && (
                <motion.div key="layout-outlines" {...SECTION_ANIM} style={{ overflow: 'hidden' }}>
                  <div className="p-3 border-t border-border-color/40 space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-text-main font-medium">Show layout outlines</span>
                      <button
                        role="switch"
                        aria-checked={layout.showLayoutBounds ?? false}
                        onClick={() => onChange({ showLayoutBounds: !(layout.showLayoutBounds ?? false) })}
                        className={`relative w-9 h-5 rounded-full transition cursor-pointer ${
                          (layout.showLayoutBounds ?? false) ? 'bg-brand-accent' : 'bg-border-color'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                          (layout.showLayoutBounds ?? false) ? 'left-4' : 'left-0.5'
                        }`} />
                      </button>
                    </label>
                    <p className="text-[10px] text-text-muted leading-relaxed">
                      Displays dotted borders around components. Drag and drop sections on the sheet to reorder them! (Invisible on download)
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

    </div>
  );
};
