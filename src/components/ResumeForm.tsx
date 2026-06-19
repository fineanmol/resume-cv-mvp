import React, { useState } from 'react';
import type { ResumeState } from '../types';
import { SectionHeader } from './SectionHeader';
import { PdfService } from '../services/pdf';
import { GeminiService } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Sparkles,
  Upload, User, Briefcase, GraduationCap, Award,
  Loader, Star, Globe, FileText, AlignLeft
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

export const ResumeForm: React.FC<ResumeFormProps> = ({
  state, onChange, onImproveBullet, aiLoading, isOnline, geminiKey
}) => {
  const [openSection, setOpenSection] = useState<string>('personal');
  const [parsing, setParsing] = useState(false);

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
    onChange(prev => { const u = [...prev.resumeExperience]; u[idx] = { ...u[idx], [k]: k === 'bullets' ? v : clean(v) }; return { ...prev, resumeExperience: u }; });
  const updEdu = (idx: number, k: string, v: string) =>
    onChange(prev => { const u = [...prev.resumeEducation]; u[idx] = { ...u[idx], [k]: k === 'bullets' ? v : clean(v) }; return { ...prev, resumeEducation: u }; });
  const updCert = (idx: number, k: string, v: string) =>
    onChange(prev => { const u = [...prev.resumeCerts]; u[idx] = { ...u[idx], [k]: clean(v) }; return { ...prev, resumeCerts: u }; });
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
                        <button onClick={() => onChange(p => ({ ...p, resumeExperience: p.resumeExperience.filter((_, i) => i !== idx) }))}
                          className="absolute right-3 top-3 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={exp.title} onChange={e => updExp(idx, 'title', e.target.value)} className={inputCls} placeholder="Job Title" />
                          <input value={exp.company} onChange={e => updExp(idx, 'company', e.target.value)} className={inputCls} placeholder="Company" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={exp.dates} onChange={e => updExp(idx, 'dates', e.target.value)} className={inputCls} placeholder="Dates" />
                          <input value={exp.location} onChange={e => updExp(idx, 'location', e.target.value)} className={inputCls} placeholder="Location" />
                        </div>
                        <textarea value={exp.bullets} onChange={e => updExp(idx, 'bullets', e.target.value)} rows={4}
                          className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-xs text-text-main focus:outline-none resize-y"
                          placeholder="One bullet point per line. Use **bold** for emphasis." />
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
                        <button onClick={() => onChange(p => ({ ...p, resumeEducation: p.resumeEducation.filter((_, i) => i !== idx) }))}
                          className="absolute right-3 top-3 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={edu.degree} onChange={e => updEdu(idx, 'degree', e.target.value)} className={inputCls} placeholder="Degree" />
                          <input value={edu.school} onChange={e => updEdu(idx, 'school', e.target.value)} className={inputCls} placeholder="School" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={edu.dates} onChange={e => updEdu(idx, 'dates', e.target.value)} className={inputCls} placeholder="Dates" />
                          <input value={edu.location} onChange={e => updEdu(idx, 'location', e.target.value)} className={inputCls} placeholder="Location" />
                        </div>
                        <textarea value={edu.bullets} onChange={e => updEdu(idx, 'bullets', e.target.value)} rows={2}
                          className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-xs text-text-main focus:outline-none resize-y"
                          placeholder="Relevant coursework, GPA, honors..." />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SECTION: Certifications ──────────────────────────── */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <SectionHeader id="certs" icon={Award} label="Certifications" badge={state.resumeCerts.length} openSection={openSection} onToggle={toggle} />
          <AnimatePresence initial={false}>
            {openSection === 'certs' && (
              <motion.div key="certs" {...SECTION_ANIM} style={{ overflow: "hidden" }}>
                <div className="p-4 border-t border-border-color/40 space-y-2.5">
                  <button
                    onClick={() => onChange(p => ({ ...p, resumeCerts: [...p.resumeCerts, { title: 'Certification Name', desc: 'Issuing Organization — Year' }] }))}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-input-bg hover:bg-brand-accent/10 border border-border-color/80 hover:border-brand-accent/40 text-text-main rounded-lg text-xs font-semibold cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Certification
                  </button>
                  <AnimatePresence>
                    {state.resumeCerts.map((cert, idx) => (
                      <motion.div key={idx} {...ITEM_ANIM} className="bg-card/20 border border-border-color/50 p-2.5 rounded-lg relative group space-y-1.5">
                        <button onClick={() => onChange(p => ({ ...p, resumeCerts: p.resumeCerts.filter((_, i) => i !== idx) }))}
                          className="absolute right-2 top-2 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <input value={cert.title} onChange={e => updCert(idx, 'title', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-border-color/30 text-xs font-semibold text-text-main focus:outline-none w-full"
                          placeholder="Certification Name" />
                        <input value={cert.desc} onChange={e => updCert(idx, 'desc', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-border-color/30 text-[11px] text-text-muted focus:outline-none w-full"
                          placeholder="Issuing Organization — Year" />
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
