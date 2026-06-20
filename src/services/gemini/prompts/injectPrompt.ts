import type { CoverLetterState, ResumeState } from '../../../types';

// ── Keyword injection — cover letter ─────────────────────────────────────────

const INJECT_CL_SCHEMA = {
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
};

export function buildInjectKeywordIntoCoverLetterPayload(
  state: CoverLetterState,
  keyword: string,
): unknown {
  const prompt = `SYSTEM INSTRUCTIONS:
You are an expert CV and Cover Letter writer. The candidate is missing the keyword: '${keyword}'.
Your task is to naturally insert this keyword into one of the cover letter paragraphs (p1, p2, p3, p4) or highlights list where it fits most logically.
CRITICAL INSTRUCTIONS:
1. STRICT TRUTH & FACTUAL INTEGRITY: Keep all statements 100% grounded in the candidate's original text. Do not invent new skills or experience details.
2. Insert the keyword naturally.
3. OUTPUT PLAIN TEXT ONLY — do NOT use any markdown formatting. No bold (**text**), no italics, no asterisks around words.
4. Return ONLY the modified fields (p1, p2, p3, p4, and highlights) that were updated.
5. JSON ESCAPING RULE: All string values in the JSON output MUST be properly escaped.

CURRENT COVER LETTER STATE (JSON):
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
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: INJECT_CL_SCHEMA,
    },
  };
}

// ── Keyword injection — resume ────────────────────────────────────────────────

const INJECT_RESUME_SCHEMA = {
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
};

export function buildInjectKeywordIntoResumePayload(
  state: ResumeState,
  keyword: string,
): unknown {
  const prompt = `SYSTEM INSTRUCTIONS:
You are an expert Resume writer. The candidate is missing the keyword: '${keyword}'.
Your task is to naturally insert this keyword into the resumeSummary, resumeSkills list, or experience bullets where it fits most logically.
CRITICAL INSTRUCTIONS:
1. STRICT TRUTH & FACTUAL INTEGRITY: Keep all statements 100% grounded in the candidate's original text. Do not invent new skills or experience details.
2. Insert the keyword naturally.
3. OUTPUT PLAIN TEXT ONLY — do NOT use any markdown formatting. No bold (**text**), no italics, no asterisks around words.
4. Return ONLY the modified fields (resumeSummary, resumeSkills, and resumeExperience) that were updated.
5. JSON ESCAPING RULE: All string values in the JSON output MUST be properly escaped.

CURRENT RESUME STATE (JSON):
${JSON.stringify({
    resumeSummary: state.resumeSummary,
    resumeSkills: state.resumeSkills,
    resumeExperience: state.resumeExperience.map(exp => ({
      title: exp.title,
      company: exp.company,
      bullets: exp.bullets,
    })),
  }, null, 2)}`;

  return {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: INJECT_RESUME_SCHEMA,
    },
  };
}
