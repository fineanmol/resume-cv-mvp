import React from 'react';
import { Link2 } from 'lucide-react';

interface EntryLinkFieldProps {
  url?: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export const EntryLinkField: React.FC<EntryLinkFieldProps> = ({
  url = '',
  onChange,
  placeholder = 'https://example.com',
}) => (
  <div className="pt-2 border-t border-slate-100 space-y-1.5">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
      <Link2 className="w-3 h-3" />
      Link
    </p>
    <input
      type="url"
      value={url}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="w-full text-[11px] border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-teal-400 text-slate-700 placeholder:text-slate-400"
      placeholder={placeholder}
    />
    <p className="text-[9px] text-slate-400 leading-snug">
      A link icon appears next to the title when a URL is set.
    </p>
  </div>
);
