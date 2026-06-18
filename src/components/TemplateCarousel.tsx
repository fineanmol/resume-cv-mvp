import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ResumeTemplateRenderer } from '../templates/ResumeTemplates';
import { CoverLetterTemplateRenderer } from '../templates/CoverLetterTemplates';
import type { ResumeState, CoverLetterState } from '../types';

interface TemplateCarouselProps {
  docType: 'resume' | 'coverletter';
  state: ResumeState | CoverLetterState;
  activeTemplate: string;
  onSelect: (templateId: 'navy' | 'serif' | 'sidebar' | 'tech' | 'ats' | 'executive') => void;
}

export const TemplateCarousel: React.FC<TemplateCarouselProps> = ({
  docType,
  state,
  activeTemplate,
  onSelect
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const templates = [
    { id: 'navy' as const, name: 'Navy Elegant', desc: 'Modern & Clean' },
    { id: 'serif' as const, name: 'Harvard Serif', desc: 'Classic & Formal' },
    { id: 'sidebar' as const, name: 'Creative Sidebar', desc: 'Two-Column' },
    { id: 'tech' as const, name: 'Tech Monospace', desc: 'Developer Style' },
    { id: 'ats' as const, name: 'Clean ATS', desc: 'Max ATS Score' },
    { id: 'executive' as const, name: 'Executive', desc: 'Premium Header' },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -160 : 160;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-3 pb-4 border-b border-border-color/40 relative">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
          Choose Layout Template
        </label>
        
        {/* Navigation arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1 hover:bg-card border border-border-color/60 rounded-md transition cursor-pointer text-text-muted hover:text-text-main"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1 hover:bg-card border border-border-color/60 rounded-md transition cursor-pointer text-text-muted hover:text-text-main"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {templates.map((t) => {
          const isActive = activeTemplate === t.id;
          
          // Override template to render current selection inside card
          const localState = {
            ...state,
            layoutSettings: {
              ...state.layoutSettings,
              template: t.id
            }
          };

          return (
            <motion.button
              key={t.id}
              onClick={() => onSelect(t.id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-shrink-0 w-[115px] snap-start bg-card/30 border rounded-xl p-2.5 transition text-left cursor-pointer flex flex-col justify-between group relative select-none ${
                isActive
                  ? 'border-brand-accent bg-brand-accent/5 ring-2 ring-brand-accent/40'
                  : 'border-border-color hover:border-brand-accent/55 hover:bg-card/75'
              }`}
            >
              {/* Miniature render area */}
              <div className="w-full h-[120px] relative overflow-hidden bg-white shadow-sm border border-border-color/40 rounded-lg pointer-events-none select-none mb-2 flex justify-center items-start">
                <div className="origin-top-left scale-[0.11] w-[794px] h-[1123px]">
                  {docType === 'resume' ? (
                    <ResumeTemplateRenderer state={localState as ResumeState} />
                  ) : (
                    <CoverLetterTemplateRenderer state={localState as CoverLetterState} />
                  )}
                </div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-0.5">
                <span className={`text-[10px] font-bold block truncate leading-tight ${isActive ? 'text-brand-accent' : 'text-text-main'}`}>
                  {t.name}
                </span>
                <span className="text-[8px] text-text-muted block truncate">{t.desc}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
