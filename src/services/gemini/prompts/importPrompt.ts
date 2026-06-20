// ── PDF resume import / parse ─────────────────────────────────────────────────

export const IMPORT_PROMPT_TEXT =
  'Parse this resume PDF and extract the details into the requested JSON schema. Make sure to capture contact details, professional summary, skills list, work experiences, education, certifications, key achievements, and languages.';

export const IMPORT_RESUME_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING' },
    subtitle: { type: 'STRING' },
    phone: { type: 'STRING' },
    email: { type: 'STRING' },
    linkedin: { type: 'STRING' },
    location: { type: 'STRING' },
    resumeSummary: { type: 'STRING' },
    resumeSkills: { type: 'STRING' },
    resumeExperience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          company: { type: 'STRING' },
          dates: { type: 'STRING' },
          location: { type: 'STRING' },
          bullets: {
            type: 'STRING',
            description:
              'Experience bullet points/achievements. Split multiple achievements with newlines (\\n). Do NOT include leading bullet characters.',
          },
        },
        required: ['title', 'company', 'dates', 'location', 'bullets'],
      },
    },
    resumeEducation: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          degree: { type: 'STRING' },
          school: { type: 'STRING' },
          dates: { type: 'STRING' },
          location: { type: 'STRING' },
          bullets: {
            type: 'STRING',
            description:
              'Education details or bullet points. Split multiple items with newlines (\\n). Do NOT include leading bullet characters.',
          },
        },
        required: ['degree', 'school', 'dates', 'location', 'bullets'],
      },
    },
    resumeCerts: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          desc: { type: 'STRING' },
        },
        required: ['title', 'desc'],
      },
    },
    resumeAchievements: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          desc: { type: 'STRING' },
        },
        required: ['title', 'desc'],
      },
    },
    resumeLanguages: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          level: { type: 'STRING' },
        },
        required: ['name', 'level'],
      },
    },
  },
  required: [
    'name', 'subtitle', 'phone', 'email', 'linkedin', 'location',
    'resumeSummary', 'resumeSkills', 'resumeExperience', 'resumeEducation',
    'resumeCerts', 'resumeAchievements', 'resumeLanguages',
  ],
};

export function buildParseResumePdfPayload(base64Data: string): unknown {
  return {
    contents: [
      {
        role: 'user',
        parts: [
          { text: IMPORT_PROMPT_TEXT },
          { inlineData: { mimeType: 'application/pdf', data: base64Data } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: IMPORT_RESUME_SCHEMA,
    },
  };
}
