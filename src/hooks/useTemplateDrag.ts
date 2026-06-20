import { useState, useCallback, useMemo } from 'react';
import type React from 'react';
import type { ResumeState, LayoutSettings } from '../types';

interface UseTemplateDragParams {
  designerLeftSections: string[];
  designerRightSections: string[];
  layoutSettings: LayoutSettings;
  onFieldChange?: <K extends keyof ResumeState>(field: K, value: ResumeState[K]) => void;
  isEditable: boolean;
  showLayoutBounds: boolean;
}

export interface TemplateDragResult {
  dragProps: {
    showLayoutBounds: boolean;
    isEditable: boolean;
    onDragStart: (e: React.DragEvent, sectionId: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, targetSectionId: string) => void;
    onDragEnd: () => void;
    dragOverId: string | null;
    onDragEnter: (e: React.DragEvent, sectionId: string) => void;
    onDragLeave: () => void;
  };
  handleSectionDragOver: (e: React.DragEvent) => void;
  handleColumnDrop: (e: React.DragEvent, targetColumn: 'left' | 'right') => void;
}

export function useTemplateDrag({
  designerLeftSections,
  designerRightSections,
  layoutSettings,
  onFieldChange,
  isEditable,
  showLayoutBounds,
}: UseTemplateDragParams): TemplateDragResult {
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

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

  return {
    dragProps,
    handleSectionDragOver,
    handleColumnDrop,
  };
}
