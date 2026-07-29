import type { CoverLetterState, ResumeState } from '../src/types';
import { MASTER_RESUME_SKILLS, MASTER_SUMMARY_MAX_CHARS } from './layoutLock';

/** Local copy to avoid sanitize ↔ contentGuard import cycles. */
function alignSkillsOrder(skills: string): string {
  const clean = (raw: string) =>
    raw
      .replace(/\*\*/g, '')
      .replace(/^[-•*]\s*/, '')
      .replace(/^["']|["']$/g, '')
      .trim();
  const master = MASTER_RESUME_SKILLS.split(',').map(clean).filter(Boolean);
  const incoming = (skills || '').split(',').map(clean).filter(Boolean);
  const byLower = new Map(incoming.map((s) => [s.toLowerCase(), s]));
  return master.map((m) => byLower.get(m.toLowerCase()) || m).join(', ');
}

/**
 * Hard floors so tailored applications never ship "empty-looking" content.
 * Tuned to Sakshi master resume / cover letter density (2026-07-16).
 * If a tailor/LLM shortens below these, we keep the denser previous text.
 */
export const RESUME_CONTENT_FLOOR = Object.freeze({
  summaryMinChars: 360,
  /** Prevent right-column overflow onto page 2 (master ~422). */
  summaryMaxChars: MASTER_SUMMARY_MAX_CHARS,
  minExperienceRoles: 4,
  /** Per role index (Product Manager → … → Dion intern). */
  experienceMinBulletChars: Object.freeze([650, 420, 280, 550]),
  experienceMinBulletLines: Object.freeze([4, 3, 2, 4]),
  minSkillTokens: 28,
  /** Reject a bullet rewrite shorter than this fraction of the previous bullets. */
  minKeepRatio: 0.9,
});

export const CL_CONTENT_FLOOR = Object.freeze({
  p1MinChars: 350,
  p2MinChars: 500,
  p3MinChars: 340,
  p4MinChars: 230,
  minHighlights: 4,
  highlightMinChars: 80,
  minKeepRatio: 0.9,
});

function bulletLines(text: string): number {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean).length;
}

function skillCount(skills: string): number {
  return skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean).length;
}

function preferDense(prev: string, next: string | undefined, minRatio: number, absMin: number): string {
  const p = (prev || '').trim();
  const n = (next || '').trim();
  if (!n) return prev;
  if (n.length < absMin) return prev;
  if (p && n.length < Math.floor(p.length * minRatio)) return prev;
  return next as string;
}

/** Keep previous denser text when a patch tries to thin resume content. */
export function guardResumeAgainstThinning(prev: ResumeState, next: ResumeState): ResumeState {
  const { minKeepRatio, summaryMinChars, experienceMinBulletChars, experienceMinBulletLines, minSkillTokens } =
    RESUME_CONTENT_FLOOR;

  let resumeSummary = preferDense(prev.resumeSummary, next.resumeSummary, minKeepRatio, summaryMinChars);
  const summaryMax = RESUME_CONTENT_FLOOR.summaryMaxChars;
  if (resumeSummary.length > summaryMax) {
    // Prefer previous if it fits the 1-page cap; else keep next (sanitize will cap).
    if ((prev.resumeSummary || '').trim().length <= summaryMax) {
      resumeSummary = prev.resumeSummary;
    }
  }

  let resumeSkills = next.resumeSkills || prev.resumeSkills;
  if (skillCount(resumeSkills) < minSkillTokens && skillCount(prev.resumeSkills) >= minSkillTokens) {
    resumeSkills = prev.resumeSkills;
  }
  // Always restore golden grid order (reorder alone was spilling DYMATRIX etc. to 2 pages).
  resumeSkills = alignSkillsOrder(resumeSkills || prev.resumeSkills);

  const resumeExperience = prev.resumeExperience.map((exp, idx) => {
    const patched = next.resumeExperience?.[idx]?.bullets;
    const absMin = experienceMinBulletChars[idx] ?? 280;
    const minLines = experienceMinBulletLines[idx] ?? 2;
    let bullets = preferDense(exp.bullets, patched, minKeepRatio, absMin);
    if (bulletLines(bullets) < minLines && bulletLines(exp.bullets) >= minLines) {
      bullets = exp.bullets;
    }
    // Never drop roles / invent employers — only swap bullet text when dense enough.
    return { ...exp, bullets };
  });

  return {
    ...next,
    resumeSummary,
    resumeSkills,
    resumeExperience,
  };
}

/** Keep previous denser text when a patch tries to thin cover letter paragraphs. */
export function guardCoverLetterAgainstThinning(
  prev: CoverLetterState,
  next: CoverLetterState,
): CoverLetterState {
  const { minKeepRatio, p1MinChars, p2MinChars, p3MinChars, p4MinChars, minHighlights, highlightMinChars } =
    CL_CONTENT_FLOOR;

  const highlights = (prev.highlights || []).map((hl, idx) => {
    const patched = next.highlights?.[idx];
    return {
      ...hl,
      category: patched?.category || hl.category,
      text: preferDense(hl.text, patched?.text, minKeepRatio, highlightMinChars),
    };
  });

  return {
    ...next,
    p1: preferDense(prev.p1, next.p1, minKeepRatio, p1MinChars),
    p2: preferDense(prev.p2, next.p2, minKeepRatio, p2MinChars),
    p3: preferDense(prev.p3, next.p3, minKeepRatio, p3MinChars),
    p4: preferDense(prev.p4, next.p4, minKeepRatio, p4MinChars),
    highlights: highlights.length >= minHighlights ? highlights : prev.highlights,
  };
}

/** Soft warnings for logs / meta (does not throw — thinning is auto-reverted). */
export function contentDensityReport(resume: ResumeState, coverLetter: CoverLetterState): string[] {
  const notes: string[] = [];
  if ((resume.resumeSummary || '').trim().length < RESUME_CONTENT_FLOOR.summaryMinChars) {
    notes.push(`summary below floor (${resume.resumeSummary.trim().length} chars)`);
  }
  resume.resumeExperience.forEach((exp, idx) => {
    const min = RESUME_CONTENT_FLOOR.experienceMinBulletChars[idx] ?? 280;
    const len = (exp.bullets || '').trim().length;
    if (len < min) notes.push(`experience[${idx}] bullets ${len} < ${min}`);
  });
  for (const key of ['p1', 'p2', 'p3', 'p4'] as const) {
    const min = CL_CONTENT_FLOOR[`${key}MinChars`];
    const len = (coverLetter[key] || '').trim().length;
    if (len < min) notes.push(`cover ${key} ${len} < ${min}`);
  }
  return notes;
}
