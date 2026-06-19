import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  variant?: 'default' | 'teal';
  compact?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  id,
  variant = 'default',
  compact = false,
}) => {
  const checkedClass = variant === 'teal' ? 'bg-teal-500' : 'bg-brand-accent';
  const switchEl = (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative rounded-full transition cursor-pointer flex-shrink-0 ${
        compact ? 'w-7 h-4' : 'w-9 h-5'
      } ${checked ? checkedClass : 'bg-border-color'}`}
    >
      <span
        className={`absolute top-0.5 bg-white rounded-full shadow transition-all ${
          compact ? 'w-3 h-3' : 'w-4 h-4'
        } ${checked ? (compact ? 'left-3.5' : 'left-4') : 'left-0.5'}`}
      />
    </button>
  );

  if (label) {
    return (
      <label className="flex items-center justify-between gap-2 cursor-pointer min-w-0">
        <span className={`${compact ? 'text-[11px] leading-tight' : 'text-xs'} text-text-main font-medium truncate`}>
          {label}
        </span>
        {switchEl}
      </label>
    );
  }

  return switchEl;
};
