import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { GeminiService } from '../src/services/gemini';
import type { CoverLetterState, ResumeState } from '../src/types';
import {
  mergeCoverLetterPatch,
  mergeResumePatch,
  resolveCoverLetterPlaceholders,
} from './merge';
import { exportDesignerPdfs } from './pdf/exportPdf';
import {
  sanitizeCoverLetterForExport,
  sanitizeResumeForExport,
} from './sanitize';
import { contentDensityReport, guardCoverLetterAgainstThinning, guardResumeAgainstThinning } from './contentGuard';
import { scoreAtsMatch } from './score';

export interface GenerateForJobInput {
  jobId: string;
  company: string;
  role: string;
  jobDescription: string;
  outputDir: string;
  masterResumePath?: string;
  masterCoverLetterPath?: string;
  /** Copy website golden PDF instead of re-rendering (pixel-identical). */
  masterResumePdfPath?: string;
  masterCoverLetterPdfPath?: string;
  resume?: ResumeState;
  coverLetter?: CoverLetterState;
  skipHumanize?: boolean;
  geminiApiKey?: string;
}

export interface GenerateForJobResult {
  jobId: string;
  company: string;
  role: string;
  variantId: string;
  outputDir: string;
  resumePdf: string;
  coverLetterPdf: string;
  resumeJson: string;
  coverLetterJson: string;
  metaJson: string;
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

function requireKey(explicit?: string): string {
  const key = explicit || process.env.GEMINI_API_KEY || '';
  // Composer-only mode can run without Gemini (CURSOR_API_KEY / cursor agent login).
  if (!key && process.env.AI_PROVIDER !== 'composer' && process.env.FORCE_COMPOSER !== '1') {
    throw new Error('GEMINI_API_KEY is required (env or request body), or set AI_PROVIDER=composer.');
  }
  return key || 'composer';
}

async function loadJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
}

export async function tailorApplication(opts: {
  resume: ResumeState;
  coverLetter: CoverLetterState;
  jobDescription: string;
  company: string;
  role: string;
  geminiApiKey?: string;
  skipHumanize?: boolean;
}): Promise<{ resume: ResumeState; coverLetter: CoverLetterState }> {
  const apiKey = requireKey(opts.geminiApiKey);
  let resume = opts.resume;
  let coverLetter = {
    ...opts.coverLetter,
    companyName: opts.company || opts.coverLetter.companyName,
    jobTitle: opts.role || opts.coverLetter.jobTitle,
  };

  const tailoredResume = await GeminiService.tailorResume(apiKey, resume, opts.jobDescription);
  resume = mergeResumePatch(resume, tailoredResume);

  const tailoredCl = await GeminiService.tailorCoverLetter(apiKey, coverLetter, opts.jobDescription);
  coverLetter = mergeCoverLetterPatch(coverLetter, tailoredCl);

  if (!opts.skipHumanize) {
    const humanResume = await GeminiService.humanizeResume(apiKey, resume);
    resume = mergeResumePatch(resume, humanResume);
    const humanCl = await GeminiService.humanizeCoverLetter(apiKey, coverLetter);
    coverLetter = mergeCoverLetterPatch(coverLetter, humanCl);
  }

  coverLetter = resolveCoverLetterPlaceholders(coverLetter, opts.company, opts.role);

  // Never allow tailor/humanize to thin below master density floors
  resume = guardResumeAgainstThinning(opts.resume, resume);
  coverLetter = guardCoverLetterAgainstThinning(
    {
      ...opts.coverLetter,
      companyName: opts.company || opts.coverLetter.companyName,
      jobTitle: opts.role || opts.coverLetter.jobTitle,
    },
    coverLetter,
  );

  // Lock Designer resume + professional CL (frozen layout; export path re-applies too)
  resume = sanitizeResumeForExport(resume);
  coverLetter = sanitizeCoverLetterForExport(coverLetter);

  const densityNotes = contentDensityReport(resume, coverLetter);
  if (densityNotes.length) {
    console.warn('[contentGuard] density notes after guard:', densityNotes.join('; '));
  }

  return { resume, coverLetter };
}

export async function generateForJob(input: GenerateForJobInput): Promise<GenerateForJobResult> {
  const resume =
    input.resume ||
    (input.masterResumePath
      ? await loadJson<ResumeState>(input.masterResumePath)
      : null);
  const coverLetter =
    input.coverLetter ||
    (input.masterCoverLetterPath
      ? await loadJson<CoverLetterState>(input.masterCoverLetterPath)
      : null);

  if (!resume || !coverLetter) {
    throw new Error('Provide resume/coverLetter JSON or masterResumePath/masterCoverLetterPath.');
  }
  if (!input.jobDescription?.trim()) {
    throw new Error('jobDescription is required.');
  }

  const { resume: tailoredResume, coverLetter: tailoredCl } = await tailorApplication({
    resume,
    coverLetter,
    jobDescription: input.jobDescription,
    company: input.company,
    role: input.role,
    geminiApiKey: input.geminiApiKey,
    skipHumanize: input.skipHumanize,
  });

  const ats = scoreAtsMatch(tailoredResume, tailoredCl, input.jobDescription);
  const date = new Date().toISOString().slice(0, 10);
  const variantId = `${slug(input.company)}_${slug(input.role)}_${date}`;
  const outputDir = path.resolve(input.outputDir);

  await mkdir(outputDir, { recursive: true });

  const { resumePdf, coverLetterPdf } = await exportDesignerPdfs({
    resume: tailoredResume,
    coverLetter: tailoredCl,
    outputDir,
    masterResumePdfPath: input.masterResumePdfPath,
    masterCoverLetterPdfPath: input.masterCoverLetterPdfPath,
  });

  const resumeJson = path.join(outputDir, 'resume.json');
  const coverLetterJson = path.join(outputDir, 'cover_letter.json');
  const metaJson = path.join(outputDir, 'meta.json');

  await writeFile(resumeJson, JSON.stringify(tailoredResume, null, 2));
  await writeFile(coverLetterJson, JSON.stringify(tailoredCl, null, 2));

  const meta = {
    jobId: input.jobId,
    company: input.company,
    role: input.role,
    variantId,
    generatedAt: new Date().toISOString(),
    template: 'designer',
    aiProvider: process.env.AI_PROVIDER || 'auto', // auto = Gemini, Composer on Gemini failure
    skipHumanize: Boolean(input.skipHumanize),
    atsScore: ats.score,
    matchedKeywords: ats.matched,
    missingKeywords: ats.missing,
    resumePdf,
    coverLetterPdf,
    resumeJson,
    coverLetterJson,
  };
  await writeFile(metaJson, JSON.stringify(meta, null, 2));

  return {
    jobId: input.jobId,
    company: input.company,
    role: input.role,
    variantId,
    outputDir,
    resumePdf,
    coverLetterPdf,
    resumeJson,
    coverLetterJson,
    metaJson,
    atsScore: ats.score,
    matchedKeywords: ats.matched,
    missingKeywords: ats.missing,
  };
}
