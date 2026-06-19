import React, { useState } from 'react';
import type { ResumeState } from '../types';
import { SectionHeader } from './SectionHeader';
import { PdfService } from '../services/pdf';
import { GeminiService } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Sparkles,
  Upload, User, Briefcase, GraduationCap, Award,
  Loader, Star, Globe, FileText, AlignLeft,
  Trophy, Target, Terminal, Flag, Check, Settings
} from 'lucide-react';
import { splitIntoBullets } from '../utils/bullets';

interface ResumeFormProps {
  state: ResumeState;
  onChange: (newState: ResumeState | ((prev: ResumeState) => ResumeState)) => void;
  onImproveBullet: (idx: number, currentText: string) => Promise<void>;
  aiLoading: boolean;
  isOnline: boolean;
  geminiKey: string;
}

// Framer Motion props for accordion sections (inline — avoids Variants typing issues)
const SECTION_ANIM = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { duration: 0.22 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.16 } },
} as const;

const ITEM_ANIM = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
} as const;

const inputCls = 'bg-input-bg border border-border-color rounded px-2.5 py-1.5 text-xs text-text-main focus:outline-none focus:border-brand-accent w-full';
const fullInputCls = `${inputCls} rounded-lg`;

interface DescriptionBulletEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  prefixId: string;
  placeholder?: string;
}

const DescriptionBulletEditor: React.FC<DescriptionBulletEditorProps> = ({
  value,
  onChange,
  prefixId,
  placeholder = "Add details..."
}) => {
  const arr = value ? value.split('\n') : [''];

  return (
    <div className="space-y-1.5">
      {arr.map((bullet, bIdx) => (
        <div key={bIdx} className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-text-muted select-none w-4 text-right">{bIdx + 1}.</span>
          <input
            id={`${prefixId}-${bIdx}`}
            value={bullet}
            onChange={(e) => {
              const updated = [...arr];
              updated[bIdx] = e.target.value;
              onChange(updated.join('\n'));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const inputEl = e.currentTarget;
                const start = inputEl.selectionStart ?? bullet.length;
                const textBefore = bullet.substring(0, start);
                const textAfter = bullet.substring(start);

                const updated = [...arr];
                updated[bIdx] = textBefore;
                updated.splice(bIdx + 1, 0, textAfter);
                onChange(updated.join('\n'));
                setTimeout(() => {
                  const nextInput = document.getElementById(`${prefixId}-${bIdx + 1}`) as HTMLInputElement | null;
                  if (nextInput) {
                    nextInput.focus();
                    nextInput.setSelectionRange(0, 0);
                  }
                }, 0);
              } else if (e.key === 'Backspace' && !bullet) {
                e.preventDefault();
                if (arr.length > 1) {
                  const updated = arr.filter((_, i) => i !== bIdx);
                  onChange(updated.join('\n'));
                  setTimeout(() => {
                    document.getElementById(`${prefixId}-${bIdx - 1}`)?.focus();
                  }, 0);
                }
              }
            }}
            className="flex-1 min-w-0 bg-input-bg border border-border-color rounded-lg p-1.5 text-xs text-text-main focus:outline-none"
            placeholder={placeholder}
          />
        </div>
      ))}
    </div>
  );
};

export const ResumeForm: React.FC<ResumeFormProps> = ({
  state, onChange, onImproveBullet, aiLoading, isOnline, geminiKey
}) => {
  const [openSection, setOpenSection] = useState<string>('personal');
  const [parsing, setParsing] = useState(false);
  const [openExpSettingsIdx, setOpenExpSettingsIdx] = useState<number | null>(null);
  const [openEduSettingsIdx, setOpenEduSettingsIdx] = useState<number | null>(null);
  const [openCertSettingsIdx, setOpenCertSettingsIdx] = useState<number | null>(null);

  const toggle = (s: string) => setOpenSection(p => p === s ? '' : s);
  const clean = (t: string) => t.replace(/\*\*|\*/g, '');

  const handlePdfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!geminiKey) { alert('Please enter a Gemini API Key first to parse the PDF resume details.'); return; }
    setParsing(true);
    try {
      const ab = await file.arrayBuffer();
      const b64 = btoa(new Uint8Array(ab).reduce((d, b) => d + String.fromCharCode(b), ''));
      let avatar = '';
      try { const p = await PdfService.extractFirstPhoto(file); if (p) avatar = p; } catch { /* photo extraction optional */ }
      const parsed = await GeminiService.parseResumePdf(geminiKey, b64);
      if (parsed.resumeExperience) {
        parsed.resumeExperience = parsed.resumeExperience.map(exp => ({
          ...exp,
          bullets: splitIntoBullets(exp.bullets || '').join('\n')
        }));
      }
      if (parsed.resumeEducation) {
        parsed.resumeEducation = parsed.resumeEducation.map(edu => ({
          ...edu,
          bullets: splitIntoBullets(edu.bullets || '').join('\n')
        }));
      }
      onChange(prev => ({ ...prev, avatar: avatar || prev.avatar || '', ...parsed }) as ResumeState);
      alert('PDF Resume imported successfully!');
    } catch (err) {
      alert(`PDF parsing failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setParsing(false);
      e.target.value = '';
    }
  };

  const updExp = (idx: number, k: string, v: string) =>
    onChange(prev => { const u = [...prev.resumeExperience]; u[idx] = { ...u[idx], [k]: (k === 'bullets' || k === 'url' || k === 'logo') ? v : clean(v) }; return { ...prev, resumeExperience: u }; });
  const updEdu = (idx: number, k: string, v: string) =>
    onChange(prev => { const u = [...prev.resumeEducation]; u[idx] = { ...u[idx], [k]: (k === 'bullets' || k === 'logo') ? v : clean(v) }; return { ...prev, resumeEducation: u }; });
  const updCert = (idx: number, k: string, v: string) =>
    onChange(prev => { const u = [...prev.resumeCerts]; u[idx] = { ...u[idx], [k]: k === 'url' ? v : clean(v) }; return { ...prev, resumeCerts: u }; });
  const updAch = (idx: number, k: string, v: string) =>
    onChange(prev => { const u = [...prev.resumeAchievements]; u[idx] = { ...u[idx], [k]: clean(v) }; return { ...prev, resumeAchievements: u }; });
  const updLang = (idx: number, k: string, v: string) =>
    onChange(prev => { const u = [...prev.resumeLanguages]; u[idx] = { ...u[idx], [k]: clean(v) }; return { ...prev, resumeLanguages: u }; });

  return (
    <div className="w-full flex-1 flex flex-col overflow-y-auto p-5 space-y-5">

      {/* PDF Import */}
      <div className="bg-card/20 border border-border-color/60 rounded-xl p-4 space-y-2.5">
        <div className="text-xs font-bold text-text-main flex items-center gap-1.5 uppercase tracking-wider">
          <Upload className="w-4 h-4 text-brand-accent" />
          Import Resume PDF
        </div>
        <p className="text-[11px] text-text-muted leading-relaxed">
          Upload your PDF to auto-extract details, skills, experience &amp; photo via Gemini AI.
        </p>
        <label className="flex items-center justify-center gap-2 px-3 py-2 bg-sidebar border border-border-color hover:border-brand-accent/50 rounded-lg text-xs font-semibold text-text-main hover:text-brand-accent transition cursor-pointer">
          {parsing
            ? <><Loader className="w-3.5 h-3.5 animate-spin text-brand-accent" />Parsing PDF...</>
            : <><Upload className="w-3.5 h-3.5" />Choose Resume PDF</>
          }
          <input type="file" accept=".pdf" onChange={handlePdfImport} disabled={parsing} className="hidden" />
        </label>
      </div>

      <div className="space-y-3">

        {/* ── SECTION: Contact ─────────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="personal" icon={User} label="Contact Details" openSection={openSection} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {openSection === 'personal' && (
              <motion.div key="personal" {...SECTION_ANIM} style={{ overflow: "hidden" }}>
                <div className="p-4 border-t border-border-color/40 space-y-3">
                  <div><label className="block text-[10px] text-text-muted mb-1">Full Name</label>
                    <input className={fullInputCls} value={state.name} onChange={e => onChange(p => ({ ...p, name: clean(e.target.value) }))} /></div>
                  <div><label className="block text-[10px] text-text-muted mb-1">Professional Headline</label>
                    <input className={fullInputCls} value={state.subtitle} onChange={e => onChange(p => ({ ...p, subtitle: clean(e.target.value) }))} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-[10px] text-text-muted mb-1">Phone</label>
                      <input className={inputCls} value={state.phone} onChange={e => onChange(p => ({ ...p, phone: clean(e.target.value) }))} /></div>
                    <div><label className="block text-[10px] text-text-muted mb-1">Location</label>
                      <input className={inputCls} value={state.location} onChange={e => onChange(p => ({ ...p, location: clean(e.target.value) }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-[10px] text-text-muted mb-1">Email</label>
                      <input type="email" className={inputCls} value={state.email} onChange={e => onChange(p => ({ ...p, email: clean(e.target.value) }))} /></div>
                    <div><label className="block text-[10px] text-text-muted mb-1">LinkedIn URL</label>
                      <input className={inputCls} value={state.linkedin} onChange={e => onChange(p => ({ ...p, linkedin: clean(e.target.value) }))} /></div>
                  </div>
                  <div className="pt-2 border-t border-border-color/20">
                    <label className="block text-[10px] text-text-muted mb-1">Profile Photo</label>
                    <div className="flex items-center gap-3">
                      {state.avatar ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border-color/60 bg-slate-100 flex-shrink-0">
                          <img src={state.avatar} alt="Profile preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full border border-dashed border-border-color bg-slate-50 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-text-muted" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <label className="px-2.5 py-1.5 bg-brand-accent/10 border border-brand-accent/25 hover:bg-brand-accent/20 text-brand-accent text-[10px] font-bold rounded cursor-pointer transition text-center select-none">
                          Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    onChange((p) => ({ ...p, avatar: reader.result as string }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        {state.avatar && (
                          <button
                            type="button"
                            onClick={() => onChange((p) => ({ ...p, avatar: '' }))}
                            className="px-2.5 py-1 border border-red-200 hover:bg-red-50 text-red-500 text-[10px] font-bold rounded cursor-pointer transition"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SECTION: Summary ─────────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="summary" icon={AlignLeft} label="Profile Summary" openSection={openSection} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {openSection === 'summary' && (
              <motion.div key="summary" {...SECTION_ANIM} style={{ overflow: "hidden" }}>
                <div className="p-4 border-t border-border-color/40">
                  <textarea
                    rows={5}
                    className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:border-brand-accent resize-y"
                    placeholder="Write a 2–4 sentence professional summary highlighting your expertise, achievements, and career goals."
                    value={state.resumeSummary}
                    onChange={e => onChange(p => ({ ...p, resumeSummary: e.target.value }))}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SECTION: Skills ──────────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="skills" icon={FileText} label="Skills" openSection={openSection} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {openSection === 'skills' && (
              <motion.div key="skills" {...SECTION_ANIM} style={{ overflow: "hidden" }}>
                <div className="p-4 border-t border-border-color/40">
                  <p className="text-[10px] text-text-muted mb-2">Comma-separated list of skills. ATS keyword frequency is calculated from this field.</p>
                  <textarea
                    rows={3}
                    className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:border-brand-accent resize-y"
                    placeholder="React, TypeScript, Node.js, AWS, Python, Docker..."
                    value={state.resumeSkills}
                    onChange={e => onChange(p => ({ ...p, resumeSkills: e.target.value }))}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SECTION: Experience ──────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="experience" icon={Briefcase} label="Work History" badge={state.resumeExperience.length} openSection={openSection} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {openSection === 'experience' && (
              <motion.div key="experience" {...SECTION_ANIM} style={{ overflow: "hidden" }}>
                <div className="p-4 border-t border-border-color/40 space-y-3">
                  <button
                    onClick={() => onChange(p => ({ ...p, resumeExperience: [...p.resumeExperience, { title: 'Job Title', company: 'Company', dates: 'Jan 2022 – Present', location: 'City, Country', bullets: 'Describe your key responsibilities and achievements here' }] }))}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-input-bg hover:bg-brand-accent/10 border border-border-color/80 hover:border-brand-accent/40 text-text-main rounded-lg text-xs font-semibold cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                  <AnimatePresence>
                    {state.resumeExperience.map((exp, idx) => (
                      <motion.div key={idx} {...ITEM_ANIM} className="bg-card/20 border border-border-color/60 rounded-xl p-3.5 space-y-2.5 relative group">
                        <div className="absolute right-3 top-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition z-10">
                          <button
                            type="button"
                            onClick={() => setOpenExpSettingsIdx(openExpSettingsIdx === idx ? null : idx)}
                            className={`text-text-muted hover:text-brand-accent transition cursor-pointer p-1 ${openExpSettingsIdx === idx ? 'text-brand-accent' : ''}`}
                            title="Item Settings"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onChange(p => ({ ...p, resumeExperience: p.resumeExperience.filter((_, i) => i !== idx) }))}
                            className="text-text-muted hover:text-red-400 transition cursor-pointer p-1"
                            title="Delete Experience"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={exp.title} onChange={e => updExp(idx, 'title', e.target.value)} className={inputCls} placeholder="Job Title" />
                          <input value={exp.company} onChange={e => updExp(idx, 'company', e.target.value)} className={inputCls} placeholder="Company" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={exp.dates} onChange={e => updExp(idx, 'dates', e.target.value)} className={inputCls} placeholder="Dates" />
                          <input value={exp.location} onChange={e => updExp(idx, 'location', e.target.value)} className={inputCls} placeholder="Location" />
                        </div>

                        {openExpSettingsIdx === idx && (
                          <div className="p-3 bg-slate-50/5 rounded-lg border border-border-color/50 space-y-2.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Experience Settings</div>
                            <div>
                              <label className="block text-[9px] text-text-muted mb-1 font-semibold">Website / Project URL</label>
                              <input
                                value={exp.url || ''}
                                onChange={e => updExp(idx, 'url', e.target.value)}
                                className={inputCls}
                                placeholder="https://company.com"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[9px] text-text-muted font-semibold mb-1">Company Logo / Icon</label>
                              <div className="flex gap-2 items-center">
                                {exp.logo ? (
                                  <img src={exp.logo} className="w-10 h-10 object-contain rounded border border-border-color bg-white" alt="" />
                                ) : (
                                  <div className="w-10 h-10 rounded border border-dashed border-border-color/80 flex items-center justify-center text-text-muted bg-input-bg">
                                    <Briefcase className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="flex-1 flex flex-col gap-1">
                                  <input
                                    value={exp.logo || ''}
                                    onChange={e => updExp(idx, 'logo', e.target.value)}
                                    className="w-full bg-input-bg border border-border-color rounded-lg p-1.5 text-[11px] text-text-main focus:outline-none"
                                    placeholder="Paste logo URL"
                                  />
                                  <div className="flex gap-1.5">
                                    <label className="flex-1 px-2 py-1 bg-brand-accent/10 border border-brand-accent/20 hover:bg-brand-accent/20 text-brand-accent text-[9px] font-bold rounded cursor-pointer transition text-center select-none">
                                      Upload File
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                              if (typeof reader.result === 'string') {
                                                updExp(idx, 'logo', reader.result);
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                    {exp.logo && (
                                      <button
                                        type="button"
                                        onClick={() => updExp(idx, 'logo', '')}
                                        className="px-2 py-1 border border-red-200 hover:bg-red-50 text-red-500 text-[9px] font-bold rounded cursor-pointer transition flex-1"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Responsibilities & Achievements</label>
                          <DescriptionBulletEditor
                            value={exp.bullets}
                            onChange={v => updExp(idx, 'bullets', v)}
                            prefixId={`exp-bullet-${idx}`}
                            placeholder="Describe responsibility or achievement... (Use **bold** for emphasis)"
                          />
                        </div>
                        {isOnline && (
                          <button type="button" disabled={aiLoading} onClick={() => onImproveBullet(idx, exp.bullets)}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-brand-accent/10 border border-brand-accent/25 hover:bg-brand-accent/20 rounded text-brand-accent text-[10px] font-bold cursor-pointer transition w-full disabled:opacity-50">
                            {aiLoading ? <Loader className="w-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 animate-pulse" />}
                            Improve with AI
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SECTION: Education ───────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="education" icon={GraduationCap} label="Education" badge={state.resumeEducation.length} openSection={openSection} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {openSection === 'education' && (
              <motion.div key="education" {...SECTION_ANIM} style={{ overflow: "hidden" }}>
                <div className="p-4 border-t border-border-color/40 space-y-3">
                  <button
                    onClick={() => onChange(p => ({ ...p, resumeEducation: [...p.resumeEducation, { degree: 'Degree / Major', school: 'University', dates: '2018 – 2022', location: 'City, Country', bullets: 'Relevant coursework or achievements' }] }))}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-input-bg hover:bg-brand-accent/10 border border-border-color/80 hover:border-brand-accent/40 text-text-main rounded-lg text-xs font-semibold cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Education
                  </button>
                  <AnimatePresence>
                    {state.resumeEducation.map((edu, idx) => (
                      <motion.div key={idx} {...ITEM_ANIM} className="bg-card/20 border border-border-color/60 rounded-xl p-3.5 space-y-2.5 relative group">
                        <div className="absolute right-3 top-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition z-10">
                          <button
                            type="button"
                            onClick={() => setOpenEduSettingsIdx(openEduSettingsIdx === idx ? null : idx)}
                            className={`text-text-muted hover:text-brand-accent transition cursor-pointer p-1 ${openEduSettingsIdx === idx ? 'text-brand-accent' : ''}`}
                            title="Item Settings"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onChange(p => ({ ...p, resumeEducation: p.resumeEducation.filter((_, i) => i !== idx) }))}
                            className="text-text-muted hover:text-red-400 transition cursor-pointer p-1"
                            title="Delete Education"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={edu.degree} onChange={e => updEdu(idx, 'degree', e.target.value)} className={inputCls} placeholder="Degree" />
                          <input value={edu.school} onChange={e => updEdu(idx, 'school', e.target.value)} className={inputCls} placeholder="School" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={edu.dates} onChange={e => updEdu(idx, 'dates', e.target.value)} className={inputCls} placeholder="Dates" />
                          <input value={edu.location} onChange={e => updEdu(idx, 'location', e.target.value)} className={inputCls} placeholder="Location" />
                        </div>

                        {openEduSettingsIdx === idx && (
                          <div className="p-3 bg-slate-50/5 rounded-lg border border-border-color/50 space-y-2.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Education Settings</div>
                            <div className="space-y-1">
                              <label className="block text-[9px] text-text-muted font-semibold mb-1">School Logo / Icon</label>
                              <div className="flex gap-2 items-center">
                                {edu.logo ? (
                                  <img src={edu.logo} className="w-10 h-10 object-contain rounded border border-border-color bg-white" alt="" />
                                ) : (
                                  <div className="w-10 h-10 rounded border border-dashed border-border-color/80 flex items-center justify-center text-text-muted bg-input-bg">
                                    <GraduationCap className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="flex-1 flex flex-col gap-1">
                                  <input
                                    value={edu.logo || ''}
                                    onChange={e => updEdu(idx, 'logo', e.target.value)}
                                    className="w-full bg-input-bg border border-border-color rounded-lg p-1.5 text-[11px] text-text-main focus:outline-none"
                                    placeholder="Paste logo URL"
                                  />
                                  <div className="flex gap-1.5">
                                    <label className="flex-1 px-2 py-1 bg-brand-accent/10 border border-brand-accent/20 hover:bg-brand-accent/20 text-brand-accent text-[9px] font-bold rounded cursor-pointer transition text-center select-none">
                                      Upload File
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                              if (typeof reader.result === 'string') {
                                                updEdu(idx, 'logo', reader.result);
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                    {edu.logo && (
                                      <button
                                        type="button"
                                        onClick={() => updEdu(idx, 'logo', '')}
                                        className="px-2 py-1 border border-red-200 hover:bg-red-50 text-red-500 text-[9px] font-bold rounded cursor-pointer transition flex-1"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">coursework, GPA, honors...</label>
                          <DescriptionBulletEditor
                            value={edu.bullets}
                            onChange={v => updEdu(idx, 'bullets', v)}
                            prefixId={`edu-bullet-${idx}`}
                            placeholder="GPA: 3.8/4.0, Relevant coursework, honors..."
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SECTION: Projects & Certifications ───────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="certs" icon={Award} label="Projects & Certifications" badge={state.resumeCerts.length} openSection={openSection} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {openSection === 'certs' && (
              <motion.div key="certs" {...SECTION_ANIM} style={{ overflow: "hidden" }}>
                <div className="p-4 border-t border-border-color/40 space-y-2.5">
                  <button
                    onClick={() => onChange(p => ({ ...p, resumeCerts: [...p.resumeCerts, { title: 'Project / Certification Name', desc: 'Description / Tech Stack / Issuer' }] }))}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-input-bg hover:bg-brand-accent/10 border border-border-color/80 hover:border-brand-accent/40 text-text-main rounded-lg text-xs font-semibold cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project / Certification
                  </button>
                  <AnimatePresence>
                    {state.resumeCerts.map((cert, idx) => (
                      <motion.div key={idx} {...ITEM_ANIM} className="bg-card/20 border border-border-color/50 p-2.5 rounded-lg relative group space-y-1.5">
                        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition z-10">
                          <button
                            type="button"
                            onClick={() => setOpenCertSettingsIdx(openCertSettingsIdx === idx ? null : idx)}
                            className={`text-text-muted hover:text-brand-accent transition cursor-pointer p-0.5 ${openCertSettingsIdx === idx ? 'text-brand-accent' : ''}`}
                            title="Item Settings"
                          >
                            <Settings className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onChange(p => ({ ...p, resumeCerts: p.resumeCerts.filter((_, i) => i !== idx) }))}
                            className="text-text-muted hover:text-red-400 transition cursor-pointer p-0.5"
                            title="Delete Project / Cert"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input value={cert.title} onChange={e => updCert(idx, 'title', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-border-color/30 text-xs font-semibold text-text-main focus:outline-none w-full"
                          placeholder="Project / Certification Name" />

                        {openCertSettingsIdx === idx && (
                          <div className="p-2.5 bg-slate-50/5 rounded-lg border border-border-color/50 space-y-2">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Project Settings</div>
                            <div>
                              <label className="block text-[9px] text-text-muted mb-0.5 font-semibold">Project Link / Verification Link</label>
                              <input
                                value={cert.url || ''}
                                onChange={e => updCert(idx, 'url', e.target.value)}
                                className="w-full bg-input-bg border border-border-color rounded px-2 py-1 text-[11px] text-text-main focus:outline-none focus:border-brand-accent"
                                placeholder="https://myproject.com"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[9px] text-text-muted font-semibold mb-0.5">Project Icon</label>
                              <div className="flex flex-wrap gap-1 items-center">
                                {([
                                  { key: 'star', icon: Star },
                                  { key: 'award', icon: Award },
                                  { key: 'flag', icon: Flag },
                                  { key: 'check', icon: Check },
                                  { key: 'trophy', icon: Trophy },
                                  { key: 'target', icon: Target },
                                  { key: 'terminal', icon: Terminal },
                                  { key: 'globe', icon: Globe },
                                  { key: 'fileText', icon: FileText }
                                ] as const).map(opt => {
                                  const IconComponent = opt.icon;
                                  const isSel = cert.icon === opt.key;
                                  return (
                                    <button
                                      key={opt.key}
                                      type="button"
                                      onClick={() => updCert(idx, 'icon', isSel ? '' : opt.key)}
                                      title={opt.key}
                                      className={`p-1 rounded border transition cursor-pointer flex items-center justify-center ${
                                        isSel
                                          ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                                          : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
                                      }`}
                                    >
                                      <IconComponent className="w-3 h-3" />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="block text-[9px] font-semibold text-text-muted uppercase tracking-wider">Description / details</label>
                          <DescriptionBulletEditor
                            value={cert.desc}
                            onChange={v => updCert(idx, 'desc', v)}
                            prefixId={`cert-bullet-${idx}`}
                            placeholder="Description / Tech Stack / Issuer — e.g. Tech: React, Tailwind"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SECTION: Achievements ────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="achievements" icon={Star} label="Achievements" badge={state.resumeAchievements.length} openSection={openSection} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {openSection === 'achievements' && (
              <motion.div key="achievements" {...SECTION_ANIM} style={{ overflow: "hidden" }}>
                <div className="p-4 border-t border-border-color/40 space-y-2.5">
                  <button
                    onClick={() => onChange(p => ({ ...p, resumeAchievements: [...p.resumeAchievements, { title: 'Achievement Title', desc: 'Brief description of impact or scale', icon: 'star' as const }] }))}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-input-bg hover:bg-brand-accent/10 border border-border-color/80 hover:border-brand-accent/40 text-text-main rounded-lg text-xs font-semibold cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Achievement
                  </button>
                  <AnimatePresence>
                    {state.resumeAchievements.map((ach, idx) => (
                      <motion.div key={idx} {...ITEM_ANIM} className="bg-card/20 border border-border-color/50 p-2.5 rounded-lg relative group space-y-1.5">
                        <button onClick={() => onChange(p => ({ ...p, resumeAchievements: p.resumeAchievements.filter((_, i) => i !== idx) }))}
                          className="absolute right-2 top-2 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <input value={ach.title} onChange={e => updAch(idx, 'title', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-border-color/30 text-xs font-semibold text-text-main focus:outline-none w-full"
                          placeholder="Achievement Title" />
                        <input value={ach.desc} onChange={e => updAch(idx, 'desc', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-border-color/30 text-[11px] text-text-muted focus:outline-none w-full"
                          placeholder="Impact / scale (e.g. Increased revenue by 30%)" />
                        <div className="flex flex-wrap gap-1.5 items-center mt-2.5 pt-1.5 border-t border-border-color/20">
                          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mr-1.5">Icon:</span>
                          {([
                            { key: 'star', icon: Star },
                            { key: 'award', icon: Award },
                            { key: 'flag', icon: Flag },
                            { key: 'check', icon: Check },
                            { key: 'trophy', icon: Trophy },
                            { key: 'target', icon: Target },
                            { key: 'terminal', icon: Terminal }
                          ] as const).map(opt => {
                            const IconComponent = opt.icon;
                            const isSel = (ach.icon || 'star') === opt.key;
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => updAch(idx, 'icon', opt.key)}
                                title={opt.key}
                                className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                                  isSel
                                    ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                                    : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
                                }`}
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SECTION: Languages ───────────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="languages" icon={Globe} label="Languages" badge={state.resumeLanguages.length} openSection={openSection} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {openSection === 'languages' && (
              <motion.div key="languages" {...SECTION_ANIM} style={{ overflow: "hidden" }}>
                <div className="p-4 border-t border-border-color/40 space-y-2.5">
                  <button
                    onClick={() => onChange(p => ({ ...p, resumeLanguages: [...p.resumeLanguages, { name: 'Language', level: 'Native / Fluent' }] }))}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-input-bg hover:bg-brand-accent/10 border border-border-color/80 hover:border-brand-accent/40 text-text-main rounded-lg text-xs font-semibold cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Language
                  </button>
                  <AnimatePresence>
                    {state.resumeLanguages.map((lang, idx) => (
                      <motion.div key={idx} {...ITEM_ANIM} className="flex gap-2 items-center relative group">
                        <button onClick={() => onChange(p => ({ ...p, resumeLanguages: p.resumeLanguages.filter((_, i) => i !== idx) }))}
                          className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition cursor-pointer flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <input value={lang.name} onChange={e => updLang(idx, 'name', e.target.value)}
                          className={`${inputCls} flex-1`} placeholder="Language" />
                        <input value={lang.level} onChange={e => updLang(idx, 'level', e.target.value)}
                          className={`${inputCls} flex-1`} placeholder="Level" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
