/**
 * Extract ATS-relevant keywords from a job description.
 * Prefer known skill phrases; never treat high-frequency filler / German
 * function words as keywords (those were getting stuffed into resumes).
 */
export function extractKeywords(jd: string): string[] {
  if (!jd) return [];

  const lowercaseJd = jd.toLowerCase();

  const commonTechSkills = [
    'product management',
    'product manager',
    'product owner',
    'project management',
    'software development',
    'product strategy',
    'product roadmap',
    'roadmaps',
    'market research',
    'data analysis',
    'user research',
    'user experience',
    'agile methodology',
    'agile methodologies',
    'scrum master',
    'cross functional',
    'cross-functional',
    'stakeholder management',
    'stakeholder engagement',
    'a/b testing',
    'ab testing',
    'user stories',
    'acceptance criteria',
    'wireframes',
    'figma',
    'jira',
    'confluence',
    'github',
    'optimizely',
    'amplitude',
    'google analytics',
    'power bi',
    'tableau',
    'sql',
    'python',
    'java',
    'react',
    'typescript',
    'javascript',
    'api integration',
    'saas product',
    'saas products',
    'fintech',
    'e-commerce',
    'ecommerce',
    'go-to-market',
    'backlog',
    'prioritization',
    'experimentation',
    'kpi',
    'okrs',
    'b2b',
    'saas',
    'crm',
    'salesforce',
    'machine learning',
    'c++',
    'c#',
    '.net',
  ];

  /** Single-token skills that are safe to score on (allowlist only). */
  const allowedSingleSkills = new Set([
    'sql',
    'python',
    'java',
    'react',
    'typescript',
    'javascript',
    'figma',
    'jira',
    'confluence',
    'github',
    'optimizely',
    'amplitude',
    'tableau',
    'fintech',
    'saas',
    'b2b',
    'crm',
    'salesforce',
    'scrum',
    'kanban',
    'agile',
    'roadmap',
    'roadmaps',
    'backlog',
    'analytics',
    'kpi',
    'okrs',
    'api',
    'apis',
    'ux',
    'ui',
    'seo',
    'gtm',
    'mvp',
    'prd',
    'prds',
    'c++',
    'c#',
    '.net',
  ]);

  const foundSkills: string[] = [];
  for (const skill of commonTechSkills) {
    if (lowercaseJd.includes(skill)) foundSkills.push(skill);
  }

  // Also pick allowlisted single tokens that appear in the JD (for C++ / SQL etc.)
  const words = lowercaseJd.match(/\b[a-z0-9\-+#'.]+\b/g) || [];
  const frequencies: Record<string, number> = {};
  for (const w of words) {
    if (!allowedSingleSkills.has(w)) continue;
    frequencies[w] = (frequencies[w] || 0) + 1;
  }
  const topAllowedSingles = Object.keys(frequencies)
    .sort((a, b) => frequencies[b] - frequencies[a])
    .slice(0, 12);

  const germanFiller = new Set([
    'und', 'oder', 'der', 'die', 'das', 'mit', 'von', 'für', 'nicht', 'sich',
    'wir', 'eine', 'einer', 'erfahrung', 'zusammenarbeit', 'arbeiten', 'kenntnisse',
    'anforderungen', 'aufgaben', 'lösung', 'lösungen', 'unterstützt', 'unserer',
  ]);

  const allKeywords = Array.from(new Set([...foundSkills, ...topAllowedSingles])).filter(
    (kw) => {
      const k = kw.toLowerCase();
      if (germanFiller.has(k)) return false;
      if (/[äöüß]/i.test(k)) return false; // resume is English — never score DE-only tokens
      return true;
    },
  );
  return allKeywords.sort((a, b) => b.length - a.length);
}
