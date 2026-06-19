import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 47 }, (_, i) => THIS_YEAR - 35 + i); // 35 back, 11 forward

function parseMonthYear(str: string): { month: number; year: number } | null {
  const s = str.trim();
  // MM/YYYY
  const m1 = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (m1) return { month: parseInt(m1[1]) - 1, year: parseInt(m1[2]) };
  // MMM YYYY or Month YYYY
  const m2 = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (m2) {
    const idx = MONTHS.findIndex(m => m.toLowerCase() === m2[1].substring(0, 3).toLowerCase());
    if (idx !== -1) return { month: idx, year: parseInt(m2[2]) };
  }
  return null;
}

function parseDateRange(value: string) {
  const [rawStart = '', rawEnd = ''] = value.split(/\s*[–—-]\s*/);
  const isPresent = /^present$/i.test(rawEnd.trim()) || rawEnd.trim() === '';
  const start = parseMonthYear(rawStart) ?? { month: new Date().getMonth(), year: THIS_YEAR };
  const end   = isPresent ? { month: new Date().getMonth(), year: THIS_YEAR } : (parseMonthYear(rawEnd) ?? { month: new Date().getMonth(), year: THIS_YEAR });
  return { startMonth: start.month, startYear: start.year, endMonth: end.month, endYear: end.year, isPresent };
}

function fmt(month: number, year: number) { return `${MONTHS[month]} ${year}`; }

interface Props {
  value: string;
  isEditable: boolean;
  onSave: (v: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

export const DateRangePicker: React.FC<Props> = ({ value, isEditable, onSave, style, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsed = parseDateRange(value);
  const [startMonth, setStartMonth] = useState(parsed.startMonth);
  const [startYear, setStartYear]   = useState(parsed.startYear);
  const [endMonth, setEndMonth]     = useState(parsed.endMonth);
  const [endYear, setEndYear]       = useState(parsed.endYear);
  const [isPresent, setIsPresent]   = useState(parsed.isPresent);

  // Re-sync local state when value prop changes externally
  useEffect(() => {
    const p = parseDateRange(value);
    setStartMonth(p.startMonth); setStartYear(p.startYear);
    setEndMonth(p.endMonth);     setEndYear(p.endYear);
    setIsPresent(p.isPresent);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const apply = () => {
    const result = isPresent
      ? `${fmt(startMonth, startYear)} – Present`
      : `${fmt(startMonth, startYear)} – ${fmt(endMonth, endYear)}`;
    onSave(result);
    setOpen(false);
  };

  const selectClass = 'border border-slate-200 rounded px-1 py-0.5 text-[10px] text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer';

  return (
    <span className="inline-flex items-center gap-1 shrink-0 relative" ref={ref}>
      {/* Calendar trigger */}
      {isEditable ? (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
          className="text-slate-400 hover:text-teal-500 transition cursor-pointer rounded p-0.5 -m-0.5 focus:outline-none"
          title="Pick date range"
          aria-label="Open date picker"
        >
          <Calendar className="w-3 h-3 shrink-0" strokeWidth={1.5} />
        </button>
      ) : (
        <Calendar className="w-3 h-3 text-slate-400 shrink-0" strokeWidth={1.5} aria-hidden />
      )}

      {/* Date text — always shown */}
      <span style={style} className={`whitespace-nowrap ${className}`}>{value}</span>

      {/* Popover */}
      {open && (
        <div
          className="edit-only absolute right-0 top-full mt-1 z-[200] bg-white border border-slate-200 shadow-xl rounded-lg p-3 w-[260px]"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">Date Range</p>

          {/* Start */}
          <div className="mb-2">
            <span className="text-[9px] text-slate-500 font-semibold block mb-1">Start</span>
            <div className="flex gap-1.5">
              <select value={startMonth} onChange={e => setStartMonth(+e.target.value)} className={selectClass}>
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select value={startYear} onChange={e => setStartYear(+e.target.value)} className={`${selectClass} flex-1`}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* End */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 font-semibold">End</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPresent}
                  onChange={e => setIsPresent(e.target.checked)}
                  className="w-3 h-3 accent-teal-500 cursor-pointer"
                />
                <span className="text-[9px] text-slate-600 font-medium">Present</span>
              </label>
            </div>
            {!isPresent && (
              <div className="flex gap-1.5">
                <select value={endMonth} onChange={e => setEndMonth(+e.target.value)} className={selectClass}>
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select value={endYear} onChange={e => setEndYear(+e.target.value)} className={`${selectClass} flex-1`}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Preview + Apply */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-[10px] text-slate-500 font-mono">
              {isPresent ? `${fmt(startMonth, startYear)} – Present` : `${fmt(startMonth, startYear)} – ${fmt(endMonth, endYear)}`}
            </span>
            <button
              onClick={apply}
              className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-teal-500 hover:bg-teal-600 text-white transition cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </span>
  );
};
