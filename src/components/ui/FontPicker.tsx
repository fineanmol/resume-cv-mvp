import React from 'react';
import type { FontFamily } from '../../types';
import { FONT_OPTIONS, FONT_CSS } from '../../config/fonts';

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

export default FontPicker;
