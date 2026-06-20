import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../hooks/useAutoSave';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';
import { DEFAULT_CL_STATE } from '../config/defaultCL';

const mockSaveResume = vi.fn().mockResolvedValue(undefined);
const mockSaveCoverLetter = vi.fn().mockResolvedValue(undefined);

vi.mock('../services/db', () => ({
  dbService: {
    saveResume: (...args: unknown[]) => mockSaveResume(...args),
    saveCoverLetter: (...args: unknown[]) => mockSaveCoverLetter(...args),
  },
}));

const user = { email: 'auto@save.test' };
const DEBOUNCE = 500;

beforeEach(() => {
  vi.useFakeTimers();
  mockSaveResume.mockClear();
  mockSaveCoverLetter.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useAutoSave — debounce behaviour', () => {
  it('does NOT call saveResume before the debounce delay elapses', async () => {
    const setSaveStatus = vi.fn();
    renderHook(() =>
      useAutoSave({
        user,
        activeDocId: 'doc-1',
        activeDocType: 'resume',
        resumeState: DEFAULT_RESUME_STATE,
        clState: DEFAULT_CL_STATE,
        setSaveStatus,
        debounceMs: DEBOUNCE,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE - 1);
    });

    expect(mockSaveResume).not.toHaveBeenCalled();
  });

  it('calls saveResume after the debounce delay with correct args', async () => {
    const setSaveStatus = vi.fn();
    renderHook(() =>
      useAutoSave({
        user,
        activeDocId: 'doc-1',
        activeDocType: 'resume',
        resumeState: DEFAULT_RESUME_STATE,
        clState: DEFAULT_CL_STATE,
        setSaveStatus,
        debounceMs: DEBOUNCE,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE);
      await Promise.resolve();
    });

    expect(mockSaveResume).toHaveBeenCalledTimes(1);
    expect(mockSaveResume).toHaveBeenCalledWith(
      user.email,
      'doc-1',
      DEFAULT_RESUME_STATE
    );
  });

  it('routes to saveCoverLetter when activeDocType is coverletter', async () => {
    const setSaveStatus = vi.fn();
    renderHook(() =>
      useAutoSave({
        user,
        activeDocId: 'cl-1',
        activeDocType: 'coverletter',
        resumeState: DEFAULT_RESUME_STATE,
        clState: DEFAULT_CL_STATE,
        setSaveStatus,
        debounceMs: DEBOUNCE,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE);
      await Promise.resolve();
    });

    expect(mockSaveCoverLetter).toHaveBeenCalledTimes(1);
    expect(mockSaveResume).not.toHaveBeenCalled();
  });

  it('does NOT save when activeDocId is null', async () => {
    const setSaveStatus = vi.fn();
    renderHook(() =>
      useAutoSave({
        user,
        activeDocId: null,
        activeDocType: 'resume',
        resumeState: DEFAULT_RESUME_STATE,
        clState: DEFAULT_CL_STATE,
        setSaveStatus,
        debounceMs: DEBOUNCE,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE);
      await Promise.resolve();
    });

    expect(mockSaveResume).not.toHaveBeenCalled();
  });

  it('sets saveStatus to saving then saved on success', async () => {
    const setSaveStatus = vi.fn();
    renderHook(() =>
      useAutoSave({
        user,
        activeDocId: 'doc-1',
        activeDocType: 'resume',
        resumeState: DEFAULT_RESUME_STATE,
        clState: DEFAULT_CL_STATE,
        setSaveStatus,
        debounceMs: DEBOUNCE,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE);
      await Promise.resolve();
    });

    expect(setSaveStatus).toHaveBeenCalledWith('saving');
    expect(setSaveStatus).toHaveBeenCalledWith('saved');
  });
});
