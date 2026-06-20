import React from 'react';

const Slider: React.FC<{
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
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
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(parse(e.target.value))}
      className="w-full accent-brand-accent h-1.5 rounded-full"
    />
  </div>
);

export default Slider;
