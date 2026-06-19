import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from '../SectionHeader';
import { SECTION_ANIM } from '../../constants/animations';
import { sectionShellCls } from '../../constants/formClasses';

interface AccordionSectionProps {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  openSection: string;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  /** Inner padding wrapper classes (default: form section body) */
  bodyClassName?: string;
  /** Design panel: instant expand, no height clip (avoids cutting sliders) */
  variant?: 'form' | 'design';
}

const designShellCls =
  'border border-border-color/50 rounded-xl overflow-visible bg-card/10';

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  id,
  icon,
  label,
  badge,
  openSection,
  onToggle,
  children,
  bodyClassName = 'p-4 border-t border-border-color/40',
  variant = 'form',
}) => {
  const isOpen = openSection === id;
  const isDesign = variant === 'design';

  return (
    <div
      id={isDesign ? `design-section-${id}` : undefined}
      className={isDesign ? designShellCls : sectionShellCls}
    >
      <SectionHeader
        id={id}
        icon={icon}
        label={label}
        badge={badge}
        openSection={openSection}
        onToggle={onToggle}
      />
      {isDesign ? (
        isOpen ? (
          <div className={bodyClassName}>{children}</div>
        ) : null
      ) : (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div key={id} {...SECTION_ANIM} style={{ overflow: 'hidden' }}>
              <div className={bodyClassName}>{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
