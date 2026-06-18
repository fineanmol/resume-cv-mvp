import React, { useState } from 'react';
import type { CoverLetterState } from '../types';
import { TemplateCarousel } from './TemplateCarousel';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  FileText,
  AlignLeft,
  GripVertical
} from 'lucide-react';

interface CoverLetterFormProps {
  state: CoverLetterState;
  onChange: (newState: CoverLetterState | ((prev: CoverLetterState) => CoverLetterState)) => void;
}

export const CoverLetterForm: React.FC<CoverLetterFormProps> = ({
  state,
  onChange
}) => {
  const [openSection, setOpenSection] = useState<string>('target');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  const cleanMarkdown = (txt: string) => txt.replace(/\*\*|\*/g, "");

  const moveHighlight = (index: number, direction: 'up' | 'down') => {
    const list = [...state.highlights];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    onChange((prev) => ({ ...prev, highlights: list }));
  };

  // HTML5 Drag-and-Drop Drop Handler
  const handleDrop = (sourceIdx: number, targetIdx: number) => {
    if (sourceIdx === targetIdx) return;
    onChange((prev) => {
      const list = [...prev.highlights];
      const [removed] = list.splice(sourceIdx, 1);
      list.splice(targetIdx, 0, removed);
      return { ...prev, highlights: list };
    });
  };

  return (
    <aside className="w-[380px] border-r border-border-color/60 bg-sidebar flex flex-col flex-shrink-0 overflow-y-auto p-6 space-y-6">
      
      {/* Template Switcher Carousel */}
      <TemplateCarousel
        docType="coverletter"
        state={state}
        activeTemplate={state.layoutSettings.template || 'navy'}
        onSelect={(templateId) => {
          onChange((prev) => ({
            ...prev,
            layoutSettings: { ...prev.layoutSettings, template: templateId }
          }));
        }}
      />

      <div className="space-y-4">
        
        {/* SECTION 1: Target Info */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <button
            onClick={() => toggleSection('target')}
            className="w-full flex items-center justify-between p-4 font-bold text-xs text-text-main hover:bg-card/20 transition uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-accent" />
              Target Position info
            </span>
            {openSection === 'target' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'target' && (
            <div className="p-4 border-t border-border-color/40 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">Company Name</label>
                  <input
                    type="text"
                    value={state.companyName}
                    onChange={(e) => onChange(prev => ({ ...prev, companyName: cleanMarkdown(e.target.value) }))}
                    className="w-full bg-input-bg border border-border-color rounded px-2.5 py-1.5 text-xs text-text-main"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">Target Role</label>
                  <input
                    type="text"
                    value={state.jobTitle}
                    onChange={(e) => onChange(prev => ({ ...prev, jobTitle: cleanMarkdown(e.target.value) }))}
                    className="w-full bg-input-bg border border-border-color rounded px-2.5 py-1.5 text-xs text-text-main"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Body Paragraphs */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <button
            onClick={() => toggleSection('paragraphs')}
            className="w-full flex items-center justify-between p-4 font-bold text-xs text-text-main hover:bg-card/20 transition uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-brand-accent" />
              Letter Paragraphs
            </span>
            {openSection === 'paragraphs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'paragraphs' && (
            <div className="p-4 border-t border-border-color/40 space-y-4">
              <div>
                <label className="block text-[10px] text-text-muted mb-1">Salutation</label>
                <input
                  type="text"
                  value={state.salutation}
                  onChange={(e) => onChange(prev => ({ ...prev, salutation: cleanMarkdown(e.target.value) }))}
                  className="w-full bg-input-bg border border-border-color rounded px-2.5 py-1.5 text-xs text-text-main"
                />
              </div>

              {['p1', 'p2', 'p3', 'p4'].map((pKey, pIdx) => (
                <div key={pKey}>
                  <label className="block text-[9px] text-text-muted mb-1 uppercase font-semibold">Paragraph {pIdx + 1}</label>
                  <textarea
                    value={(state as any)[pKey]}
                    onChange={(e) => onChange(prev => ({ ...prev, [pKey]: e.target.value }))}
                    rows={4}
                    className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-xs text-text-main focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: Highlights drag-and-drop list */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <button
            onClick={() => toggleSection('highlights')}
            className="w-full flex items-center justify-between p-4 font-bold text-xs text-text-main hover:bg-card/20 transition uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-accent" />
              Highlights Reordering
            </span>
            {openSection === 'highlights' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'highlights' && (
            <div className="p-4 border-t border-border-color/40 space-y-4">
              <div className="flex justify-between items-center text-[10px] text-text-muted uppercase tracking-wider mb-2 font-bold">
                <span>Key bullet items ({state.highlights.length})</span>
                <button
                  onClick={() => {
                    onChange(prev => ({
                      ...prev,
                      highlights: [...prev.highlights, { category: 'Highlight Category', text: 'Highlight detail description' }]
                    }));
                  }}
                  className="text-brand-accent hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="space-y-3">
                {state.highlights.map((hl, idx) => (
                  <div
                    key={idx}
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", idx.toString());
                      e.currentTarget.classList.add("opacity-40");
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.classList.remove("opacity-40");
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const sourceIdx = parseInt(e.dataTransfer.getData("text/plain"));
                      handleDrop(sourceIdx, idx);
                    }}
                    className="bg-card/25 border border-border-color/50 rounded-xl p-3 flex flex-col gap-2 relative group hover:border-brand-accent/30 transition duration-150 cursor-grab active:cursor-grabbing"
                  >
                    <button
                      onClick={() => {
                        onChange(prev => ({
                          ...prev,
                          highlights: prev.highlights.filter((_, i) => i !== idx)
                        }));
                      }}
                      className="absolute right-3 top-3 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <GripVertical className="w-3.5 h-3.5 text-text-muted/40 cursor-grab" />
                        <input
                          type="text"
                          value={hl.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            onChange(prev => {
                              const updated = [...prev.highlights];
                              updated[idx] = { ...updated[idx], category: cleanMarkdown(val) };
                              return { ...prev, highlights: updated };
                            });
                          }}
                          className="bg-transparent border-b border-transparent hover:border-border-color/30 text-xs font-bold text-brand-accent focus:outline-none w-44"
                          placeholder="Category"
                        />
                      </div>
                      
                      {/* Arrow Reordering Controls */}
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => moveHighlight(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-text-muted hover:text-brand-accent disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveHighlight(idx, 'down')}
                          disabled={idx === state.highlights.length - 1}
                          className="p-1 text-text-muted hover:text-brand-accent disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={hl.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange(prev => {
                          const updated = [...prev.highlights];
                          updated[idx] = { ...updated[idx], text: val };
                          return { ...prev, highlights: updated };
                        });
                      }}
                      rows={2}
                      className="w-full bg-input-bg border border-border-color/60 rounded px-2.5 py-1 text-xs text-text-main resize-none"
                      placeholder="Bullet details..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Layout & Spacing */}
        <div className="border border-border-color/50 rounded-xl overflow-hidden bg-card/10">
          <button
            onClick={() => toggleSection('layout')}
            className="w-full flex items-center justify-between p-4 font-bold text-xs text-text-main hover:bg-card/20 transition uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-accent" />
              Layout &amp; Spacing
            </span>
            {openSection === 'layout' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'layout' && (
            <div className="p-4 border-t border-border-color/40 space-y-4">
              <div>
                <label className="block text-[10px] text-text-muted uppercase font-bold tracking-wider mb-2">Cover Letter Template</label>
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
                    min="9"
                    max="15"
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
                    min="8"
                    max="30"
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
                    min="8"
                    max="30"
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
                    min="6"
                    max="30"
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
                    min="1.2"
                    max="2.0"
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
              </div>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
};
