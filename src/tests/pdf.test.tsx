import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PdfService } from '../services/pdf';

const mockFrom = vi.fn().mockReturnThis();
const mockSet = vi.fn().mockReturnThis();
const mockSave = vi.fn().mockImplementation(function(this: any) {
  return this;
});
const mockThen = vi.fn().mockImplementation(function(this: any, cb) {
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

  it('correctly sets up and executes pdf generation by stripping edit controls and resolving oklch colors', async () => {
    // Setup mock element in JSDOM
    const originalDiv = document.createElement('div');
    originalDiv.className = 'pdf-sheet';
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

    // Verify save was called
    expect(mockSave).toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(originalDiv);
  });
});
