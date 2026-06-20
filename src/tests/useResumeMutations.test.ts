import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import { useResumeMutations } from '../hooks/useResumeMutations';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';
import type { ResumeState } from '../types';

/** Helper: creates a renderHook that wires useResumeMutations to real useState */
function setup(initial: ResumeState = DEFAULT_RESUME_STATE) {
  return renderHook(() => {
    const [state, setState] = useState<ResumeState>(initial);
    const mutations = useResumeMutations((updater, _skip) => {
      setState(prev => (typeof updater === 'function' ? updater(prev) : updater));
    });
    return { state, mutations };
  });
}

describe('useResumeMutations — experience', () => {
  it('onAddExperience appends a new entry', () => {
    const { result } = setup();
    const initialCount = result.current.state.resumeExperience.length;
    act(() => result.current.mutations.onAddExperience());
    expect(result.current.state.resumeExperience).toHaveLength(initialCount + 1);
    expect(result.current.state.resumeExperience.at(-1)!.company).toBe('New Company');
  });

  it('onDeleteExperience removes the entry at the given index', () => {
    const { result } = setup();
    const initialCount = result.current.state.resumeExperience.length;
    act(() => result.current.mutations.onDeleteExperience(0));
    expect(result.current.state.resumeExperience).toHaveLength(initialCount - 1);
  });

  it('onDuplicateExperience inserts a copy after the source index', () => {
    const { result } = setup();
    const initialCount = result.current.state.resumeExperience.length;
    const sourceTitle = result.current.state.resumeExperience[0].title;
    act(() => result.current.mutations.onDuplicateExperience(0));
    expect(result.current.state.resumeExperience).toHaveLength(initialCount + 1);
    expect(result.current.state.resumeExperience[1].title).toBe(sourceTitle);
  });

  it('onExperienceChange updates a field at the given index', () => {
    const { result } = setup();
    act(() => result.current.mutations.onExperienceChange(0, 'title', 'Updated Title'));
    expect(result.current.state.resumeExperience[0].title).toBe('Updated Title');
  });
});

describe('useResumeMutations — education', () => {
  it('onAddEducation appends a new entry', () => {
    const { result } = setup();
    const initialCount = result.current.state.resumeEducation.length;
    act(() => result.current.mutations.onAddEducation());
    expect(result.current.state.resumeEducation).toHaveLength(initialCount + 1);
    expect(result.current.state.resumeEducation.at(-1)!.school).toBe('New University');
  });

  it('onDeleteEducation removes the entry at the given index', () => {
    const { result } = setup();
    const initialCount = result.current.state.resumeEducation.length;
    act(() => result.current.mutations.onDeleteEducation(0));
    expect(result.current.state.resumeEducation).toHaveLength(initialCount - 1);
  });

  it('onDuplicateEducation inserts a copy after the source', () => {
    const { result } = setup();
    const initialCount = result.current.state.resumeEducation.length;
    const sourceDegree = result.current.state.resumeEducation[0].degree;
    act(() => result.current.mutations.onDuplicateEducation(0));
    expect(result.current.state.resumeEducation).toHaveLength(initialCount + 1);
    expect(result.current.state.resumeEducation[1].degree).toBe(sourceDegree);
  });
});

describe('useResumeMutations — achievements', () => {
  it('onAddAchievement appends a new entry', () => {
    const { result } = setup();
    const initialCount = result.current.state.resumeAchievements.length;
    act(() => result.current.mutations.onAddAchievement());
    expect(result.current.state.resumeAchievements).toHaveLength(initialCount + 1);
    expect(result.current.state.resumeAchievements.at(-1)!.title).toBe('New Achievement');
  });

  it('onDeleteAchievement removes entry at index', () => {
    const { result } = setup();
    const initialCount = result.current.state.resumeAchievements.length;
    act(() => result.current.mutations.onDeleteAchievement(0));
    expect(result.current.state.resumeAchievements).toHaveLength(initialCount - 1);
  });
});

describe('useResumeMutations — field and layout', () => {
  it('onFieldChange updates a top-level field', () => {
    const { result } = setup();
    act(() => result.current.mutations.onFieldChange('name', 'Jane Doe'));
    expect(result.current.state.name).toBe('Jane Doe');
  });

  it('onLayoutSettingsChange merges a layout patch', () => {
    const { result } = setup();
    act(() => result.current.mutations.onLayoutSettingsChange({ fontSize: 13 }));
    expect(result.current.state.layoutSettings.fontSize).toBe(13);
    // other settings remain untouched
    expect(result.current.state.layoutSettings.lineHeight).toBe(
      DEFAULT_RESUME_STATE.layoutSettings.lineHeight
    );
  });

  it('onEntryVisibilityChange toggles field visibility on an experience entry', () => {
    const { result } = setup();
    act(() =>
      result.current.mutations.onEntryVisibilityChange('experience', 0, 'dates', false)
    );
    expect(result.current.state.resumeExperience[0].visibility?.dates).toBe(false);
  });
});
