export type FontFamily = 'inter' | 'outfit' | 'plus-jakarta' | 'poppins' | 'playfair' | 'eb-garamond' | 'lora' | 'jetbrains-mono';
export type HeaderStyle = 'centered' | 'left' | 'banner' | 'minimal';

export interface LayoutSettings {
  fontSize: number;
  paddingTopBottom: number;
  paddingLeftRight: number;
  sectionSpacing: number;
  lineHeight: number;
  template?: 'navy' | 'serif' | 'sidebar' | 'tech' | 'ats' | 'executive';
  brandColor?: string;        // primary accent (headers, borders, bullets)
  accentColor2?: string;      // secondary accent (badges, highlights)
  fontFamily?: FontFamily;    // body font
  headingFont?: FontFamily;   // heading / name font (can differ from body)
  headerStyle?: HeaderStyle;  // layout variant for the name/contact block
  showPhoto?: boolean;        // whether to display avatar in templates that support it
  bulletStyle?: 'disc' | 'circle' | 'square' | 'dash' | 'arrow' | 'number' | 'none';
  skillsStyle?: 'chips' | 'normal';
  summaryAlign?: 'left' | 'center' | 'right' | 'justify';
  experienceAlign?: 'left' | 'center' | 'right' | 'justify';
  educationAlign?: 'left' | 'center' | 'right' | 'justify';
  certsAlign?: 'left' | 'center' | 'right' | 'justify';
  achievementsAlign?: 'left' | 'center' | 'right' | 'justify';
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
  url?: string;
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
  url?: string;
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

export type TemplateId = 'navy' | 'serif' | 'sidebar' | 'tech' | 'ats' | 'executive';

export type DocType = 'resume' | 'coverletter';

// Auth user — either a Firebase User or a local guest
export type LocalUser = { email: string; isLocal: true };
export type AuthUser = { email: string | null; uid?: string } | LocalUser;
export const isLocalUser = (u: AuthUser): u is LocalUser => 'isLocal' in u && u.isLocal === true;
export const userEmail = (u: AuthUser): string => u.email ?? '';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
