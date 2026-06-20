import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import { useAiActions } from '../hooks/useAiActions';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';
import { DEFAULT_CL_STATE } from '../config/defaultCL';
import type { ResumeState, CoverLetterState } from '../types';
import { GeminiService } from '../services/gemini';

// Use vi.fn() directly inside the factory (not hoisted external vars)
vi.mock('../services/gemini', () => ({
  GeminiService: {
    tailorResume: vi.fn(),
    tailorCoverLetter: vi.fn(),
    injectKeywordIntoCoverLetter: vi.fn(),
    injectKeywordIntoResume: vi.fn(),
    improveExperienceBullet: vi.fn(),
    parseResumePdf: vi.fn(),
    extractJdFromHtml: vi.fn(),
    request: vi.fn(),
  },
}));

const mockToast = {
  toasts: [] as never[],
  show: vi.fn(),
  dismiss: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

beforeEach(() => {
  vi.mocked(GeminiService.tailorResume).mockReset();
  vi.mocked(GeminiService.tailorCoverLetter).mockReset();
  vi.mocked(GeminiService.injectKeywordIntoCoverLetter).mockReset();
  vi.mocked(GeminiService.injectKeywordIntoResume).mockReset();
  vi.mocked(GeminiService.improveExperienceBullet).mockReset();
  mockToast.success.mockReset();
  mockToast.error.mockReset();
  mockToast.warning.mockReset();
  mockToast.info.mockReset();
});

describe('useAiActions — tailorDocument (resume)', () => {
  it('merges returned experience bullets into resume state', async () => {
    vi.mocked(GeminiService.tailorResume).mockResolvedValue({
      resumeSummary: 'Updated summary',
      resumeSkills: 'React, Node.js',
      resumeExperience: [
        { bullets: '• Improved performance by 40%.', company: '', title: '', dates: '', location: '' },
        { bullets: '• Built microservices.', company: '', title: '', dates: '', location: '' },
      ],
    });

    const { result } = renderHook(() => {
      const [resumeState, setResumeState] = useState<ResumeState>(DEFAULT_RESUME_STATE);
      const [clState, setClState] = useState<CoverLetterState>(DEFAULT_CL_STATE);
      const actions = useAiActions({
        geminiKey: 'test-api-key',
        activeDocType: 'resume',
        resumeState,
        clState,
        jobDescription: 'Looking for a senior engineer.',
        setResumeState,
        setClState,
        onNeedKey: vi.fn(),
        toast: mockToast,
      });
      return { resumeState, clState, ...actions };
    });

    await act(async () => {
      await result.current.tailorDocument();
    });

    expect(result.current.resumeState.resumeSummary).toBe('Updated summary');
    expect(result.current.resumeState.resumeSkills).toBe('React, Node.js');
    expect(result.current.resumeState.resumeExperience[0].bullets).toContain('Improved performance');
  });

  it('calls toast.success after a successful tailor', async () => {
    vi.mocked(GeminiService.tailorResume).mockResolvedValue({
      resumeSummary: 'New summary',
      resumeExperience: [],
    });

    const { result } = renderHook(() => {
      const [resumeState, setResumeState] = useState<ResumeState>(DEFAULT_RESUME_STATE);
      const [clState, setClState] = useState<CoverLetterState>(DEFAULT_CL_STATE);
      const actions = useAiActions({
        geminiKey: 'test-api-key',
        activeDocType: 'resume',
        resumeState,
        clState,
        jobDescription: 'Some job.',
        setResumeState,
        setClState,
        onNeedKey: vi.fn(),
        toast: mockToast,
      });
      return { ...actions };
    });

    await act(async () => {
      await result.current.tailorDocument();
    });

    expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('tailored'));
  });

  it('strips markdown bold (**text**) from tailored bullets', async () => {
    vi.mocked(GeminiService.tailorResume).mockResolvedValue({
      resumeSummary: 'Updated summary',
      resumeSkills: 'React, Node.js',
      resumeExperience: [
        { bullets: 'Led **market research** for the product.\nImproved **conversion rates** by 20%.', company: '', title: '', dates: '', location: '' },
        { bullets: 'Built **microservices** with Node.js.', company: '', title: '', dates: '', location: '' },
      ],
    });

    const { result } = renderHook(() => {
      const [resumeState, setResumeState] = useState<ResumeState>(DEFAULT_RESUME_STATE);
      const [clState, setClState] = useState<CoverLetterState>(DEFAULT_CL_STATE);
      const actions = useAiActions({
        geminiKey: 'test-api-key',
        activeDocType: 'resume',
        resumeState,
        clState,
        jobDescription: 'Looking for a senior engineer.',
        setResumeState,
        setClState,
        onNeedKey: vi.fn(),
        toast: mockToast,
      });
      return { resumeState, clState, ...actions };
    });

    await act(async () => {
      await result.current.tailorDocument();
    });

    expect(result.current.resumeState.resumeExperience[0].bullets).not.toContain('**');
    expect(result.current.resumeState.resumeExperience[0].bullets).toContain('market research');
    expect(result.current.resumeState.resumeExperience[0].bullets).toContain('conversion rates');
    expect(result.current.resumeState.resumeExperience[1].bullets).not.toContain('**');
    expect(result.current.resumeState.resumeExperience[1].bullets).toContain('microservices');
  });

  it('preserves all bullet points per job after tailoring', async () => {
    vi.mocked(GeminiService.tailorResume).mockResolvedValue({
      resumeSummary: 'Updated summary',
      resumeSkills: 'React, Node.js',
      resumeExperience: [
        { bullets: 'Led the architecture.\nMentored 6 developers.\nCollaborated with product managers.\nOwned the roadmap.', company: '', title: '', dates: '', location: '' },
        { bullets: 'Built REST APIs.\nImplemented automated testing.', company: '', title: '', dates: '', location: '' },
      ],
    });

    const { result } = renderHook(() => {
      const [resumeState, setResumeState] = useState<ResumeState>(DEFAULT_RESUME_STATE);
      const [clState, setClState] = useState<CoverLetterState>(DEFAULT_CL_STATE);
      const actions = useAiActions({
        geminiKey: 'test-api-key',
        activeDocType: 'resume',
        resumeState,
        clState,
        jobDescription: 'Looking for a senior engineer.',
        setResumeState,
        setClState,
        onNeedKey: vi.fn(),
        toast: mockToast,
      });
      return { resumeState, clState, ...actions };
    });

    await act(async () => {
      await result.current.tailorDocument();
    });

    const job0Bullets = result.current.resumeState.resumeExperience[0].bullets.split('\n').filter(Boolean);
    const job1Bullets = result.current.resumeState.resumeExperience[1].bullets.split('\n').filter(Boolean);
    expect(job0Bullets.length).toBe(4);
    expect(job1Bullets.length).toBe(2);
  });

  it('aiLoading is false when not running a request', () => {
    const { result } = renderHook(() => {
      const [resumeState, setResumeState] = useState<ResumeState>(DEFAULT_RESUME_STATE);
      const [clState, setClState] = useState<CoverLetterState>(DEFAULT_CL_STATE);
      return useAiActions({
        geminiKey: 'key',
        activeDocType: 'resume',
        resumeState,
        clState,
        jobDescription: '',
        setResumeState,
        setClState,
        onNeedKey: vi.fn(),
        toast: mockToast,
      });
    });
    expect(result.current.aiLoading).toBe(false);
  });
});

describe('useAiActions — injectKeyword (cover letter)', () => {
  it('merges keyword result into cover letter state', async () => {
    vi.mocked(GeminiService.injectKeywordIntoCoverLetter).mockResolvedValue({
      p1: 'Updated p1 with TypeScript keyword.',
    });

    const { result } = renderHook(() => {
      const [resumeState, setResumeState] = useState<ResumeState>(DEFAULT_RESUME_STATE);
      const [clState, setClState] = useState<CoverLetterState>(DEFAULT_CL_STATE);
      const actions = useAiActions({
        geminiKey: 'test-api-key',
        activeDocType: 'coverletter',
        resumeState,
        clState,
        jobDescription: '',
        setResumeState,
        setClState,
        onNeedKey: vi.fn(),
        toast: mockToast,
      });
      return { clState, ...actions };
    });

    await act(async () => {
      await result.current.injectKeyword('TypeScript');
    });

    expect(result.current.clState.p1).toBe('Updated p1 with TypeScript keyword.');
  });

  it('calls toast.success after a successful injection', async () => {
    vi.mocked(GeminiService.injectKeywordIntoCoverLetter).mockResolvedValue({ p1: 'new p1' });

    const { result } = renderHook(() => {
      const [resumeState, setResumeState] = useState<ResumeState>(DEFAULT_RESUME_STATE);
      const [clState, setClState] = useState<CoverLetterState>(DEFAULT_CL_STATE);
      return useAiActions({
        geminiKey: 'test-api-key',
        activeDocType: 'coverletter',
        resumeState,
        clState,
        jobDescription: '',
        setResumeState,
        setClState,
        onNeedKey: vi.fn(),
        toast: mockToast,
      });
    });

    await act(async () => {
      await result.current.injectKeyword('Go');
    });

    expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('"Go"'));
  });

  it('strips markdown bold from injected cover letter paragraphs and highlights', async () => {
    vi.mocked(GeminiService.injectKeywordIntoCoverLetter).mockResolvedValue({
      p1: 'Experienced in **cross-functional** collaboration.',
      p2: 'Led **agile** teams across 3 time zones.',
      highlights: [
        { category: '**Leadership**', text: 'Managed a team of **10 engineers**.' },
      ],
    });

    const { result } = renderHook(() => {
      const [resumeState, setResumeState] = useState<ResumeState>(DEFAULT_RESUME_STATE);
      const [clState, setClState] = useState<CoverLetterState>(DEFAULT_CL_STATE);
      const actions = useAiActions({
        geminiKey: 'test-api-key',
        activeDocType: 'coverletter',
        resumeState,
        clState,
        jobDescription: '',
        setResumeState,
        setClState,
        onNeedKey: vi.fn(),
        toast: mockToast,
      });
      return { clState, ...actions };
    });

    await act(async () => {
      await result.current.injectKeyword('cross-functional');
    });

    expect(result.current.clState.p1).not.toContain('**');
    expect(result.current.clState.p1).toContain('cross-functional');
    expect(result.current.clState.p2).not.toContain('**');
    expect(result.current.clState.p2).toContain('agile');
    expect(result.current.clState.highlights[0].category).not.toContain('**');
    expect(result.current.clState.highlights[0].category).toContain('Leadership');
    expect(result.current.clState.highlights[0].text).not.toContain('**');
    expect(result.current.clState.highlights[0].text).toContain('10 engineers');
  });
});

describe('useAiActions — injectKeyword (resume)', () => {
  it('strips markdown bold from injected resumeSummary and resumeSkills', async () => {
    vi.mocked(GeminiService.injectKeywordIntoResume).mockResolvedValue({
      resumeSummary: 'Passionate engineer with expertise in **Kubernetes** orchestration.',
      resumeSkills: 'React, Node.js, **Kubernetes**, Docker',
      resumeExperience: [
        { bullets: 'Deployed **Kubernetes** clusters reducing downtime by 30%.', company: '', title: '', dates: '', location: '' },
      ],
    });

    const { result } = renderHook(() => {
      const [resumeState, setResumeState] = useState<ResumeState>(DEFAULT_RESUME_STATE);
      const [clState, setClState] = useState<CoverLetterState>(DEFAULT_CL_STATE);
      const actions = useAiActions({
        geminiKey: 'test-api-key',
        activeDocType: 'resume',
        resumeState,
        clState,
        jobDescription: '',
        setResumeState,
        setClState,
        onNeedKey: vi.fn(),
        toast: mockToast,
      });
      return { resumeState, ...actions };
    });

    await act(async () => {
      await result.current.injectKeyword('Kubernetes');
    });

    expect(result.current.resumeState.resumeSummary).not.toContain('**');
    expect(result.current.resumeState.resumeSummary).toContain('Kubernetes');
    expect(result.current.resumeState.resumeSkills).not.toContain('**');
    expect(result.current.resumeState.resumeSkills).toContain('Kubernetes');
    expect(result.current.resumeState.resumeExperience[0].bullets).not.toContain('**');
    expect(result.current.resumeState.resumeExperience[0].bullets).toContain('Kubernetes');
  });
});

describe('useAiActions — missing API key', () => {
  it('shows a warning and does not call any API when geminiKey is empty', async () => {
    const { result } = renderHook(() => {
      const [resumeState, setResumeState] = useState<ResumeState>(DEFAULT_RESUME_STATE);
      const [clState, setClState] = useState<CoverLetterState>(DEFAULT_CL_STATE);
      return useAiActions({
        geminiKey: '',
        activeDocType: 'resume',
        resumeState,
        clState,
        jobDescription: 'test',
        setResumeState,
        setClState,
        onNeedKey: vi.fn(),
        toast: mockToast,
      });
    });

    await act(async () => {
      await result.current.tailorDocument();
    });

    expect(vi.mocked(GeminiService.tailorResume)).not.toHaveBeenCalled();
    expect(mockToast.warning).toHaveBeenCalledWith(expect.stringContaining('Gemini API Key'));
  });
});
