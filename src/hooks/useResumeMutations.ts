import { useCallback } from 'react';
import type {
  ResumeState,
  ExperienceItem,
  EducationItem,
  CertItem,
  AchievementItem,
  LanguageItem,
  ResumeLayoutSettings,
} from '../types';

export type ResumeSet = (
  newState: ResumeState | ((prev: ResumeState) => ResumeState),
  skipHistory?: boolean
) => void;

export function useResumeMutations(set: ResumeSet) {
  const onFieldChange = useCallback(
    (field: keyof ResumeState, value: unknown) => {
      set(prev => ({ ...prev, [field]: value }));
    },
    [set]
  );

  const onExperienceChange = useCallback(
    (index: number, field: keyof ExperienceItem, value: string) => {
      set(prev => {
        const updated = [...prev.resumeExperience];
        updated[index] = { ...updated[index], [field]: value };
        return { ...prev, resumeExperience: updated };
      });
    },
    [set]
  );

  const onAddExperience = useCallback(() => {
    set(prev => ({
      ...prev,
      resumeExperience: [
        ...prev.resumeExperience,
        {
          company: 'New Company',
          title: 'New Position',
          dates: '2026 - Present',
          location: 'City, Country',
          bullets: '• Accomplished X using Y.\n• Led team of Z.',
        },
      ],
    }));
  }, [set]);

  const onDeleteExperience = useCallback(
    (index: number) => {
      set(prev => ({
        ...prev,
        resumeExperience: prev.resumeExperience.filter((_, i) => i !== index),
      }));
    },
    [set]
  );

  const onEducationChange = useCallback(
    (index: number, field: keyof EducationItem, value: string) => {
      set(prev => {
        const updated = [...prev.resumeEducation];
        updated[index] = { ...updated[index], [field]: value };
        return { ...prev, resumeEducation: updated };
      });
    },
    [set]
  );

  const onAddEducation = useCallback(() => {
    set(prev => ({
      ...prev,
      resumeEducation: [
        ...prev.resumeEducation,
        {
          school: 'New University',
          degree: 'Degree Name',
          dates: '2022 - 2026',
          location: 'City, Country',
          bullets: 'GPA: 3.8/4.0',
        },
      ],
    }));
  }, [set]);

  const onDeleteEducation = useCallback(
    (index: number) => {
      set(prev => ({
        ...prev,
        resumeEducation: prev.resumeEducation.filter((_, i) => i !== index),
      }));
    },
    [set]
  );

  const onCertChange = useCallback(
    (index: number, field: keyof CertItem, value: string) => {
      set(prev => {
        const updated = [...prev.resumeCerts];
        updated[index] = { ...updated[index], [field]: value };
        return { ...prev, resumeCerts: updated };
      });
    },
    [set]
  );

  const onAddCert = useCallback(() => {
    set(prev => ({
      ...prev,
      resumeCerts: [
        ...(prev.resumeCerts || []),
        { title: 'New Project/Cert', desc: 'Description of project/cert' },
      ],
    }));
  }, [set]);

  const onDeleteCert = useCallback(
    (index: number) => {
      set(prev => ({
        ...prev,
        resumeCerts: prev.resumeCerts.filter((_, i) => i !== index),
      }));
    },
    [set]
  );

  const onAchievementChange = useCallback(
    (index: number, field: keyof AchievementItem, value: string) => {
      set(prev => {
        const updated = [...prev.resumeAchievements];
        updated[index] = { ...updated[index], [field]: value };
        return { ...prev, resumeAchievements: updated };
      });
    },
    [set]
  );

  const onAddAchievement = useCallback(() => {
    set(prev => ({
      ...prev,
      resumeAchievements: [
        ...(prev.resumeAchievements || []),
        { title: 'New Achievement', desc: 'Detail of achievement', icon: 'star' },
      ],
    }));
  }, [set]);

  const onDeleteAchievement = useCallback(
    (index: number) => {
      set(prev => ({
        ...prev,
        resumeAchievements: prev.resumeAchievements.filter((_, i) => i !== index),
      }));
    },
    [set]
  );

  const onLanguageChange = useCallback(
    (index: number, field: keyof LanguageItem, value: string) => {
      set(prev => {
        const updated = [...prev.resumeLanguages];
        updated[index] = { ...updated[index], [field]: value };
        return { ...prev, resumeLanguages: updated };
      });
    },
    [set]
  );

  const onAddLanguage = useCallback(() => {
    set(prev => ({
      ...prev,
      resumeLanguages: [
        ...(prev.resumeLanguages || []),
        { name: 'Language', level: 'Native' },
      ],
    }));
  }, [set]);

  const onDeleteLanguage = useCallback(
    (index: number) => {
      set(prev => ({
        ...prev,
        resumeLanguages: prev.resumeLanguages.filter((_, i) => i !== index),
      }));
    },
    [set]
  );

  const onLayoutSettingsChange = useCallback(
    (patch: Partial<ResumeLayoutSettings>) => {
      set(prev => ({
        ...prev,
        layoutSettings: { ...prev.layoutSettings, ...patch },
      }));
    },
    [set]
  );

  return {
    onFieldChange,
    onExperienceChange,
    onAddExperience,
    onDeleteExperience,
    onEducationChange,
    onAddEducation,
    onDeleteEducation,
    onCertChange,
    onAddCert,
    onDeleteCert,
    onAchievementChange,
    onAddAchievement,
    onDeleteAchievement,
    onLanguageChange,
    onAddLanguage,
    onDeleteLanguage,
    onLayoutSettingsChange,
  };
}
