export type EditableFieldKey =
  | 'summary'
  | 'experience.title'
  | 'experience.company'
  | 'experience.dates'
  | 'experience.location'
  | 'experience.bullets'
  | 'education.degree'
  | 'education.school'
  | 'education.dates'
  | 'education.location'
  | 'education.bullets'
  | 'projects.title'
  | 'projects.description'
  | 'achievements.title'
  | 'achievements.description'
  | 'languages.name'
  | 'languages.level'
  | 'header.name'
  | 'header.subtitle'
  | 'header.phone'
  | 'header.email'
  | 'header.linkedin'
  | 'header.location'
  | 'skills';

export const FIELD_PLACEHOLDERS: Record<EditableFieldKey, string> = {
  summary: 'Write a 2–4 sentence professional summary highlighting your expertise, achievements, and career goals.',
  'experience.title': 'Job Title',
  'experience.company': 'Company',
  'experience.dates': 'Dates',
  'experience.location': 'Location',
  'experience.bullets': 'Describe responsibility or achievement...',
  'education.degree': 'Degree',
  'education.school': 'School',
  'education.dates': 'Dates',
  'education.location': 'Location',
  'education.bullets': 'GPA, coursework, honors...',
  'projects.title': 'Project / Certification Name',
  'projects.description': 'Description / tech stack / issuer...',
  'achievements.title': 'Achievement Title',
  'achievements.description': 'Impact / scale (e.g. Increased revenue by 30%)',
  'languages.name': 'Language',
  'languages.level': 'Proficiency',
  'header.name': 'Your Name',
  'header.subtitle': 'Professional Title',
  'header.phone': 'Phone',
  'header.email': 'Email',
  'header.linkedin': 'LinkedIn',
  'header.location': 'Location',
  skills: 'Add skill...',
};

export function getFieldPlaceholder(field: EditableFieldKey): string {
  return FIELD_PLACEHOLDERS[field];
}
