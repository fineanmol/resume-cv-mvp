import React from 'react';
import { Star } from 'lucide-react';
import type { ResumeState, CertItem, AchievementItem, LanguageItem } from '../../types';
import { EditableText as E } from './EditableText';
import { WorkLink } from './WorkLink';

export interface BottomSectionsProps {
  resumeCerts: ResumeState['resumeCerts'];
  resumeAchievements: ResumeState['resumeAchievements'];
  resumeLanguages: ResumeState['resumeLanguages'];
  sec: React.CSSProperties;
  isEditable: boolean;
  ec: string;
  accentColor: string;
  headingClass: string;
  onCertChange?: (index: number, field: keyof CertItem, value: string) => void;
  onAchievementChange?: (index: number, field: keyof AchievementItem, value: string) => void;
  onLanguageChange?: (index: number, field: keyof LanguageItem, value: string) => void;
  certsAlign?: 'left' | 'center' | 'right' | 'justify';
  achievementsAlign?: 'left' | 'center' | 'right' | 'justify';
}

export const BottomSections: React.FC<BottomSectionsProps> = ({
  resumeCerts, resumeAchievements, resumeLanguages,
  sec, isEditable, ec, accentColor, headingClass,
  onCertChange, onAchievementChange, onLanguageChange,
  certsAlign = 'left', achievementsAlign = 'left',
}) => (
  <>
    {resumeCerts && resumeCerts.length > 0 && (
      <section style={sec}>
        <h3 className={headingClass} style={{ color: accentColor, borderColor: `${accentColor}40` }}>Certifications</h3>
        <ul className="space-y-1.5 text-xs">
          {resumeCerts.map((cert, idx) => (
            <li key={idx} className={`text-${certsAlign}`}>
              <div className={`flex items-center gap-1 ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                <E tag="strong" value={cert.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 font-bold"
                  onSave={v => onCertChange?.(idx, 'title', v)} />
                <WorkLink url={cert.url} brandColor={accentColor} />
              </div>
              <E tag="p" value={cert.desc} isEditable={isEditable} editableClass={ec} className={`text-slate-500 text-[11px] mt-0.5 text-${certsAlign}`}
                onSave={v => onCertChange?.(idx, 'desc', v)} />
            </li>
          ))}
        </ul>
      </section>
    )}
    {resumeAchievements && resumeAchievements.length > 0 && (
      <section style={sec}>
        <h3 className={headingClass} style={{ color: accentColor, borderColor: `${accentColor}40` }}>Achievements</h3>
        <ul className="space-y-2 text-xs">
          {resumeAchievements.map((ach, idx) => (
            <li key={idx} className={`flex gap-2 text-${achievementsAlign} ${achievementsAlign === 'right' ? 'flex-row-reverse' : ''}`}>
              <Star className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <E tag="strong" value={ach.title} isEditable={isEditable} editableClass={ec} className="text-slate-800 block"
                  onSave={v => onAchievementChange?.(idx, 'title', v)} />
                <E tag="p" value={ach.desc} isEditable={isEditable} editableClass={ec} className="text-slate-500 text-[11px]"
                  onSave={v => onAchievementChange?.(idx, 'desc', v)} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    )}
    {resumeLanguages && resumeLanguages.length > 0 && (
      <section style={sec}>
        <h3 className={headingClass} style={{ color: accentColor, borderColor: `${accentColor}40` }}>Languages</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          {resumeLanguages.map((lang, idx) => (
            <span key={idx} className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <E value={lang.name} isEditable={isEditable} editableClass={ec} className="font-semibold text-slate-800"
                onSave={v => onLanguageChange?.(idx, 'name', v)} />
              <span className="text-slate-400">/</span>
              <E value={lang.level} isEditable={isEditable} editableClass={ec} className="text-slate-500"
                onSave={v => onLanguageChange?.(idx, 'level', v)} />
            </span>
          ))}
        </div>
      </section>
    )}
  </>
);
