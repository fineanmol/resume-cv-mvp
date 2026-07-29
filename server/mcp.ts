#!/usr/bin/env node
/**
 * Cursor MCP server for resume-cv-mvp auto-apply integration.
 * Tools: generate_for_job, tailor_application, export_pdfs
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { generateForJob, tailorApplication } from './pipeline';
import { exportDesignerPdfs } from './pdf/exportPdf';
import { scoreAtsMatch } from './score';
import type { CoverLetterState, ResumeState } from '../src/types';

const server = new McpServer({
  name: 'resume-cv-mvp',
  version: '1.0.0',
});

function textResult(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

server.tool(
  'generate_for_job',
  'Tailor Designer resume + cover letter to a JD (truth-bound + humanize), export PDFs, save JSON/meta under outputDir.',
  {
    jobId: z.string(),
    company: z.string(),
    role: z.string(),
    jobDescription: z.string(),
    outputDir: z.string(),
    masterResumePath: z.string().optional(),
    masterCoverLetterPath: z.string().optional(),
    skipHumanize: z.boolean().optional(),
  },
  async (args) => {
    const result = await generateForJob({
      jobId: args.jobId,
      company: args.company,
      role: args.role,
      jobDescription: args.jobDescription,
      outputDir: args.outputDir,
      masterResumePath: args.masterResumePath,
      masterCoverLetterPath: args.masterCoverLetterPath,
      skipHumanize: args.skipHumanize,
    });
    return textResult(result);
  },
);

server.tool(
  'tailor_application',
  'Tailor in-memory resume + cover letter JSON to a JD (no PDF). Uses Designer template settings on resume.',
  {
    jobDescription: z.string(),
    company: z.string(),
    role: z.string(),
    resumeJson: z.string().describe('JSON string of ResumeState'),
    coverLetterJson: z.string().describe('JSON string of CoverLetterState'),
    skipHumanize: z.boolean().optional(),
  },
  async (args) => {
    const resume = JSON.parse(args.resumeJson) as ResumeState;
    const coverLetter = JSON.parse(args.coverLetterJson) as CoverLetterState;
    const result = await tailorApplication({
      resume,
      coverLetter,
      jobDescription: args.jobDescription,
      company: args.company,
      role: args.role,
      skipHumanize: args.skipHumanize,
    });
    const ats = scoreAtsMatch(result.resume, result.coverLetter, args.jobDescription);
    return textResult({ ...result, atsScore: ats.score, matched: ats.matched, missing: ats.missing });
  },
);

server.tool(
  'export_pdfs',
  'Render Designer resume PDF + professional cover letter PDF to outputDir.',
  {
    outputDir: z.string(),
    resumeJson: z.string(),
    coverLetterJson: z.string(),
  },
  async (args) => {
    const resume = JSON.parse(args.resumeJson) as ResumeState;
    const coverLetter = JSON.parse(args.coverLetterJson) as CoverLetterState;
    // Layout is frozen inside exportDesignerPdfs (sanitizeResumeForExport).
    const paths = await exportDesignerPdfs({ resume, coverLetter, outputDir: args.outputDir });
    return textResult(paths);
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
