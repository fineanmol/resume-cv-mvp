import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generateForJob, tailorApplication } from './pipeline';
import { exportDesignerPdfs } from './pdf/exportPdf';
import { scoreAtsMatch } from './score';
import type { CoverLetterState, ResumeState } from '../src/types';
import { mergeCoverLetterPatch, mergeResumePatch } from './merge';
import { GeminiService } from '../src/services/gemini';

const app = new Hono();
const PORT = Number(process.env.RESUME_API_PORT || 8791);
const TOKEN = process.env.RESUME_API_TOKEN || '';

app.use('*', cors());

app.use('*', async (c, next) => {
  if (!TOKEN) return next();
  const auth = c.req.header('authorization') || '';
  const headerToken = c.req.header('x-resume-api-token') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (headerToken !== TOKEN && bearer !== TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  return next();
});

app.get('/health', (c) => c.json({ ok: true, service: 'resume-cv-api', template: 'designer' }));

app.post('/v1/generate_for_job', async (c) => {
  try {
    const body = await c.req.json();
    const outputDir = String(body.outputDir || body.output_dir || '');
    if (!outputDir) return c.json({ error: 'outputDir is required' }, 400);
    const result = await generateForJob({
      jobId: String(body.jobId || body.job_id || 'job'),
      company: String(body.company || ''),
      role: String(body.role || body.position || ''),
      jobDescription: String(body.jobDescription || body.job_description || body.jd || ''),
      outputDir,
      masterResumePath: body.masterResumePath || body.master_resume_path,
      masterCoverLetterPath: body.masterCoverLetterPath || body.master_cover_letter_path,
      masterResumePdfPath: body.masterResumePdfPath || body.master_resume_pdf_path,
      masterCoverLetterPdfPath: body.masterCoverLetterPdfPath || body.master_cover_letter_pdf_path,
      resume: body.resume,
      coverLetter: body.coverLetter || body.cover_letter,
      skipHumanize: Boolean(body.skipHumanize || body.skip_humanize),
      geminiApiKey: body.geminiApiKey || body.gemini_api_key,
    });
    return c.json(result);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

app.post('/v1/tailor_application', async (c) => {
  try {
    const body = await c.req.json();
    const result = await tailorApplication({
      resume: body.resume as ResumeState,
      coverLetter: (body.coverLetter || body.cover_letter) as CoverLetterState,
      jobDescription: String(body.jobDescription || body.jd || ''),
      company: String(body.company || ''),
      role: String(body.role || ''),
      skipHumanize: Boolean(body.skipHumanize),
      geminiApiKey: body.geminiApiKey,
    });
    const ats = scoreAtsMatch(result.resume, result.coverLetter, String(body.jobDescription || body.jd || ''));
    return c.json({ ...result, atsScore: ats.score, matchedKeywords: ats.matched, missingKeywords: ats.missing });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

app.post('/v1/humanize_document', async (c) => {
  try {
    const body = await c.req.json();
    const apiKey = body.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) return c.json({ error: 'GEMINI_API_KEY required' }, 400);
    const type = body.type || body.docType;
    if (type === 'coverletter' || type === 'cover_letter') {
      const prev = body.coverLetter || body.document;
      const patch = await GeminiService.humanizeCoverLetter(apiKey, prev);
      return c.json({ coverLetter: mergeCoverLetterPatch(prev, patch) });
    }
    const prev = body.resume || body.document;
    const patch = await GeminiService.humanizeResume(apiKey, prev);
    return c.json({ resume: mergeResumePatch(prev, patch) });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

app.post('/v1/export_pdfs', async (c) => {
  try {
    const body = await c.req.json();
    const outputDir = String(body.outputDir || body.output_dir || '');
    if (!outputDir) return c.json({ error: 'outputDir is required' }, 400);
    const resume = body.resume as ResumeState;
    const coverLetter = (body.coverLetter || body.cover_letter) as CoverLetterState;
    // Layout is frozen inside exportDesignerPdfs (sanitizeResumeForExport).
    const paths = await exportDesignerPdfs({ resume, coverLetter, outputDir });
    return c.json(paths);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

console.log(`resume-cv API listening on http://127.0.0.1:${PORT}`);
serve({ fetch: app.fetch, hostname: '127.0.0.1', port: PORT });
