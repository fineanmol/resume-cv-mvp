/** Accordion section expand/collapse — forms (ResumeForm, CoverLetterForm) */
export const SECTION_ANIM = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { duration: 0.22 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.16 } },
} as const;

/** Accordion section — DesignPanel (slightly snappier) */
export const SECTION_ANIM_DESIGN = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { duration: 0.2 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.15 } },
} as const;

/** List item enter/exit inside accordion sections */
export const ITEM_ANIM = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
} as const;

/** App page transitions */
export const PAGE_ANIM = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
} as const;

/** Modal overlay + panel */
export const MODAL_OVERLAY_ANIM = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

export const MODAL_PANEL_ANIM = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 12 },
} as const;
