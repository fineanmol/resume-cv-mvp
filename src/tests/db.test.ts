import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dbService } from '../services/db';
import type { ResumeState, CoverLetterState } from '../types';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';
import { DEFAULT_CL_STATE } from '../config/defaultCL';

// Ensure db is null in tests so all paths go through localStorage
vi.mock('../services/firebase', () => ({ db: null, auth: null, app: null }));

const USER_ID = 'test-user@example.com';
const RESUME_ID = 'resume-abc123';
const CL_ID = 'cl-xyz456';

const minimalResume: ResumeState = {
  ...DEFAULT_RESUME_STATE,
  id: RESUME_ID,
  title: 'My Test Resume',
};

const minimalCL: CoverLetterState = {
  ...DEFAULT_CL_STATE,
  id: CL_ID,
  title: 'My Test CL',
};

beforeEach(() => {
  localStorage.clear();
});

describe('dbService — localStorage fallback (db=null)', () => {
  it('saveResume stores data under LOCAL_RESUME_<id> key', async () => {
    await dbService.saveResume(USER_ID, RESUME_ID, minimalResume);
    const raw = localStorage.getItem(`LOCAL_RESUME_${RESUME_ID}`);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.title).toBe('My Test Resume');
    expect(parsed.id).toBe(RESUME_ID);
  });

  it('getResume returns null when no data exists', async () => {
    const result = await dbService.getResume(USER_ID, 'nonexistent-id');
    expect(result).toBeNull();
  });

  it('saveResume / getResume round-trip preserves all fields', async () => {
    await dbService.saveResume(USER_ID, RESUME_ID, minimalResume);
    const loaded = await dbService.getResume(USER_ID, RESUME_ID);
    expect(loaded).not.toBeNull();
    expect(loaded!.name).toBe(minimalResume.name);
    expect(loaded!.resumeSkills).toBe(minimalResume.resumeSkills);
    expect(loaded!.resumeExperience).toHaveLength(minimalResume.resumeExperience.length);
  });

  it('saveCoverLetter stores data under LOCAL_CL_<id> key', async () => {
    await dbService.saveCoverLetter(USER_ID, CL_ID, minimalCL);
    const raw = localStorage.getItem(`LOCAL_CL_${CL_ID}`);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.title).toBe('My Test CL');
    expect(parsed.id).toBe(CL_ID);
  });

  it('getCoverLetter round-trip returns saved state', async () => {
    await dbService.saveCoverLetter(USER_ID, CL_ID, minimalCL);
    const loaded = await dbService.getCoverLetter(USER_ID, CL_ID);
    expect(loaded).not.toBeNull();
    expect(loaded!.companyName).toBe(minimalCL.companyName);
    expect(loaded!.p1).toBe(minimalCL.p1);
  });

  it('saveResume writes metadata to LOCAL_META_<userId>', async () => {
    await dbService.saveResume(USER_ID, RESUME_ID, minimalResume);
    const metaRaw = localStorage.getItem(`LOCAL_META_${USER_ID}`);
    expect(metaRaw).not.toBeNull();
    const meta = JSON.parse(metaRaw!);
    expect(Array.isArray(meta)).toBe(true);
    const entry = meta.find((m: { id: string }) => m.id === RESUME_ID);
    expect(entry).toBeDefined();
    expect(entry.type).toBe('resume');
    expect(entry.title).toBe('My Test Resume');
  });

  it('listDrafts returns saved resumes and cover letters sorted by updatedAt', async () => {
    await dbService.saveResume(USER_ID, RESUME_ID, minimalResume);
    // Introduce a small gap to ensure deterministic order
    await new Promise(r => setTimeout(r, 5));
    await dbService.saveCoverLetter(USER_ID, CL_ID, minimalCL);

    const drafts = await dbService.listDrafts(USER_ID);
    expect(drafts.length).toBeGreaterThanOrEqual(2);
    // Most recent (CL) should be first
    expect(drafts[0].id).toBe(CL_ID);
    expect(drafts[0].type).toBe('coverletter');
  });

  it('deleteDraft removes localStorage entry and updates metadata', async () => {
    await dbService.saveResume(USER_ID, RESUME_ID, minimalResume);
    expect(localStorage.getItem(`LOCAL_RESUME_${RESUME_ID}`)).not.toBeNull();

    await dbService.deleteDraft(USER_ID, RESUME_ID, 'resume');

    expect(localStorage.getItem(`LOCAL_RESUME_${RESUME_ID}`)).toBeNull();
    const drafts = await dbService.listDrafts(USER_ID);
    expect(drafts.find((d) => d.id === RESUME_ID)).toBeUndefined();
  });

  it('renameDraft updates the title of a saved resume', async () => {
    await dbService.saveResume(USER_ID, RESUME_ID, minimalResume);
    await dbService.renameDraft(USER_ID, RESUME_ID, 'resume', 'Renamed Resume');
    const loaded = await dbService.getResume(USER_ID, RESUME_ID);
    expect(loaded!.title).toBe('Renamed Resume');
  });
});
