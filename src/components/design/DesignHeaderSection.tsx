import React from 'react';
import { Layout, Image, List, Tag } from 'lucide-react';
import { AccordionSection, ToggleSwitch } from '../ui';
import { HEADER_STYLES, BULLET_STYLES } from '../../config/designOptions';
import type { LayoutSettings } from '../../types';
import { PHOTO_SHAPES, resolvePhotoShape, photoShapePatch } from '../../utils/photoShape';

interface Props {
  layout: Pick<LayoutSettings, 'template' | 'headerStyle' | 'bulletStyle' | 'brandColor' | 'skillsStyle' | 'showPhoto' | 'photoShape' | 'roundPhoto'>;
  onChange: (patch: Partial<LayoutSettings>) => void;
  docType: 'resume' | 'coverletter';
  openSection: string;
  onToggle: (id: string) => void;
}

const DesignHeaderSection: React.FC<Props> = ({ layout, onChange, docType, openSection, onToggle }) => {
  return (
    <>
      <AccordionSection
        id="header"
        icon={Layout}
        label="Header Style"
        openSection={openSection}
        onToggle={onToggle}
        variant="design"
        bodyClassName="p-3 border-t border-border-color/40 space-y-3"
      >
        {docType === 'coverletter' && (layout.template ?? 'navy') === 'sidebar' ? (
          <p className="text-[10px] text-text-muted leading-relaxed pb-1">
            The Sidebar template uses a fixed two-column layout — header style is not applicable.
            Switch to another template to use different header styles.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            {HEADER_STYLES.map(h => {
              const isActive = (layout.headerStyle ?? 'centered') === h.id;
              return (
                <button
                  key={h.id}
                  onClick={() => onChange({ headerStyle: h.id })}
                  className={`px-2 py-2 rounded-lg border text-left transition cursor-pointer ${
                    isActive
                      ? 'border-brand-accent bg-brand-accent/8 text-brand-accent'
                      : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
                  }`}
                >
                  <span className="block text-[10px] font-bold">{h.label}</span>
                  <span className="block text-[9px] opacity-70 leading-tight">{h.desc}</span>
                </button>
              );
            })}
          </div>
        )}

        <p className="text-[10px] text-text-muted leading-relaxed border-t border-border-color/30 pt-3">
          Contact field visibility, photo, and uppercase name are in the document header gear on the canvas.
        </p>
      </AccordionSection>

      {docType === 'resume' && (
        <AccordionSection
          id="bullets"
          icon={List}
          label="Bullet Style"
          openSection={openSection}
          onToggle={onToggle}
          variant="design"
          bodyClassName="p-3 border-t border-border-color/40 grid grid-cols-2 gap-1.5"
        >
          {BULLET_STYLES.map(b => {
            const isActive = (layout.bulletStyle ?? 'disc') === b.id;
            return (
              <button
                key={b.id ?? 'disc'}
                onClick={() => onChange({ bulletStyle: b.id })}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg border text-left transition cursor-pointer ${
                  isActive
                    ? 'border-brand-accent bg-brand-accent/8 text-brand-accent font-bold'
                    : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
                }`}
              >
                <span className="text-[10px] font-semibold">{b.label}</span>
                <span className="text-xs font-semibold opacity-80" style={{ color: isActive ? undefined : layout.brandColor }}>{b.preview}</span>
              </button>
            );
          })}
        </AccordionSection>
      )}

      {docType === 'resume' && (
        <AccordionSection
          id="skillsStyle"
          icon={Tag}
          label="Skills Style"
          openSection={openSection}
          onToggle={onToggle}
          variant="design"
          bodyClassName="p-3 border-t border-border-color/40 grid grid-cols-3 gap-1.5"
        >
          <button
            onClick={() => onChange({ skillsStyle: 'chips' })}
            className={`px-2.5 py-2 rounded-lg border text-left transition cursor-pointer ${
              (layout.skillsStyle ?? 'chips') === 'chips'
                ? 'border-brand-accent bg-brand-accent/8 text-brand-accent font-bold'
                : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
            }`}
          >
            <span className="text-[10px] font-semibold block">Chips</span>
            <span className="text-[8px] opacity-70 leading-tight block mt-0.5">Styled pill badges</span>
          </button>
          <button
            onClick={() => onChange({ skillsStyle: 'normal' })}
            className={`px-2.5 py-2 rounded-lg border text-left transition cursor-pointer ${
              (layout.skillsStyle ?? 'chips') === 'normal'
                ? 'border-brand-accent bg-brand-accent/8 text-brand-accent font-bold'
                : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
            }`}
          >
            <span className="text-[10px] font-semibold block">Plain Text</span>
            <span className="text-[8px] opacity-70 leading-tight block mt-0.5">Comma-separated list</span>
          </button>
          <button
            onClick={() => onChange({ skillsStyle: 'grid' })}
            className={`px-2.5 py-2 rounded-lg border text-left transition cursor-pointer ${
              (layout.skillsStyle ?? 'chips') === 'grid'
                ? 'border-brand-accent bg-brand-accent/8 text-brand-accent font-bold'
                : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
            }`}
          >
            <span className="text-[10px] font-semibold block">Grid Table</span>
            <span className="text-[8px] opacity-70 leading-tight block mt-0.5">4-col ATS layout</span>
          </button>
        </AccordionSection>
      )}

      <AccordionSection
        id="photo"
        icon={Image}
        label="Photo"
        openSection={openSection}
        onToggle={onToggle}
        variant="design"
        bodyClassName="p-3 border-t border-border-color/40 space-y-3"
      >
        <ToggleSwitch
          label="Show photo"
          checked={layout.showPhoto ?? true}
          onChange={v => onChange({ showPhoto: v })}
        />
        {(layout.showPhoto ?? true) && (
          <div className="space-y-1.5">
            <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">Shape</span>
            <div className="flex items-center gap-2">
              {PHOTO_SHAPES.map(({ id, label, previewClass }) => (
                <button
                  key={id}
                  type="button"
                  title={label}
                  onClick={() => onChange(photoShapePatch(id))}
                  className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg border transition cursor-pointer flex-1 ${
                    resolvePhotoShape(layout) === id
                      ? 'border-brand-accent bg-brand-accent/8 text-brand-accent'
                      : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
                  }`}
                >
                  <div className={`w-4 h-4 bg-current opacity-60 ${previewClass}`} />
                  <span className="text-[8px] font-semibold leading-none">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </AccordionSection>
    </>
  );
};

export default DesignHeaderSection;
