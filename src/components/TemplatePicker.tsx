import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { ResumeTemplateRenderer } from '../templates/ResumeTemplates';
import { CoverLetterTemplateRenderer } from '../templates/CoverLetterTemplates';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';
import { DEFAULT_CL_STATE } from '../config/defaultCL';

type TemplateId = 'navy' | 'serif' | 'sidebar' | 'tech' | 'ats' | 'executive';

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: TemplateId) => void;
  docType: 'resume' | 'coverletter';
}

const TEMPLATES: { id: TemplateId; name: string; desc: string; badge?: string; accent: string }[] = [
  { id: 'navy', name: 'Navy Elegant', desc: 'Centered header with accent border. Clean and professional.', accent: '#314855' },
  { id: 'serif', name: 'Harvard Serif', desc: 'Elegant serif typography. Ideal for academic and executive roles.', accent: '#1e293b' },
  { id: 'sidebar', name: 'Creative Sidebar', desc: 'Two-column with branded sidebar for skills and contact info.', accent: '#0284c7' },
  { id: 'tech', name: 'Tech Monospace', desc: 'Code-inspired developer layout with monospace accents.', accent: '#10b981' },
  { id: 'ats', name: 'Clean ATS', desc: 'Plain single-column for maximum ATS parsing compatibility.', badge: 'Best for ATS', accent: '#6366f1' },
  { id: 'executive', name: 'Executive', desc: 'Premium gradient header with branded colour palette.', badge: 'Premium', accent: '#b45309' },
];

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ isOpen, onClose, onSelect, docType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-editor/80 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl bg-sidebar border border-border-color rounded-2xl shadow-2xl p-6 relative"
      >
        <button onClick={onClose}
          className="absolute right-6 top-6 p-1.5 text-text-muted hover:text-text-main hover:bg-card border border-transparent hover:border-border-color rounded-lg transition cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <div className="text-xs font-bold text-brand-accent flex items-center gap-1.5 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Choose Template
          </div>
          <h2 className="text-xl font-bold text-text-main">
            Select {docType === 'resume' ? 'Resume' : 'Cover Letter'} Layout
          </h2>
          <p className="text-xs text-text-muted mt-1">
            All templates are fully editable. Switch anytime from the sidebar carousel.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {TEMPLATES.map((tpl) => (
            <motion.div
              key={tpl.id}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(tpl.id)}
              className="bg-card/30 hover:bg-card/75 border border-border-color/60 hover:border-brand-accent/50 rounded-xl p-3 transition-all duration-200 cursor-pointer flex flex-col group relative overflow-hidden"
              style={{ borderTopColor: tpl.accent, borderTopWidth: 3 }}
            >
              {tpl.badge && (
                <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: tpl.accent }}>
                  {tpl.badge}
                </span>
              )}

              {/* Live miniature preview */}
              <div className="w-full h-[140px] relative overflow-hidden bg-white border border-border-color/40 rounded-lg pointer-events-none select-none mb-3 flex justify-center items-start">
                <div className="origin-top-left scale-[0.175] w-[794px] h-[1123px] absolute top-0 left-0">
                  {docType === 'resume'
                    ? <ResumeTemplateRenderer state={{ ...DEFAULT_RESUME_STATE, layoutSettings: { ...DEFAULT_RESUME_STATE.layoutSettings, template: tpl.id, brandColor: tpl.accent } }} />
                    : <CoverLetterTemplateRenderer state={{ ...DEFAULT_CL_STATE, layoutSettings: { ...DEFAULT_CL_STATE.layoutSettings, template: tpl.id, brandColor: tpl.accent } }} />
                  }
                </div>
              </div>

              <h3 className="font-bold text-xs text-text-main group-hover:text-brand-accent transition mb-0.5">{tpl.name}</h3>
              <p className="text-[10px] text-text-muted leading-snug">{tpl.desc}</p>

              <div className="mt-2 flex items-center gap-1 text-[10px] text-brand-accent font-semibold opacity-0 group-hover:opacity-100 transition">
                <CheckCircle2 className="w-3.5 h-3.5" /> Use this template
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 border border-border-color hover:bg-card text-xs font-semibold rounded-lg text-text-muted hover:text-text-main transition cursor-pointer">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
