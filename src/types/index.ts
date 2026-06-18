export interface LayoutSettings {
  fontSize: number;
  paddingTopBottom: number;
  paddingLeftRight: number;
  sectionSpacing: number;
  lineHeight: number;
  template?: 'navy' | 'serif' | 'sidebar' | 'tech';
  brandColor?: string; // Hex code or Tailwind color suffix
}

export interface HighlightItem {
  category: string;
  text: string;
}

export interface CoverLetterState {
  id?: string;
  title?: string;
  name: string;
  subtitle: string;
  phone: string;
  email: string;
  linkedin: string;
  location: string;
  avatar: string;
  companyName: string;
  jobTitle: string;
  salutation: string;
  p1: string;
  p2: string;
  p3: string;
  p4: string;
  highlights: HighlightItem[];
  layoutSettings: LayoutSettings;
}

export interface ResumeLayoutSettings extends LayoutSettings {
  columnGap: number;
}

export interface ExperienceItem {
  title: string;
  company: string;
  dates: string;
  location: string;
  bullets: string;
}

export interface EducationItem {
  degree: string;
  school: string;
  dates: string;
  location: string;
  bullets: string;
}

export interface CertItem {
  title: string;
  desc: string;
}

export interface AchievementItem {
  title: string;
  desc: string;
  icon: 'flag' | 'star' | 'check';
}

export interface LanguageItem {
  name: string;
  level: string;
}

export interface ResumeState {
  id?: string;
  title?: string;
  name: string;
  subtitle: string;
  phone: string;
  email: string;
  linkedin: string;
  location: string;
  avatar: string;
  resumeSummary: string;
  resumeSkills: string;
  resumeExperience: ExperienceItem[];
  resumeEducation: EducationItem[];
  resumeCerts: CertItem[];
  resumeAchievements: AchievementItem[];
  resumeLanguages: LanguageItem[];
  layoutSettings: ResumeLayoutSettings;
}

export interface DocumentMetadata {
  id: string;
  type: 'resume' | 'coverletter';
  title: string;
  updatedAt: number;
}
