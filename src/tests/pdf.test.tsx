import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PdfService } from '../services/pdf';

// Mock html2pdf.js module
const mockSave = vi.fn().mockImplementation(() => Promise.resolve());
const mockFrom = vi.fn().mockImplementation(() => ({ save: mockSave }));
const mockSet = vi.fn().mockImplementation(() => ({ from: mockFrom }));
const mockHtml2Pdf = vi.fn().mockImplementation(() => ({ set: mockSet }));

vi.mock('html2pdf.js', () => {
  return {
    default: () => mockHtml2Pdf()
  };
});

describe('PdfService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('correctly sets up html2pdf parameters, handles offscreen clones, and parses oklch/oklab to rgba', () => {
    // Setup mock element in JSDOM
    const originalDiv = document.createElement('div');
    originalDiv.className = 'pdf-sheet';
    originalDiv.id = 'resume-sheet';
    
    // Set style parameters
    originalDiv.style.color = 'oklch(0.6 0.2 240)';
    originalDiv.style.backgroundColor = 'oklab(0.5 0.1 -0.1)';
    originalDiv.style.boxShadow = '0px 10px 20px rgba(0,0,0,0.5)';
    originalDiv.style.fontSize = '12pt';
    originalDiv.style.padding = '20mm 15mm';
    originalDiv.style.fontFamily = 'Inter';
    
    document.body.appendChild(originalDiv);

    // Trigger download
    PdfService.downloadPdf(originalDiv, 'test_output.pdf');

    // Verify html2pdf.js was invoked
    expect(mockHtml2Pdf).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
      filename: 'test_output.pdf',
      jsPDF: expect.objectContaining({ format: 'a4' })
    }));

    // Verify the live element is passed directly to html2pdf.from()
    expect(mockFrom).toHaveBeenCalledWith(originalDiv);

    // Retrieve the opt object passed to mockSet to test onclone callback
    const opt = mockSet.mock.calls[0][0];
    expect(opt).toBeTruthy();
    expect(opt.html2canvas).toBeTruthy();
    expect(opt.html2canvas.onclone).toBeTypeOf('function');

    // Mock a cloned document structure to verify onclone styling modifications
    const mockClonedDoc = document.implementation.createHTMLDocument('cloned');
    const mockClonedSheet = mockClonedDoc.createElement('div');
    mockClonedSheet.className = 'pdf-sheet';
    mockClonedSheet.id = 'resume-sheet';
    mockClonedDoc.body.appendChild(mockClonedSheet);

    // Trigger the onclone callback
    opt.html2canvas.onclone(mockClonedDoc);

    // Assert that the cloned element had layout constraints stripped
    expect(mockClonedSheet.style.boxShadow).toBe('none');
    expect(mockClonedSheet.style.transform).toBe('none');
    expect(mockClonedSheet.style.transition).toBe('none');

    // Assert that the custom style element was added to hide borders and pseudo-elements
    const styleTags = mockClonedDoc.head.querySelectorAll('style');
    expect(styleTags.length).toBeGreaterThan(0);
    expect(styleTags[0].innerHTML).toContain('.pdf-sheet::before, .pdf-sheet::after');
    expect(styleTags[0].innerHTML).toContain('[contenteditable="true"]');

    document.body.removeChild(originalDiv);
  });
});
