import React, { useState, useCallback, lazy, Suspense, type RefObject } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ResumeForm } from '../ResumeForm';
import { CoverLetterForm } from '../CoverLetterForm';
import { DesignPanel } from '../DesignPanel';
import { JDPanel } from '../JDPanel';
import { SettingsDropdown } from './SettingsDropdown';

import type { ResumeState, CoverLetterState } from '../../types';
import type { useResumeMutations } from '../../hooks/useResumeMutations';
import type { useCoverLetterMutations } from '../../hooks/useCoverLetterMutations';

const ResumeTemplateRenderer = lazy(() =>
  import('../../templates/ResumeTemplates').then(m => ({ default: m.ResumeTemplateRenderer }))
);
const CoverLetterTemplateRenderer = lazy(() =>
  import('../../templates/CoverLetterTemplates').then(m => ({ default: m.CoverLetterTemplateRenderer }))
);

type ResumeMutations = ReturnType<typeof useResumeMutations>;
type CoverLetterMutations = ReturnType<typeof useCoverLetterMutations>;

interface EditorLayoutProps {
  isResume: boolean;
  resumeState: ResumeState;
  resumeSet: (updater: ResumeState | ((prev: ResumeState) => ResumeState), skipHistory?: boolean) => void;
  clState: CoverLetterState;
  clSet: (updater: CoverLetterState | ((prev: CoverLetterState) => CoverLetterState), skipHistory?: boolean) => void;
  resumeMutations: ResumeMutations;
  clMutations: CoverLetterMutations;
  sidebarOpen: boolean;
  zoomScale: number;
  sheetRef: RefObject<HTMLDivElement | null>;
  sheetOverflow: boolean;
  rightTab: 'design' | 'ats';
  setRightTab: (tab: 'design' | 'ats') => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showSettings: boolean;
  geminiKey: string;
  onGeminiKeyChange: (v: string) => void;
  onSaveGeminiKey: (e: React.FormEvent) => void;
  isOnline: boolean;
  onImproveBullet: (idx: number, currentText: string) => Promise<void>;
  aiLoading: boolean;
  jobDescription: string;
  onJdChange: (text: string) => void;
  docText: string;
  onInjectKeyword: (kw: string) => Promise<void>;
  onAiTailor: () => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  isResume,
  resumeState,
  resumeSet,
  clState,
  clSet,
  resumeMutations,
  clMutations,
  sidebarOpen,
  zoomScale,
  sheetRef,
  sheetOverflow,
  rightTab,
  setRightTab,
  rightPanelOpen,
  setRightPanelOpen,
  showSettings,
  geminiKey,
  onGeminiKeyChange,
  onSaveGeminiKey,
  isOnline,
  onImproveBullet,
  aiLoading,
  jobDescription,
  onJdChange,
  docText,
  onInjectKeyword,
  onAiTailor,
}) => {
  const [leftWidth, setLeftWidth] = useState(380);
  const [rightWidth, setRightWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const startResizeLeft = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
    const startX = mouseDownEvent.clientX;
    const startWidth = leftWidth;

    const doResize = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      const newWidth = Math.max(280, Math.min(550, startWidth + deltaX));
      setLeftWidth(newWidth);
    };

    const stopResize = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };

    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  }, [leftWidth]);

  const startResizeRight = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
    const startX = mouseDownEvent.clientX;
    const startWidth = rightWidth;

    const doResize = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      const newWidth = Math.max(260, Math.min(500, startWidth - deltaX));
      setRightWidth(newWidth);
    };

    const stopResize = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };

    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  }, [rightWidth]);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {showSettings && (
        <SettingsDropdown
          geminiKey={geminiKey}
          onChange={onGeminiKeyChange}
          onSave={onSaveGeminiKey}
        />
      )}

      {sidebarOpen && (
        <aside
          style={{ width: `${leftWidth}px` }}
          className="flex-shrink-0 border-r border-border-color/60 bg-sidebar flex flex-col overflow-hidden"
        >
          {isResume ? (
            <ResumeForm
              state={resumeState}
              onChange={resumeSet}
              onImproveBullet={onImproveBullet}
              aiLoading={aiLoading}
              isOnline={isOnline}
              geminiKey={geminiKey}
            />
          ) : (
            <CoverLetterForm state={clState} onChange={clSet} />
          )}
        </aside>
      )}

      {sidebarOpen && (
        <div
          onMouseDown={startResizeLeft}
          className="w-[4px] hover:w-[6px] h-full cursor-col-resize bg-border-color/10 hover:bg-brand-accent/50 transition-colors flex-shrink-0 z-40 relative select-none"
          title="Drag to resize panel"
        />
      )}

      <section className="flex-1 min-h-0 relative flex flex-col bg-[#dde3ec]">
        <div className="sheet-preview-container flex-1 w-full relative">
          <div
            ref={sheetRef}
            style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center', transition: 'transform 0.25s ease-out' }}
            className={`flex justify-center${sheetOverflow ? ' sheet-overflow-active' : ''}`}
          >
            <Suspense fallback={<div className="w-[794px] h-[1123px] bg-white animate-pulse rounded shadow-xl" />}>
              {isResume ? (
                <ResumeTemplateRenderer
                  state={resumeState}
                  isEditable
                  {...resumeMutations}
                />
              ) : (
                <CoverLetterTemplateRenderer
                  state={clState}
                  isEditable
                  {...clMutations}
                />
              )}
            </Suspense>
          </div>
        </div>
      </section>

      {rightPanelOpen && (
        <div
          onMouseDown={startResizeRight}
          className="w-[4px] hover:w-[6px] h-full cursor-col-resize bg-border-color/10 hover:bg-brand-accent/50 transition-colors flex-shrink-0 z-40 relative select-none"
          title="Drag to resize panel"
        />
      )}

      <motion.aside
        animate={{ width: rightPanelOpen ? rightWidth : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`flex-shrink-0 bg-sidebar flex flex-col overflow-hidden relative ${rightPanelOpen ? 'border-l border-border-color/60' : 'border-transparent'}`}
      >
        <div className="flex border-b border-border-color/60 flex-shrink-0">
          <button
            onClick={() => setRightTab('design')}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${rightTab === 'design' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-text-muted hover:text-text-main'}`}
          >
            Design
          </button>
          <button
            onClick={() => setRightTab('ats')}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${rightTab === 'ats' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-text-muted hover:text-text-main'}`}
          >
            ATS &amp; AI
          </button>
        </div>

        {rightTab === 'design' ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            {isResume ? (
              <DesignPanel
                layout={resumeState.layoutSettings}
                onChange={patch => resumeSet(p => ({ ...p, layoutSettings: { ...p.layoutSettings, ...patch } }))}
                docType="resume"
              />
            ) : (
              <DesignPanel
                layout={clState.layoutSettings}
                onChange={patch => clSet(p => ({ ...p, layoutSettings: { ...p.layoutSettings, ...patch } }))}
                docType="coverletter"
              />
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <JDPanel
              jobDescription={jobDescription}
              onJdChange={onJdChange}
              docText={docText}
              onInjectKeyword={onInjectKeyword}
              aiLoading={aiLoading}
              onAiTailor={onAiTailor}
              isOnline={isOnline}
              geminiKey={geminiKey}
            />
          </div>
        )}
      </motion.aside>

      <button
        onClick={() => setRightPanelOpen(p => !p)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full border border-border-color/60 bg-sidebar text-text-muted hover:text-text-main flex items-center justify-center shadow-md cursor-pointer z-50 hover:bg-brand-accent hover:text-editor transition-all"
        style={{
          right: rightPanelOpen ? `${rightWidth}px` : '0px',
          transition: isResizing ? 'none' : 'right 0.2s ease-out',
        }}
        title={rightPanelOpen ? 'Close panel' : 'Open panel'}
      >
        {rightPanelOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
