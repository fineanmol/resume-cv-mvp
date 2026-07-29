#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { generateForJob } from './pipeline';

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const jobId = arg('job-id') || 'job';
  const company = arg('company') || '';
  const role = arg('role') || '';
  const jdFile = arg('jd-file');
  const jobDescription = arg('jd') || (jdFile ? await readFile(jdFile, 'utf8') : '');
  const outputDir = arg('out') || arg('output-dir');
  const masterResumePath = arg('master-resume');
  const masterCoverLetterPath = arg('master-cover-letter');

  if (!outputDir || !jobDescription) {
    console.error(`Usage:
  npm run generate -- \\
    --job-id li_123 --company FACTUREE --role "Associate Product Manager" \\
    --jd-file ./jd.txt --out ../applications/jobs/li_123_facturee \\
    --master-resume /path/sakshi-resume.json \\
    --master-cover-letter /path/sakshi-cover-letter.json

Env: GEMINI_API_KEY required.
`);
    process.exit(1);
  }

  const result = await generateForJob({
    jobId,
    company,
    role,
    jobDescription,
    outputDir,
    masterResumePath,
    masterCoverLetterPath,
    skipHumanize: flag('skip-humanize'),
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
