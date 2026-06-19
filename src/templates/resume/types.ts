import type {
  ResumeState,
  ResumeLayoutSettings,
  ExperienceItem,
  EducationItem,
  CertItem,
  AchievementItem,
  LanguageItem,
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
  onAddEducation?: () => void;
  onDeleteEducation?: (index: number) => void;
  onAddCert?: () => void;
  onDeleteCert?: (index: number) => void;
  onAddAchievement?: () => void;
  onDeleteAchievement?: (index: number) => void;
  onAddLanguage?: () => void;
  onDeleteLanguage?: (index: number) => void;
  onLayoutSettingsChange?: (patch: Partial<ResumeLayoutSettings>) => void;
}
