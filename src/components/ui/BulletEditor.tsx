import React from 'react';

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
  const arr = value ? value.split('\n') : [''];

  return (
    <div className="space-y-1.5">
      {arr.map((bullet, bIdx) => (
        <div key={bIdx} className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-text-muted select-none w-4 text-right">
            {bIdx + 1}.
          </span>
          <input
            id={`${prefixId}-${bIdx}`}
            value={bullet}
            onChange={(e) => {
              const updated = [...arr];
              updated[bIdx] = e.target.value;
              onChange(updated.join('\n'));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const inputEl = e.currentTarget;
                const start = inputEl.selectionStart ?? bullet.length;
                const textBefore = bullet.substring(0, start);
                const textAfter = bullet.substring(start);

                const updated = [...arr];
                updated[bIdx] = textBefore;
                updated.splice(bIdx + 1, 0, textAfter);
                onChange(updated.join('\n'));
                setTimeout(() => {
                  const nextInput = document.getElementById(
                    `${prefixId}-${bIdx + 1}`,
                  ) as HTMLInputElement | null;
                  if (nextInput) {
                    nextInput.focus();
                    nextInput.setSelectionRange(0, 0);
                  }
                }, 0);
              } else if (e.key === 'Backspace' && !bullet) {
                e.preventDefault();
                if (arr.length > 1) {
                  const updated = arr.filter((_, i) => i !== bIdx);
                  onChange(updated.join('\n'));
                  setTimeout(() => {
                    document.getElementById(`${prefixId}-${bIdx - 1}`)?.focus();
                  }, 0);
                }
              }
            }}
            className="flex-1 min-w-0 bg-input-bg border border-border-color rounded-lg p-1.5 text-xs text-text-main focus:outline-none"
            placeholder={placeholder}
          />
        </div>
      ))}
    </div>
  );
};
