import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { SectionPreviewContent } from './SectionPreview';
import { SECTION_CATALOG } from './sectionCatalog';
import type { LayoutSettings } from '../types';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSections: string[];
  onAddSection: (sectionId: string) => void;
  brandColor?: string;
  skillsStyle?: LayoutSettings['skillsStyle'];
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  activeSections,
  onAddSection,
  brandColor = '#314855',
  skillsStyle = 'chips',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      noPadding
      panelClassName="overflow-hidden my-8"
      overlayClassName="bg-editor/85 overflow-y-auto"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-color/60 flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-text-main">Add a new section</h2>
          <p className="text-xs text-text-muted mt-1">Previews match the Modern Designer template layout</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-text-muted hover:text-text-main hover:bg-card border border-transparent hover:border-border-color rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-none" style={{ maxHeight: 'calc(90vh - 140px)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTION_CATALOG.map((sec) => {
            const isAdded = activeSections.includes(sec.id);
            return (
              <div
                key={sec.id}
                onClick={() => {
                  if (!isAdded) {
                    onAddSection(sec.id);
                    onClose();
                  }
                }}
                className={`border rounded-xl overflow-hidden bg-card/20 group/card relative flex flex-col h-[220px] transition-shadow duration-200 ${
                  isAdded
                    ? 'border-brand-accent/40 bg-brand-accent/5 opacity-80'
                    : 'border-border-color/60 hover:border-brand-accent cursor-pointer hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                <div className="p-3 flex-1 overflow-hidden bg-white group-hover/card:bg-white transition-colors">
                  <SectionPreviewContent
                    sectionId={sec.id}
                    brandColor={brandColor}
                    skillsStyle={skillsStyle}
                  />
                </div>

                <div className="p-3 border-t border-border-color/40 bg-sidebar flex items-center justify-between flex-shrink-0">
                  <div>
                    <h3 className="text-xs font-bold text-text-main">{sec.title}</h3>
                    <p className="text-[10px] text-text-muted mt-0.5">{sec.desc}</p>
                  </div>
                  {isAdded && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Added
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
      </div>
    </Modal>
  );
};
