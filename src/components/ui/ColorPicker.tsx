import React from 'react';
import { COLOR_PRESETS } from '../../config/designOptions';

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

export default ColorPicker;
