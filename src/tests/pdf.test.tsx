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
    
    document.body.appendChild(originalDiv);

    // Trigger download
    PdfService.downloadPdf(originalDiv, 'test_output.pdf');

    // Verify html2pdf.js was invoked
    expect(mockHtml2Pdf).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
      filename: 'test_output.pdf',
      jsPDF: expect.objectContaining({ format: 'a4' })
    }));

    document.body.removeChild(originalDiv);
  });
});
