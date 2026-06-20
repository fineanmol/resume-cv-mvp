import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ResumeState, LayoutSettings } from '../types';
import {
  EDITOR_CLEAR_FOCUS_EVENT,
  shouldKeepEditorFocus,
} from '../utils/editorFocus';

interface UseTemplateFocusParams {
  isEditable: boolean;
  layoutSettings: LayoutSettings;
  designerLeftSections: string[];
  designerRightSections: string[];
  resumeExperience: ResumeState['resumeExperience'];
  resumeEducation: ResumeState['resumeEducation'];
  resumeCerts: ResumeState['resumeCerts'];
  resumeAchievements: ResumeState['resumeAchievements'];
  resumeLanguages: ResumeState['resumeLanguages'];
  onFieldChange?: <K extends keyof ResumeState>(field: K, value: ResumeState[K]) => void;
}

export interface SectionContextValue {
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  openPopoverId: string | null;
  setOpenPopoverId: (id: string | null) => void;
  handleMoveSectionUpDown: (id: string, dir: 'up' | 'down') => void;
  handleMoveItemUpDown: (sectionId: string, index: number, dir: 'up' | 'down') => void;
}

export interface TemplateFocusResult {
  activeSectionId: string | null;
  activeItemId: string | null;
  openPopoverId: string | null;
  sheetActiveClass: string;
  clearActive: () => void;
  sectionContextValue: SectionContextValue;
}

function handleMoveItem<T>(
  arr: T[],
  index: number,
  dir: 'up' | 'down',
): T[] {
  const newIdx = dir === 'up' ? index - 1 : index + 1;
  if (newIdx < 0 || newIdx >= arr.length) return arr;
  const a = [...arr];
  [a[index], a[newIdx]] = [a[newIdx], a[index]];
  return a;
}

export function useTemplateFocus({
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
}: UseTemplateFocusParams): TemplateFocusResult {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

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

  const handleMoveItemUpDown = useCallback((sectionId: string, index: number, dir: 'up' | 'down') => {
    if (sectionId === 'experience') {
      onFieldChange?.('resumeExperience', handleMoveItem(resumeExperience, index, dir));
    } else if (sectionId === 'education') {
      onFieldChange?.('resumeEducation', handleMoveItem(resumeEducation, index, dir));
    } else if (sectionId === 'certs') {
      onFieldChange?.('resumeCerts', handleMoveItem(resumeCerts ?? [], index, dir));
    } else if (sectionId === 'achievements') {
      onFieldChange?.('resumeAchievements', handleMoveItem(resumeAchievements ?? [], index, dir));
    } else if (sectionId === 'languages') {
      onFieldChange?.('resumeLanguages', handleMoveItem(resumeLanguages ?? [], index, dir));
    }
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

  const sectionContextValue = useMemo<SectionContextValue>(() => ({
    activeSectionId,
    setActiveSectionId,
    activeItemId,
    setActiveItemId,
    openPopoverId,
    setOpenPopoverId,
    handleMoveSectionUpDown,
    handleMoveItemUpDown,
  }), [activeSectionId, activeItemId, openPopoverId, handleMoveSectionUpDown, handleMoveItemUpDown]);

  return {
    activeSectionId,
    activeItemId,
    openPopoverId,
    sheetActiveClass,
    clearActive,
    sectionContextValue,
  };
}
