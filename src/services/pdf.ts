// @ts-ignore
import html2pdf from 'html2pdf.js';

declare const pdfjsLib: any;

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
  } catch (e) {
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
    const val = computed[prop as any];
    if (val && (val.includes('oklch') || val.includes('oklab'))) {
      cloned.style[prop as any] = convertOklToRgb(val);
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
            const imageObjId = opList.argsArray[i][0];

            const img = await new Promise<any>((resolve) => {
              const result = page.objs.get(imageObjId, (obj: any) => {
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

    // Locate the actual sheet content
    const sheetElement = element.querySelector('.pdf-sheet') || element;

    // Clone the element to render it unscaled and clean
    const clone = sheetElement.cloneNode(true) as HTMLElement;
    
    // Clear scaling transforms, transitions and shadows on the clone
    clone.style.transform = 'none';
    clone.style.transition = 'none';
    clone.style.boxShadow = 'none';
    
    // Position the clone in the active viewport but render it behind the page content
    clone.style.position = 'fixed';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.zIndex = '-9999';
    clone.style.width = '794px'; // A4 standard width at 96 DPI
    clone.style.height = 'auto';
    clone.style.display = 'block';

    // Walk the original DOM tree and copy standard RGB colors into the cloned elements to override oklch properties
    convertElementColors(sheetElement as HTMLElement, clone);
    const allClonedElements = clone.querySelectorAll('*');
    const allOriginalElements = sheetElement.querySelectorAll('*');
    for (let i = 0; i < allClonedElements.length; i++) {
      const origEl = allOriginalElements[i] as HTMLElement;
      const cloneEl = allClonedElements[i] as HTMLElement;
      if (origEl && cloneEl) {
        convertElementColors(origEl, cloneEl);
      }
    }

    document.body.appendChild(clone);

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2.0, // High quality scale
        useCORS: true, 
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: 'pt' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf()
      .set(opt)
      .from(clone)
      .save()
      .then(() => {
        document.body.removeChild(clone);
      })
      .catch((err: any) => {
        console.error("PDF download failed:", err);
        document.body.removeChild(clone);
      });
  }
}
