import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from 'lucide-react';
import { AccordionSection } from '../ui';
import { TEMPLATES_FOR_DESIGN } from '../../config/templates';
import type { LayoutSettings } from '../../types';

interface Props {
  layout: Pick<LayoutSettings, 'template'>;
  onChange: (patch: Partial<LayoutSettings>) => void;
  openSection: string;
  onToggle: (id: string) => void;
}

const DesignTemplateSection: React.FC<Props> = ({ layout, onChange, openSection, onToggle }) => (
  <AccordionSection
    id="template"
    icon={Layout}
    label="Template"
    openSection={openSection}
    onToggle={onToggle}
    variant="design"
    bodyClassName="p-3 border-t border-border-color/40 grid grid-cols-2 gap-2"
  >
    {TEMPLATES_FOR_DESIGN.map(t => {
      const isActive = (layout.template ?? 'navy') === t.id;
      return (
        <motion.button
          key={t.id}
          onClick={() => onChange({ template: t.id })}
          whileTap={{ scale: 0.96 }}
          className={`relative flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left cursor-pointer transition ${
            isActive
              ? 'border-transparent text-white shadow-sm'
              : 'border-border-color/60 hover:border-brand-accent/50 text-text-muted hover:text-text-main'
          }`}
          style={isActive ? { background: t.accent } : {}}
        >
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: isActive ? 'rgba(255,255,255,0.6)' : t.accent }} />
          <span className="text-[10px] font-semibold truncate">{t.name}</span>
          {t.badge && (
            <span
              className="absolute -top-1.5 -right-1.5 text-[8px] font-bold px-1 py-0.5 rounded-full text-white"
              style={{ background: t.accent }}
            >
              {t.badge}
            </span>
          )}
        </motion.button>
      );
    })}
  </AccordionSection>
);

export default DesignTemplateSection;
