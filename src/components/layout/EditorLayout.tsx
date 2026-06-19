import React, { useState, useCallback, useRef, useEffect, lazy, Suspense, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ResumeForm } from '../ResumeForm';
import { CoverLetterForm } from '../CoverLetterForm';
import { DesignPanel } from '../DesignPanel';
import { DESIGNER_STYLE_DEFAULTS } from '../../config/designerDefaults';
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

const PAGE_HEIGHT_PX = 1123;

/** Wait for lazy-loaded `.pdf-sheet` to mount inside the preview wrapper. */
function usePdfSheet(sheetRef: RefObject<HTMLDivElement | null>): HTMLElement | null {
  const [sheet, setSheet] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = sheetRef.current;
    if (!root) return;

    const sync = () => {
      const next = root.querySelector('.pdf-sheet') as HTMLElement | null;
      setSheet((prev) => (prev === next ? prev : next));
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [sheetRef]);

  return sheet;
}

/**
 * Simulates CSS `break-inside: avoid` in the live editor preview.
 *
 * After every content change it scans every `.group/item` inside the sheet,
 * identifies items that would be sliced by a page boundary, and pushes them
 * down so they start at the top of the next page — exactly as the browser's
 * print engine would do when the user downloads the PDF.
 *
 * Loop-prevention: a 150 ms cooldown prevents the ResizeObserver from
 * triggering a re-run caused by our own `marginTop` adjustments.
 *
 * Adjustments are stored in `data-pb-push` / `data-pb-orig` attributes so
 * the PDF clone can reset them before generating the actual PDF.
 */
function usePreviewPageBreaks(
  sheet: HTMLElement | null,
  zoomScale: number,
): void {
  const zoomRef = useRef(zoomScale);
  useEffect(() => { zoomRef.current = zoomScale; }, [zoomScale]);

  useEffect(() => {
    if (!sheet) return;

    let lastApply = 0;
    let rafId: number | null = null;

    const resetAll = () => {
      sheet.querySelectorAll<HTMLElement>('[data-pb-push]').forEach(el => {
        el.style.marginTop = el.getAttribute('data-pb-orig') ?? '';
        el.removeAttribute('data-pb-push');
        el.removeAttribute('data-pb-orig');
      });
    };

    const applyBreaks = () => {
      lastApply = Date.now();
      resetAll();

      const sheetRect = sheet.getBoundingClientRect();
      const scale = zoomRef.current;

      const items = Array.from(
        sheet.querySelectorAll<HTMLElement>('.group\\/item'),
      ).filter(el => !el.closest('[data-pdf-hide]'));

      for (const el of items) {
        const rect = el.getBoundingClientRect();
        const top    = (rect.top    - sheetRect.top) / scale;
        const bottom = (rect.bottom - sheetRect.top) / scale;
        const boundary = Math.ceil((top + 1) / PAGE_HEIGHT_PX) * PAGE_HEIGHT_PX;

        if (top < boundary && bottom > boundary) {
          const push = boundary - top + 16;
          const currentMT = parseFloat(window.getComputedStyle(el).marginTop) || 0;
          el.setAttribute('data-pb-orig', el.style.marginTop);
          el.setAttribute('data-pb-push', 'true');
          el.style.marginTop = `${currentMT + push}px`;
        }
      }
    };

    const schedule = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (Date.now() - lastApply < 150) return;
        applyBreaks();
      });
    };

    const obs = new ResizeObserver(schedule);
    obs.observe(sheet);
    const initTimer = setTimeout(applyBreaks, 200);
    const fontTimer = setTimeout(applyBreaks, 700);

    return () => {
      obs.disconnect();
      clearTimeout(initTimer);
      clearTimeout(fontTimer);
      if (rafId !== null) cancelAnimationFrame(rafId);
      resetAll();
    };
  }, [sheet, zoomScale]);
}

/** Reserve scroll height when the sheet is CSS-scaled so page 2+ stays visible in preview. */
function useScaledSheetHeight(
  sheet: HTMLElement | null,
  zoomScale: number,
): number | undefined {
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!sheet) return;

    const update = () => {
      setHeight(Math.ceil(sheet.scrollHeight * zoomScale));
    };

    const obs = new ResizeObserver(update);
    obs.observe(sheet);
    update();
    return () => obs.disconnect();
  }, [sheet, zoomScale]);

  return height;
}

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

type ResumeMutations = ReturnType<typeof useResumeMutations>;
type CoverLetterMutations = ReturnType<typeof useCoverLetterMutations>;

interface EditorLayoutProps {
  isResume: boolean;
  resumeState: ResumeState;
  resumeSet: (updater: ResumeState | ((prev: ResumeState) => ResumeState), skipHistory?: boolean) => void;
  resumeCommitHistory: () => void;
  clState: CoverLetterState;
  clSet: (updater: CoverLetterState | ((prev: CoverLetterState) => CoverLetterState), skipHistory?: boolean) => void;
  clCommitHistory: () => void;
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
  designFocusSection: string | null;
  onDesignFocusHandled: () => void;
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
  resumeCommitHistory,
  clState,
  clSet,
  clCommitHistory,
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
  designFocusSection,
  onDesignFocusHandled,
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
