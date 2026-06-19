import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { ResumeTemplateRenderer } from '../templates/ResumeTemplates';
import { CoverLetterTemplateRenderer } from '../templates/CoverLetterTemplates';
import type { TemplateId } from '../types';
import { TEMPLATE_CATALOG } from '../config/templates';
import { Modal } from './ui/Modal';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
  docType: 'resume' | 'coverletter';
  documentState: any; // ResumeState or CoverLetterState
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  currentTemplate,
  onSelectTemplate,
  docType,
  documentState,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(currentTemplate);

  const currentTemplateObj = TEMPLATE_CATALOG.find(t => t.id === selectedTemplateId) || TEMPLATE_CATALOG[0];

  const previewState = {
    ...documentState,
    layoutSettings: {
      ...documentState.layoutSettings,
      template: selectedTemplateId,
      brandColor: currentTemplateObj.accent,
    }
  };

  const handleApply = () => {
    onSelectTemplate(selectedTemplateId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-6xl"
      noPadding
      panelClassName="overflow-hidden h-[90vh]"
      overlayClassName="bg-editor/85 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-color/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
          <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
            Choose Resume Template
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-text-muted hover:text-text-main hover:bg-card border border-transparent hover:border-border-color rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Two-Pane Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - Templates Grid list */}
        <div className="w-1/2 overflow-y-auto p-6 border-r border-border-color/60 space-y-4 scrollbar-none">
          <h3 className="text-sm font-bold text-text-main mb-4">Available Layouts</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TEMPLATE_CATALOG.map((t) => {
              const isActive = selectedTemplateId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 relative flex flex-col justify-between h-[130px] ${
                    isActive
                      ? 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent'
                      : 'border-border-color/60 hover:border-brand-accent/50 bg-card/25 hover:bg-card/45'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-text-main">{t.name}</h4>
                      {t.badge && (
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white"
                          style={{ background: t.accent }}
                        >
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-brand-accent font-semibold">{t.tagline}</p>
                    <p className="text-[10px] text-text-muted leading-relaxed line-clamp-2">{t.desc}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.accent }} />
                      <span className="text-[9px] text-text-muted font-mono">{t.accent}</span>
                    </div>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-brand-accent" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane - Full-fledged Live A4 Preview */}
        <div className="w-1/2 bg-[#dde3ec]/60 overflow-hidden flex items-center justify-center p-6 relative">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute top-4 left-6 z-10 bg-white/80 backdrop-blur px-2.5 py-1 rounded-md shadow-sm border border-slate-200">
            Live Preview
          </div>

          <div
            className="bg-white shadow-2xl rounded-sm overflow-hidden select-none origin-center"
            style={{ width: 437, height: 618 }}
          >
            <div className="origin-top-left scale-[0.55] w-[794px] h-[1123px]">
              {docType === 'resume' ? (
                <ResumeTemplateRenderer state={previewState} />
              ) : (
                <CoverLetterTemplateRenderer state={previewState} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-border-color/60 bg-sidebar flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-border-color hover:bg-card text-xs font-semibold rounded-lg text-text-muted hover:text-text-main transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover text-editor font-bold rounded-lg text-xs transition cursor-pointer"
        >
          Apply Template
        </button>
      </div>
    </Modal>
  );
};
