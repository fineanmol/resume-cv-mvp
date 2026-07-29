import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import type { CoverLetterState, ResumeState } from './types';
import { ResumeTemplateRenderer } from './templates/resume/ResumeTemplateRenderer';
import { CoverLetterTemplateRenderer } from './templates/CoverLetterTemplates';
import { buildPrintHtml } from './services/pdf/buildPrintHtml';

type PrintPayload =
  | { type: 'resume'; state: ResumeState }
  | { type: 'coverLetter'; state: CoverLetterState };

declare global {
  interface Window {
    __PRINT_PAYLOAD__?: PrintPayload;
    /** Same HTML the website Download PDF button prints — used by Playwright export. */
    __getPrintHtml__?: (title?: string) => string;
  }
}

function PrintApp() {
  const [payload, setPayload] = useState<PrintPayload | null>(
    () => window.__PRINT_PAYLOAD__ ?? null,
  );

  useEffect(() => {
    if (payload) return;
    const id = window.setInterval(() => {
      if (window.__PRINT_PAYLOAD__) {
        setPayload(window.__PRINT_PAYLOAD__);
        window.clearInterval(id);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [payload]);

  useEffect(() => {
    if (!payload) return;
    let cancelled = false;

    const ready = async () => {
      await document.fonts.ready;
      const deadline = Date.now() + 15000;
      while (!cancelled && Date.now() < deadline) {
        const sheet = document.querySelector('.pdf-sheet');
        const gridReady =
          payload.type !== 'resume' ||
          !!document.querySelector('[data-testid="designer-column-grid"]');
        if (sheet instanceof HTMLElement && gridReady) {
          window.__getPrintHtml__ = (title = 'Resume') => buildPrintHtml(sheet, title);
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          if (!cancelled) {
            document.documentElement.setAttribute('data-print-ready', 'true');
            document.body.setAttribute('data-print-ready', 'true');
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 50));
      }
    };

    void ready();
    return () => {
      cancelled = true;
    };
  }, [payload]);

  if (!payload) {
    return <div data-print-status="waiting">Waiting for print payload…</div>;
  }

  // Wrapper must NOT use .pdf-sheet — templates already render one.
  // Nesting two .pdf-sheet nodes doubles CSS padding (40/50px + layout mm) and
  // breaks margins vs the website Download path.
  if (payload.type === 'resume') {
    return (
      <div data-testid="print-resume">
        <ResumeTemplateRenderer state={payload.state} isEditable={false} />
      </div>
    );
  }

  return (
    <div data-testid="print-cover-letter">
      <CoverLetterTemplateRenderer state={payload.state} isEditable={false} />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrintApp />
  </StrictMode>,
);
