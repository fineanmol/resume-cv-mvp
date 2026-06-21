import React, { useCallback, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CoverLetterState } from '../types';
import type { UndoRedoSetter } from '../hooks/useUndoRedo';
import { AccordionSection } from './ui/AccordionSection';
import { ITEM_ANIM } from '../constants/animations';
import { inputCls, sectionBodyCls } from '../constants/formClasses';
import {
  Plus, Trash2, ArrowUp, ArrowDown,
  Briefcase, FileText, AlignLeft, GripVertical,
} from 'lucide-react';

const PdfImportBlock = lazy(() =>
  import('./forms/resume/PdfImportBlock').then(m => ({ default: m.PdfImportBlock }))
);

interface CoverLetterFormProps {
  state: CoverLetterState;
  onChange: UndoRedoSetter<CoverLetterState>;
  onCommit: () => void;
  geminiKey: string;
}

export const CoverLetterForm: React.FC<CoverLetterFormProps> = ({ state, onChange, onCommit, geminiKey }) => {
  const [openSection, setOpenSection] = useState<string>('target');

  const toggle = (s: string) => setOpenSection(p => p === s ? '' : s);
  const clean  = (t: string) => t.replace(/\*\*|\*/g, '');

  const handleChange = useCallback<UndoRedoSetter<CoverLetterState>>(
    (updater, skipHistory = false) => onChange(updater, skipHistory),
    [onChange]
  );

  const setText = (partial: Partial<CoverLetterState>) =>
    handleChange(p => ({ ...p, ...partial }), true);

  const setDiscrete = (partial: Partial<CoverLetterState>) =>
    handleChange(p => ({ ...p, ...partial }));

  const moveHighlight = (index: number, dir: 'up' | 'down') => {
    const list = [...state.highlights];
    const to   = dir === 'up' ? index - 1 : index + 1;
    if (to < 0 || to >= list.length) return;
    [list[index], list[to]] = [list[to], list[index]];
    setDiscrete({ highlights: list });
  };

  const handleDrop = (src: number, dst: number) => {
    if (src === dst) return;
    handleChange(prev => {
      const list = [...prev.highlights];
      const [item] = list.splice(src, 1);
      list.splice(dst, 0, item);
      return { ...prev, highlights: list };
    });
  };

  return (
    <div className="w-full min-h-0 flex-1 flex flex-col overflow-y-auto overscroll-contain p-5 space-y-5">
      <Suspense fallback={<div className="h-24 rounded-xl bg-card/50 animate-pulse border border-border-color/40" aria-hidden />}>
        <PdfImportBlock
          geminiKey={geminiKey}
          label="Import PDF to Cover Letter"
          description="Upload your resume PDF to auto-fill your contact details (name, email, phone, location, LinkedIn) into this cover letter via Gemini AI."
          onImport={(parsed) =>
            handleChange((prev) => ({
              ...prev,
              ...(parsed.name !== undefined && { name: parsed.name }),
              ...(parsed.subtitle !== undefined && { subtitle: parsed.subtitle }),
              ...(parsed.email !== undefined && { email: parsed.email }),
              ...(parsed.phone !== undefined && { phone: parsed.phone }),
              ...(parsed.linkedin !== undefined && { linkedin: parsed.linkedin }),
              ...(parsed.location !== undefined && { location: parsed.location }),
              ...(parsed.avatar !== undefined && parsed.avatar && { avatar: parsed.avatar }),
            }))
          }
        />
      </Suspense>

      <div className="space-y-3">

        <AccordionSection
          id="target"
          icon={Briefcase}
          label="Target Position"
          openSection={openSection}
          onToggle={toggle}
          bodyClassName={`${sectionBodyCls} space-y-3`}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-text-muted mb-1">Company Name</label>
              <input className={inputCls} value={state.companyName}
                onChange={e => setText({ companyName: clean(e.target.value) })}
                onBlur={e => {
                  const company = e.target.value.trim();
                  if (company) {
                    const today = new Date().toLocaleDateString('en-GB');
                    const newTitle = `${company} - Cover Letter (${today})`;
                    handleChange(p => ({ ...p, title: newTitle }), true);
                  }
                  onCommit();
                }} />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted mb-1">Target Role</label>
              <input className={inputCls} value={state.jobTitle}
                onChange={e => setText({ jobTitle: clean(e.target.value) })}
                onBlur={onCommit} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-text-muted mb-1">Your Name</label>
              <input className={inputCls} value={state.name}
                onChange={e => setText({ name: clean(e.target.value) })}
                onBlur={onCommit} />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted mb-1">Your Title</label>
              <input className={inputCls} value={state.subtitle}
                onChange={e => setText({ subtitle: clean(e.target.value) })}
                onBlur={onCommit} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-text-muted mb-1">Email</label>
              <input className={inputCls} value={state.email}
                onChange={e => setText({ email: clean(e.target.value) })}
                onBlur={onCommit} />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted mb-1">Phone</label>
              <input className={inputCls} value={state.phone}
                onChange={e => setText({ phone: clean(e.target.value) })}
                onBlur={onCommit} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-text-muted mb-1">LinkedIn</label>
              <input className={inputCls} value={state.linkedin}
                onChange={e => setText({ linkedin: clean(e.target.value) })}
                onBlur={onCommit} />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted mb-1">Location</label>
              <input className={inputCls} value={state.location}
                onChange={e => setText({ location: clean(e.target.value) })}
                onBlur={onCommit} />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          id="paragraphs"
          icon={AlignLeft}
          label="Letter Paragraphs"
          openSection={openSection}
          onToggle={toggle}
          bodyClassName={`${sectionBodyCls} space-y-4`}
        >
          <div>
            <label className="block text-[10px] text-text-muted mb-1">Salutation</label>
            <input className={inputCls} value={state.salutation}
              onChange={e => setText({ salutation: clean(e.target.value) })}
              onBlur={onCommit} />
          </div>
          <p className="text-[10px] text-text-muted leading-relaxed">
            Use <code className="bg-card px-1 rounded">{'{{company}}'}</code> and <code className="bg-card px-1 rounded">{'{{role}}'}</code> to auto-insert the target company and role.
          </p>
          {(['p1', 'p2', 'p3', 'p4'] as const).map((pKey, pIdx) => (
            <div key={pKey}>
              <label className="block text-[9px] text-text-muted mb-1 uppercase font-semibold">Paragraph {pIdx + 1}</label>
              <textarea
                value={state[pKey]}
                onChange={e => setText({ [pKey]: e.target.value })}
                onBlur={onCommit}
                rows={4}
                className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:border-brand-accent resize-y"
              />
            </div>
          ))}
        </AccordionSection>

        <AccordionSection
          id="highlights"
          icon={FileText}
          label="Highlights"
          badge={state.highlights.length}
          openSection={openSection}
          onToggle={toggle}
          bodyClassName={`${sectionBodyCls} space-y-3`}
        >
          <div className="flex justify-between items-center text-[10px] text-text-muted uppercase tracking-wider font-bold">
            <span>Drag to reorder</span>
            <button
              onClick={() => handleChange(p => ({ ...p, highlights: [...p.highlights, { category: 'Category', text: 'Detail description here' }] }))}
              className="text-brand-accent hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <AnimatePresence>
            {state.highlights.map((hl, idx) => (
              <motion.div key={idx} {...ITEM_ANIM}>
              <div
                draggable="true"
                onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(idx)); e.currentTarget.classList.add('opacity-40'); }}
                onDragEnd={(e) => { e.currentTarget.classList.remove('opacity-40'); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(parseInt(e.dataTransfer.getData('text/plain')), idx)}
                className="bg-card/25 border border-border-color/50 rounded-xl p-3 flex flex-col gap-2 relative group hover:border-brand-accent/30 transition cursor-grab active:cursor-grabbing"
              >
                <button
                  onClick={() => handleChange(p => ({ ...p, highlights: p.highlights.filter((_, i) => i !== idx) }))}
                  className="absolute right-3 top-3 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <GripVertical className="w-3.5 h-3.5 text-text-muted/40" />
                    <input
                      type="text"
                      value={hl.category}
                      onChange={e => { const v = e.target.value; handleChange(p => { const u = [...p.highlights]; u[idx] = { ...u[idx], category: clean(v) }; return { ...p, highlights: u }; }, true); }}
                      onBlur={onCommit}
                      className="bg-transparent border-b border-transparent hover:border-border-color/30 text-xs font-bold text-brand-accent focus:outline-none w-44"
                      placeholder="Category"
                    />
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => moveHighlight(idx, 'up')} disabled={idx === 0}
                      className="p-1 text-text-muted hover:text-brand-accent disabled:opacity-30 cursor-pointer">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveHighlight(idx, 'down')} disabled={idx === state.highlights.length - 1}
                      className="p-1 text-text-muted hover:text-brand-accent disabled:opacity-30 cursor-pointer">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={hl.text}
                  onChange={e => { const v = e.target.value; handleChange(p => { const u = [...p.highlights]; u[idx] = { ...u[idx], text: v }; return { ...p, highlights: u }; }, true); }}
                  onBlur={onCommit}
                  rows={2}
                  className="w-full bg-input-bg border border-border-color/60 rounded px-2.5 py-1 text-xs text-text-main resize-none focus:outline-none focus:border-brand-accent"
                  placeholder="Detail description..."
                />
              </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </AccordionSection>

      </div>
    </div>
  );
};
