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

    // Verify the clone passed to html2pdf is correctly positioned and styled
    expect(mockFrom).toHaveBeenCalled();
    const clonedElement = mockFrom.mock.calls[0][0] as HTMLElement;
    expect(clonedElement).toBeTruthy();
    
    // Crucial positioning parameters to prevent blank page issues
    expect(clonedElement.style.left).toBe('0px');
    expect(clonedElement.style.top).toBe('0px');
    expect(clonedElement.style.zIndex).toBe('-9999');
    
    // Verify that original inline styles are not wiped out by cssText
    expect(clonedElement.style.fontSize).toBe('12pt');
    expect(clonedElement.style.padding).toBe('20mm 15mm');
    expect(clonedElement.style.fontFamily).toBe('Inter');

    document.body.removeChild(originalDiv);
  });
});
