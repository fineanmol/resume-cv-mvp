import type { ResumeState, CoverLetterState, DocumentMetadata } from '../types';

// ── IDocumentStore ────────────────────────────────────────────────────────────
// Mirrors every public method of dbService in db.ts (compile-time contract).

export interface IDocumentStore {
  listDrafts(userId: string): Promise<DocumentMetadata[]>;
  saveResume(userId: string, id: string, state: ResumeState): Promise<void>;
  saveCoverLetter(userId: string, id: string, state: CoverLetterState): Promise<void>;
  getResume(userId: string, id: string): Promise<ResumeState | null>;
  getCoverLetter(userId: string, id: string): Promise<CoverLetterState | null>;
  deleteDraft(userId: string, id: string, type: 'resume' | 'coverletter'): Promise<void>;
  renameDraft(userId: string, id: string, type: 'resume' | 'coverletter', newTitle: string): Promise<void>;
  updateLocalMetadataList(
    userId: string,
    id: string,
    type: 'resume' | 'coverletter',
    title: string,
    updatedAt: number,
  ): Promise<void>;
}

// ── IAiService ────────────────────────────────────────────────────────────────
// Mirrors every public static method of GeminiService (compile-time contract).
// Applied via `const _: IAiService = GeminiService` at the bottom of gemini.ts.

export interface IAiService {
  request<T>(apiKey: string, payload: unknown): Promise<T>;
  tailorCoverLetter(apiKey: string, state: CoverLetterState, jobDesc: string): Promise<Partial<CoverLetterState>>;
  tailorResume(apiKey: string, state: ResumeState, jobDesc: string): Promise<Partial<ResumeState>>;
  parseResumePdf(apiKey: string, base64Data: string): Promise<Partial<ResumeState>>;
  injectKeywordIntoCoverLetter(apiKey: string, state: CoverLetterState, keyword: string): Promise<Partial<CoverLetterState>>;
  injectKeywordIntoResume(apiKey: string, state: ResumeState, keyword: string): Promise<Partial<ResumeState>>;
  improveExperienceBullet(apiKey: string, bulletText: string, jobTitle?: string, jdText?: string): Promise<string>;
  extractJdFromHtml(apiKey: string, rawHtml: string): Promise<string>;
}
