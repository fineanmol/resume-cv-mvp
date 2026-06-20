import { useState, useCallback } from 'react';
import { GeminiService } from '../services/gemini';
import type { ResumeState, CoverLetterState, DocType } from '../types';
import type { ToastAPI } from './useToast';
import { splitIntoBullets, stripMarkdownBold } from '../utils/bullets';

interface Options {
  geminiKey: string;
  activeDocType: DocType | null;
  resumeState: ResumeState;
  clState: CoverLetterState;
  jobDescription: string;
  setResumeState: (fn: (prev: ResumeState) => ResumeState) => void;
  setClState: (fn: (prev: CoverLetterState) => CoverLetterState) => void;
  onNeedKey: () => void;
  toast: ToastAPI;
}

export function useAiActions({
  geminiKey, activeDocType,
  resumeState, clState, jobDescription,
  setResumeState, setClState,
  onNeedKey, toast,
}: Options) {
  const [aiLoading, setAiLoading] = useState(false);

  const requireKey = useCallback((): boolean => {
    if (!geminiKey) { toast.warning('Add your Gemini API Key in Settings to use AI features.'); onNeedKey(); return false; }
    return true;
  }, [geminiKey, onNeedKey, toast]);

  const tailorDocument = useCallback(async () => {
    if (!requireKey()) return;
    if (!jobDescription.trim()) { toast.info('Paste a Job Description in the right panel first.'); return; }
    setAiLoading(true);
    try {
      if (activeDocType === 'resume') {
        const result = await GeminiService.tailorResume(geminiKey, resumeState, jobDescription);
        setResumeState(prev => ({
          ...prev,
          resumeSummary: result.resumeSummary || prev.resumeSummary,
          resumeSkills: result.resumeSkills || prev.resumeSkills,
          resumeExperience: prev.resumeExperience.map((exp, idx) => ({
            ...exp,
            bullets: result.resumeExperience?.[idx]?.bullets
              ? splitIntoBullets(stripMarkdownBold(result.resumeExperience[idx].bullets)).join('\n')
              : exp.bullets,
          })),
        }));
      } else {
        const result = await GeminiService.tailorCoverLetter(geminiKey, clState, jobDescription);
        setClState(prev => ({
          ...prev,
          companyName: result.companyName || prev.companyName,
          jobTitle: result.jobTitle || prev.jobTitle,
          salutation: result.salutation || prev.salutation,
          p1: result.p1 || prev.p1,
          p2: result.p2 || prev.p2,
          p3: result.p3 || prev.p3,
          p4: result.p4 || prev.p4,
          highlights: prev.highlights.map((hl, idx) => ({
            ...hl,
            category: result.highlights?.[idx]?.category || hl.category,
            text: result.highlights?.[idx]?.text || hl.text,
          })),
        }));
      }
      toast.success('Document tailored to the job description!');
    } catch (err) {
      toast.error(`AI Tailoring failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setAiLoading(false);
    }
  }, [requireKey, jobDescription, activeDocType, geminiKey, resumeState, clState, setResumeState, setClState, toast]);

  const injectKeyword = useCallback(async (kw: string) => {
    if (!requireKey()) return;
    try {
      if (activeDocType === 'resume') {
        const result = await GeminiService.injectKeywordIntoResume(geminiKey, resumeState, kw);
        setResumeState(prev => ({
          ...prev,
          resumeSummary: result.resumeSummary || prev.resumeSummary,
          resumeSkills: result.resumeSkills || prev.resumeSkills,
          resumeExperience: prev.resumeExperience.map((exp, idx) => ({
            ...exp,
            bullets: result.resumeExperience?.[idx]?.bullets
              ? splitIntoBullets(stripMarkdownBold(result.resumeExperience[idx].bullets)).join('\n')
              : exp.bullets,
          })),
        }));
      } else {
        const result = await GeminiService.injectKeywordIntoCoverLetter(geminiKey, clState, kw);
        setClState(prev => ({
          ...prev,
          p1: result.p1 || prev.p1,
          p2: result.p2 || prev.p2,
          p3: result.p3 || prev.p3,
          p4: result.p4 || prev.p4,
          highlights: prev.highlights.map((hl, idx) => ({
            ...hl,
            category: result.highlights?.[idx]?.category || hl.category,
            text: result.highlights?.[idx]?.text || hl.text,
          })),
        }));
      }
      toast.success(`"${kw}" injected naturally into your document.`);
    } catch (err) {
      toast.error(`Keyword injection failed: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }, [requireKey, activeDocType, geminiKey, resumeState, clState, setResumeState, setClState, toast]);

  const improveBullet = useCallback(async (idx: number, currentText: string) => {
    if (!requireKey()) return;
    setAiLoading(true);
    try {
      const improved = await GeminiService.improveExperienceBullet(
        geminiKey,
        currentText,
        resumeState.resumeExperience[idx]?.title ?? '',
        jobDescription,
      );
      setResumeState(prev => {
        const updated = [...prev.resumeExperience];
        updated[idx] = { ...updated[idx], bullets: splitIntoBullets(improved).join('\n') };
        return { ...prev, resumeExperience: updated };
      });
      toast.success('Bullet points improved!');
    } catch (err) {
      toast.error(`Bullet improvement failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setAiLoading(false);
    }
  }, [requireKey, geminiKey, resumeState, jobDescription, setResumeState, toast]);

  return { aiLoading, tailorDocument, injectKeyword, improveBullet };
}
