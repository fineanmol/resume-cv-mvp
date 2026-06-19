import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, Upload } from 'lucide-react';

export interface ItemLogoProps {
  logo?: string;
  brandColor: string;
  isEditable?: boolean;
  onLogoChange?: (logo: string) => void;
  placeholderIcon?: React.ReactNode;
}

export const ItemLogo: React.FC<ItemLogoProps> = ({
  logo, brandColor, isEditable, onLogoChange, placeholderIcon,
}) => {
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showInput) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowInput(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showInput]);

  const logoEl = logo ? (
    <img src={logo} alt="logo" className="w-6 h-6 rounded object-contain bg-white border border-slate-100 flex-shrink-0" />
  ) : (
    <span className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${brandColor}18`, color: brandColor }}>
      {placeholderIcon || <Briefcase className="w-3.5 h-3.5" />}
    </span>
  );

  if (!isEditable) return logoEl;

  return (
    <div className="relative flex-shrink-0 group/logo edit-only" ref={ref}>
      <button
        type="button"
        onClick={() => { setUrl(logo || ''); setShowInput(!showInput); }}
        className="flex items-center justify-center w-6 h-6 rounded overflow-hidden hover:ring-2 ring-brand-accent transition cursor-pointer"
        title="Set company/school logo"
      >
        {logoEl}
      </button>

      {showInput && (
        <div className="absolute left-0 top-8 z-50 bg-white border border-slate-200 shadow-xl rounded-lg p-3 w-64 flex flex-col gap-2 edit-only">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Company / School Logo</p>
          <div className="flex gap-1.5">
            <input
              type="text"
              className="flex-1 text-xs border border-slate-200 rounded px-2 py-1 outline-none focus:border-brand-accent"
              placeholder="Paste image URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { onLogoChange?.(url.trim()); setShowInput(false); }
              }}
            />
            <button
              type="button"
              className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 rounded font-semibold cursor-pointer"
              onClick={() => { onLogoChange?.(url.trim()); setShowInput(false); }}
            >
              Set
            </button>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline font-semibold cursor-pointer">
              <Upload className="w-3 h-3" /> Upload Image
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const dataUrl = ev.target?.result as string;
                  onLogoChange?.(dataUrl);
                  setShowInput(false);
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
          {logo && (
            <button
              type="button"
              className="text-[10px] text-red-400 hover:text-red-600 hover:underline cursor-pointer text-left"
              onClick={() => { onLogoChange?.(''); setShowInput(false); }}
            >
              Remove logo
            </button>
          )}
        </div>
      )}
    </div>
  );
};
