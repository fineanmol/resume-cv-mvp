import React, { useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import type { ResumeState } from '../../../types';
import { PdfService } from '../../../services/pdf';
import { GeminiService } from '../../../services/gemini';
import { splitIntoBullets } from '../../../utils/bullets';

interface PdfImportBlockProps {
  onChange: (newState: ResumeState | ((prev: ResumeState) => ResumeState)) => void;
  geminiKey: string;
}

export const PdfImportBlock: React.FC<PdfImportBlockProps> = ({ onChange, geminiKey }) => {
  const [parsing, setParsing] = useState(false);

  const handlePdfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!geminiKey) {
      alert('Please enter a Gemini API Key first to parse the PDF resume details.');
      return;
    }
    setParsing(true);
    try {
      const ab = await file.arrayBuffer();
      const b64 = btoa(new Uint8Array(ab).reduce((d, b) => d + String.fromCharCode(b), ''));
      let avatar = '';
      try {
        const p = await PdfService.extractFirstPhoto(file);
        if (p) avatar = p;
      } catch {
        /* photo extraction optional */
      }
      const parsed = await GeminiService.parseResumePdf(geminiKey, b64);
      if (parsed.resumeExperience) {
        parsed.resumeExperience = parsed.resumeExperience.map((exp) => ({
          ...exp,
          bullets: splitIntoBullets(exp.bullets || '').join('\n'),
        }));
      }
      if (parsed.resumeEducation) {
        parsed.resumeEducation = parsed.resumeEducation.map((edu) => ({
          ...edu,
          bullets: splitIntoBullets(edu.bullets || '').join('\n'),
        }));
      }
      onChange((prev) => ({ ...prev, avatar: avatar || prev.avatar || '', ...parsed }) as ResumeState);
      alert('PDF Resume imported successfully!');
    } catch (err) {
      alert(`PDF parsing failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setParsing(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-card/20 border border-border-color/60 rounded-xl p-4 space-y-2.5">
      <div className="text-xs font-bold text-text-main flex items-center gap-1.5 uppercase tracking-wider">
        <Upload className="w-4 h-4 text-brand-accent" />
        Import Resume PDF
      </div>
      <p className="text-[11px] text-text-muted leading-relaxed">
        Upload your PDF to auto-extract details, skills, experience &amp; photo via Gemini AI.
      </p>
      <label className="flex items-center justify-center gap-2 px-3 py-2 bg-sidebar border border-border-color hover:border-brand-accent/50 rounded-lg text-xs font-semibold text-text-main hover:text-brand-accent transition cursor-pointer">
        {parsing ? (
          <>
            <Loader className="w-3.5 h-3.5 animate-spin text-brand-accent" />
            Parsing PDF...
          </>
        ) : (
          <>
            <Upload className="w-3.5 h-3.5" />
            Choose Resume PDF
          </>
        )}
        <input
          type="file"
          accept=".pdf"
          onChange={handlePdfImport}
          disabled={parsing}
          className="hidden"
        />
      </label>
    </div>
  );
};
