import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { ResumeTemplateRenderer } from '../templates/ResumeTemplates';
import { CoverLetterTemplateRenderer } from '../templates/CoverLetterTemplates';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';
import { DEFAULT_CL_STATE } from '../config/defaultCL';

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: 'navy' | 'serif' | 'sidebar' | 'tech') => void;
  docType: 'resume' | 'coverletter';
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  docType
}) => {
  if (!isOpen) return null;

  const templates = [
    {
      id: 'navy' as const,
      name: 'Navy Elegant',
      desc: 'Top header border with centered typography. Professional standard.',
      color: 'border-t-4 border-t-[#314855]'
    },
    {
      id: 'serif' as const,
      name: 'Harvard Serif',
      desc: 'Elegant, timeless serif layout. Excellent for academia & executive roles.',
      color: 'border-t-4 border-t-[#1e293b]'
    },
    {
      id: 'sidebar' as const,
      name: 'Creative Sidebar',
      desc: 'Two-column design with a distinct contact & competencies sidebar.',
      color: 'border-t-4 border-t-[#5cc3e8]'
    },
    {
      id: 'tech' as const,
      name: 'Tech Monospace',
      desc: 'Modern, code-inspired spacing with developer console tags.',
      color: 'border-t-4 border-t-[#10b981]'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-editor/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl bg-sidebar border border-border-color rounded-2xl shadow-2xl p-6 relative flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-1.5 text-text-muted hover:text-text-main hover:bg-card border border-transparent hover:border-border-color rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <div className="text-xs font-bold text-brand-accent flex items-center gap-1.5 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
            Pick Layout Style
          </div>
          <h2 className="text-xl font-bold text-text-main">
            Select {docType === 'resume' ? 'Resume' : 'Cover Letter'} Template
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Choose a visual preset to start building. You can easily adjust sliders and switch templates in the editor workspace at any time.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => onSelect(tpl.id)}
              className={`bg-card/30 hover:bg-card/75 border border-border-color/60 hover:border-brand-accent/50 rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative ${tpl.color}`}
            >
              <div>
                <h3 className="font-bold text-sm text-text-main group-hover:text-brand-accent transition mb-1">
                  {tpl.name}
                </h3>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  {tpl.desc}
                </p>
              </div>

              {/* Scaled visual layout representation */}
              <div className="mt-4 flex justify-center border border-border-color/40 bg-input-bg/50 rounded-lg p-4 select-none opacity-90 group-hover:opacity-100 transition overflow-hidden h-60 items-center">
                <div className="w-[159px] h-[225px] relative overflow-hidden bg-white shadow-md border border-border-color/60 rounded-md pointer-events-none select-none">
                  <div className="origin-top-left scale-[0.2] w-[794px] h-[1123px]">
                    {docType === 'resume' ? (
                      <ResumeTemplateRenderer
                        state={{
                          ...DEFAULT_RESUME_STATE,
                          layoutSettings: { ...DEFAULT_RESUME_STATE.layoutSettings, template: tpl.id }
                        }}
                      />
                    ) : (
                      <CoverLetterTemplateRenderer
                        state={{
                          ...DEFAULT_CL_STATE,
                          layoutSettings: { ...DEFAULT_CL_STATE.layoutSettings, template: tpl.id }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border-color hover:bg-card text-xs font-semibold rounded-lg text-text-muted hover:text-text-main transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
