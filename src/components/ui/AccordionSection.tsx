import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from '../SectionHeader';
import { SECTION_ANIM, SECTION_ANIM_DESIGN } from '../../constants/animations';
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
  /** Use slightly faster animation (DesignPanel) */
  variant?: 'form' | 'design';
}

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
  const anim = variant === 'design' ? SECTION_ANIM_DESIGN : SECTION_ANIM;
  const isOpen = openSection === id;

  return (
    <div className={sectionShellCls}>
      <SectionHeader
        id={id}
        icon={icon}
        label={label}
        badge={badge}
        openSection={openSection}
        onToggle={onToggle}
      />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div key={id} {...anim} style={{ overflow: 'hidden' }}>
            <div className={bodyClassName}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
