import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LayoutTemplate } from 'lucide-react';
import { TemplatePicker } from './TemplatePicker';
import type { TemplateId } from '../types';
import { TEMPLATES_FOR_CAROUSEL } from '../config/templates';

interface TemplateCarouselProps {
  docType: 'resume' | 'coverletter';
  state: object;
  activeTemplate: string;
  onSelect: (templateId: TemplateId) => void;
}

export const TemplateCarousel: React.FC<TemplateCarouselProps> = ({
  docType, activeTemplate, onSelect,
}) => {
  const activeRef = useRef<HTMLButtonElement>(null);
  const [pickerOpen, setPickerOpen]       = useState(false);
  const [pickerStartIndex, setPickerStartIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeTemplate]);

  const openPickerAt = (index?: number) => {
    setPickerStartIndex(index);
    setPickerOpen(true);
  };

  return (
    <>
      <div className="pb-3 border-b border-border-color/40">
        {/* Row: label + Browse button */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-accent" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Template</span>
          </div>
          <button
            onClick={() => openPickerAt(undefined)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold text-brand-accent hover:bg-brand-accent/10 border border-brand-accent/20 hover:border-brand-accent/40 transition cursor-pointer"
          >
            <LayoutTemplate className="w-3 h-3" />
            Browse
          </button>
        </div>

        {/* Chip strip — clicking opens the fullscreen picker at that template's position */}
        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TEMPLATES_FOR_CAROUSEL.map((t, i) => {
            const isActive = activeTemplate === t.id;
            return (
              <motion.button
                key={t.id}
                ref={isActive ? activeRef : null}
                onClick={() => openPickerAt(i)}
                whileTap={{ scale: 0.94 }}
                className={`relative flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all border ${
                  isActive
                    ? 'text-white border-transparent shadow-sm'
                    : 'text-text-muted border-border-color/60 hover:border-brand-accent/40 hover:text-text-main bg-card/30'
                }`}
                style={isActive ? { background: t.color, borderColor: t.color } : {}}
                title={`Preview ${t.name} template`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: isActive ? 'rgba(255,255,255,0.6)' : t.color }}
                />
                {t.name}
                {isActive && (
                  <motion.span
                    layoutId={`carousel-active-${docType}`}
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: `0 0 0 2px ${t.color}55` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Full-screen picker portal */}
      <AnimatePresence>
        {pickerOpen && (
          <TemplatePicker
            isOpen={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={(id) => { onSelect(id); setPickerOpen(false); }}
            docType={docType}
            startIndex={pickerStartIndex}
          />
        )}
      </AnimatePresence>
    </>
  );
};
