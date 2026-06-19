import React, { useState } from 'react';
import { ATSWidget } from './ATSWidget';
import { GeminiService } from '../services/gemini';
import { Sparkles, Globe, AlertTriangle, CheckCircle } from 'lucide-react';

interface JDPanelProps {
  jobDescription: string;
  onJdChange: (text: string) => void;
  docText: string;
  onInjectKeyword: (kw: string) => Promise<void>;
  aiLoading: boolean;
  onAiTailor: () => void;
  isOnline: boolean;
  geminiKey: string;
}

export const JDPanel: React.FC<JDPanelProps> = ({
  jobDescription,
  onJdChange,
  docText,
  onInjectKeyword,
  aiLoading,
  onAiTailor,
  isOnline,
  geminiKey
}) => {
  const [url, setUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showStatus = (type: 'success' | 'error' | 'info', msg: string) => {
    setStatus({ type, message: msg });
    setTimeout(() => setStatus(null), 5000);
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = url.trim();
    if (!targetUrl) return;

    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    setScraping(true);
    showStatus('info', 'Crawling target listing URL...');

    try {
      let contents = "";
      
      // Proxy 1: allorigins.win
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const json = await res.json();
          contents = json.contents || "";
        } else {
          throw new Error("Primary proxy failed.");
        }
      } catch (firstErr) {
        console.warn("Primary proxy failed, trying backup corsproxy.io...", firstErr);
      }

      // Proxy 2: corsproxy.io
      if (!contents) {
        try {
          const backupUrl = `https://corsproxy.io/?${targetUrl}`;
          const res = await fetch(backupUrl);
          if (res.ok) {
            contents = await res.text();
          } else {
            throw new Error("Backup proxy failed.");
          }
        } catch (secondErr) {
          console.warn("Backup proxy failed, trying tertiary proxy codetabs...", secondErr);
        }
      }

      // Proxy 3: codetabs.com
      if (!contents) {
        try {
          const tertiaryUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
          const res = await fetch(tertiaryUrl);
          if (res.ok) {
            contents = await res.text();
          } else {
            throw new Error("Tertiary proxy failed.");
          }
        } catch (thirdErr) {
          console.error("All proxies failed:", thirdErr);
          throw new Error("CORS proxy limit reached. Please copy-paste JD text manually.", { cause: thirdErr });
        }
      }

      if (!contents || contents.trim().length === 0) {
        throw new Error("Listing crawl returned empty content.");
      }

      // Strip script blocks, styles, HTML markup
      let cleanText = contents
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
        .replace(/<\/?[^>]+(>|$)/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (geminiKey && cleanText.length > 200) {
        showStatus('info', 'Refining description text with Gemini...');
        try {
          cleanText = await GeminiService.extractJdFromHtml(geminiKey, cleanText);
        } catch (geminiErr) {
          console.warn("Gemini JD refinement failed, using raw cleaned text:", geminiErr);
        }
      }

      onJdChange(cleanText);
      showStatus('success', 'Job description scraped successfully!');
      setUrl('');
    } catch (err) {
      showStatus('error', err instanceof Error ? err.message : 'Scraping failed');
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 space-y-5 flex flex-col w-full">
      
      {/* 1. JD Link Scraper Input */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-brand-accent" />
          Job Listing Link Scraper
        </h4>
        <form onSubmit={handleScrape} className="flex gap-2">
          <input
            type="text"
            placeholder="Paste LinkedIn/Indeed link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={scraping}
            className="flex-1 bg-input-bg border border-border-color rounded-lg px-3 py-1.5 text-xs text-text-main placeholder-text-muted/30 focus:outline-none focus:border-brand-accent"
          />
          <button
            type="submit"
            disabled={scraping || !url.trim()}
            className="px-3 py-1.5 bg-card hover:bg-card/75 border border-border-color rounded-lg text-xs font-bold text-text-main hover:text-brand-accent transition cursor-pointer disabled:opacity-40"
          >
            {scraping ? '...' : 'Scrape'}
          </button>
        </form>

        {/* Status indicator */}
        {status && (
          <div className={`flex items-center gap-1.5 text-[11px] p-2 rounded border leading-snug ${
            status.type === 'success' 
              ? 'bg-green-950/20 border-green-500/30 text-green-300' 
              : status.type === 'error'
              ? 'bg-red-950/20 border-red-500/30 text-red-300'
              : 'bg-blue-950/20 border-blue-500/30 text-blue-300 animate-pulse'
          }`}>
            {status.type === 'success' && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />}
            {status.type === 'error' && <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />}
            <span>{status.message}</span>
          </div>
        )}
      </div>

      {/* 2. JD Textarea */}
      <div className="space-y-2.5 border-t border-border-color/30 pt-4">
        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Job Description Details
        </h4>
        <textarea
          value={jobDescription}
          onChange={(e) => onJdChange(e.target.value)}
          placeholder="Paste description text manually or use the scraper above..."
          rows={7}
          className="w-full bg-input-bg border border-border-color rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-brand-accent resize-y font-sans leading-relaxed"
        />
      </div>

      {/* 3. AI Document Tailoring */}
      {isOnline && (
        <button
          disabled={aiLoading}
          onClick={onAiTailor}
          className="flex items-center justify-center gap-2 py-3 bg-brand-accent hover:bg-brand-accent-hover text-editor font-bold rounded-lg shadow-lg hover:shadow-brand-accent/10 transition duration-200 text-xs cursor-pointer w-full disabled:opacity-50"
        >
          {aiLoading ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Tailor Document to Job
        </button>
      )}

      {/* 4. ATS Scoring and Badges */}
      <div className="border-t border-border-color/30 pt-4">
        <ATSWidget
          jd={jobDescription}
          docText={docText}
          onInjectKeyword={onInjectKeyword}
          onRecheck={() => onJdChange(jobDescription)}
        />
      </div>

    </div>
  );
};
