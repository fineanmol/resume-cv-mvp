import { splitIntoBullets } from '../../utils/bullets';

export const parseEducationGrade = (bullets: string) => {
  const lines = splitIntoBullets(bullets);
  let gradeText = '';
  let gradeType: 'gpa' | 'medalist' | 'grade' | 'none' = 'none';
  const remainingBullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const gpaMatch = trimmed.match(/^(GPA|Grade|Medalist)\s*[:-]?\s*(.*)$/i);
    if (gpaMatch) {
      gradeType = gpaMatch[1].toLowerCase() as 'gpa' | 'medalist' | 'grade';
      const val = gpaMatch[2].trim();
      if (gradeType === 'gpa') {
        gradeText = val.toUpperCase().includes('GPA') ? val : `GPA\n${val}`;
      } else if (gradeType === 'medalist') {
        gradeText = val.toUpperCase().includes('MEDALIST') ? val : `Medalist 🏆\n${val}`;
      } else {
        gradeText = val.toUpperCase().includes('GRADE') ? val : `Grade\n${val}`;
      }
    } else {
      remainingBullets.push(line);
    }
  }

  return { gradeText, gradeType, remaining: remainingBullets.join('\n') };
};

const GRADE_LINE_RE = /^(GPA|Grade|Medalist)\s*[:-]?/i;

/** Recombine GPA/grade prefix lines with updated coursework bullets after canvas edits. */
export function mergeEducationBullets(originalBullets: string, updatedRemaining: string): string {
  const prefixLines = (originalBullets ? originalBullets.split(/\r?\n/) : []).filter((line) =>
    GRADE_LINE_RE.test(line.trim()),
  );
  const remainingLines = updatedRemaining.split('\n');
  return [...prefixLines, ...remainingLines].join('\n');
};
