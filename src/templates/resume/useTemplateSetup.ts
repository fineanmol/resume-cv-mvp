import { createContext, useContext, useCallback, useMemo } from 'react';
import type { ResumeState, HeaderStyle } from '../../types';
import { useTemplateDrag } from '../../hooks/useTemplateDrag';
import { useTemplateStyles } from '../../hooks/useTemplateStyles';
import { useTemplateFocus } from '../../hooks/useTemplateFocus';
import type { ResumeTemplateProps } from './types';

export type TemplateRenderContext = ReturnType<typeof useTemplateSetup>;

export const TemplateRenderContext = createContext<TemplateRenderContext | null>(null);

export function useTemplateRenderContext(): TemplateRenderContext {
  const ctx = useContext(TemplateRenderContext);
  if (!ctx) throw new Error('useTemplateRenderContext must be used within ResumeTemplateRenderer');
  return ctx;
}

export function useTemplateSetup({
  state,
  isEditable = false,
  onFieldChange,
  onExperienceChange,
  onEducationChange,
  onCertChange,
  onAchievementChange,
  onLanguageChange,
  onAddExperience,
  onDeleteExperience,
  onDuplicateExperience,
  onAddSimilarExperience,
  onAddEducation,
  onDeleteEducation,
  onDuplicateEducation,
  onAddSimilarEducation,
  onAddCert,
  onDeleteCert,
  onDuplicateCert,
  onAddSimilarCert,
  onAddAchievement,
  onDeleteAchievement,
  onDuplicateAchievement,
  onAddSimilarAchievement,
  onAddLanguage,
  onDeleteLanguage,
  onDuplicateLanguage,
  onAddSimilarLanguage,
  onEntryVisibilityChange,
  onLayoutSettingsChange,
}: ResumeTemplateProps) {
  const {
    name, subtitle, phone, email, linkedin, location, avatar,
    resumeSummary, resumeSkills, resumeExperience, resumeEducation,
    resumeCerts, resumeAchievements, resumeLanguages, layoutSettings,
  } = state;

  const {
    sectionSpacing, columnGap = 16, template = 'navy', brandColor = '#314855',
    accentColor2,
    headerStyle = 'centered',
    showPhoto = true,
    bulletStyle = 'chips',
    skillsStyle = 'chips',
    summaryAlign = 'justify',
    experienceAlign = 'left',
    educationAlign = 'left',
    certsAlign = 'left',
    achievementsAlign = 'left',
    showLayoutBounds = false,
    designerLeftSections = ['experience', 'education'],
    designerRightSections = ['summary', 'skills', 'achievements', 'certs', 'languages'],
    entrySpacing = 12,
    lineHeight,
  } = layoutSettings;

  // ── Composed hooks ───────────────────────────────────────────────────────────

  const { bodyFontCss, headingFontCss, titleFontCss, accentFontCss, sheetStyle, sec, ec, badgeStyle } =
    useTemplateStyles({ layoutSettings, isEditable });

  const {
    activeSectionId,
    activeItemId,
    openPopoverId,
    sheetActiveClass,
    clearActive,
    sectionContextValue,
  } = useTemplateFocus({
    isEditable,
    layoutSettings,
    designerLeftSections,
    designerRightSections,
    resumeExperience,
    resumeEducation,
    resumeCerts,
    resumeAchievements,
    resumeLanguages,
    onFieldChange,
  });

  const { dragProps, handleSectionDragOver, handleColumnDrop } = useTemplateDrag({
    designerLeftSections,
    designerRightSections,
    layoutSettings,
    onFieldChange,
    isEditable,
    showLayoutBounds,
  });

  // ── Remaining setup ──────────────────────────────────────────────────────────

  const ef = (field: keyof ResumeState) => (v: string) => onFieldChange?.(field, v as ResumeState[typeof field]);
  const showAvatar = showPhoto && !!avatar;

  const handleLayoutSettingsPatch = useCallback(
    (patch: Partial<typeof layoutSettings>) => onLayoutSettingsChange?.({ ...layoutSettings, ...patch }),
    [onLayoutSettingsChange, layoutSettings],
  );

  const headerProps = useMemo(() => ({
    name: { value: name, onSave: (v: string) => onFieldChange?.('name', v as ResumeState['name']) },
    subtitle: { value: subtitle, onSave: (v: string) => onFieldChange?.('subtitle', v as ResumeState['subtitle']) },
    phone: { value: phone, onSave: (v: string) => onFieldChange?.('phone', v as ResumeState['phone']) },
    email: { value: email, onSave: (v: string) => onFieldChange?.('email', v as ResumeState['email']) },
    location: { value: location, onSave: (v: string) => onFieldChange?.('location', v as ResumeState['location']) },
    linkedin: { value: linkedin, onSave: (v: string) => onFieldChange?.('linkedin', v as ResumeState['linkedin']) },
    avatar,
    showAvatar,
    brandColor,
    headingFontCss,
    headerStyle: headerStyle as HeaderStyle,
    isEditable,
    ec,
    sectionSpacing,
    layoutSettings,
    onLayoutSettingsChange: handleLayoutSettingsPatch,
    onAvatarChange: (url: string) => onFieldChange?.('avatar', url as ResumeState['avatar']),
  }), [
    name, subtitle, phone, email, location, linkedin, avatar, showAvatar,
    brandColor, headingFontCss, headerStyle, isEditable, ec, sectionSpacing,
    layoutSettings, handleLayoutSettingsPatch, onFieldChange,
  ]);

  const bottomProps = useMemo(() => ({
    resumeCerts,
    resumeAchievements,
    resumeLanguages,
    sec,
    isEditable,
    ec,
    layoutSettings,
    bulletStyle,
    onLayoutSettingsChange: handleLayoutSettingsPatch,
    onCertChange,
    onAchievementChange,
    onLanguageChange,
    onAddCert,
    onDeleteCert,
    onDuplicateCert,
    onAddSimilarCert,
    onAddAchievement,
    onDeleteAchievement,
    onDuplicateAchievement,
    onAddSimilarAchievement,
    onAddLanguage,
    onDeleteLanguage,
    onDuplicateLanguage,
    onAddSimilarLanguage,
    onEntryVisibilityChange,
    certsAlign,
    achievementsAlign,
    accentColor: brandColor,
    accentColor2,
  }), [
    resumeCerts, resumeAchievements, resumeLanguages, sec, isEditable, ec,
    layoutSettings, bulletStyle, handleLayoutSettingsPatch, onCertChange,
    onAchievementChange, onLanguageChange, onAddCert, onDeleteCert,
    onDuplicateCert, onAddSimilarCert, onAddAchievement, onDeleteAchievement,
    onDuplicateAchievement, onAddSimilarAchievement, onAddLanguage,
    onDeleteLanguage, onDuplicateLanguage, onAddSimilarLanguage,
    onEntryVisibilityChange, certsAlign, achievementsAlign, brandColor, accentColor2,
  ]);

  return {
    template,
    isEditable,
    name,
    subtitle,
    phone,
    email,
    linkedin,
    location,
    avatar,
    resumeSummary,
    resumeSkills,
    resumeExperience,
    resumeEducation,
    resumeCerts,
    resumeAchievements,
    resumeLanguages,
    layoutSettings,
    brandColor,
    accentColor2,
    bulletStyle,
    skillsStyle,
    summaryAlign,
    experienceAlign,
    educationAlign,
    certsAlign,
    achievementsAlign,
    showPhoto,
    showLayoutBounds,
    designerLeftSections,
    designerRightSections,
    lineHeight,
    columnGap,
    entrySpacing,
    sectionContextValue,
    sheetActiveClass,
    clearActive,
    handleSectionDragOver,
    handleColumnDrop,
    dragProps,
    bodyFontCss,
    headingFontCss,
    titleFontCss,
    accentFontCss,
    sheetStyle,
    sec,
    ec,
    ef,
    showAvatar,
    headerProps,
    badgeStyle,
    bottomProps,
    onFieldChange,
    onExperienceChange,
    onEducationChange,
    onCertChange,
    onAchievementChange,
    onLanguageChange,
    onAddExperience,
    onDeleteExperience,
    onDuplicateExperience,
    onAddSimilarExperience,
    onAddEducation,
    onDeleteEducation,
    onDuplicateEducation,
    onAddSimilarEducation,
    onAddCert,
    onDeleteCert,
    onDuplicateCert,
    onAddSimilarCert,
    onAddAchievement,
    onDeleteAchievement,
    onDuplicateAchievement,
    onAddSimilarAchievement,
    onAddLanguage,
    onDeleteLanguage,
    onDuplicateLanguage,
    onAddSimilarLanguage,
    onEntryVisibilityChange,
    onLayoutSettingsChange,
    activeSectionId,
    activeItemId,
    openPopoverId,
  };
}
