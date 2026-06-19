import React from 'react';
import { User } from 'lucide-react';
import type { ResumeState } from '../../../types';
import type { UndoRedoSetter } from '../../../hooks/useUndoRedo';
import { AccordionSection } from '../../ui/AccordionSection';
import { ImageUploadField } from '../../ui/ImageUploadField';
import { fullInputCls, inputCls, labelCls } from '../../../constants/formClasses';

interface ContactSectionProps {
  state: ResumeState;
  onChange: UndoRedoSetter<ResumeState>;
  onCommit: () => void;
  openSection: string;
  onToggle: (id: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  state,
  onChange,
  onCommit,
  openSection,
  onToggle,
}) => {
  const clean = (t: string) => t.replace(/\*\*|\*/g, '');

  return (
    <AccordionSection
      id="personal"
      icon={User}
      label="Contact Details"
      openSection={openSection}
      onToggle={onToggle}
      bodyClassName="p-4 border-t border-border-color/40 space-y-3"
    >
      <div>
        <label className={labelCls}>Full Name</label>
        <input
          className={fullInputCls}
          value={state.name}
          onChange={(e) => onChange((p) => ({ ...p, name: clean(e.target.value) }), true)}
          onBlur={onCommit}
        />
      </div>
      <div>
        <label className={labelCls}>Professional Headline</label>
        <input
          className={fullInputCls}
          value={state.subtitle}
          onChange={(e) => onChange((p) => ({ ...p, subtitle: clean(e.target.value) }), true)}
          onBlur={onCommit}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Phone</label>
          <input
            className={inputCls}
            value={state.phone}
            onChange={(e) => onChange((p) => ({ ...p, phone: clean(e.target.value) }), true)}
            onBlur={onCommit}
          />
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input
            className={inputCls}
            value={state.location}
            onChange={(e) => onChange((p) => ({ ...p, location: clean(e.target.value) }), true)}
            onBlur={onCommit}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Email</label>
          <input
            type="email"
            className={inputCls}
            value={state.email}
            onChange={(e) => onChange((p) => ({ ...p, email: clean(e.target.value) }), true)}
            onBlur={onCommit}
          />
        </div>
        <div>
          <label className={labelCls}>LinkedIn URL</label>
          <input
            className={inputCls}
            value={state.linkedin}
            onChange={(e) => onChange((p) => ({ ...p, linkedin: clean(e.target.value) }), true)}
            onBlur={onCommit}
          />
        </div>
      </div>
      <div className="pt-2 border-t border-border-color/20">
        <ImageUploadField
          label="Profile Photo"
          value={state.avatar}
          onChange={(avatar) => onChange((p) => ({ ...p, avatar }))}
          placeholderIcon={User}
          shape="circle"
          size="md"
          urlPlaceholder="Paste photo URL"
          uploadLabel="Upload Photo"
          removeLabel="Remove Photo"
        />
      </div>
    </AccordionSection>
  );
};
