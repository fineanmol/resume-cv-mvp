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
interface SlotDefinition {
  slot: string;
  maxLen: number;
  alts: string[];
}

const PM_SLOTS: SlotDefinition[] = [
  {
    slot: 'Product Strategy',
    maxLen: 19,
    alts: ['Product Discovery', 'Roadmaps', 'Product Management', 'Product Lifecycle', 'Product Vision', 'GTM Strategy'],
  },
  {
    slot: 'Requirement Gathering',
    maxLen: 23,
    alts: ['Backlog Prioritization', 'User Stories', 'Feature Prioritization', 'Acceptance Criteria', 'PRDs & User Stories'],
  },
  {
    slot: 'SAP',
    maxLen: 5,
    alts: ['CRM', 'ERP', 'API', 'AWS', 'B2B', 'GTM', 'AI'],
  },
  {
    slot: 'Power BI',
    maxLen: 9,
    alts: ['Tableau', 'Looker', 'Metabase', 'Mixpanel', 'BigQuery'],
  },
  {
    slot: 'Optimizely',
    maxLen: 12,
    alts: ['Salesforce', 'Amplitude', 'Hotjar', 'HubSpot', 'Segment'],
  },
  {
    slot: 'A/B Testing',
    maxLen: 15,
    alts: ['Experimentation', 'Data-driven', 'Analytics'],
  },
  {
    slot: 'ETL tools',
    maxLen: 10,
    alts: ['APIs', 'REST APIs', 'Automation', 'Python'],
  },
  {
    slot: 'Conflict Management',
    maxLen: 22,
    alts: ['Cross-functional', 'Stakeholder Alignment', 'Cross-functional Collab', 'Team Leadership'],
  },
  {
    slot: 'KYC',
    maxLen: 9,
    alts: ['SaaS', 'B2B', 'B2C', 'IoT', 'Fintech', 'AI', 'Logistics', 'E-commerce'],
  },
  {
    slot: 'Market Research',
    maxLen: 19,
    alts: ['Competitor Analysis', 'User Research', 'Customer Insights', 'Market Analysis'],
  },
  {
    slot: 'Pricing',
    maxLen: 11,
    alts: ['Growth', 'Retention', 'Funnel', 'NPS', 'OKRs', 'Operations', 'Customer Success'],
  },
];

export function alignSkillsToMasterOrder(
  skills: string,
  masterOrder: string = MASTER_RESUME_SKILLS,
): string {
  const master = masterOrder.split(',').map(cleanSkillToken).filter(Boolean);
  const incoming = skills.split(',').map(cleanSkillToken).filter(Boolean);
  if (!incoming.length) return master.join(', ');

  const incomingLower = new Map(incoming.map((s) => [s.toLowerCase(), s]));
  const usedIncoming = new Set<string>();

  // Initialize slots with master
  const slots = [...master];

  // Direct case-insensitive matches for existing master chips
  for (let i = 0; i < slots.length; i++) {
    const k = slots[i].toLowerCase();
    if (incomingLower.has(k)) {
      slots[i] = incomingLower.get(k)!;
      usedIncoming.add(k);
    }
  }

  // Length-budget-aware slot tailoring for JD keywords
  for (const def of PM_SLOTS) {
    const slotIdx = slots.findIndex((s) => s.toLowerCase() === def.slot.toLowerCase());
    if (slotIdx === -1) continue;

    // Check if any incoming skill matches the slot's alternatives
    for (const alt of def.alts) {
      const altK = alt.toLowerCase();
      // Match if incoming contains this alt (exact or partial)
      const matchingIncoming = [...incomingLower.keys()].find(
        (k) => (k === altK || k.includes(altK) || altK.includes(k)) && !usedIncoming.has(k),
      );

      if (matchingIncoming) {
        const candidate = incomingLower.get(matchingIncoming)!;
        // Strict length check so lines never overflow or wrap awkwardly
        if (candidate.length <= def.maxLen) {
          slots[slotIdx] = candidate;
          usedIncoming.add(matchingIncoming);
          break;
        } else if (alt.length <= def.maxLen) {
          slots[slotIdx] = alt;
          usedIncoming.add(matchingIncoming);
          break;
        }
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
