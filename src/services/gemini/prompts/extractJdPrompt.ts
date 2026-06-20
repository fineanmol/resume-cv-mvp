// ── JD HTML extraction ────────────────────────────────────────────────────────

const EXTRACT_JD_SCHEMA = {
  type: 'OBJECT',
  properties: {
    extractedJd: {
      type: 'STRING',
      description: 'The extracted clean text of the job description.',
    },
  },
  required: ['extractedJd'],
};

export function buildExtractJdFromHtmlPayload(rawHtml: string): unknown {
  const prompt = `SYSTEM INSTRUCTIONS:
You are an assistant that extracts the clean job description text from raw HTML crawled from a job listing website.
Remove all HTML tags, script blocks, styling, navigation links, and footers.
Extract only the job title, company name (if visible), and the full job description content including requirements, responsibilities, qualifications, and benefits.
Return the response in the exact JSON schema requested.

RAW HTML/TEXT TO PARSE:
${rawHtml.substring(0, 15000)}`;

  return {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: EXTRACT_JD_SCHEMA,
    },
  };
}
