import { useCallback, useMemo } from 'react';
import type {
  ResumeState,
  ExperienceItem,
  EducationItem,
  CertItem,
  AchievementItem,
  LanguageItem,
  ResumeLayoutSettings,
  EntrySection,
} from '../types';

const ENTRY_ARRAY_KEYS: Record<EntrySection, keyof ResumeState> = {
  experience: 'resumeExperience',
  education: 'resumeEducation',
  certs: 'resumeCerts',
  achievements: 'resumeAchievements',
  languages: 'resumeLanguages',
};

function cloneEntry<T>(item: T): T {
  const copy = { ...item } as T & { visibility?: Record<string, boolean> };
  if (copy.visibility) {
    copy.visibility = { ...copy.visibility };
  }
  return copy;
}

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

  const onEntryVisibilityChange = useCallback(
    (section: EntrySection, index: number, field: string, value: boolean) => {
      set(prev => {
        const key = ENTRY_ARRAY_KEYS[section];
        const items = [...(prev[key] as Array<{ visibility?: Record<string, boolean> }>)];
        const item = { ...items[index] };
        item.visibility = { ...item.visibility, [field]: value };
        items[index] = item;
        return { ...prev, [key]: items };
      });
    },
    [set]
  );

  const onDuplicateExperience = useCallback(
    (index: number) => {
      set(prev => {
        const updated = [...prev.resumeExperience];
        updated.splice(index + 1, 0, cloneEntry(prev.resumeExperience[index]));
        return { ...prev, resumeExperience: updated };
      });
    },
    [set]
  );

  const onAddSimilarExperience = useCallback(
    (index: number) => {
      set(prev => {
        const source = prev.resumeExperience[index];
        const copy = cloneEntry(source);
        copy.title = `${source.title} (Copy)`;
        return { ...prev, resumeExperience: [...prev.resumeExperience, copy] };
      });
    },
    [set]
  );

  const onDuplicateEducation = useCallback(
    (index: number) => {
      set(prev => {
        const updated = [...prev.resumeEducation];
        updated.splice(index + 1, 0, cloneEntry(prev.resumeEducation[index]));
        return { ...prev, resumeEducation: updated };
      });
    },
    [set]
  );

  const onAddSimilarEducation = useCallback(
    (index: number) => {
      set(prev => {
        const source = prev.resumeEducation[index];
        const copy = cloneEntry(source);
        copy.degree = `${source.degree} (Copy)`;
        return { ...prev, resumeEducation: [...prev.resumeEducation, copy] };
      });
    },
    [set]
  );

  const onDuplicateCert = useCallback(
    (index: number) => {
      set(prev => {
        const updated = [...prev.resumeCerts];
        updated.splice(index + 1, 0, cloneEntry(prev.resumeCerts[index]));
        return { ...prev, resumeCerts: updated };
      });
    },
    [set]
  );

  const onAddSimilarCert = useCallback(
    (index: number) => {
      set(prev => {
        const source = prev.resumeCerts[index];
        const copy = cloneEntry(source);
        copy.title = `${source.title} (Copy)`;
        return { ...prev, resumeCerts: [...prev.resumeCerts, copy] };
      });
    },
    [set]
  );

  const onDuplicateAchievement = useCallback(
    (index: number) => {
      set(prev => {
        const updated = [...prev.resumeAchievements];
        updated.splice(index + 1, 0, cloneEntry(prev.resumeAchievements[index]));
        return { ...prev, resumeAchievements: updated };
      });
    },
    [set]
  );

  const onAddSimilarAchievement = useCallback(
    (index: number) => {
      set(prev => {
        const source = prev.resumeAchievements[index];
        const copy = cloneEntry(source);
        copy.title = `${source.title} (Copy)`;
        return { ...prev, resumeAchievements: [...prev.resumeAchievements, copy] };
      });
    },
    [set]
  );

  const onDuplicateLanguage = useCallback(
    (index: number) => {
      set(prev => {
        const updated = [...prev.resumeLanguages];
        updated.splice(index + 1, 0, cloneEntry(prev.resumeLanguages[index]));
        return { ...prev, resumeLanguages: updated };
      });
    },
    [set]
  );

  const onAddSimilarLanguage = useCallback(
    (index: number) => {
      set(prev => {
        const source = prev.resumeLanguages[index];
        const copy = cloneEntry(source);
        copy.name = `${source.name} (Copy)`;
        return { ...prev, resumeLanguages: [...prev.resumeLanguages, copy] };
      });
    },
    [set]
  );

  return useMemo(() => ({
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
    onEntryVisibilityChange,
    onDuplicateExperience,
    onAddSimilarExperience,
    onDuplicateEducation,
    onAddSimilarEducation,
    onDuplicateCert,
    onAddSimilarCert,
    onDuplicateAchievement,
    onAddSimilarAchievement,
    onDuplicateLanguage,
    onAddSimilarLanguage,
  }), [
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
    onEntryVisibilityChange,
    onDuplicateExperience,
    onAddSimilarExperience,
    onDuplicateEducation,
    onAddSimilarEducation,
    onDuplicateCert,
    onAddSimilarCert,
    onDuplicateAchievement,
    onAddSimilarAchievement,
    onDuplicateLanguage,
    onAddSimilarLanguage,
  ]);
}
