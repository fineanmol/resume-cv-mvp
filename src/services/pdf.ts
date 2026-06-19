import html2pdf from 'html2pdf.js';

declare const pdfjsLib: {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<PdfDoc> };
  OPS: { paintImageXObject: number; paintJpegXObject: number };
};

interface PdfDoc {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
}

interface PdfPage {
  getOperatorList: () => Promise<{ fnArray: number[]; argsArray: unknown[][] }>;
  objs: { get: (id: string, cb: (obj: PdfImage) => void) => PdfImage | undefined };
}

interface PdfImage {
  width: number;
  height: number;
  data: Uint8ClampedArray | number[];
}

// High-performance single-pixel canvas converter to transform oklch color strings to standard rgba strings
const colorCanvas = document.createElement('canvas');
colorCanvas.width = 1;
colorCanvas.height = 1;
const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });

function convertOklToRgb(colorStr: string): string {
  if (!colorStr || (!colorStr.includes('oklch') && !colorStr.includes('oklab'))) return colorStr;
  if (!colorCtx) return colorStr;

  try {
    colorCtx.clearRect(0, 0, 1, 1);
    colorCtx.fillStyle = colorStr;
    colorCtx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = colorCtx.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  } catch {
    return colorStr;
  }
}

function convertElementColors(original: HTMLElement, cloned: HTMLElement) {
  const computed = window.getComputedStyle(original);

  const propertiesToConvert = [
    'color',
    'backgroundColor',
    'borderColor',
    'borderTopColor',
    'borderBottomColor',
    'borderLeftColor',
    'borderRightColor',
    'fill',
    'stroke'
  ];

  propertiesToConvert.forEach((prop) => {
    const cssProp = prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    const val = computed.getPropertyValue(cssProp);
    if (val) {
      const converted = (val.includes('oklch') || val.includes('oklab')) ? convertOklToRgb(val) : val;
      cloned.style.setProperty(cssProp, converted);
    }
  });
}

export class PdfService {
  public static async extractFirstPhoto(file: File): Promise<string | null> {
    if (typeof pdfjsLib === 'undefined') {
      console.warn("PDF.js library is not loaded. Image extraction skipped.");
      return null;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      }

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      if (pdf.numPages === 0) return null;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const opList = await page.getOperatorList();

        for (let i = 0; i < opList.fnArray.length; i++) {
          if (
            opList.fnArray[i] === pdfjsLib.OPS.paintImageXObject ||
            opList.fnArray[i] === pdfjsLib.OPS.paintJpegXObject
          ) {
            const imageObjId = opList.argsArray[i][0] as string;

            const img = await new Promise<PdfImage>((resolve) => {
              const result = page.objs.get(imageObjId, (obj: PdfImage) => {
                resolve(obj);
              });
              if (result) resolve(result);
            });

            if (img && img.width && img.height) {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) continue;

              let pixelData = img.data;
              if (pixelData.length === img.width * img.height * 3) {
                const rgba = new Uint8ClampedArray(img.width * img.height * 4);
                let j = 0;
                for (let k = 0; k < pixelData.length; k += 3) {
                  rgba[j] = pixelData[k];
                  rgba[j + 1] = pixelData[k + 1];
                  rgba[j + 2] = pixelData[k + 2];
                  rgba[j + 3] = 255;
                  j += 4;
                }
                pixelData = rgba;
              } else if (pixelData.length === img.width * img.height) {
                const rgba = new Uint8ClampedArray(img.width * img.height * 4);
                let j = 0;
                for (let k = 0; k < pixelData.length; k++) {
                  const val = pixelData[k];
                  rgba[j] = val;
                  rgba[j + 1] = val;
                  rgba[j + 2] = val;
                  rgba[j + 3] = 255;
                  j += 4;
                }
                pixelData = rgba;
              } else if (pixelData.length !== img.width * img.height * 4) {
                continue;
              }

              const imageData = new ImageData(
                new Uint8ClampedArray(pixelData),
                img.width,
                img.height
              );
              ctx.putImageData(imageData, 0, 0);
              return canvas.toDataURL('image/jpeg');
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to extract image from PDF:", err);
    }
    return null;
  }

  public static downloadPdf(element: HTMLElement, filename: string): void {
    if (!html2pdf) {
      alert("PDF downloader package is not available.");
      return;
    }

    const sheetElement = (element.querySelector('.pdf-sheet') || element) as HTMLElement;

    const opt = {
      margin: 0,
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        onclone: (clonedDoc: Document) => {
          // Find the cloned sheet element in the cloned document
          const clonedSheet = (sheetElement.id ? clonedDoc.getElementById(sheetElement.id) : null)
            || clonedDoc.querySelector('.pdf-sheet')
            || (clonedDoc.body.querySelector('*') as HTMLElement);

          if (clonedSheet) {
            // Strip layout constraints/transforms that shouldn't appear in the PDF
            clonedSheet.style.boxShadow = 'none';
            clonedSheet.style.transform = 'none';
            clonedSheet.style.transition = 'none';

            // Convert oklch/oklab color values to standard browser-compatible rgba
            convertElementColors(sheetElement, clonedSheet);
            const origEls = sheetElement.querySelectorAll('*');
            const cloneEls = clonedSheet.querySelectorAll('*');
            for (let i = 0; i < origEls.length; i++) {
              if (origEls[i] && cloneEls[i]) {
                convertElementColors(origEls[i] as HTMLElement, cloneEls[i] as HTMLElement);
              }
            }

            // Append style override tag to cloned document to hide layout tools (pseudo-elements, focus outlines)
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              .pdf-sheet::before, .pdf-sheet::after {
                display: none !important;
                content: none !important;
              }
              [contenteditable="true"] {
                outline: none !important;
                border-color: transparent !important;
                background-color: transparent !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        }
      },
      jsPDF: { unit: 'pt' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };

    html2pdf()
      .set(opt)
      .from(sheetElement)
      .save()
      .catch((err: unknown) => {
        console.error('PDF download failed:', err);
      });
  }
}
