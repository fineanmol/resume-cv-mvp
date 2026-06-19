import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type React from 'react';
import type { ResumeState, HeaderStyle } from '../../types';
import { FONT_CSS } from '../../config/fonts';
import {
  EDITOR_CLEAR_FOCUS_EVENT,
  shouldKeepEditorFocus,
} from '../../utils/editorFocus';
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
    fontSize, paddingTopBottom, paddingLeftRight, sectionSpacing,
    lineHeight, columnGap = 16, template = 'navy', brandColor = '#314855',
    accentColor2,
    fontFamily = 'inter',
    headingFont,
    titleFont,
    accentFont,
    headerStyle = 'centered',
    showPhoto = true,
    bulletStyle = 'disc',
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
  } = layoutSettings;

  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const handleMoveItemUpDown = useCallback((sectionId: string, index: number, dir: 'up' | 'down') => {
    const newIdx = dir === 'up' ? index - 1 : index + 1;
    const swap = (arr: unknown[]): unknown[] => {
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      const a = [...arr];
      [a[index], a[newIdx]] = [a[newIdx], a[index]];
      return a;
    };
    if (sectionId === 'experience') onFieldChange?.('resumeExperience', swap(resumeExperience) as typeof resumeExperience);
    else if (sectionId === 'education') onFieldChange?.('resumeEducation', swap(resumeEducation) as typeof resumeEducation);
    else if (sectionId === 'certs') onFieldChange?.('resumeCerts', swap(resumeCerts ?? []) as typeof resumeCerts);
    else if (sectionId === 'achievements') onFieldChange?.('resumeAchievements', swap(resumeAchievements ?? []) as typeof resumeAchievements);
    else if (sectionId === 'languages') onFieldChange?.('resumeLanguages', swap(resumeLanguages ?? []) as typeof resumeLanguages);
  }, [onFieldChange, resumeExperience, resumeEducation, resumeCerts, resumeAchievements, resumeLanguages]);

  const handleMoveSectionUpDown = useCallback((id: string, dir: 'up' | 'down') => {
    const leftCol = [...(designerLeftSections ?? [])];
    const rightCol = [...(designerRightSections ?? [])];
    const inLeft = leftCol.includes(id);
    const col = inLeft ? leftCol : rightCol;
    const colIdx = col.indexOf(id);
    const newColIdx = dir === 'up' ? colIdx - 1 : colIdx + 1;
    if (newColIdx < 0 || newColIdx >= col.length) return;
    [col[colIdx], col[newColIdx]] = [col[newColIdx], col[colIdx]];
    onFieldChange?.('layoutSettings', {
      ...layoutSettings,
      ...(inLeft ? { designerLeftSections: col } : { designerRightSections: col }),
    });
  }, [designerLeftSections, designerRightSections, onFieldChange, layoutSettings]);

  const sheetActiveClass = isEditable
    ? (activeItemId ? 'has-active-item' : activeSectionId ? 'has-active-section' : '')
    : '';

  const clearActive = useCallback(() => {
    setActiveSectionId(null);
    setActiveItemId(null);
    setOpenPopoverId(null);
  }, []);

  useEffect(() => {
    if (!isEditable || (!activeSectionId && !activeItemId)) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (shouldKeepEditorFocus(e.target)) return;
      clearActive();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isEditable, activeSectionId, activeItemId, clearActive]);

  useEffect(() => {
    if (!isEditable) return;
    const handleClearEvent = () => clearActive();
    document.addEventListener(EDITOR_CLEAR_FOCUS_EVENT, handleClearEvent);
    return () => document.removeEventListener(EDITOR_CLEAR_FOCUS_EVENT, handleClearEvent);
  }, [isEditable, clearActive]);

  const handleSectionDragStart = useCallback((e: React.DragEvent, sectionId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);
    setDraggedSectionId(sectionId);
  }, []);

  const handleSectionDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    setDragOverSectionId(sectionId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverSectionId(null);
  }, []);

  const handleSectionDrop = useCallback((e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSectionId(null);
    if (!draggedSectionId || draggedSectionId === targetSectionId) {
      setDraggedSectionId(null);
      return;
    }

    const leftCol = [...designerLeftSections];
    const rightCol = [...designerRightSections];
    const srcInLeft = leftCol.includes(draggedSectionId);
    const destInLeft = leftCol.includes(targetSectionId);

    if (srcInLeft) {
      const idx = leftCol.indexOf(draggedSectionId);
      if (idx !== -1) leftCol.splice(idx, 1);
    } else {
      const idx = rightCol.indexOf(draggedSectionId);
      if (idx !== -1) rightCol.splice(idx, 1);
    }

    if (destInLeft) {
      const idx = leftCol.indexOf(targetSectionId);
      if (idx !== -1) leftCol.splice(idx, 0, draggedSectionId);
      else leftCol.push(draggedSectionId);
    } else {
      const idx = rightCol.indexOf(targetSectionId);
      if (idx !== -1) rightCol.splice(idx, 0, draggedSectionId);
      else rightCol.push(draggedSectionId);
    }

    onFieldChange?.('layoutSettings', {
      ...layoutSettings,
      designerLeftSections: leftCol,
      designerRightSections: rightCol,
    });
    setDraggedSectionId(null);
  }, [draggedSectionId, designerLeftSections, designerRightSections, onFieldChange, layoutSettings]);

  const handleColumnDrop = useCallback((e: React.DragEvent, targetColumn: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSectionId(null);
    if (!draggedSectionId) return;

    const leftCol = [...designerLeftSections];
    const rightCol = [...designerRightSections];
    const srcInLeft = leftCol.includes(draggedSectionId);

    if ((srcInLeft && targetColumn === 'left') || (!srcInLeft && targetColumn === 'right')) return;

    if (srcInLeft) {
      const idx = leftCol.indexOf(draggedSectionId);
      if (idx !== -1) leftCol.splice(idx, 1);
    } else {
      const idx = rightCol.indexOf(draggedSectionId);
      if (idx !== -1) rightCol.splice(idx, 1);
    }

    if (targetColumn === 'left') leftCol.push(draggedSectionId);
    else rightCol.push(draggedSectionId);

    onFieldChange?.('layoutSettings', {
      ...layoutSettings,
      designerLeftSections: leftCol,
      designerRightSections: rightCol,
    });
    setDraggedSectionId(null);
  }, [draggedSectionId, designerLeftSections, designerRightSections, onFieldChange, layoutSettings]);

  const handleDragEnd = useCallback(() => {
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  }, []);

  const sectionContextValue = useMemo(() => ({
    activeSectionId,
    setActiveSectionId,
    activeItemId,
    setActiveItemId,
    openPopoverId,
    setOpenPopoverId,
    handleMoveSectionUpDown,
    handleMoveItemUpDown,
  }), [activeSectionId, activeItemId, openPopoverId, handleMoveSectionUpDown, handleMoveItemUpDown]);

  const dragProps = useMemo(() => ({
    showLayoutBounds: showLayoutBounds ?? false,
    isEditable,
    onDragStart: handleSectionDragStart,
    onDragOver: handleSectionDragOver,
    onDrop: handleSectionDrop,
    onDragEnd: handleDragEnd,
    dragOverId: dragOverSectionId,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
  }), [
    showLayoutBounds,
    isEditable,
    handleSectionDragStart,
    handleSectionDragOver,
    handleSectionDrop,
    handleDragEnd,
    dragOverSectionId,
    handleDragEnter,
    handleDragLeave,
  ]);

  const bodyFontCss    = FONT_CSS[fontFamily]    ?? FONT_CSS.inter;
  const headingFontCss = headingFont ? FONT_CSS[headingFont] : bodyFontCss;
  const titleFontCss   = titleFont   ? FONT_CSS[titleFont]   : headingFontCss;
  const accentFontCss  = accentFont  ? FONT_CSS[accentFont]  : bodyFontCss;

  const sheetStyle: React.CSSProperties = {
    fontSize: `${fontSize}pt`,
    padding: `${paddingTopBottom}mm ${paddingLeftRight}mm`,
    lineHeight,
    color: '#334155',
    fontFamily: bodyFontCss,
    ['--sheet-fs' as string]: String(fontSize),
  };
  const sec: React.CSSProperties = { marginBottom: `${sectionSpacing}px` };
  const ec = isEditable ? 'outline-none hover:bg-slate-100/80 focus:bg-slate-100 rounded px-1 -mx-1 transition' : '';
  const ef = (field: keyof ResumeState) => (v: string) => onFieldChange?.(field, v);
  const showAvatar = showPhoto && !!avatar;

  const handleLayoutSettingsPatch = useCallback(
    (patch: Partial<typeof layoutSettings>) => onLayoutSettingsChange?.({ ...layoutSettings, ...patch }),
    [onLayoutSettingsChange, layoutSettings],
  );

  const headerProps = useMemo(() => ({
    name: { value: name, onSave: (v: string) => onFieldChange?.('name', v) },
    subtitle: { value: subtitle, onSave: (v: string) => onFieldChange?.('subtitle', v) },
    phone: { value: phone, onSave: (v: string) => onFieldChange?.('phone', v) },
    email: { value: email, onSave: (v: string) => onFieldChange?.('email', v) },
    location: { value: location, onSave: (v: string) => onFieldChange?.('location', v) },
    linkedin: { value: linkedin, onSave: (v: string) => onFieldChange?.('linkedin', v) },
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
    onAvatarChange: (url: string) => onFieldChange?.('avatar', url),
  }), [
    name, subtitle, phone, email, location, linkedin, avatar, showAvatar,
    brandColor, headingFontCss, headerStyle, isEditable, ec, sectionSpacing,
    layoutSettings, handleLayoutSettingsPatch, onFieldChange,
  ]);

  const badgeStyle = useCallback((): React.CSSProperties => ({
    background: '#ffffff',
    color: '#475569',
    borderColor: '#e2e8f0',
  }), []);

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
  };
}
