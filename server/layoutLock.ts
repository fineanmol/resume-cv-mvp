import type { CoverLetterState, ResumeState } from '../src/types';

/**
 * FROZEN Sakshi Product Resume layout — pixel-matched to
 * applications/uploads/Sakshi Product Resume.pdf (2026-07-16).
 *
 * Applied on every PDF export via sanitizeResumeForExport / exportDesignerPdfs.
 * Do not loosen these without re-running scripts/compare-pdfs.py against the golden PDF.
 */
export const DESIGNER_LAYOUT_LOCK_VERSION = 'sakshi-product-resume-2026-07-16';

export const DESIGNER_LAYOUT_LOCK: Readonly<Partial<ResumeState['layoutSettings']>> = Object.freeze({
  template: 'designer' as const,
  brandColor: '#343334',
  accentColor2: '#00B6CB',
  titleColor: '#343334',
  bodyTextColor: '#3E3E3E',
  fontFamily: 'open-sans',
  headingFont: 'raleway',
  titleFont: 'raleway',
  accentFont: 'open-sans',
  fontSize: 10,
  paddingTopBottom: 8,
  paddingLeftRight: 10.5,
  sectionSpacing: 14,
  entrySpacing: 6,
  /** Masters ↔ Bachelors gap (slightly looser than experience entries). */
  educationEntrySpacing: 12,
  lineHeight: 1.28,
  columnGap: 16,
  bulletStyle: 'disc',
  skillsStyle: 'grid',
  summaryAlign: 'justify',
  experienceAlign: 'left',
  educationAlign: 'left',
  certsAlign: 'left',
  achievementsAlign: 'left',
  headerStyle: 'left',
  showPhoto: true,
  roundPhoto: true,
  uppercaseName: true,
  showPhone: false,
  showEmail: true,
  showLocation: true,
  showLinkedin: true,
  showTitle: true,
  showLanguageLevel: true,
  showSummaryBullets: false,
  showProjectBullets: false,
  showAchievementBullets: false,
  showProjectDesc: true,
  showAchievementDesc: true,
  showProjectIcons: true,
  showAchievementIcons: true,
  showExperienceLogo: false,
  showEducationLogo: false,
  designerLeftSections: Object.freeze(['education', 'experience', 'languages']) as string[],
  designerRightSections: Object.freeze(['summary', 'skills', 'certs', 'achievements']) as string[],
});

export const CL_LAYOUT_LOCK: Readonly<Partial<CoverLetterState['layoutSettings']>> = Object.freeze({
  template: 'professional' as const,
  /** 10pt fills the sheet better than 9 (was visually sparse). */
  fontSize: 10,
  paddingTopBottom: 14.5,
  paddingLeftRight: 15,
  sectionSpacing: 10,
  lineHeight: 1.35,
  headerStyle: 'left',
  uppercaseName: true,
  showPhoto: true,
  brandColor: '#343334',
  accentColor2: '#00B6CB',
});

/** Language row lock: name + level on one line, no bubbles. */
export const LANGUAGE_VISIBILITY_LOCK = Object.freeze({
  slider: false,
  level: true,
});

/**
 * Golden skill chip order from Sakshi Product Resume.pdf (1-page fit).
 * Tailor/humanize often reorders long chips (e.g. Stakeholder Management,
 * Key performance indicators) and blows the nowrap grid onto page 2.
 * Always re-align to this order on export.
 */
export const MASTER_RESUME_SKILLS =
  'Product Strategy, MVP, Scrum, SDLC, Requirement Gathering, Release Planning, Kanban, SQL, Market Research, SAP, Customer-Centric, A/B Testing, Figma, UI/UX, Power BI, Confluence, n8n, Optimizely, Sprint Planning, MS Office, Conflict Management, Pricing, ETL tools, GitHub, Key performance indicators (KPIs), Stakeholder Management, Google Analytics, JIRA, Project management, Miro, KYC';

/** Soft cap so tailored summaries cannot add an extra right-column line. */
export const MASTER_SUMMARY_MAX_CHARS = 430;
