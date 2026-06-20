import React, { useState, useMemo, useCallback } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import type { TemplateId, ResumeState, CoverLetterState } from '../types';
import { getTemplatesForDocType } from '../config/templates';
import { Modal } from './ui/Modal';
import { TemplateLayoutPreview } from './TemplateLayoutPreview';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
  docType: 'resume' | 'coverletter';
  documentState: ResumeState | CoverLetterState;
}

/** Inner body unmounts when modal closes — draft selection resets on each open (Cancel-safe). */
const TemplatesModalBody: React.FC<Omit<TemplatesModalProps, 'isOpen'>> = ({
  onClose,
  currentTemplate,
  onSelectTemplate,
  docType,
}) => {
  const catalog = useMemo(() => getTemplatesForDocType(docType), [docType]);

  // If the current template isn't valid for this docType, start selection at the first available one.
  const initialTemplate = useMemo(
    () => catalog.find(t => t.id === currentTemplate) ? currentTemplate : catalog[0]?.id ?? currentTemplate,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(initialTemplate);

  const currentTemplateObj = useMemo(
    () => catalog.find((t) => t.id === selectedTemplateId) ?? catalog[0],
    [catalog, selectedTemplateId],
  );

  const handleSelect = useCallback((id: TemplateId) => {
    setSelectedTemplateId(id);
  }, []);

  const handleApply = () => {
    onSelectTemplate(selectedTemplateId);
    onClose();
  };

  const previewAccent = currentTemplateObj.accent;

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-color/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
          <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
            Choose {docType === 'resume' ? 'Resume' : 'Cover Letter'} Template
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

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-1/2 overflow-y-auto p-6 border-r border-border-color/60 space-y-4 scrollbar-none min-h-0">
          <h3 className="text-sm font-bold text-text-main mb-4">Available Layouts</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {catalog.map((t) => {
              const isActive = selectedTemplateId === t.id;
              return (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(t.id);
                    }
                  }}
                  className={`border rounded-xl p-3 cursor-pointer transition-colors relative flex flex-col gap-2 ${
                    isActive
                      ? 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent'
                      : 'border-border-color/60 hover:border-brand-accent/50 bg-card/25 hover:bg-card/45'
                  }`}
                >
                  <div className="h-[72px] rounded-lg overflow-hidden border border-border-color/40 bg-white">
                    <TemplateLayoutPreview templateId={t.id} accent={t.accent} />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-text-main">{t.name}</h4>
                      {t.badge && (
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                          style={{ background: t.accent }}
                        >
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-brand-accent font-semibold">{t.tagline}</p>
                    <p className="text-[10px] text-text-muted leading-relaxed line-clamp-2">{t.desc}</p>
                  </div>

                  <div className="flex items-center justify-between">
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

        <div className="w-1/2 bg-[#dde3ec]/60 overflow-hidden flex items-center justify-center p-6 relative min-h-0">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute top-4 left-6 z-10 bg-white/80 backdrop-blur px-2.5 py-1 rounded-md shadow-sm border border-slate-200">
            Layout Preview
          </div>

          <div className="flex flex-col items-center gap-3">
            <div
              className="bg-white shadow-2xl rounded-sm overflow-hidden select-none w-[320px] h-[452px]"
            >
              <TemplateLayoutPreview templateId={selectedTemplateId} accent={previewAccent} />
            </div>

            <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-black/10"
                style={{ background: previewAccent }}
                aria-hidden
              />
              <span className="text-xs font-bold text-slate-700">{currentTemplateObj.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">{previewAccent}</span>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
};

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  currentTemplate,
  onSelectTemplate,
  docType,
  documentState,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    maxWidth="max-w-6xl"
    noPadding
    panelClassName="overflow-hidden h-[90vh]"
    overlayClassName="bg-editor/85 overflow-hidden"
  >
    {isOpen && (
      <TemplatesModalBody
        key={currentTemplate}
        onClose={onClose}
        currentTemplate={currentTemplate}
        onSelectTemplate={onSelectTemplate}
        docType={docType}
        documentState={documentState}
      />
    )}
  </Modal>
);
