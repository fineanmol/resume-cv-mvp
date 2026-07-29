import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { closePdfRuntime, exportDesignerPdfs } from './pdf/exportPdf';
import { DESIGNER_LAYOUT_LOCK_VERSION } from './layoutLock';

async function main() {
  const root = '/Users/fineanmol/Desktop/N8N workflow for Automation/applications/master';
  const out = '/Users/fineanmol/Desktop/N8N workflow for Automation/applications/uploads/compare';
  const resume = JSON.parse(await readFile(path.join(root, 'sakshi-resume.json'), 'utf8'));
  const coverLetter = JSON.parse(await readFile(path.join(root, 'sakshi-cover-letter.json'), 'utf8'));

  await mkdir(out, { recursive: true });
  // exportDesignerPdfs always applies DESIGNER_LAYOUT_LOCK / CL_LAYOUT_LOCK
  const r = await exportDesignerPdfs({
    resume,
    coverLetter,
    outputDir: out,
    resumeFileName: 'export_master_resume.pdf',
    coverLetterFileName: 'export_master_cl.pdf',
  });
  console.log({ ...r, layoutLock: DESIGNER_LAYOUT_LOCK_VERSION });
  await closePdfRuntime();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
