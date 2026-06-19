import React from 'react';
import {
  createInputBulletKeyDownHandler,
  parseEditableBullets,
} from '../../hooks/useBulletKeyboard';

interface BulletEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  prefixId: string;
  placeholder?: string;
}

export const BulletEditor: React.FC<BulletEditorProps> = ({
  value,
  onChange,
  prefixId,
  placeholder = 'Add details...',
}) => {
  const arr = parseEditableBullets(value);

  return (
    <div className="space-y-1.5">
      {arr.map((bullet, bIdx) => (
        <div key={bIdx} className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-text-muted select-none w-4 text-right">
            {bIdx + 1}.
          </span>
          <input
            data-bullet-id={`${prefixId}-${bIdx}`}
            value={bullet}
            onChange={(e) => {
              const updated = [...arr];
              updated[bIdx] = e.target.value;
              onChange(updated.join('\n'));
            }}
            onKeyDown={createInputBulletKeyDownHandler({
              bullets: arr,
              bIdx,
              prefixId,
              onChange,
            })}
            className="flex-1 min-w-0 bg-input-bg border border-border-color rounded-lg p-1.5 text-xs text-text-main focus:outline-none"
            placeholder={placeholder}
          />
        </div>
      ))}
    </div>
  );
};
