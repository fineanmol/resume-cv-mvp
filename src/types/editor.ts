import type React from 'react';
import type { ResumeState, CoverLetterState } from './index';
import type { useResumeMutations } from '../hooks/useResumeMutations';
import type { useCoverLetterMutations } from '../hooks/useCoverLetterMutations';

// ── DocContext ─────────────────────────────────────────────────────────────────
// Document state and history for both resume and cover letter.

export interface DocContext {
  isResume: boolean;
  resumeState: ResumeState;
  resumeSet: (updater: ResumeState | ((prev: ResumeState) => ResumeState), skipHistory?: boolean) => void;
  resumeCommitHistory: () => void;
  clState: CoverLetterState;
  clSet: (updater: CoverLetterState | ((prev: CoverLetterState) => CoverLetterState), skipHistory?: boolean) => void;
  clCommitHistory: () => void;
}

// ── DocumentMutations ─────────────────────────────────────────────────────────
// Mutation handlers produced by the useResumeMutations / useCoverLetterMutations hooks.

export interface DocumentMutations {
  resumeMutations: ReturnType<typeof useResumeMutations>;
  clMutations: ReturnType<typeof useCoverLetterMutations>;
}

// ── PanelState ────────────────────────────────────────────────────────────────
// UI state for the resizable sidebar / right panel / zoom.

export interface PanelState {
  sidebarOpen: boolean;
  zoomScale: number;
  rightTab: 'design' | 'ats';
  setRightTab: (tab: 'design' | 'ats') => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// ── SheetRefs ─────────────────────────────────────────────────────────────────
// Refs and derived state for the PDF preview sheet.

export interface SheetRefs {
  sheetRef: React.RefObject<HTMLDivElement | null>;
  sheetOverflow: boolean;
  designFocusSection: string | null;
  onDesignFocusHandled: () => void;
  showSettings: boolean;
}

// ── AiConfig ──────────────────────────────────────────────────────────────────
// API key, loading state, and connectivity for the AI features.

export interface AiConfig {
  geminiKey: string;
  onGeminiKeyChange: (v: string) => void;
  onSaveGeminiKey: (e: React.FormEvent) => void;
  isOnline: boolean;
  aiLoading: boolean;
}

// ── AiActions ─────────────────────────────────────────────────────────────────
// Callbacks and data for the JD / ATS / AI panel.

export interface AiActions {
  onImproveBullet: (idx: number, currentText: string) => Promise<void>;
  jobDescription: string;
  onJdChange: (text: string) => void;
  docText: string;
  onInjectKeyword: (kw: string) => Promise<void>;
  onAiTailor: () => void;
}
