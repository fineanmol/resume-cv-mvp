import { extractKeywords } from '../src/utils/jdMatcher';
import type { CoverLetterState, ResumeState } from '../src/types';

export function scoreAtsMatch(
  resume: ResumeState,
  coverLetter: CoverLetterState,
  jobDescription: string,
): { score: number; matched: string[]; missing: string[] } {
  const keywords = extractKeywords(jobDescription);
  const haystack = [
    resume.resumeSummary,
    resume.resumeSkills,
    ...resume.resumeExperience.map((e) => `${e.title} ${e.company} ${e.bullets}`),
    coverLetter.p1,
    coverLetter.p2,
    coverLetter.p3,
    coverLetter.p4,
    ...coverLetter.highlights.map((h) => `${h.category} ${h.text}`),
  ].join(' ').toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of keywords) {
    if (haystack.includes(kw.toLowerCase())) matched.push(kw);
    else missing.push(kw);
  }
  // No extractable skill keywords → nothing to fail against (avoid forcing spam boosts)
  const score = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 100;
  return { score, matched: matched.slice(0, 40), missing: missing.slice(0, 40) };
}
