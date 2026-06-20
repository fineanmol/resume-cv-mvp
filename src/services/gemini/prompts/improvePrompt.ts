// ── Bullet-point improver ─────────────────────────────────────────────────────

const IMPROVE_BULLET_SCHEMA = {
  type: 'OBJECT',
  properties: {
    improvedBullet: {
      type: 'STRING',
      description: 'The refined, professional, and impact-focused bullet points.',
    },
  },
  required: ['improvedBullet'],
};

export function buildImproveBulletPayload(
  bulletText: string,
  jobTitle?: string,
  jdText?: string,
): unknown {
  const prompt = `SYSTEM INSTRUCTIONS:
You are an expert Resume and CV writer. Your goal is to improve the experience bullet point(s) provided.
CRITICAL INSTRUCTIONS:
1. STRICT TRUTH & FACTUAL INTEGRITY: You must keep all statements 100% grounded in the candidate's original text.
   - NEVER inflate, exaggerate, or invent qualifications, metrics, years of experience, or skills.
   - Do NOT lie or invent facts.
2. If jobTitle or jdText (Job Description) are provided, tailor the bullet points to highlight skills and achievements relevant to that job role.
3. Optimize the text to be punchy, impact-focused, and use strong action verbs.
4. Keep the output format matching the input format.
5. Return the response in the exact JSON schema requested.
6. JSON ESCAPING RULE: All string values in the JSON output MUST be properly escaped.

ORIGINAL BULLET POINT(S):
${bulletText}

${jobTitle ? `TARGET JOB TITLE: ${jobTitle}` : ''}
${jdText ? `TARGET JOB DESCRIPTION:\n${jdText}` : ''}`;

  return {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: IMPROVE_BULLET_SCHEMA,
    },
  };
}
