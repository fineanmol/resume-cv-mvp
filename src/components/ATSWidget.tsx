import React, { useState } from 'react';
import { extractKeywords } from '../utils/jdMatcher';
import { RefreshCw, Check, Plus, AlertCircle, Loader } from 'lucide-react';

interface ATSWidgetProps {
  jd: string;
  docText: string;
  onInjectKeyword: (keyword: string) => Promise<void>;
  onRecheck: () => void;
}

export const ATSWidget: React.FC<ATSWidgetProps> = ({
  jd,
  docText,
  onInjectKeyword,
  onRecheck
}) => {
  const [injectingKeyword, setInjectingKeyword] = useState<string | null>(null);

  const trimmedJd = jd.trim();
  if (!trimmedJd) {
    return (
      <div className="bg-card border border-border-color/60 rounded-xl p-4 text-center text-xs text-text-muted">
        <AlertCircle className="w-5 h-5 mx-auto mb-2 text-text-muted/60" />
        Paste a Job Description in the control panel to evaluate ATS score.
      </div>
    );
  }

  const keywords = extractKeywords(trimmedJd);
  if (keywords.length === 0) {
    return (
      <div className="bg-card border border-border-color/60 rounded-xl p-4 text-center text-xs text-text-muted">
        No technical keywords detected in the Job Description. Try adding more detailed text.
      </div>
    );
  }

  const docTextLower = docText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let totalWeight = 0;
  let matchedWeight = 0;

  keywords.forEach(kw => {
    const escaped = escapeRegExp(kw);
    const regexG = new RegExp(`(?<!\\w)${escaped}(?!\\w)`, 'gi');
    const matches = trimmedJd.match(regexG);
    const weight = matches ? matches.length : 1;

    totalWeight += weight;

    const regex = new RegExp(`(?<!\\w)${escaped}(?!\\w)`, 'i');
    if (regex.test(docTextLower)) {
      matched.push(kw);
      matchedWeight += weight;
    } else {
      missing.push(kw);
    }
  });

  const score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

  let matchStatus = "Needs Optimization";
  let colorClass = "text-amber-400";
  let strokeColor = "#f59e0b"; // Amber
  let tipMessage = "💡 Tip: Click missing keywords to naturally inject them with AI.";

  if (score >= 80) {
    matchStatus = "Excellent Match";
    colorClass = "text-green-400";
    strokeColor = "#10b981"; // Emerald
    tipMessage = "🎉 Amazing! Your document matches the job description parameters.";
  } else if (score >= 60) {
    matchStatus = "Good Match";
    colorClass = "text-brand-accent";
    strokeColor = "#5cc3e8"; // Sky Blue
    tipMessage = "👍 Good match! Inject a few more keywords to reach an excellent score.";
  }

  const handleKeywordClick = async (kw: string) => {
    if (injectingKeyword) return; // Prevent double clicks
    setInjectingKeyword(kw);
    try {
      await onInjectKeyword(kw);
    } catch (err) {
      console.error(err);
    } finally {
      setInjectingKeyword(null);
    }
  };

  return (
    <div className="bg-card border border-border-color/60 rounded-xl p-5 shadow-inner">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {/* SVG Gauge */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg width="56" height="56" viewBox="0 0 36 36" className="transform -rotate-90 w-14 h-14">
              <path stroke="#2e303a" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path
                stroke={strokeColor}
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-text-main">
              {score}%
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-text-main">ATS Compatibility Score</div>
            <div className={`text-xs font-semibold ${colorClass}`}>{matchStatus}</div>
          </div>
        </div>

        <button
          onClick={onRecheck}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sidebar hover:bg-sidebar/80 border border-border-color rounded-lg text-xs font-medium text-text-main hover:text-brand-accent transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Re-check
        </button>
      </div>

      <div className="text-xs text-text-muted leading-relaxed mb-4">
        {tipMessage}
      </div>

      <div className="border-t border-border-color/60 pt-4 space-y-4">
        {/* Matched Keywords */}
        <div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
            Matched Keywords ({matched.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matched.length === 0 ? (
              <span className="text-xs text-text-muted/60 italic">None matched yet.</span>
            ) : (
              matched.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-medium"
                >
                  <Check className="w-3 h-3" />
                  {kw}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
            Missing Keywords ({missing.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missing.length === 0 ? (
              <span className="text-xs text-green-400 font-semibold italic">No missing keywords!</span>
            ) : (
              missing.map((kw, idx) => {
                const isThisInjecting = injectingKeyword === kw;
                return (
                  <button
                    key={idx}
                    disabled={!!injectingKeyword}
                    onClick={() => handleKeywordClick(kw)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 text-xs font-medium cursor-pointer transition disabled:opacity-60"
                  >
                    {isThisInjecting ? (
                      <Loader className="w-3 h-3 animate-spin text-amber-400" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    {kw}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
