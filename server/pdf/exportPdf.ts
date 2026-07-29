import { mkdir, copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';
import type { CoverLetterState, ResumeState } from '../../src/types';
import { contentDensityReport } from '../contentGuard';
import { sanitizeCoverLetterForExport, sanitizeResumeForExport } from '../sanitize';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Restore Sakshi master headshot if tailor/composer cleared avatar. */
async function ensurePhoto<T extends { avatar?: string; layoutSettings?: Record<string, unknown> }>(
  doc: T,
  masterPath: string,
): Promise<T> {
  const avatarOk = typeof doc.avatar === 'string' && doc.avatar.length > 100;
  if (avatarOk && doc.layoutSettings?.showPhoto !== false) {
    return {
      ...doc,
      layoutSettings: { ...(doc.layoutSettings || {}), showPhoto: true },
    };
  }
  try {
    const master = JSON.parse(await readFile(masterPath, 'utf8')) as {
      avatar?: string;
      layoutSettings?: Record<string, unknown>;
    };
    if (!master.avatar || master.avatar.length < 100) return doc;
    return {
      ...doc,
      avatar: master.avatar,
      layoutSettings: {
        ...(doc.layoutSettings || {}),
        ...(master.layoutSettings || {}),
        showPhoto: true,
      },
    };
  } catch {
    return { ...doc, layoutSettings: { ...(doc.layoutSettings || {}), showPhoto: true } };
  }
}

type PrintPayload =
  | { type: 'resume'; state: ResumeState }
  | { type: 'coverLetter'; state: CoverLetterState };

let sharedServer: ViteDevServer | null = null;
let sharedBrowser: Browser | null = null;

async function getPrintServer(): Promise<string> {
  const envUrl = process.env.RESUME_PRINT_URL?.replace(/\/$/, '');
  if (envUrl) return envUrl;

  if (!sharedServer) {
    sharedServer = await createServer({
      root: ROOT,
      configFile: path.join(ROOT, 'vite.config.ts'),
      server: { port: 5199, strictPort: false, host: '127.0.0.1' },
      logLevel: 'error',
    });
    await sharedServer.listen();
  }
  const urls = sharedServer.resolvedUrls?.local;
  return (urls?.[0] || 'http://127.0.0.1:5199').replace(/\/$/, '');
}

async function getBrowser(): Promise<Browser> {
  if (!sharedBrowser) {
    sharedBrowser = await chromium.launch({ headless: true });
  }
  return sharedBrowser;
}

/** Prepare DOM like the website print iframe: sheet fills A4, no centered gutters. */
async function prepareSheetForPdf(page: import('playwright').Page): Promise<void> {
  await page.evaluate(() => {
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.background = '#fff';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = '#fff';
    document.body.style.display = 'block';

    const sheet = document.querySelector('.pdf-sheet') as HTMLElement | null;
    if (!sheet) return;
    sheet.classList.remove('mx-auto', 'shadow-none');
    sheet.style.margin = '0';
    sheet.style.boxShadow = 'none';
    sheet.style.width = '210mm';
    sheet.style.minHeight = '0';
    sheet.style.maxWidth = '210mm';
    sheet.style.boxSizing = 'border-box';
    sheet.style.overflowX = 'hidden';
    // Match golden Product Resume density (headless otherwise lands ~40px over A4).
    sheet.style.lineHeight = '1.15';
    const padX = getComputedStyle(sheet).paddingLeft;
    const padT = getComputedStyle(sheet).paddingTop;
    sheet.style.paddingTop = padT;
    sheet.style.paddingBottom = '8px';
    sheet.style.paddingLeft = padX;
    sheet.style.paddingRight = padX;
    sheet.querySelectorAll<HTMLElement>('[data-skills-grid]').forEach((el) => {
      el.style.display = 'flex';
      el.style.flexWrap = 'wrap';
      el.style.justifyContent = 'flex-start';
      el.style.columnGap = '17.8pt';
      el.style.rowGap = '8.5pt';
      el.style.width = '100%';
      el.style.maxWidth = '100%';
    });
    sheet.querySelectorAll<HTMLElement>('[data-skill-grid-item]').forEach((el) => {
      el.style.flex = '0 0 auto';
    });
    sheet.querySelectorAll<HTMLElement>('svg.profile-photo-waves, svg.profile-photo-frame').forEach((svg) => {
      svg.style.display = 'none';
    });
    sheet.querySelectorAll<HTMLElement>('[style*="font-size"]').forEach((el) => {
      const fs = el.style.fontSize || '';
      if (/^7\./.test(fs) || fs.includes('7.61') || fs.includes('7.6') || fs.includes('7pt') || fs.includes('8.88') || fs.includes('9.5')) {
        el.style.lineHeight = '1.1';
      }
    });
    // Allow last-column blocks to fragment so a few leftover px don't force page 2.
    sheet.querySelectorAll<HTMLElement>('.group\\/item, ul > li').forEach((el) => {
      el.style.breakInside = 'auto';
      el.style.pageBreakInside = 'auto';
    });
  });
}

async function renderSitePdf(payload: PrintPayload, outPath: string): Promise<void> {
  const base = await getPrintServer();
  const browser = await getBrowser();
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 }, // A4 @ 96dpi
    deviceScaleFactor: 1,
  });
  try {
    await page.addInitScript((p) => {
      (window as unknown as { __PRINT_PAYLOAD__: PrintPayload }).__PRINT_PAYLOAD__ = p;
    }, payload);

    await page.goto(`${base}/print.html`, { waitUntil: 'networkidle', timeout: 120000 });
    await page.waitForSelector('[data-print-ready="true"]', { timeout: 60000 });

    // Prefer the same cloned print HTML as the Download button (float transform etc.)
    const hasBuilder = await page.evaluate(
      () => typeof (window as unknown as { __getPrintHtml__?: unknown }).__getPrintHtml__ === 'function',
    );
    if (hasBuilder) {
      const html = await page.evaluate(() => {
        const fn = (window as unknown as { __getPrintHtml__: (t?: string) => string }).__getPrintHtml__;
        return fn('document');
      });
      await page.setContent(html, { waitUntil: 'networkidle', timeout: 120000 });
      await page.waitForTimeout(250);
    }

    await prepareSheetForPdf(page);
    await page.waitForTimeout(100);

    await mkdir(path.dirname(outPath), { recursive: true });
    await page.pdf({
      path: outPath,
      width: '210mm',
      height: '297mm',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: false,
    });
  } finally {
    await page.close();
  }
}

export async function exportDesignerPdfs(opts: {
  resume: ResumeState;
  coverLetter: CoverLetterState;
  outputDir: string;
  resumeFileName?: string;
  coverLetterFileName?: string;
  /** If set, copy this file as resume.pdf instead of re-rendering (pixel-identical to website export). */
  masterResumePdfPath?: string;
  /** If set, copy this file as cover_letter.pdf instead of re-rendering. */
  masterCoverLetterPdfPath?: string;
  /** Skip layout lock (debug only). Default always locks Sakshi master layout. */
  skipLayoutLock?: boolean;
}): Promise<{ resumePdf: string; coverLetterPdf: string }> {
  const masterResumeJson =
    process.env.MASTER_RESUME_JSON ||
    path.resolve(
      ROOT,
      '../../N8N workflow for Automation/applications/master/sakshi-resume.json',
    );
  const masterClJson =
    process.env.MASTER_COVER_LETTER_JSON ||
    path.resolve(
      ROOT,
      '../../N8N workflow for Automation/applications/master/sakshi-cover-letter.json',
    );

  let resumeState = await ensurePhoto(opts.resume, masterResumeJson);
  let coverLetterState = await ensurePhoto(opts.coverLetter, masterClJson);

  const resume = opts.skipLayoutLock ? resumeState : sanitizeResumeForExport(resumeState);
  const coverLetter = opts.skipLayoutLock
    ? coverLetterState
    : sanitizeCoverLetterForExport(coverLetterState);

  const densityNotes = contentDensityReport(resume, coverLetter);
  if (densityNotes.length) {
    console.warn(
      '[contentGuard] export density warning (tailor should have restored denser text):',
      densityNotes.join('; '),
    );
  }

  const resumePdf = path.join(opts.outputDir, opts.resumeFileName || 'resume.pdf');
  const coverLetterPdf = path.join(opts.outputDir, opts.coverLetterFileName || 'cover_letter.pdf');
  await mkdir(opts.outputDir, { recursive: true });

  if (opts.masterResumePdfPath) {
    await copyFile(opts.masterResumePdfPath, resumePdf);
  } else {
    await renderSitePdf({ type: 'resume', state: resume }, resumePdf);
  }

  if (opts.masterCoverLetterPdfPath) {
    await copyFile(opts.masterCoverLetterPdfPath, coverLetterPdf);
  } else {
    await renderSitePdf({ type: 'coverLetter', state: coverLetter }, coverLetterPdf);
  }

  return { resumePdf, coverLetterPdf };
}

export async function closePdfRuntime(): Promise<void> {
  if (sharedBrowser) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
  if (sharedServer) {
    await sharedServer.close();
    sharedServer = null;
  }
}
