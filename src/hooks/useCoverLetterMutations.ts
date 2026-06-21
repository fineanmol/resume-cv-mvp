import { useCallback, useMemo } from 'react';
import type { CoverLetterState, HighlightItem, LayoutSettings } from '../types';

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

  /**
   * Dedicated handler for layout-settings patches.
   * Uses a functional update so it always merges with the LATEST prev.layoutSettings,
   * avoiding the stale-closure issue that would arise if the caller captured
   * `layoutSettings` from a render closure.
   */
  const onLayoutSettingsChange = useCallback(
    (patch: Partial<LayoutSettings>) => {
      set(prev => ({
        ...prev,
        layoutSettings: { ...prev.layoutSettings, ...patch },
      }));
    },
    [set]
  );

  return useMemo(
    () => ({ onFieldChange, onHighlightChange, onLayoutSettingsChange }),
    [onFieldChange, onHighlightChange, onLayoutSettingsChange]
  );
}
