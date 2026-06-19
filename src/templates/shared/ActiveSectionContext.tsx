import { createContext } from 'react';

export type ActiveSectionContextValue = {
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  handleMoveSectionUpDown: (id: string, dir: 'up' | 'down') => void;
  handleMoveItemUpDown: (sectionId: string, index: number, dir: 'up' | 'down') => void;
} | null;

export const ActiveSectionContext = createContext<ActiveSectionContextValue>(null);
