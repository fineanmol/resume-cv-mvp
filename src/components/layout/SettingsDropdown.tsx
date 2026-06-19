import React from 'react';
import { Sparkles } from 'lucide-react';

interface SettingsDropdownProps {
  geminiKey: string;
  onChange: (v: string) => void;
  onSave: (e: React.FormEvent) => void;
}

export const SettingsDropdown: React.FC<SettingsDropdownProps> = ({ geminiKey, onChange, onSave }) => (
  <div className="absolute right-20 top-16 z-50 w-80 bg-sidebar border border-brand-accent/30 rounded-xl p-4 shadow-xl">
    <form onSubmit={onSave} className="space-y-3">
      <div className="text-xs font-bold text-brand-accent flex items-center gap-1">
        <Sparkles className="w-4 h-4" /> Gemini API Key
      </div>
      <p className="text-[10px] text-text-muted leading-relaxed">
        Provide your Gemini API Key to enable AI tailoring, keyword injection, and bullet improvers.
      </p>
      <input
        type="password"
        required
        placeholder="AIzaSy..."
        value={geminiKey}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-input-bg border border-border-color rounded-lg px-3 py-2 text-xs text-text-main placeholder-text-muted/30 focus:outline-none focus:border-brand-accent"
      />
      <button
        type="submit"
        className="w-full py-2 bg-brand-accent hover:bg-brand-accent-hover text-editor font-bold rounded-lg text-xs transition cursor-pointer"
      >
        Save API Key
      </button>
    </form>
  </div>
);
