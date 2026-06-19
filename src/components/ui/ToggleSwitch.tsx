import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, id }) => {
  const switchEl = (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition cursor-pointer ${
        checked ? 'bg-brand-accent' : 'bg-border-color'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
          checked ? 'left-4' : 'left-0.5'
        }`}
      />
    </button>
  );

  if (label) {
    return (
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-xs text-text-main font-medium">{label}</span>
        {switchEl}
      </label>
    );
  }

  return switchEl;
};
