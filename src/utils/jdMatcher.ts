export function extractKeywords(jd: string): string[] {
  if (!jd) return [];
  
  const words = jd.toLowerCase().match(/\b[a-z0-9\-+#']+\b/g) || [];
  
  const stopWords = new Set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
    'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
    'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can',
    'will', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain',
    'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn',
    'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn', 'using', 'experience',
    'work', 'role', 'team', 'company', 'job', 'skills', 'hiring', 'opportunity', 'requirements',
    'candidate', 'description', 'position', 'requirements', 'responsibilities', 'qualification',
    'qualifications', 'successful', 'ideal'
  ]);

  const candidateKeywords = words.filter(w => w.length > 3 && !stopWords.has(w));
  
  const frequencies: { [key: string]: number } = {};
  candidateKeywords.forEach(w => {
    frequencies[w] = (frequencies[w] || 0) + 1;
  });

  const commonTechSkills = [
    'product management', 'product manager', 'project management', 'software development',
    'product strategy', 'product roadmap', 'market research', 'data analysis', 'user research',
    'agile methodology', 'agile methodologies', 'scrum master', 'cross functional', 'cross-functional',
    'stakeholder management', 'stakeholder engagement', 'a/b testing', 'ab testing', 'user experience',
    'user stories', 'acceptance criteria', 'wireframes', 'figma', 'jira', 'confluence', 'github',
    'optimizely', 'amplitude', 'google analytics', 'power bi', 'tableau', 'sql', 'python', 'java',
    'react', 'typescript', 'javascript', 'api integration', 'saas product', 'saas products', 'fintech',
    'c++', 'c#', '.net'
  ];

  const foundSkills: string[] = [];
  const lowercaseJd = jd.toLowerCase();
  commonTechSkills.forEach(skill => {
    if (lowercaseJd.includes(skill)) {
      foundSkills.push(skill);
    }
  });

  const sortedWords = Object.keys(frequencies).sort((a, b) => frequencies[b] - frequencies[a]);
  const topSingleWords = sortedWords.slice(0, 20);

  const allKeywords = Array.from(new Set([...foundSkills, ...topSingleWords]));
  
  return allKeywords.sort((a, b) => b.length - a.length);
}
