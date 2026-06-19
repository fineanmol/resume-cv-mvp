import { useCallback, useMemo } from 'react';
import type { CoverLetterState, HighlightItem } from '../types';

export type CoverLetterSet = (
  newState: CoverLetterState | ((prev: CoverLetterState) => CoverLetterState),
  skipHistory?: boolean
) => void;

export function useCoverLetterMutations(set: CoverLetterSet) {
  const onFieldChange = useCallback(
    (field: keyof CoverLetterState, value: unknown) => {
      set(prev => ({ ...prev, [field]: value }));
    },
    [set]
  );

  const onHighlightChange = useCallback(
    (index: number, field: keyof HighlightItem, value: string) => {
      set(prev => {
        const updated = [...prev.highlights];
        updated[index] = { ...updated[index], [field]: value };
        return { ...prev, highlights: updated };
      });
    },
    [set]
  );

  return useMemo(() => ({ onFieldChange, onHighlightChange }), [onFieldChange, onHighlightChange]);
}
