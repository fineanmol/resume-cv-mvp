import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { labelCls } from '../../constants/formClasses';

interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholderIcon: LucideIcon;
  label?: string;
  shape?: 'circle' | 'square';
  size?: 'sm' | 'md';
  urlPlaceholder?: string;
  uploadLabel?: string;
  removeLabel?: string;
}

const sizeStyles = {
  sm: {
    thumb: 'w-10 h-10',
    icon: 'w-4 h-4',
    btn: 'text-[9px] px-2 py-1',
    url: 'p-1.5 text-[11px]',
    uploadFlex: 'flex gap-1.5',
    uploadBtn: 'flex-1',
    removeBtn: 'flex-1',
  },
  md: {
    thumb: 'w-12 h-12',
    icon: 'w-5 h-5',
    btn: 'text-[10px] px-2.5 py-1.5',
    url: 'p-1.5 text-[11px]',
    uploadFlex: 'flex flex-col gap-1',
    uploadBtn: '',
    removeBtn: '',
  },
} as const;

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  placeholderIcon: PlaceholderIcon,
  label,
  shape = 'square',
  size = 'sm',
  urlPlaceholder = 'Paste image URL',
  uploadLabel = 'Upload File',
  removeLabel = 'Remove',
}) => {
  const s = sizeStyles[size];
  const isCircle = shape === 'circle';
  const thumbShape = isCircle ? 'rounded-full' : 'rounded';
  const imgFit = isCircle ? 'object-cover' : 'object-contain';
  const emptyBg = isCircle ? 'bg-slate-50' : 'bg-input-bg';
  const filledBg = isCircle ? 'bg-slate-100' : 'bg-white';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-1">
      {label && <label className={labelCls}>{label}</label>}
      <div className="flex gap-2 items-center">
        {value ? (
          <div
            className={`relative ${s.thumb} ${thumbShape} overflow-hidden border border-border-color/60 ${filledBg} flex-shrink-0`}
          >
            <img src={value} alt="" className={`w-full h-full ${imgFit}`} />
          </div>
        ) : (
          <div
            className={`${s.thumb} ${thumbShape} border border-dashed border-border-color/80 ${emptyBg} flex items-center justify-center flex-shrink-0`}
          >
            <PlaceholderIcon className={`${s.icon} text-text-muted`} />
          </div>
        )}
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-input-bg border border-border-color rounded-lg ${s.url} text-text-main focus:outline-none`}
            placeholder={urlPlaceholder}
          />
          <div className={s.uploadFlex}>
            <label
              className={`${s.uploadBtn} ${s.btn} bg-brand-accent/10 border border-brand-accent/20 hover:bg-brand-accent/20 text-brand-accent font-bold rounded cursor-pointer transition text-center select-none`}
            >
              {uploadLabel}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className={`${s.removeBtn} ${s.btn} border border-red-200 hover:bg-red-50 text-red-500 font-bold rounded cursor-pointer transition`}
              >
                {removeLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
