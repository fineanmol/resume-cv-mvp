import type { CoverLetterState, ResumeState } from '../src/types';
import {
  CL_LAYOUT_LOCK,
  DESIGNER_LAYOUT_LOCK,
  DESIGNER_LAYOUT_LOCK_VERSION,
  LANGUAGE_VISIBILITY_LOCK,
  MASTER_RESUME_SKILLS,
  MASTER_SUMMARY_MAX_CHARS,
} from './layoutLock';

export {
  DESIGNER_LAYOUT_LOCK,
  DESIGNER_LAYOUT_LOCK_VERSION,
  CL_LAYOUT_LOCK,
  MASTER_RESUME_SKILLS,
};

/** Strip markdown / list junk from a single skill chip token. */
export function cleanSkillToken(raw: string): string {
  return raw
    .replace(/\*\*/g, '')
    .replace(/^[-•*]\s*/, '')
    .replace(/^["']|["']$/g, '')
    .trim();
}

/**
 * Slot-preserving PM skill alignment for 1-page grid packing.
 * Replaces matching category chips in-place with exact incoming PM keywords
 * (e.g. Tableau replaces Power BI, Salesforce replaces SAP, User Stories replaces Requirement Gathering),
 * preserving the exact 10-row grid alignment and preventing ragged whitespace or 2-page spill.
 */
const PM_SLOT_GROUPS: Record<string, string[]> = {
  'Product Strategy': ['Roadmaps', 'Product Discovery', 'Product Lifecycle', 'Product Management'],
  'Requirement Gathering': ['User Stories', 'Backlog Prioritization', 'Feature Prioritization', 'PRDs'],
  'SAP': ['Salesforce', 'HubSpot', 'CRM'],
  'Power BI': ['Tableau', 'Looker', 'Metabase'],
  'Optimizely': ['Amplitude', 'Mixpanel', 'Hotjar', 'Google Analytics'],
  'A/B Testing': ['Experimentation', 'Hypothesis Testing', 'Data-driven'],
  'ETL tools': ['API', 'APIs', 'REST APIs', 'Integrations'],
  'MS Office': ['Excel', 'Spreadsheets'],
  'Conflict Management': ['Cross-functional', 'Cross-functional Collaboration', 'Stakeholder Alignment'],
  'KYC': ['B2B', 'SaaS', 'Marketplace', 'Fintech', 'AI'],
  'Market Research': ['Competitive Analysis', 'Customer Research', 'User Research'],
  'Pricing': ['Conversion Rate', 'Funnel Analysis', 'Retention', 'Growth'],
};

export function alignSkillsToMasterOrder(
  skills: string,
  masterOrder: string = MASTER_RESUME_SKILLS,
): string {
  const master = masterOrder.split(',').map(cleanSkillToken).filter(Boolean);
  const incoming = skills.split(',').map(cleanSkillToken).filter(Boolean);
  if (!incoming.length) return master.join(', ');

  const incomingLower = new Map(incoming.map((s) => [s.toLowerCase(), s]));
  const usedIncoming = new Set<string>();

  // Pass 1: Direct case-insensitive matches
  const slots: string[] = master.map((m) => {
    const k = m.toLowerCase();
    if (incomingLower.has(k)) {
      usedIncoming.add(k);
      return incomingLower.get(k)!;
    }
    return m;
  });

  // Pass 2: Slot-group replacements for relevant PM tools/skills
  for (let i = 0; i < master.length; i++) {
    const masterSlot = master[i];
    const group = PM_SLOT_GROUPS[masterSlot];
    if (!group) continue;

    // If current slot already matched directly from incoming, keep it
    if (usedIncoming.has(slots[i].toLowerCase()) && slots[i].toLowerCase() !== masterSlot.toLowerCase()) {
      continue;
    }

    // Find the first incoming skill in this slot group that hasn't been placed yet
    for (const alt of group) {
      const altK = alt.toLowerCase();
      if (incomingLower.has(altK) && !usedIncoming.has(altK)) {
        slots[i] = incomingLower.get(altK)!;
        usedIncoming.add(altK);
        break;
      }
    }
  }

  return slots.join(', ');
}

/** Comma-separated skills → clean chips + master order lock. */
export function sanitizeSkills(skills: string): string {
  const cleaned = skills
    .split(',')
    .map(cleanSkillToken)
    .filter(Boolean)
    .join(', ');
  return alignSkillsToMasterOrder(cleaned);
}

/** Cap summary length without cutting mid-word / mid-phrase when possible. */
export function capSummary(text: string, max = MASTER_SUMMARY_MAX_CHARS): string {
  const t = (text || '').trim();
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  // Longest prefix that ends on a sentence boundary (greedy), not the first sentence.
  const sentence = slice.match(/^[\s\S]*[.!?]/)?.[0]?.trim();
  if (sentence && sentence.length >= Math.floor(max * 0.7)) return sentence;
  const word = slice.replace(/\s+\S*$/, '').trim();
  return word.length >= Math.floor(max * 0.65) ? `${word}.` : `${slice.trim()}…`;
}

/** Replace em/en dashes with ASCII hyphen. */
export function replaceDashes(text: string): string {
  return (text || '').replace(/[—–―]/g, '-');
}

/** Em-dash cleanup only — keep **bold** for Designer experience highlighting. */
function scrubKeepBold(text: string): string {
  return replaceDashes(text || '');
}

/** Em-dash + strip bold (for plain fields / skills). */
function scrubPlain(text: string): string {
  return replaceDashes(text || '').replace(/\*\*/g, '');
}

function scrubBulletsKeepBold(bullets: string): string {
  return bullets
    .split(/\r?\n/)
    .map((line) => scrubKeepBold(line.trim()))
    .filter(Boolean)
    .join('\n');
}

/**
 * Post-tailor cleanup for text + lock Designer layout to website master.
 * Preserves **bold** in experience bullets (and summary) for keyword highlighting.
 * Always wins over tailor / caller layout tweaks.
 */
export function sanitizeResumeForExport(state: ResumeState): ResumeState {
  return {
    ...state,
    name: scrubPlain(state.name),
    subtitle: scrubPlain(state.subtitle),
    resumeSummary: capSummary(scrubKeepBold(state.resumeSummary)),
    resumeSkills: sanitizeSkills(state.resumeSkills),
    resumeExperience: state.resumeExperience.map((exp) => ({
      ...exp,
      title: scrubPlain(exp.title),
      company: scrubPlain(exp.company),
      dates: scrubPlain(exp.dates),
      location: scrubPlain(exp.location || ''),
      bullets: scrubBulletsKeepBold(exp.bullets),
    })),
    resumeEducation: state.resumeEducation.map((edu) => ({
      ...edu,
      degree: scrubPlain(edu.degree),
      school: scrubPlain(edu.school),
      dates: scrubPlain(edu.dates),
      location: scrubPlain(edu.location || ''),
      bullets: scrubKeepBold(edu.bullets || ''),
    })),
    resumeCerts: state.resumeCerts.map((c) => ({
      ...c,
      title: scrubPlain(c.title),
      desc: scrubKeepBold(c.desc),
    })),
    resumeAchievements: state.resumeAchievements.map((a) => ({
      ...a,
      title: scrubPlain(a.title),
      desc: scrubKeepBold(a.desc),
    })),
    resumeLanguages: state.resumeLanguages.map((l) => ({
      ...l,
      name: scrubPlain(l.name),
      level: scrubPlain(l.level),
      visibility: {
        ...(l.visibility || {}),
        ...LANGUAGE_VISIBILITY_LOCK,
      },
    })),
    layoutSettings: {
      ...state.layoutSettings,
      ...DESIGNER_LAYOUT_LOCK,
      // Fresh arrays so callers cannot mutate the frozen lock
      designerLeftSections: [...DESIGNER_LAYOUT_LOCK.designerLeftSections!],
      designerRightSections: [...DESIGNER_LAYOUT_LOCK.designerRightSections!],
    },
  };
}

export function sanitizeCoverLetterForExport(state: CoverLetterState): CoverLetterState {
  return {
    ...state,
    name: scrubPlain(state.name),
    subtitle: scrubPlain(state.subtitle),
    companyName: scrubPlain(state.companyName),
    jobTitle: scrubPlain(state.jobTitle),
    salutation: scrubPlain(state.salutation),
    p1: scrubKeepBold(state.p1),
    p2: scrubKeepBold(state.p2),
    p3: scrubKeepBold(state.p3),
    p4: scrubKeepBold(state.p4),
    highlights: state.highlights.map((h) => ({
      category: scrubPlain(h.category),
      text: scrubKeepBold(h.text),
    })),
    layoutSettings: {
      ...state.layoutSettings,
      ...CL_LAYOUT_LOCK,
    },
  };
}
