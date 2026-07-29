import type { CoverLetterState, ResumeState } from '../src/types';
import { splitIntoBullets } from '../src/utils/bullets';
import { guardCoverLetterAgainstThinning, guardResumeAgainstThinning } from './contentGuard';

/** Safe merge: only summary/skills/bullets — never invent jobs/dates. Rejects thinned content. */
export function mergeResumePatch(prev: ResumeState, result: Partial<ResumeState>): ResumeState {
  const merged: ResumeState = {
    ...prev,
    resumeSummary: result.resumeSummary || prev.resumeSummary,
    resumeSkills: result.resumeSkills || prev.resumeSkills,
    resumeExperience: prev.resumeExperience.map((exp, idx) => ({
      ...exp,
      bullets: result.resumeExperience?.[idx]?.bullets
        ? splitIntoBullets(result.resumeExperience[idx].bullets).join('\n')
        : exp.bullets,
    })),
  };
  return guardResumeAgainstThinning(prev, merged);
}

export function mergeCoverLetterPatch(
  prev: CoverLetterState,
  result: Partial<CoverLetterState>,
): CoverLetterState {
  const merged: CoverLetterState = {
    ...prev,
    companyName: result.companyName || prev.companyName,
    jobTitle: result.jobTitle || prev.jobTitle,
    salutation: result.salutation || prev.salutation,
    p1: result.p1 || prev.p1,
    p2: result.p2 || prev.p2,
    p3: result.p3 || prev.p3,
    p4: result.p4 || prev.p4,
    highlights: prev.highlights.map((hl, idx) => ({
      ...hl,
      category: result.highlights?.[idx]?.category || hl.category,
      text: result.highlights?.[idx]?.text || hl.text,
    })),
  };
  return guardCoverLetterAgainstThinning(prev, merged);
}

export function applyPlaceholders(text: string, company: string, role: string): string {
  return text
    .replaceAll('{{company}}', company)
    .replaceAll('{{role}}', role);
}

export function resolveCoverLetterPlaceholders(
  state: CoverLetterState,
  company: string,
  role: string,
): CoverLetterState {
  return {
    ...state,
    companyName: company || state.companyName,
    jobTitle: role || state.jobTitle,
    p1: applyPlaceholders(state.p1, company, role),
    p2: applyPlaceholders(state.p2, company, role),
    p3: applyPlaceholders(state.p3, company, role),
    p4: applyPlaceholders(state.p4, company, role),
  };
}
