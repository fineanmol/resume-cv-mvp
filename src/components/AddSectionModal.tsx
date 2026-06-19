import React from 'react';
import { X, Award, CheckCircle2 } from 'lucide-react';
import { Modal } from './ui/Modal';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSections: string[];
  onAddSection: (sectionId: string) => void;
}

const SECTION_TYPES = [
  {
    id: 'summary',
    title: 'Summary',
    desc: 'Brief professional overview',
    preview: (
      <div className="text-[9px] text-slate-500 space-y-1">
        <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 uppercase tracking-wider text-[10px]">Profile Summary</div>
        <p className="leading-relaxed">Innovative and results-driven specialist with 5+ years of experience in system design, application development, and leading cross-functional teams.</p>
      </div>
    )
  },
  {
    id: 'skills',
    title: 'Skills',
    desc: 'Core competencies & technologies',
    preview: (
      <div className="text-[9px] text-slate-500 space-y-1">
        <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 uppercase tracking-wider text-[10px]">Skills</div>
        <div className="flex flex-wrap gap-1">
          {['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'System Design'].map((s, idx) => (
            <span key={idx} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[8px] font-medium">{s}</span>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'experience',
    title: 'Experience',
    desc: 'Work history & bullet accomplishments',
    preview: (
      <div className="text-[9px] text-slate-500 space-y-1">
        <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 uppercase tracking-wider text-[10px]">Professional Experience</div>
        <div>
          <div className="flex justify-between font-bold text-slate-800">
            <span>Senior Software Engineer</span>
            <span className="font-normal text-slate-400">2024 - Present</span>
          </div>
          <div className="text-slate-500 italic text-[8px]">TechFlow Solutions | San Francisco, CA</div>
          <ul className="list-disc pl-3 text-slate-500 text-[8px] mt-1 space-y-0.5">
            <li>Led monolithic platform migration to microservices.</li>
            <li>Mentored 6 junior developer engineers.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'education',
    title: 'Education',
    desc: 'Degrees, schools, and credentials',
    preview: (
      <div className="text-[9px] text-slate-500 space-y-1">
        <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 uppercase tracking-wider text-[10px]">Education</div>
        <div>
          <div className="flex justify-between font-bold text-slate-800">
            <span>B.S. in Computer Science</span>
            <span className="font-normal text-slate-400">2017 - 2021</span>
          </div>
          <div className="text-slate-500 italic text-[8px]">State University | GPA: 3.8</div>
        </div>
      </div>
    )
  },
  {
    id: 'certs',
    title: 'Projects',
    desc: 'Personal or professional projects',
    preview: (
      <div className="text-[9px] text-slate-500 space-y-1">
        <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 uppercase tracking-wider text-[10px]">Projects</div>
        <div>
          <div className="font-bold text-slate-800 flex items-center gap-0.5">
            <span>Project Voyager</span>
            <span className="text-[7px] text-teal-600 font-semibold">(voyager.dev)</span>
          </div>
          <p className="text-[8px] text-slate-500 leading-normal">Designed an AI-driven log tracker processing 10M daily events.</p>
        </div>
      </div>
    )
  },
  {
    id: 'achievements',
    title: 'Achievements',
    desc: 'Recognitions, awards, and milestones',
    preview: (
      <div className="text-[9px] text-slate-500 space-y-1">
        <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 uppercase tracking-wider text-[10px]">Achievements</div>
        <div className="flex items-start gap-1">
          <div className="p-1 bg-teal-50 border border-teal-200 rounded text-teal-600">
            <Award className="w-2.5 h-2.5" />
          </div>
          <div className="flex-1 leading-normal text-[8px]">
            <strong className="text-slate-800 block">First Place at Hackathon</strong>
            <span>Won against 200+ teams in state-level coding sprint.</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'languages',
    title: 'Languages',
    desc: 'Linguistic proficiencies',
    preview: (
      <div className="text-[9px] text-slate-500 space-y-1">
        <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 uppercase tracking-wider text-[10px]">Languages</div>
        <div className="flex justify-between items-center text-[8px] py-0.5">
          <div>
            <span className="font-semibold text-slate-800">English</span>
            <span className="text-[7px] text-slate-400 ml-1">(Native)</span>
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((val) => (
              <span key={val} className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            ))}
          </div>
        </div>
      </div>
    )
  }
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  activeSections,
  onAddSection
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      noPadding
      panelClassName="overflow-hidden my-8"
      overlayClassName="bg-editor/85 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-color/60 flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-text-main">Add a new section</h2>
          <p className="text-xs text-text-muted mt-1">Select a section preview card below to insert it into your resume</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-text-muted hover:text-text-main hover:bg-card border border-transparent hover:border-border-color rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-none" style={{ maxHeight: 'calc(90vh - 140px)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTION_TYPES.map((sec) => {
            const isAdded = activeSections.includes(sec.id);
            return (
              <div
                key={sec.id}
                onClick={() => {
                  if (!isAdded) {
                    onAddSection(sec.id);
                    onClose();
                  }
                }}
                className={`border rounded-xl overflow-hidden bg-card/20 group/card relative flex flex-col h-[200px] transition-all duration-300 ${
                  isAdded
                    ? 'border-brand-accent/40 bg-brand-accent/5 opacity-80'
                    : 'border-border-color/60 hover:border-brand-accent cursor-pointer hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {/* Card Previews */}
                <div className="p-4 flex-1 overflow-hidden bg-white/5 group-hover/card:bg-white/10 transition-colors">
                  {sec.preview}
                </div>

                {/* Card Footer Banner */}
                <div className="p-3 border-t border-border-color/40 bg-sidebar flex items-center justify-between flex-shrink-0">
                  <div>
                    <h3 className="text-xs font-bold text-text-main">{sec.title}</h3>
                    <p className="text-[10px] text-text-muted mt-0.5">{sec.desc}</p>
                  </div>
                  {isAdded && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Added
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-border-color/60 bg-sidebar flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-border-color hover:bg-card text-xs font-semibold rounded-lg text-text-muted hover:text-text-main transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};
