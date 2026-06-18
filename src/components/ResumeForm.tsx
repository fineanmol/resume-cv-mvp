import React, { useState } from 'react';
import type { ResumeState } from '../types';
import { TemplateCarousel } from './TemplateCarousel';
import { PdfService } from '../services/pdf';
import { GeminiService } from '../services/gemini';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Upload, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Loader
} from 'lucide-react';

interface ResumeFormProps {
  state: ResumeState;
  onChange: (newState: ResumeState | ((prev: ResumeState) => ResumeState)) => void;
  onImproveBullet: (idx: number, currentText: string) => Promise<void>;
  aiLoading: boolean;
  isOnline: boolean;
  geminiKey: string;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({
  state,
  onChange,
  onImproveBullet,
  aiLoading,
  isOnline,
  geminiKey
}) => {
  const [openSection, setOpenSection] = useState<string>('personal');
  const [parsing, setParsing] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  // Plain-text sanitization utility
  const cleanMarkdown = (txt: string) => txt.replace(/\*\*|\*/g, "");

  const handlePdfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!geminiKey) {
      alert("Please enter a Gemini API Key first to parse the PDF resume details.");
      return;
    }

    setParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Extract photo client-side
      let extractedAvatar = "";
      try {
        const photo = await PdfService.extractFirstPhoto(file);
        if (photo) extractedAvatar = photo;
      } catch (imgErr) {
        console.error("PDF image extraction failed:", imgErr);
      }

      // Parse text details via Gemini
      const parsedData = await GeminiService.parseResumePdf(geminiKey, base64Data);

      onChange((prev) => ({
        ...prev,
        avatar: extractedAvatar || prev.avatar || '',
        ...parsedData
      }) as ResumeState);

      alert("PDF Resume imported and populated successfully!");
    } catch (err: any) {
      alert(`PDF parsing failed: ${err.message}`);
    } finally {
      setParsing(false);
      e.target.value = ""; // Reset file input
    }
  };

  const updateExperience = (idx: number, key: string, val: string) => {
    onChange((prev) => {
      const updated = [...prev.resumeExperience];
      updated[idx] = { ...updated[idx], [key]: key === 'bullets' ? val : cleanMarkdown(val) };
      return { ...prev, resumeExperience: updated };
    });
  };

  const updateEducation = (idx: number, key: string, val: string) => {
    onChange((prev) => {
      const updated = [...prev.resumeEducation];
      updated[idx] = { ...updated[idx], [key]: key === 'bullets' ? val : cleanMarkdown(val) };
      return { ...prev, resumeEducation: updated };
    });
  };

  return (
    <aside className="w-[380px] border-r border-border-color/60 bg-sidebar flex flex-col flex-shrink-0 overflow-y-auto p-6 space-y-6">
      
      {/* Template Switcher Carousel */}
      <TemplateCarousel
        docType="resume"
        state={state}
        activeTemplate={state.layoutSettings.template || 'navy'}
        onSelect={(templateId) => {
          onChange((prev) => ({
            ...prev,
            layoutSettings: { ...prev.layoutSettings, template: templateId }
          }));
        }}
      />

      {/* PDF Importer panel */}
      <div className="bg-card/20 border border-border-color/60 rounded-xl p-4 space-y-3">
        <div className="text-xs font-bold text-text-main flex items-center gap-1.5 uppercase tracking-wider">
          <Upload className="w-4 h-4 text-brand-accent animate-bounce" />
          Import Existing Resume PDF
        </div>
        <p className="text-[11px] text-text-muted leading-relaxed">
          Upload your current PDF resume to automatically extract your personal details, skills, experience, and photo.
        </p>
        <label className="flex items-center justify-center gap-2 px-3 py-2 bg-sidebar border border-border-color hover:border-brand-accent/50 rounded-lg text-xs font-semibold text-text-main hover:text-brand-accent transition cursor-pointer">
          {parsing ? (
            <>
              <Loader className="w-3.5 h-3.5 animate-spin text-brand-accent" />
              Parsing PDF Resume...
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

      <div className="space-y-4">
        {/* SECTION 1: Personal Info */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <button
            onClick={() => toggleSection('personal')}
            className="w-full flex items-center justify-between p-4 font-bold text-xs text-text-main hover:bg-card/20 transition uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand-accent" />
              Contact Details
            </span>
            {openSection === 'personal' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'personal' && (
            <div className="p-4 border-t border-border-color/40 space-y-3">
              <div>
                <label className="block text-[10px] text-text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  value={state.name}
                  onChange={(e) => onChange(prev => ({ ...prev, name: cleanMarkdown(e.target.value) }))}
                  className="w-full bg-input-bg border border-border-color rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-[10px] text-text-muted mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={state.subtitle}
                  onChange={(e) => onChange(prev => ({ ...prev, subtitle: cleanMarkdown(e.target.value) }))}
                  className="w-full bg-input-bg border border-border-color rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">Phone</label>
                  <input
                    type="text"
                    value={state.phone}
                    onChange={(e) => onChange(prev => ({ ...prev, phone: cleanMarkdown(e.target.value) }))}
                    className="w-full bg-input-bg border border-border-color rounded-lg px-3 py-1.5 text-xs text-text-main focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">Location</label>
                  <input
                    type="text"
                    value={state.location}
                    onChange={(e) => onChange(prev => ({ ...prev, location: cleanMarkdown(e.target.value) }))}
                    className="w-full bg-input-bg border border-border-color rounded-lg px-3 py-1.5 text-xs text-text-main focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">Email</label>
                  <input
                    type="email"
                    value={state.email}
                    onChange={(e) => onChange(prev => ({ ...prev, email: cleanMarkdown(e.target.value) }))}
                    className="w-full bg-input-bg border border-border-color rounded-lg px-3 py-1.5 text-xs text-text-main focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={state.linkedin}
                    onChange={(e) => onChange(prev => ({ ...prev, linkedin: cleanMarkdown(e.target.value) }))}
                    className="w-full bg-input-bg border border-border-color rounded-lg px-3 py-1.5 text-xs text-text-main focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Professional Experience */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <button
            onClick={() => toggleSection('experience')}
            className="w-full flex items-center justify-between p-4 font-bold text-xs text-text-main hover:bg-card/20 transition uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-accent" />
              Work History ({state.resumeExperience.length})
            </span>
            {openSection === 'experience' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'experience' && (
            <div className="p-4 border-t border-border-color/40 space-y-4">
              <button
                onClick={() => {
                  onChange(prev => ({
                    ...prev,
                    resumeExperience: [
                      ...prev.resumeExperience,
                      { title: 'Job Title', company: 'Company', dates: 'Dates', location: 'Location', bullets: 'Bullet points' }
                    ]
                  }));
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-input-bg hover:bg-input-bg/70 border border-border-color/80 text-text-main rounded-lg text-xs font-semibold cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Experience Item
              </button>

              {state.resumeExperience.map((exp, idx) => (
                <div key={idx} className="bg-card/20 border border-border-color/60 rounded-xl p-4 space-y-3 relative group">
                  <button
                    onClick={() => {
                      onChange(prev => ({
                        ...prev,
                        resumeExperience: prev.resumeExperience.filter((_, i) => i !== idx)
                      }));
                    }}
                    className="absolute right-3 top-3 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(idx, 'title', e.target.value)}
                      className="bg-input-bg border border-border-color/60 rounded px-2.5 py-1.5 text-xs text-text-main"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                      className="bg-input-bg border border-border-color/60 rounded px-2.5 py-1.5 text-xs text-text-main"
                      placeholder="Company"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.dates}
                      onChange={(e) => updateExperience(idx, 'dates', e.target.value)}
                      className="bg-input-bg border border-border-color/60 rounded px-2.5 py-1.5 text-xs text-text-main"
                      placeholder="Dates"
                    />
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                      className="bg-input-bg border border-border-color/60 rounded px-2.5 py-1.5 text-xs text-text-main"
                      placeholder="Location"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <textarea
                      value={exp.bullets}
                      onChange={(e) => updateExperience(idx, 'bullets', e.target.value)}
                      rows={4}
                      className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-xs text-text-main focus:outline-none"
                      placeholder="Achievements/Bullet points (one per line)"
                    />
                    {isOnline && (
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={() => onImproveBullet(idx, exp.bullets)}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-brand-accent/10 border border-brand-accent/25 hover:bg-brand-accent/25 rounded text-brand-accent text-[10px] font-bold cursor-pointer transition w-full disabled:opacity-50"
                      >
                        {aiLoading ? (
                          <Loader className="w-3 animate-spin text-brand-accent" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        )}
                        Improve Bullet Points with AI
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: Education */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <button
            onClick={() => toggleSection('education')}
            className="w-full flex items-center justify-between p-4 font-bold text-xs text-text-main hover:bg-card/20 transition uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-accent" />
              Academic Profile ({state.resumeEducation.length})
            </span>
            {openSection === 'education' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'education' && (
            <div className="p-4 border-t border-border-color/40 space-y-4">
              <button
                onClick={() => {
                  onChange(prev => ({
                    ...prev,
                    resumeEducation: [
                      ...prev.resumeEducation,
                      { degree: 'Degree', school: 'School', dates: 'Dates', location: 'Location', bullets: 'Bullet Details' }
                    ]
                  }));
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-input-bg hover:bg-input-bg/70 border border-border-color/80 text-text-main rounded-lg text-xs font-semibold cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Education Item
              </button>

              {state.resumeEducation.map((edu, idx) => (
                <div key={idx} className="bg-card/20 border border-border-color/60 rounded-xl p-4 space-y-3 relative group">
                  <button
                    onClick={() => {
                      onChange(prev => ({
                        ...prev,
                        resumeEducation: prev.resumeEducation.filter((_, i) => i !== idx)
                      }));
                    }}
                    className="absolute right-3 top-3 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                      className="bg-input-bg border border-border-color/60 rounded px-2.5 py-1.5 text-xs text-text-main"
                      placeholder="Degree"
                    />
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                      className="bg-input-bg border border-border-color/60 rounded px-2.5 py-1.5 text-xs text-text-main"
                      placeholder="School"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={edu.dates}
                      onChange={(e) => updateEducation(idx, 'dates', e.target.value)}
                      className="bg-input-bg border border-border-color/60 rounded px-2.5 py-1.5 text-xs text-text-main"
                      placeholder="Dates"
                    />
                    <input
                      type="text"
                      value={edu.location}
                      onChange={(e) => updateEducation(idx, 'location', e.target.value)}
                      className="bg-input-bg border border-border-color/60 rounded px-2.5 py-1.5 text-xs text-text-main"
                      placeholder="Location"
                    />
                  </div>

                  <textarea
                    value={edu.bullets}
                    onChange={(e) => updateEducation(idx, 'bullets', e.target.value)}
                    rows={3}
                    className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-xs text-text-main focus:outline-none"
                    placeholder="Details (coursework, focus area)"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: Credentials & Achievements */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <button
            onClick={() => toggleSection('credentials')}
            className="w-full flex items-center justify-between p-4 font-bold text-xs text-text-main hover:bg-card/20 transition uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-accent" />
              Certs &amp; Achievements
            </span>
            {openSection === 'credentials' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'credentials' && (
            <div className="p-4 border-t border-border-color/40 space-y-4">
              {/* Certs */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  <span>Certifications ({state.resumeCerts.length})</span>
                  <button
                    onClick={() => {
                      onChange(prev => ({
                        ...prev,
                        resumeCerts: [...prev.resumeCerts, { title: 'New Cert', desc: 'Description' }]
                      }));
                    }}
                    className="text-brand-accent hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>

                {state.resumeCerts.map((cert, idx) => (
                  <div key={idx} className="bg-card/20 border border-border-color/50 p-2.5 rounded-lg relative group">
                    <button
                      onClick={() => {
                        onChange(prev => ({
                          ...prev,
                          resumeCerts: prev.resumeCerts.filter((_, i) => i !== idx)
                        }));
                      }}
                      className="absolute right-2 top-2 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      value={cert.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange(prev => {
                          const updated = [...prev.resumeCerts];
                          updated[idx] = { ...updated[idx], title: cleanMarkdown(val) };
                          return { ...prev, resumeCerts: updated };
                        });
                      }}
                      className="bg-transparent border-b border-transparent hover:border-border-color/30 text-xs font-semibold text-text-main focus:outline-none w-full mb-1"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={cert.desc}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange(prev => {
                          const updated = [...prev.resumeCerts];
                          updated[idx] = { ...updated[idx], desc: cleanMarkdown(val) };
                          return { ...prev, resumeCerts: updated };
                        });
                      }}
                      className="bg-transparent border-b border-transparent hover:border-border-color/30 text-[11px] text-text-muted focus:outline-none w-full"
                      placeholder="Issuer / Description"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: Layout & Spacing */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <button
            onClick={() => toggleSection('layout')}
            className="w-full flex items-center justify-between p-4 font-bold text-xs text-text-main hover:bg-card/20 transition uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-accent" />
              Layout &amp; Spacing
            </span>
            {openSection === 'layout' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'layout' && (
            <div className="p-4 border-t border-border-color/40 space-y-4">
              <div>
                <label className="block text-[10px] text-text-muted uppercase font-bold tracking-wider mb-2">Resume Template</label>
                <select
                  value={state.layoutSettings.template || 'navy'}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange(prev => ({
                      ...prev,
                      layoutSettings: { ...prev.layoutSettings, template: val as any }
                    }));
                  }}
                  className="w-full bg-input-bg border border-border-color rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-brand-accent"
                >
                  <option value="navy">Navy Elegant</option>
                  <option value="serif">Harvard Serif</option>
                  <option value="sidebar">Creative Sidebar</option>
                  <option value="tech">Tech Monospace</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-[10px] text-text-muted mb-1 font-bold">
                    <span>Font Size</span>
                    <span>{state.layoutSettings.fontSize}pt</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="14"
                    step="0.5"
                    value={state.layoutSettings.fontSize}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChange(prev => ({
                        ...prev,
                        layoutSettings: { ...prev.layoutSettings, fontSize: val }
                      }));
                    }}
                    className="w-full accent-brand-accent"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-text-muted mb-1 font-bold">
                    <span>Padding (Top/Bottom)</span>
                    <span>{state.layoutSettings.paddingTopBottom}mm</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="25"
                    step="1"
                    value={state.layoutSettings.paddingTopBottom}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      onChange(prev => ({
                        ...prev,
                        layoutSettings: { ...prev.layoutSettings, paddingTopBottom: val }
                      }));
                    }}
                    className="w-full accent-brand-accent"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-text-muted mb-1 font-bold">
                    <span>Padding (Left/Right)</span>
                    <span>{state.layoutSettings.paddingLeftRight}mm</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="25"
                    step="1"
                    value={state.layoutSettings.paddingLeftRight}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      onChange(prev => ({
                        ...prev,
                        layoutSettings: { ...prev.layoutSettings, paddingLeftRight: val }
                      }));
                    }}
                    className="w-full accent-brand-accent"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-text-muted mb-1 font-bold">
                    <span>Section Spacing</span>
                    <span>{state.layoutSettings.sectionSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="25"
                    step="1"
                    value={state.layoutSettings.sectionSpacing}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      onChange(prev => ({
                        ...prev,
                        layoutSettings: { ...prev.layoutSettings, sectionSpacing: val }
                      }));
                    }}
                    className="w-full accent-brand-accent"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-text-muted mb-1 font-bold">
                    <span>Line Height</span>
                    <span>{state.layoutSettings.lineHeight}</span>
                  </div>
                  <input
                    type="range"
                    min="1.1"
                    max="1.8"
                    step="0.05"
                    value={state.layoutSettings.lineHeight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChange(prev => ({
                        ...prev,
                        layoutSettings: { ...prev.layoutSettings, lineHeight: val }
                      }));
                    }}
                    className="w-full accent-brand-accent"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-text-muted mb-1 font-bold">
                    <span>Column Gap</span>
                    <span>{state.layoutSettings.columnGap}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="30"
                    step="1"
                    value={state.layoutSettings.columnGap}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      onChange(prev => ({
                        ...prev,
                        layoutSettings: { ...prev.layoutSettings, columnGap: val }
                      }));
                    }}
                    className="w-full accent-brand-accent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
};
