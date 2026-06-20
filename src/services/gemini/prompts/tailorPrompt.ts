import type { CoverLetterState, ResumeState } from '../../../types';

// ── Cover-letter tailor ───────────────────────────────────────────────────────

const TAILOR_COVER_LETTER_SCHEMA = {
  type: 'OBJECT',
  properties: {
    companyName: { type: 'STRING', description: 'Target company name' },
    jobTitle: { type: 'STRING', description: 'Target job title / role' },
    salutation: { type: 'STRING', description: "Salutation e.g. 'To the Recruitment Team,'" },
    p1: { type: 'STRING', description: 'Tailored intro paragraph with {{company}} and {{role}} placeholders' },
    p2: { type: 'STRING', description: 'Tailored body paragraph' },
    p3: { type: 'STRING', description: 'Tailored interest paragraph' },
    p4: { type: 'STRING', description: 'Tailored closing paragraph' },
    highlights: {
      type: 'ARRAY',
      description: 'Array of highlights, must match input length exactly.',
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
  required: ['companyName', 'jobTitle', 'salutation', 'p1', 'p2', 'p3', 'p4', 'highlights'],
};

export function buildTailorCoverLetterPayload(state: CoverLetterState, jobDesc: string): unknown {
  const prompt = `SYSTEM INSTRUCTIONS:
You are an expert CV and Cover Letter writer. Your goal is to tailor the user's cover letter paragraphs and highlight bullets to a job description.
CRITICAL INSTRUCTIONS:
1. STRICT TRUTH & FACTUAL INTEGRITY: You must keep all statements 100% grounded in the candidate's original text. 
   - NEVER inflate, exaggerate, or invent qualifications, metrics, years of experience, or skills.
   - Do NOT lie or invent facts to match the Job Description. E.g. if the JD asks for "10+ years of experience" and the candidate has "3 years", do NOT write that they have "10+ years".
   - Keep all details consistent with the original resume/profile dates and details.
2. Preserve all candidate contact details (their name, subtitle, email, phone, location, LinkedIn). Do not invent credentials they do not have.
3. Incorporate the company name and target role naturally in the letter.
4. ATS COMPATIBILITY OPTIMIZATION: Identify key technical skills, technologies, methodologies, and terms requested in the Job Description. Naturally integrate as many of these exact keywords/skills as possible into the cover letter paragraphs and highlights where they align with the candidate's actual background. This is critical for passing ATS filters.
5. Optimize paragraphs p1, p2, p3, p4:
   - Use dynamic placeholders like {{company}} and {{role}} in the intro (p1).
   - Ensure other paragraphs are unbolded text containing no placeholders, but rich with active verbs and tailored skills.
6. Optimize the highlights list (array of category/text objects):
   - Match the exact number of highlights (currently ${state.highlights.length} items).
   - Refine the 'category' and 'text' fields to highlight achievements relevant to the target job description.
7. Return the response in the exact JSON schema requested. Do not return markdown wraps, just the raw JSON object.
8. JSON ESCAPING RULE: All string values in the JSON output MUST be properly escaped. Specifically, if you use double quotes inside a string value, you MUST escape them as \\" (e.g., write \\"Product Manager\\" instead of "Product Manager"). Do not include raw, unescaped double quotes inside your string values, as this breaks the JSON parser.

CURRENT COVER LETTER STATE (JSON):
${JSON.stringify({
    salutation: state.salutation,
    p1: state.p1,
    p2: state.p2,
    p3: state.p3,
    p4: state.p4,
    highlights: state.highlights,
  }, null, 2)}

JOB DESCRIPTION:
${jobDesc}`;

  return {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: TAILOR_COVER_LETTER_SCHEMA,
    },
  };
}

// ── Resume tailor ─────────────────────────────────────────────────────────────

const TAILOR_RESUME_SCHEMA = {
  type: 'OBJECT',
  properties: {
    resumeSummary: { type: 'STRING', description: 'Tailored summary paragraph' },
    resumeSkills: { type: 'STRING', description: 'Tailored skills list' },
    resumeExperience: {
      type: 'ARRAY',
      description: 'Must contain exactly the same number of items as the input.',
      items: {
        type: 'OBJECT',
        properties: {
          bullets: { type: 'STRING', description: 'Tailored experience bullets separated by newlines.' },
        },
        required: ['bullets'],
      },
    },
  },
  required: ['resumeSummary', 'resumeSkills', 'resumeExperience'],
};

export function buildTailorResumePayload(state: ResumeState, jobDesc: string): unknown {
  const prompt = `SYSTEM INSTRUCTIONS:
You are an expert CV and Resume writer. Your goal is to tailor the user's resume summary, skills list, and job experience bullets to a job description.
CRITICAL INSTRUCTIONS:
1. STRICT TRUTH & FACTUAL INTEGRITY: You must keep all statements 100% grounded in the candidate's original text. 
   - NEVER inflate, exaggerate, or invent qualifications, metrics, years of experience, or skills.
   - Do NOT lie or invent facts to match the Job Description. E.g. if the JD asks for "10+ years of experience" and the candidate has "3 years", do NOT write that they have "10+ years".
   - Keep all details consistent with the original resume/profile dates and details.
2. Preserve all structural and factual details of the candidate's resume (their name, subtitle, locations, degrees, schools, GPA/dates, company names, titles, and employment dates). Do not invent new jobs, dates, credentials, or projects they do not have.
3. ATS COMPATIBILITY OPTIMIZATION: Identify key technical skills, technologies, methodologies, and terms requested in the Job Description. Naturally integrate as many of these exact keywords/skills as possible into the resumeSummary, resumeSkills list, and job experience bullets where they align with the candidate's actual background. This is critical for passing ATS keyword filters.
4. Optimize the resumeSummary to align with the job's key focus areas.
5. Optimize the resumeSkills (a comma-separated list) to include the most relevant hard and soft skills extracted from the job description that fit the candidate's profile.
6. Optimize the bullets in the resumeExperience list:
   - Match the exact number of experience items (currently ${state.resumeExperience.length} items).
   - For each job, rewrite or refine the bullet points to highlight skills, tasks, and achievements relevant to the target job description.
   - Use markdown **bolding** (e.g. **Agile**, **PRD**, **SaaS**, **A/B Testing**) to highlight matching terms and metrics.
   - Keep the length and format consistent so it fits nicely.
7. KEYWORD & TERM UNIQUE ENFORCEMENT: Ensure that key terms or skills are not repeated redundantly across different sections. Each keyword or key achievement should be highlighted only once in the resume to maintain a diverse, professional, and non-repetitive narrative.
8. Return the response in the exact JSON schema requested. Do not return markdown wraps, just the raw JSON object.
9. JSON ESCAPING RULE: All string values in the JSON output MUST be properly escaped. Specifically, if you use double quotes inside a string value, you MUST escape them as \\" (e.g., write \\"Product Manager\\" instead of "Product Manager"). Do not include raw, unescaped double quotes inside your string values, as this breaks the JSON parser.

CURRENT RESUME STATE (JSON):
${JSON.stringify({
    resumeSummary: state.resumeSummary,
    resumeSkills: state.resumeSkills,
    resumeExperience: state.resumeExperience.map(exp => ({
      title: exp.title,
      company: exp.company,
      bullets: exp.bullets,
    })),
  }, null, 2)}

JOB DESCRIPTION:
${jobDesc}`;

  return {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: TAILOR_RESUME_SCHEMA,
    },
  };
}
