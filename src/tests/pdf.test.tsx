import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PdfService, sanitizeCssOklch } from '../services/pdf';

type MockPdfChain = {
  then: (cb: () => void) => MockPdfChain;
  catch: () => MockPdfChain;
};

const mockFrom = vi.fn().mockReturnThis();
const mockSet = vi.fn().mockReturnThis();
const mockSave = vi.fn().mockImplementation(function (this: MockPdfChain) {
  return this;
});
const mockThen = vi.fn().mockImplementation(function (this: MockPdfChain, cb: () => void) {
  cb();
  return this;
});
const mockCatch = vi.fn().mockReturnThis();

const mockHtml2Pdf = vi.fn().mockImplementation(() => {
  return {
    set: mockSet,
    from: mockFrom,
    save: mockSave,
    then: mockThen,
    catch: mockCatch
  };
});

vi.mock('html2pdf.js', () => {
  return {
    default: () => mockHtml2Pdf()
  };
});

describe('PdfService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('strips oklch from CSS text', () => {
    const input = '.foo { color: oklch(0.6 0.2 240); background: oklch(50% 0.1 180 / 0.5); }';
    const output = sanitizeCssOklch(input);
    expect(output).not.toMatch(/oklch|oklab/i);
    expect(output).toContain('.foo');
  });

  it('resolves SVG currentColor attributes on the PDF clone', async () => {
    const originalDiv = document.createElement('div');
    originalDiv.className = 'pdf-sheet';
    originalDiv.style.color = 'oklch(0.6 0.2 240)';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'lucide');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', 'currentColor');
    svg.appendChild(path);
    originalDiv.appendChild(svg);

    document.body.appendChild(originalDiv);
    await PdfService.downloadPdf(originalDiv, 'svg.pdf');

    const clonedElement = mockFrom.mock.calls[0][0] as HTMLElement;
    const clonedPath = clonedElement.querySelector('path');
    expect(clonedPath?.getAttribute('stroke')).toBeTruthy();
    expect(clonedPath?.getAttribute('stroke')).not.toMatch(/oklch|currentColor/i);

    document.body.removeChild(originalDiv);
  });

  it('preserves profile photo decorative SVG in PDF clone', async () => {
    const originalDiv = document.createElement('div');
    originalDiv.className = 'pdf-sheet';

    const frame = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    frame.setAttribute('class', 'profile-photo-frame pdf-keep');
    frame.setAttribute('data-pdf-keep', '');
    originalDiv.appendChild(frame);

    const waves = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    waves.setAttribute('class', 'profile-photo-waves pdf-keep');
    originalDiv.appendChild(waves);

    document.body.appendChild(originalDiv);
    await PdfService.downloadPdf(originalDiv, 'test_output.pdf');

    const clonedElement = mockFrom.mock.calls[0][0] as HTMLElement;
    expect(clonedElement.querySelector('.profile-photo-frame')).toBeTruthy();
    expect(clonedElement.querySelector('.profile-photo-waves')).toBeTruthy();

    document.body.removeChild(originalDiv);
  });

  it('preserves skill chip text in PDF clone', async () => {
    const originalDiv = document.createElement('div');
    originalDiv.className = 'pdf-sheet';

    const wrap = document.createElement('div');
    wrap.className = 'flex flex-wrap items-center gap-1.5 text-xs';
    const chip = document.createElement('span');
    chip.className = 'inline-flex px-2 py-0.5 rounded-full border';
    chip.setAttribute('data-skill-chip', '');
    const skillText = document.createElement('span');
    skillText.setAttribute('data-skill-index', '0');
    skillText.textContent = 'TypeScript';
    chip.appendChild(skillText);

    const addBtn = document.createElement('button');
    addBtn.className = 'edit-only';
    addBtn.textContent = '+';
    chip.appendChild(addBtn);

    wrap.appendChild(chip);
    originalDiv.appendChild(wrap);
    originalDiv.appendChild(addBtn);

    document.body.appendChild(originalDiv);
    await PdfService.downloadPdf(originalDiv, 'skills.pdf');

    const clonedElement = mockFrom.mock.calls[0][0] as HTMLElement;
    const clonedChip = clonedElement.querySelector('[data-skill-chip]') as HTMLElement;
    expect(clonedElement.textContent).toContain('TypeScript');
    expect(clonedElement.querySelector('[data-skill-index]')).toBeNull();
    expect(clonedElement.querySelector('.edit-only')).toBeNull();
    expect(clonedChip?.style.display).toBe('inline-flex');
    expect(clonedChip?.style.alignItems).toBe('center');

    document.body.removeChild(originalDiv);
  });

  it('preserves entry icons and logos in PDF clone when edit controls are stripped', async () => {
    const originalDiv = document.createElement('div');
    originalDiv.className = 'pdf-sheet';

    const iconPicker = document.createElement('div');
    iconPicker.className = 'relative inline-flex flex-shrink-0 pdf-keep';
    iconPicker.setAttribute('data-pdf-keep', '');
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('class', 'lucide');
    iconPicker.appendChild(iconSvg);
    const iconBtn = document.createElement('button');
    iconBtn.className = 'edit-only';
    iconPicker.appendChild(iconBtn);

    const logoWrap = document.createElement('div');
    logoWrap.className = 'relative flex-shrink-0 pdf-keep';
    logoWrap.setAttribute('data-pdf-keep', '');
    const logoImg = document.createElement('img');
    logoImg.src = 'https://example.com/logo.png';
    logoImg.className = 'w-6 h-6';
    logoWrap.appendChild(logoImg);
    const logoBtn = document.createElement('button');
    logoBtn.className = 'edit-only';
    logoWrap.appendChild(logoBtn);

    const contactRow = document.createElement('span');
    contactRow.className = 'inline-flex items-center gap-1.5 align-middle';
    const mailSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mailSvg.setAttribute('class', 'lucide w-3 h-3');
    contactRow.appendChild(mailSvg);
    const email = document.createElement('span');
    email.textContent = 'test@example.com';
    contactRow.appendChild(email);

    originalDiv.appendChild(iconPicker);
    originalDiv.appendChild(logoWrap);
    originalDiv.appendChild(contactRow);

    document.body.appendChild(originalDiv);
    await PdfService.downloadPdf(originalDiv, 'icons.pdf');

    const clonedElement = mockFrom.mock.calls[0][0] as HTMLElement;
    expect(clonedElement.querySelector('.pdf-keep svg.lucide')).toBeTruthy();
    expect(clonedElement.querySelector('.pdf-keep img')).toBeTruthy();
    expect(clonedElement.querySelector('.edit-only')).toBeNull();
    expect(clonedElement.querySelector('span.inline-flex.items-center svg')).toBeTruthy();

    document.body.removeChild(originalDiv);
  });

  it('correctly sets up and executes pdf generation by stripping edit controls and resolving oklch colors', async () => {
    // Setup mock element in JSDOM
    const originalDiv = document.createElement('div');
    originalDiv.className = 'pdf-sheet has-active-section';
    originalDiv.id = 'resume-sheet';
    
    // Add edit controls to check if they are stripped
    const editOnlyBtn = document.createElement('button');
    editOnlyBtn.className = 'edit-only';
    originalDiv.appendChild(editOnlyBtn);
    
    const contentEditable = document.createElement('span');
    contentEditable.setAttribute('contenteditable', 'true');
    contentEditable.className = 'outline-none hover:bg-slate-100/80';
    originalDiv.appendChild(contentEditable);

    // Set style parameters
    originalDiv.style.color = 'oklch(0.6 0.2 240)';
    originalDiv.style.fontSize = '12pt';
    originalDiv.style.padding = '20mm 15mm';
    originalDiv.style.fontFamily = 'Inter';
    
    document.body.appendChild(originalDiv);

    // Trigger download
    await PdfService.downloadPdf(originalDiv, 'test_output.pdf');

    // Verify html2pdf was called
    expect(mockHtml2Pdf).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalled();
    const clonedElement = mockFrom.mock.calls[0][0] as HTMLElement;
    expect(clonedElement).toBeTruthy();
    expect(clonedElement).not.toBe(originalDiv);

    // Verify clone layout settings for A4 sheet generation
    expect(clonedElement.style.transform).toBe('none');
    expect(clonedElement.style.position).toBe('relative');
    expect(clonedElement.style.width).toBe('794px');

    // Verify edit controls are stripped
    expect(clonedElement.querySelector('.edit-only')).toBeNull();
    expect(clonedElement.querySelector('[contenteditable]')).toBeNull();
    expect(clonedElement.querySelector('span')?.classList.contains('outline-none')).toBeFalsy();

    // Verify focus/backdrop classes are stripped from PDF clone
    expect(clonedElement.classList.contains('has-active-section')).toBe(false);
    expect(clonedElement.classList.contains('has-active-item')).toBe(false);

    // Verify save was called
    expect(mockSave).toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(originalDiv);
  });
});
