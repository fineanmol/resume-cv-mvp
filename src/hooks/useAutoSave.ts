import { useEffect } from 'react';
import { dbService } from '../services/db';
import { userEmail } from '../types';
import type { ResumeState, CoverLetterState, AuthUser, DocType, SaveStatus } from '../types';

interface Options {
  user: AuthUser | null;
  activeDocId: string | null;
  activeDocType: DocType | null;
  resumeState: ResumeState;
  clState: CoverLetterState;
  setSaveStatus: (s: SaveStatus) => void;
  debounceMs?: number;
}

export function useAutoSave({
  user, activeDocId, activeDocType,
  resumeState, clState,
  setSaveStatus,
  debounceMs = 1200,
}: Options) {
  useEffect(() => {
    if (!activeDocId || !user) return;

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const uid = userEmail(user);
        if (activeDocType === 'resume') {
          await dbService.saveResume(uid, activeDocId, resumeState);
        } else {
          await dbService.saveCoverLetter(uid, activeDocId, clState);
        }
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  // resumeState/clState intentionally as deps — any change triggers save
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeState, clState, activeDocId, activeDocType, user, debounceMs]);
}
