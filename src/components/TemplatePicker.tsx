import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { ResumeTemplateRenderer } from '../templates/ResumeTemplates';
import { CoverLetterTemplateRenderer } from '../templates/CoverLetterTemplates';
import type { TemplateId } from '../types';
import { TEMPLATE_CATALOG } from '../config/templates';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';
import { DEFAULT_CL_STATE } from '../config/defaultCL';

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: TemplateId) => void;
  docType: 'resume' | 'coverletter';
  /** Index to jump to when the picker opens (used by chip strip) */
  startIndex?: number;
}

const SLIDE = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.97 }),
};

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ isOpen, onClose, onSelect, docType, startIndex }) => {
  const [idx, setIdx]       = useState(startIndex ?? 0);
  const [dir, setDir]       = useState(0);

  const go = useCallback((step: number) => {
    setDir(step);
    setIdx(i => (i + step + TEMPLATE_CATALOG.length) % TEMPLATE_CATALOG.length);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  go(-1);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'Escape')     onClose();
      if (e.key === 'Enter')      { onSelect(TEMPLATE_CATALOG[idx].id); onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, go, idx, onClose, onSelect]);

  // Reset index when picker is re-mounted (handled by key on parent AnimatePresence)

  if (!isOpen) return null;

  const tpl = TEMPLATE_CATALOG[idx];

  // Live scaled A4 preview (EnhanceCV carousel uses static thumbnails; this renders the real template).
  const previewResume = {
    ...DEFAULT_RESUME_STATE,
    layoutSettings: { ...DEFAULT_RESUME_STATE.layoutSettings, template: tpl.id, brandColor: tpl.accent },
  };
  const previewCL = {
    ...DEFAULT_CL_STATE,
    layoutSettings: { ...DEFAULT_CL_STATE.layoutSettings, template: tpl.id, brandColor: tpl.accent },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="w-full max-w-5xl bg-sidebar border border-border-color rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-color/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
            <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
              Choose {docType === 'resume' ? 'Resume' : 'Cover Letter'} Layout
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Dot indicators */}
            <div className="flex gap-1.5">
              {TEMPLATE_CATALOG.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
                  className="cursor-pointer transition-all duration-200"
                  title={t.name}
                >
                  <span
                    className={`block rounded-full transition-all duration-200 ${i === idx ? 'w-5 h-2' : 'w-2 h-2 hover:opacity-70'}`}
                    style={{ background: i === idx ? tpl.accent : '#94a3b8' }}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] text-text-muted font-mono">{idx + 1} / {TEMPLATE_CATALOG.length}</span>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-main hover:bg-card border border-transparent hover:border-border-color rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Main area: preview + info ────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* A4 Preview pane */}
          <div className="flex-1 bg-slate-100/60 flex items-center justify-center overflow-hidden relative">
            {/* Prev arrow */}
            <button
              onClick={() => go(-1)}
              className="absolute left-3 z-10 p-2 bg-sidebar/90 hover:bg-sidebar border border-border-color rounded-full shadow-lg text-text-muted hover:text-brand-accent transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={tpl.id}
                custom={dir}
                variants={SLIDE}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className="flex items-start justify-center w-full h-full py-6 px-16"
              >
                {/* Scaled A4 sheet */}
                <div
                  className="bg-white shadow-2xl rounded-sm overflow-hidden pointer-events-none select-none flex-shrink-0"
                  style={{ width: 397, height: 562 }}   /* 794×1123 at 50% */
                >
                  <div className="origin-top-left scale-[0.5] w-[794px] h-[1123px]">
                    {docType === 'resume'
                      ? <ResumeTemplateRenderer state={previewResume} isEditable={false} />
                      : <CoverLetterTemplateRenderer state={previewCL} isEditable={false} />
                    }
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Next arrow */}
            <button
              onClick={() => go(1)}
              className="absolute right-3 z-10 p-2 bg-sidebar/90 hover:bg-sidebar border border-border-color rounded-full shadow-lg text-text-muted hover:text-brand-accent transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Info + CTA pane */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tpl.id + '-info'}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="w-[240px] flex-shrink-0 border-l border-border-color/60 p-6 flex flex-col justify-between bg-sidebar"
            >
              <div className="space-y-4">
                {/* Accent bar */}
                <div className="h-1 w-12 rounded-full" style={{ background: tpl.accent }} />

                <div>
                  {tpl.badge && (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full text-white mb-2"
                      style={{ background: tpl.accent }}>
                      {tpl.badge}
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-text-main leading-tight">{tpl.name}</h2>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: tpl.accent }}>{tpl.tagline}</p>
                </div>

                <p className="text-[12px] text-text-muted leading-relaxed">{tpl.desc}</p>

                {/* Template thumbnails strip */}
                <div className="flex gap-1.5 flex-wrap">
                  {TEMPLATE_CATALOG.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
                      title={t.name}
                      className={`w-6 h-6 rounded border-2 transition cursor-pointer ${i === idx ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                      style={{ background: t.accent, borderColor: i === idx ? 'white' : 'transparent', boxShadow: i === idx ? `0 0 0 2px ${t.accent}` : 'none' }}
                    />
                  ))}
                </div>

                <p className="text-[10px] text-text-muted">
                  Use <kbd className="px-1 py-0.5 bg-card border border-border-color rounded text-[10px]">←</kbd>{' '}
                  <kbd className="px-1 py-0.5 bg-card border border-border-color rounded text-[10px]">→</kbd> to browse,{' '}
                  <kbd className="px-1 py-0.5 bg-card border border-border-color rounded text-[10px]">Enter</kbd> to apply.
                </p>
              </div>

              <div className="space-y-2 mt-6">
                <button
                  onClick={() => { onSelect(tpl.id); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-lg hover:opacity-90"
                  style={{ background: tpl.accent }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Apply Layout
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 border border-border-color hover:bg-card text-xs font-semibold rounded-xl text-text-muted hover:text-text-main transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
