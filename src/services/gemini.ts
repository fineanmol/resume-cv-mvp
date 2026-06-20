import type { CoverLetterState, ResumeState } from '../types';
import type { IAiService } from './interfaces';
import { buildTailorCoverLetterPayload, buildTailorResumePayload } from './gemini/prompts/tailorPrompt';
import { buildImproveBulletPayload } from './gemini/prompts/improvePrompt';
import { buildParseResumePdfPayload } from './gemini/prompts/importPrompt';
import { buildInjectKeywordIntoCoverLetterPayload, buildInjectKeywordIntoResumePayload } from './gemini/prompts/injectPrompt';
import { buildExtractJdFromHtmlPayload } from './gemini/prompts/extractJdPrompt';

/** Strips markdown code fences from Gemini responses. Exported for testing. */
export function cleanJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export class GeminiService {
  private static getApiUrl(apiKey: string): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  }

  private static cleanJson(text: string): string {
    return cleanJson(text);
  }

  public static async request<T>(apiKey: string, payload: unknown): Promise<T> {
    const response = await fetch(this.getApiUrl(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini API.');
    }

    try {
      const cleaned = this.cleanJson(responseText);
      return JSON.parse(cleaned) as T;
    } catch (jsonErr) {
      console.error('Gemini raw response was:', responseText);
      throw new Error(`JSON parse failed: ${(jsonErr as Error).message}`, { cause: jsonErr });
    }
  }

  public static async tailorCoverLetter(
    apiKey: string,
    state: CoverLetterState,
    jobDesc: string,
  ): Promise<Partial<CoverLetterState>> {
    return this.request<Partial<CoverLetterState>>(
      apiKey,
      buildTailorCoverLetterPayload(state, jobDesc),
    );
  }

  public static async tailorResume(
    apiKey: string,
    state: ResumeState,
    jobDesc: string,
  ): Promise<Partial<ResumeState>> {
    return this.request<Partial<ResumeState>>(
      apiKey,
      buildTailorResumePayload(state, jobDesc),
    );
  }

  public static async parseResumePdf(
    apiKey: string,
    base64Data: string,
  ): Promise<Partial<ResumeState>> {
    return this.request<Partial<ResumeState>>(
      apiKey,
      buildParseResumePdfPayload(base64Data),
    );
  }

  public static async injectKeywordIntoCoverLetter(
    apiKey: string,
    state: CoverLetterState,
    keyword: string,
  ): Promise<Partial<CoverLetterState>> {
    return this.request<Partial<CoverLetterState>>(
      apiKey,
      buildInjectKeywordIntoCoverLetterPayload(state, keyword),
    );
  }

  public static async injectKeywordIntoResume(
    apiKey: string,
    state: ResumeState,
    keyword: string,
  ): Promise<Partial<ResumeState>> {
    return this.request<Partial<ResumeState>>(
      apiKey,
      buildInjectKeywordIntoResumePayload(state, keyword),
    );
  }

  public static async improveExperienceBullet(
    apiKey: string,
    bulletText: string,
    jobTitle?: string,
    jdText?: string,
  ): Promise<string> {
    interface ImprovedResponse { improvedBullet: string; }
    const res = await this.request<ImprovedResponse>(
      apiKey,
      buildImproveBulletPayload(bulletText, jobTitle, jdText),
    );
    return res.improvedBullet;
  }

  public static async extractJdFromHtml(apiKey: string, rawHtml: string): Promise<string> {
    interface ExtractedResponse { extractedJd: string; }
    const res = await this.request<ExtractedResponse>(
      apiKey,
      buildExtractJdFromHtmlPayload(rawHtml),
    );
    return res.extractedJd;
  }
}

// Compile-time contract enforcement — zero runtime cost.
// Errors here mean GeminiService's public static API drifted from IAiService.
const _: IAiService = GeminiService;
