import React from 'react';
import { Building2, GraduationCap } from 'lucide-react';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';
import { getDynamicAchievementIcon, getDynamicProjectIcon } from '../templates/shared/templateIconHelpers';
import { getLanguageBubbleCount } from '../utils/languageLevel';
import { LanguageBubbles } from '../templates/shared/LanguageBubbles';
import type { LayoutSettings } from '../types';

const H = 'text-[8px] font-bold uppercase tracking-widest border-b-2 pb-0.5 mb-1.5';

const SectionHeading: React.FC<{ title: string; brandColor: string }> = ({ title, brandColor }) => (
  <h3 className={H} style={{ borderColor: brandColor, color: brandColor }}>
    {title}
  </h3>
);

const chipClass =
  'inline-flex w-max max-w-full shrink-0 items-center rounded-md font-medium border text-[7px] leading-snug whitespace-nowrap px-1.5 py-0.5 min-h-[16px] bg-white text-slate-600 border-slate-200';

export const SectionPreviewContent: React.FC<{
  sectionId: string;
  brandColor: string;
  skillsStyle?: LayoutSettings['skillsStyle'];
}> = ({ sectionId, brandColor, skillsStyle = 'chips' }) => {
  const exp = DEFAULT_RESUME_STATE.resumeExperience[0];
  const edu = DEFAULT_RESUME_STATE.resumeEducation[0];
  const cert = DEFAULT_RESUME_STATE.resumeCerts[0];
  const ach = DEFAULT_RESUME_STATE.resumeAchievements[0];
  const lang = DEFAULT_RESUME_STATE.resumeLanguages[0];
  const skills = DEFAULT_RESUME_STATE.resumeSkills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 6);

  switch (sectionId) {
    case 'summary':
      return (
        <div className="text-[8px] text-slate-700 leading-relaxed">
          <SectionHeading title="Summary" brandColor={brandColor} />
          <p className="text-justify">{DEFAULT_RESUME_STATE.resumeSummary.slice(0, 180)}…</p>
        </div>
      );

    case 'skills':
      return (
        <div className="text-[8px]">
          <SectionHeading title="Skills" brandColor={brandColor} />
          {skillsStyle === 'normal' ? (
            <p className="text-slate-700 leading-relaxed">{skills.join(', ')}</p>
          ) : (
            <div className="flex flex-wrap items-center gap-1">
              {skills.map((s, i) => (
                <span key={i} className={chipClass}>{s}</span>
              ))}
            </div>
          )}
        </div>
      );

    case 'experience':
      return (
        <div className="text-[8px] text-slate-700 space-y-1">
          <SectionHeading title="Experience" brandColor={brandColor} />
          <div className="font-bold text-slate-800 flex justify-between gap-1">
            <span className="flex items-center gap-1 min-w-0">
              <Building2 className="w-2.5 h-2.5 flex-shrink-0 text-slate-400" />
              <span className="truncate">{exp.title}</span>
            </span>
            <span className="font-normal text-slate-500 flex-shrink-0">{exp.dates}</span>
          </div>
          <div className="flex justify-between text-slate-600 font-medium">
            <span className="text-[#007ACC] font-semibold truncate">{exp.company}</span>
            <span className="text-slate-500 flex-shrink-0">{exp.location}</span>
          </div>
          <ul className="list-disc pl-3 text-slate-700 space-y-0.5 leading-relaxed">
            {exp.bullets.split('\n').slice(0, 2).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      );

    case 'education':
      return (
        <div className="text-[8px] text-slate-700 space-y-1">
          <SectionHeading title="Education" brandColor={brandColor} />
          <div className="font-bold text-slate-800 flex items-center gap-1">
            <GraduationCap className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
            <span>{edu.degree}</span>
          </div>
          <div className="text-[#007ACC] font-semibold">{edu.school}</div>
          <div className="flex justify-between text-slate-500 text-[7px]">
            <span>{edu.dates}</span>
            <span>{edu.location}</span>
          </div>
        </div>
      );

    case 'certs':
      return (
        <div className="text-[8px] text-slate-700 space-y-1">
          <SectionHeading title="Projects" brandColor={brandColor} />
          <div className="flex gap-1.5 items-start">
            {getDynamicProjectIcon(0, cert.title, cert.icon, brandColor, 'w-2.5 h-2.5 flex-shrink-0 mt-0.5')}
            <div className="min-w-0">
              <div className="font-bold text-slate-800">{cert.title}</div>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{cert.desc}</p>
            </div>
          </div>
        </div>
      );

    case 'achievements':
      return (
        <div className="text-[8px] text-slate-700 space-y-1">
          <SectionHeading title="Key Achievements" brandColor={brandColor} />
          <div className="flex gap-1.5 items-start">
            {getDynamicAchievementIcon(0, ach.title, ach.icon, brandColor, 'w-2.5 h-2.5 flex-shrink-0 mt-0.5')}
            <div className="min-w-0">
              <div className="font-bold text-slate-800">{ach.title}</div>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{ach.desc}</p>
            </div>
          </div>
        </div>
      );

    case 'languages':
      return (
        <div className="text-[8px] text-slate-700 space-y-1">
          <SectionHeading title="Languages" brandColor={brandColor} />
          <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            <span className="font-semibold text-slate-800">{lang.name}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500">{lang.level}</span>
            <LanguageBubbles count={getLanguageBubbleCount(lang.level)} activeColor={brandColor} />
          </span>
        </div>
      );

    default:
      return null;
  }
};
