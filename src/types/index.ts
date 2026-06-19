export type FontFamily = 'inter' | 'outfit' | 'plus-jakarta' | 'poppins' | 'playfair' | 'eb-garamond' | 'lora' | 'jetbrains-mono' | 'raleway' | 'open-sans';
export type HeaderStyle = 'centered' | 'left' | 'banner' | 'minimal' | 'enhancv';

export interface LayoutSettings {
  fontSize: number;
  paddingTopBottom: number;
  paddingLeftRight: number;
  sectionSpacing: number;
  lineHeight: number;
  /** Gap between individual entries within a section (px) */
  entrySpacing?: number;
  /** Gap between designer template left/right columns (px) */
  columnGap?: number;
  template?: 'navy' | 'serif' | 'sidebar' | 'tech' | 'ats' | 'executive' | 'designer';
  brandColor?: string;        // primary accent (headers, borders, bullets)
  accentColor2?: string;      // secondary accent (badges, highlights)
  fontFamily?: FontFamily;    // body font
  headingFont?: FontFamily;   // heading / name font (can differ from body)
  /** Title font — entry titles like job role, degree, project title (Designer template) */
  titleFont?: FontFamily;
  /** Accent font — company/school names, subtitle (Designer template) */
  accentFont?: FontFamily;
  headerStyle?: HeaderStyle;  // layout variant for the name/contact block
  showPhoto?: boolean;        // whether to display avatar in templates that support it
  bulletStyle?: 'disc' | 'circle' | 'square' | 'dash' | 'arrow' | 'number' | 'none';
  skillsStyle?: 'chips' | 'normal' | 'grid';
  summaryAlign?: 'left' | 'center' | 'right' | 'justify';
  experienceAlign?: 'left' | 'center' | 'right' | 'justify';
  educationAlign?: 'left' | 'center' | 'right' | 'justify';
  certsAlign?: 'left' | 'center' | 'right' | 'justify';
  achievementsAlign?: 'left' | 'center' | 'right' | 'justify';
  showLayoutBounds?: boolean;
  designerLeftSections?: string[];
  designerRightSections?: string[];
  roundPhoto?: boolean;
  /** Profile photo clip shape (designer + header). Falls back to roundPhoto when unset. */
  photoShape?: 'circle' | 'rounded' | 'square' | 'squircle';
  showPhone?: boolean;
  showEmail?: boolean;
    showLocation?: boolean;
  showLinkedin?: boolean;
  showTitle?: boolean;
  uppercaseName?: boolean;
  // Category-specific layout options
  showAchievementIcons?: boolean;
  showAchievementDesc?: boolean;
  showAchievementBullets?: boolean;
  showProjectIcons?: boolean;
  showProjectDesc?: boolean;
  showProjectBullets?: boolean;
  showSummaryBullets?: boolean;
  showExperienceDates?: boolean;
  showExperienceLocation?: boolean;
  showExperienceCompany?: boolean;
  showExperienceLogo?: boolean;
  showEducationDates?: boolean;
  showEducationLocation?: boolean;
  showEducationGpa?: boolean;
  showEducationLogo?: boolean;
  showLanguageLevel?: boolean;
  /** Entry title color – job role, degree, project/achievement title (Designer template) */
  titleColor?: string;
  /** Body / description text color (default #3E3E3E for Designer template) */
  bodyTextColor?: string;
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

export interface ExperienceEntryVisibility {
  dates?: boolean;
  location?: boolean;
  company?: boolean;
  logo?: boolean;
  bullets?: boolean;
  link?: boolean;
}

export interface EducationEntryVisibility {
  gpa?: boolean;
  location?: boolean;
  dates?: boolean;
  bullets?: boolean;
  logo?: boolean;
}

export interface CertEntryVisibility {
  desc?: boolean;
  bullets?: boolean;
  link?: boolean;
  icon?: boolean;
}

export interface AchievementEntryVisibility {
  desc?: boolean;
  bullets?: boolean;
  icon?: boolean;
  link?: boolean;
}

export interface LanguageEntryVisibility {
  level?: boolean;
  slider?: boolean;
}

export type EntrySection = 'experience' | 'education' | 'certs' | 'achievements' | 'languages';

export interface ExperienceItem {
  title: string;
  company: string;
  dates: string;
  location: string;
  bullets: string;
  url?: string;
  logo?: string;
  visibility?: ExperienceEntryVisibility;
}

export interface EducationItem {
  degree: string;
  school: string;
  dates: string;
  location: string;
  bullets: string;
  logo?: string;
  visibility?: EducationEntryVisibility;
}

export interface CertItem {
  title: string;
  desc: string;
  url?: string;
  icon?: string;
  visibility?: CertEntryVisibility;
}

export interface AchievementItem {
  title: string;
  desc: string;
  icon?: string;
  url?: string;
  visibility?: AchievementEntryVisibility;
}

export interface LanguageItem {
  name: string;
  level: string;
  visibility?: LanguageEntryVisibility;
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

export type TemplateId = 'navy' | 'serif' | 'sidebar' | 'tech' | 'ats' | 'executive' | 'designer';

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
