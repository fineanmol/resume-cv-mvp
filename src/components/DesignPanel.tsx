import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { LayoutSettings } from '../types';
import DesignTemplateSection from './design/DesignTemplateSection';
import DesignColorsSection from './design/DesignColorsSection';
import DesignTypographySection from './design/DesignTypographySection';
import DesignSpacingSection from './design/DesignSpacingSection';
import DesignHeaderSection from './design/DesignHeaderSection';
import DesignSectionToggles from './design/DesignSectionToggles';

interface DesignPanelProps {
  layout: LayoutSettings & { columnGap?: number };
  onChange: (patch: Partial<LayoutSettings & { columnGap?: number }>) => void;
  docType: 'resume' | 'coverletter';
  focusSection?: string | null;
  onFocusHandled?: () => void;
  onReset?: () => void;
}

export const DesignPanel: React.FC<DesignPanelProps> = ({
  layout,
  onChange,
  docType,
  focusSection,
  onFocusHandled,
  onReset,
}) => {
  const [open, setOpen] = useState<string>('template');
  const [resetConfirm, setResetConfirm] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const activeOpen = focusSection ?? open;

  const toggle = (s: string) => {
    onFocusHandled?.();
    setOpen(p => p === s ? '' : s);
  };

  React.useEffect(() => {
    if (!focusSection) return;
    const t = window.setTimeout(() => {
      setOpen(focusSection);
      scrollRef.current?.querySelector(`#design-section-${focusSection}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      onFocusHandled?.();
    }, 50);
    return () => window.clearTimeout(t);
  }, [focusSection, onFocusHandled]);

  const isDesigner = (layout.template ?? 'navy') === 'designer';

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5 pb-32 space-y-3 w-full flex flex-col"
    >
      {onReset && isDesigner && (
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-border-color/40 bg-sidebar">
          <span className="text-[10px] text-text-muted leading-tight">
            Restore Figma design defaults<br />
            <span className="opacity-60">Raleway · Open Sans · Heading #343334 · Accent #00B6CB</span>
          </span>
          {resetConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onReset(); setResetConfirm(false); }}
                className="px-2 py-1 rounded text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white cursor-pointer transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="px-2 py-1 rounded text-[10px] font-semibold border border-border-color/60 text-text-muted hover:text-text-main cursor-pointer transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border-color/60 hover:border-brand-accent/60 text-text-muted hover:text-brand-accent transition cursor-pointer text-[10px] font-semibold shrink-0"
              title="Reset all style settings to Figma defaults"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      )}

      <DesignTemplateSection layout={layout} onChange={onChange} openSection={activeOpen} onToggle={toggle} docType={docType} />
      <DesignColorsSection layout={layout} onChange={onChange} openSection={activeOpen} onToggle={toggle} />
      <DesignTypographySection layout={layout} onChange={onChange} openSection={activeOpen} onToggle={toggle} docType={docType} />
      <DesignSpacingSection layout={layout} onChange={onChange} docType={docType} openSection={activeOpen} onToggle={toggle} />
      <DesignHeaderSection layout={layout} onChange={onChange} docType={docType} openSection={activeOpen} onToggle={toggle} />
      <DesignSectionToggles layout={layout} onChange={onChange} docType={docType} openSection={activeOpen} onToggle={toggle} />
    </div>
  );
};
