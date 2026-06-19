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
