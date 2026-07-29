import type { CoverLetterState, ResumeState } from '../../../types';

const HUMANIZE_RESUME_SCHEMA = {
  type: 'OBJECT',
  properties: {
    resumeSummary: { type: 'STRING' },
    resumeSkills: { type: 'STRING' },
    resumeExperience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          bullets: { type: 'STRING' },
        },
        required: ['bullets'],
      },
    },
  },
  required: ['resumeSummary', 'resumeSkills', 'resumeExperience'],
};

const HUMANIZE_CL_SCHEMA = {
  type: 'OBJECT',
  properties: {
    p1: { type: 'STRING' },
    p2: { type: 'STRING' },
    p3: { type: 'STRING' },
    p4: { type: 'STRING' },
    highlights: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          category: { type: 'STRING' },
          text: { type: 'STRING' },
        },
        required: ['category', 'text'],
      },
    },
  },
  required: ['p1', 'p2', 'p3', 'p4', 'highlights'],
};

const HUMANIZE_RULES = `You are editing a job application document to sound more natural and human - not robotic or buzzword-heavy.
CRITICAL TRUTH RULES:
1. NEVER invent jobs, employers, degrees, dates, metrics, skills, or achievements.
2. Do NOT inflate experience or change factual meaning.
3. Keep the same number of experience items and the same number of newline-separated bullets per job.
4. Keep highlight count identical for cover letters.
5. Keep existing **bold** markers in experience bullets (Designer keyword highlight). Do not add bold inside resumeSkills.
6. Prefer clear verbs and concrete outcomes over stacked adjectives ("synergistic", "passionate about leveraging", etc.).
7. Keep a calm, professional Product Manager voice.
8. Never use the em dash character (—). Use a normal hyphen (-) or rewrite the sentence.
9. resumeSkills must stay a comma-separated list of plain skill names (no bullets, no **).
10. For cover letters: keep all four paragraphs fully written (each 2-4 sentences). Do not leave p3/p4 thin or truncated. Keep all highlights filled with concrete, complete sentences.
11. Return JSON only matching the schema.`;

export function buildHumanizeResumePayload(state: ResumeState): unknown {
  const prompt = `${HUMANIZE_RULES}

CURRENT RESUME (JSON):
${JSON.stringify({
    resumeSummary: state.resumeSummary,
    resumeSkills: state.resumeSkills,
    resumeExperience: state.resumeExperience.map((exp) => ({
      title: exp.title,
      company: exp.company,
      bulletCount: exp.bullets.split('\n').filter(Boolean).length,
      bullets: exp.bullets,
    })),
  }, null, 2)}`;

  return {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: HUMANIZE_RESUME_SCHEMA,
    },
  };
}

export function buildHumanizeCoverLetterPayload(state: CoverLetterState): unknown {
  const prompt = `${HUMANIZE_RULES}

CURRENT COVER LETTER (JSON):
${JSON.stringify({
    p1: state.p1,
    p2: state.p2,
    p3: state.p3,
    p4: state.p4,
    highlights: state.highlights,
  }, null, 2)}`;

  return {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: HUMANIZE_CL_SCHEMA,
    },
  };
}
