import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PdfService, sanitizeCssOklch } from '../services/pdf';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSheet(inner = ''): HTMLElement {
  const div = document.createElement('div');
  div.className = 'pdf-sheet';
  div.id = 'resume-sheet';
  div.innerHTML = inner;
  document.body.appendChild(div);
  return div;
}

// ── sanitizeCssOklch ─────────────────────────────────────────────────────────

describe('sanitizeCssOklch', () => {
  it('strips oklch from CSS text', () => {
    const input = '.foo { color: oklch(0.6 0.2 240); background: oklch(50% 0.1 180 / 0.5); }';
    const output = sanitizeCssOklch(input);
    expect(output).not.toMatch(/oklch|oklab|color-mix/i);
    expect(output).toContain('.foo');
  });

  it('strips nested color-mix(in oklch, …) from CSS text', () => {
    const input = '.bar { color: color-mix(in oklch, oklch(0.6 0.2 240) 50%, transparent); }';
    const output = sanitizeCssOklch(input);
    expect(output).not.toMatch(/oklch|oklab|color-mix/i);
    expect(output).toContain('.bar');
  });

  it('passes through plain rgb/hex values unchanged', () => {
    const input = '.a { color: rgb(10, 20, 30); background: #abc; }';
    expect(sanitizeCssOklch(input)).toBe(input);
  });
});

// ── downloadPdf (iframe+print approach) ──────────────────────────────────────

describe('PdfService.downloadPdf', () => {
  let printSpy: ReturnType<typeof vi.fn>;
  let iframeWriteSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Stub iframe contentWindow.print and document.write
    printSpy = vi.fn();
    iframeWriteSpy = vi.fn();

    // Override createElement to intercept iframe creation
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string, ...args) => {
      const el = realCreate(tag, ...args as [ElementCreationOptions?]);
      if (tag === 'iframe') {
        Object.defineProperty(el, 'contentDocument', {
          get: () => ({
            open: vi.fn(),
            write: iframeWriteSpy,
            close: vi.fn(),
          }),
          configurable: true,
        });
        Object.defineProperty(el, 'contentWindow', {
          get: () => ({
            print: printSpy,
            focus: vi.fn(),
            document: {
              open: vi.fn(),
              write: iframeWriteSpy,
              close: vi.fn(),
            },
            addEventListener: (ev: string, cb: () => void) => {
              if (ev === 'load') setTimeout(cb, 0);
            },
          }),
          configurable: true,
        });
      }
      return el;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll('.pdf-sheet').forEach(el => el.remove());
  });

  it('calls window.print() on the iframe', async () => {
    const sheet = makeSheet('<h1>Test Resume</h1>');
    await PdfService.downloadPdf(sheet, 'test.pdf');
    expect(printSpy).toHaveBeenCalled();
  });

  it('writes the sheet HTML into the iframe document', async () => {
    const sheet = makeSheet('<p>Content</p>');
    await PdfService.downloadPdf(sheet, 'test.pdf');
    const written = (iframeWriteSpy.mock.calls[0]?.[0] ?? '') as string;
    expect(written).toContain('pdf-sheet');
    expect(written).toContain('Content');
  });

  it('strips edit-only elements from the printed HTML', async () => {
    const sheet = makeSheet('<button class="edit-only">+</button><span>Skill</span>');
    await PdfService.downloadPdf(sheet, 'test.pdf');
    const written = (iframeWriteSpy.mock.calls[0]?.[0] ?? '') as string;
    expect(written).not.toContain('edit-only');
    expect(written).toContain('Skill');
  });

  it('removes contenteditable attributes from the printed HTML', async () => {
    const sheet = makeSheet('<span contenteditable="true">Text</span>');
    await PdfService.downloadPdf(sheet, 'test.pdf');
    const written = (iframeWriteSpy.mock.calls[0]?.[0] ?? '') as string;
    expect(written).not.toContain('contenteditable');
    expect(written).toContain('Text');
  });

  it('preserves profile photo decorative SVGs in the printed HTML', async () => {
    const inner = `
      <svg class="profile-photo-frame pdf-keep" data-pdf-keep></svg>
      <svg class="profile-photo-waves pdf-keep" data-pdf-keep></svg>
    `;
    const sheet = makeSheet(inner);
    await PdfService.downloadPdf(sheet, 'test.pdf');
    const written = (iframeWriteSpy.mock.calls[0]?.[0] ?? '') as string;
    expect(written).toContain('profile-photo-frame');
    expect(written).toContain('profile-photo-waves');
  });

  it('includes @page { size: A4; margin: 0 } in the injected styles', async () => {
    const sheet = makeSheet('<p>hi</p>');
    await PdfService.downloadPdf(sheet, 'test.pdf');
    const written = (iframeWriteSpy.mock.calls[0]?.[0] ?? '') as string;
    expect(written).toMatch(/@page/);
    expect(written).toContain('210mm');
  });
});

// ── extractFirstPhoto (unchanged) ────────────────────────────────────────────

describe('PdfService.extractFirstPhoto', () => {
  it('returns null for an empty/non-PDF file without crashing', async () => {
    const file = new File(['not a pdf'], 'test.txt', { type: 'text/plain' });
    const result = await PdfService.extractFirstPhoto(file);
    expect(result).toBeNull();
  });
});
