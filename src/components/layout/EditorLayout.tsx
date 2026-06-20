import React, { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ResumeForm } from '../ResumeForm';
import { CoverLetterForm } from '../CoverLetterForm';
import { DesignPanel } from '../DesignPanel';
import { DESIGNER_STYLE_DEFAULTS } from '../../config/designerDefaults';
import { JDPanel } from '../JDPanel';
import { SettingsDropdown } from './SettingsDropdown';

import { usePdfSheet } from '../../hooks/usePdfSheet';
import { usePreviewPageBreaks } from '../../hooks/usePreviewPageBreaks';
import { useScaledSheetHeight } from '../../hooks/useScaledSheetHeight';
import { PAGE_WIDTH_PX, PAGE_HEIGHT_PX } from '../../constants/page';

import type { DocContext, DocumentMutations, PanelState, SheetRefs, AiConfig, AiActions } from '../../types/editor';

const ResumeTemplateRenderer = lazy(() =>
  import('../../templates/ResumeTemplates').then(m => ({ default: m.ResumeTemplateRenderer }))
);
const CoverLetterTemplateRenderer = lazy(() =>
  import('../../templates/CoverLetterTemplates').then(m => ({ default: m.CoverLetterTemplateRenderer }))
);

/**
 * Renders a visual "page gap" at every 1123 px boundary inside .pdf-sheet —
 * a full-sheet-width grey band with paper-edge shadows, exactly like the
 * Google Docs / Word page separator.  All elements carry data-pdf-hide so
 * they are stripped before printing and never appear in the actual PDF.
 *
 * Note: strips are kept to left:0/right:0 (794 px wide) because the
 * EditorLayout wrapper has overflow:hidden which clips wider absolute children.
 */
const PageBreakLabels: React.FC<{ sheet: HTMLElement | null }> = ({ sheet }) => {
  const [breakYs, setBreakYs] = useState<number[]>([]);

  useEffect(() => {
    if (!sheet) return;

    const update = () => {
      const h = sheet.scrollHeight;
      const count = Math.max(0, Math.floor((h - 1) / PAGE_HEIGHT_PX));
      setBreakYs(Array.from({ length: count }, (_, i) => (i + 1) * PAGE_HEIGHT_PX));
    };

    const obs = new ResizeObserver(update);
    obs.observe(sheet);
    update();
    const fontTimer = setTimeout(update, 700);
    return () => {
      obs.disconnect();
      clearTimeout(fontTimer);
    };
  }, [sheet]);

  if (!sheet || breakYs.length === 0) return null;

  return createPortal(
    <>
      {breakYs.map((y, i) => (
        <React.Fragment key={y}>
          {/* ── Page gap strip ─────────────────────────────────────────────────
              Grey band across the full sheet width. Inset shadows simulate the
              bottom edge of page N (top inset) and top edge of page N+1 (bottom
              inset), giving the tactile "separate paper sheets" look. */}
          <div
            data-pdf-hide="true"
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: `${y - 7}px`,
              height: '22px',
              background: '#dde3ec',
              borderTop: '1px solid rgba(0,0,0,0.07)',
              borderBottom: '1px solid rgba(0,0,0,0.07)',
              boxShadow:
                'inset 0 6px 8px -5px rgba(0,0,0,0.22), inset 0 -6px 8px -5px rgba(0,0,0,0.22)',
              zIndex: 50,
            }}
          />
          {/* ── "Page N" label pinned to the bottom-right of the strip ─────── */}
          <div
            data-pdf-hide="true"
            className="absolute right-3 pointer-events-none flex items-center gap-1"
            style={{ top: `${y + 3}px`, zIndex: 51 }}
          >
            <span className="text-[8px] font-bold text-slate-400 select-none uppercase tracking-widest">
              Page {i + 2}
            </span>
          </div>
        </React.Fragment>
      ))}
    </>,
    sheet,
  );
};

// ── Grouped prop interface ────────────────────────────────────────────────────

export interface EditorLayoutProps {
  doc: DocContext;
  mutations: DocumentMutations;
  panel: PanelState;
  sheet: SheetRefs;
  aiConfig: AiConfig;
  aiActions: AiActions;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  doc,
  mutations,
  panel,
  sheet: sheetProps,
  aiConfig,
  aiActions,
}) => {
  const {
    isResume,
    resumeState,
    resumeSet,
    resumeCommitHistory,
    clState,
    clSet,
    clCommitHistory,
  } = doc;

  const { resumeMutations, clMutations } = mutations;

  const { sidebarOpen, zoomScale, rightTab, setRightTab, rightPanelOpen, setRightPanelOpen } = panel;

  const {
    sheetRef,
    sheetOverflow,
    designFocusSection,
    onDesignFocusHandled,
    showSettings,
  } = sheetProps;

  const { geminiKey, onGeminiKeyChange, onSaveGeminiKey, isOnline, aiLoading } = aiConfig;

  const { onImproveBullet, jobDescription, onJdChange, docText, onInjectKeyword, onAiTailor } =
    aiActions;

  const [leftWidth, setLeftWidth] = useState(380);
  const [rightWidth, setRightWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const resizeCleanupRef = useRef<(() => void) | null>(null);

  const pdfSheet = usePdfSheet(sheetRef);

  // Simulate print-style page breaks in the live preview
  usePreviewPageBreaks(pdfSheet, zoomScale);
  const scaledSheetHeight = useScaledSheetHeight(pdfSheet, zoomScale);

  useEffect(() => {
    return () => {
      resizeCleanupRef.current?.();
      resizeCleanupRef.current = null;
    };
  }, []);

  const startResizeLeft = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    resizeCleanupRef.current?.();
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
      resizeCleanupRef.current = null;
    };

    resizeCleanupRef.current = stopResize;
    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  }, [leftWidth]);

  const startResizeRight = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    resizeCleanupRef.current?.();
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
      resizeCleanupRef.current = null;
    };

    resizeCleanupRef.current = stopResize;
    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  }, [rightWidth]);

  return (
    <div className="flex-1 flex overflow-hidden relative min-h-0">
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
          className="flex-shrink-0 border-r border-border-color/60 bg-sidebar flex flex-col overflow-hidden min-h-0 h-full"
        >
          {isResume ? (
            <ResumeForm
              state={resumeState}
              onChange={resumeSet}
              onCommit={resumeCommitHistory}
              onImproveBullet={onImproveBullet}
              aiLoading={aiLoading}
              isOnline={isOnline}
              geminiKey={geminiKey}
            />
          ) : (
            <CoverLetterForm
              state={clState}
              onChange={clSet}
              onCommit={clCommitHistory}
              geminiKey={geminiKey}
            />
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
          <div style={{ height: scaledSheetHeight }}>
            <div
              ref={sheetRef}
              style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center', transition: 'transform 0.25s ease-out' }}
              className={`flex justify-center${sheetOverflow ? ' sheet-overflow-active' : ''}`}
            >
              <Suspense fallback={<div style={{ width: PAGE_WIDTH_PX, height: PAGE_HEIGHT_PX }} className="bg-white animate-pulse rounded shadow-xl" />}>
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
          {/* Multi-page break labels rendered as portal inside pdf-sheet */}
          <PageBreakLabels sheet={pdfSheet} />
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
        className={`flex-shrink-0 bg-sidebar flex flex-col overflow-hidden relative min-h-0 h-full ${rightPanelOpen ? 'border-l border-border-color/60' : 'border-transparent'}`}
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
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {isResume ? (
              <DesignPanel
                layout={resumeState.layoutSettings}
                onChange={patch => resumeSet(p => ({ ...p, layoutSettings: { ...p.layoutSettings, ...patch } }))}
                docType="resume"
                focusSection={designFocusSection}
                onFocusHandled={onDesignFocusHandled}
                onReset={() => resumeSet(p => ({
                  ...p,
                  layoutSettings: { ...p.layoutSettings, ...DESIGNER_STYLE_DEFAULTS },
                }))}
              />
            ) : (
              <DesignPanel
                layout={clState.layoutSettings}
                onChange={patch => clSet(p => ({ ...p, layoutSettings: { ...p.layoutSettings, ...patch } }))}
                docType="coverletter"
                focusSection={designFocusSection}
                onFocusHandled={onDesignFocusHandled}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
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
