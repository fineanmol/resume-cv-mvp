import type {
  ResumeState,
  ResumeLayoutSettings,
  ExperienceItem,
  EducationItem,
  CertItem,
  AchievementItem,
  LanguageItem,
  EntrySection,
} from '../../types';

export interface ResumeTemplateProps {
  state: ResumeState;
  isEditable?: boolean;
  onFieldChange?: <K extends keyof ResumeState>(field: K, value: ResumeState[K]) => void;
  onExperienceChange?: (index: number, field: keyof ExperienceItem, value: string) => void;
  onEducationChange?: (index: number, field: keyof EducationItem, value: string) => void;
  onCertChange?: (index: number, field: keyof CertItem, value: string) => void;
  onAchievementChange?: (index: number, field: keyof AchievementItem, value: string) => void;
  onLanguageChange?: (index: number, field: keyof LanguageItem, value: string) => void;
  onAddExperience?: () => void;
  onDeleteExperience?: (index: number) => void;
  onDuplicateExperience?: (index: number) => void;
  onAddSimilarExperience?: (index: number) => void;
  onAddEducation?: () => void;
  onDeleteEducation?: (index: number) => void;
  onDuplicateEducation?: (index: number) => void;
  onAddSimilarEducation?: (index: number) => void;
  onAddCert?: () => void;
  onDeleteCert?: (index: number) => void;
  onDuplicateCert?: (index: number) => void;
  onAddSimilarCert?: (index: number) => void;
  onAddAchievement?: () => void;
  onDeleteAchievement?: (index: number) => void;
  onDuplicateAchievement?: (index: number) => void;
  onAddSimilarAchievement?: (index: number) => void;
  onAddLanguage?: () => void;
  onDeleteLanguage?: (index: number) => void;
  onDuplicateLanguage?: (index: number) => void;
  onAddSimilarLanguage?: (index: number) => void;
  onEntryVisibilityChange?: (section: EntrySection, index: number, field: string, value: boolean) => void;
  onLayoutSettingsChange?: (patch: Partial<ResumeLayoutSettings>) => void;
}
