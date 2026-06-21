import React from 'react';
import { User, Plus, X } from 'lucide-react';
import type { ResumeState, CustomContactField, ContactIconType } from '../../../types';
import type { UndoRedoSetter } from '../../../hooks/useUndoRedo';
import { AccordionSection } from '../../ui/AccordionSection';
import { ImageUploadField } from '../../ui/ImageUploadField';
import { ContactIconPicker } from '../../ui/ContactIconPicker';
import { fullInputCls, inputCls, labelCls, addButtonCls } from '../../../constants/formClasses';

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
  const customContacts: CustomContactField[] = state.customContacts ?? [];

  const addField = () => {
    onChange(p => ({
      ...p,
      customContacts: [
        ...(p.customContacts ?? []),
        { id: Date.now().toString(), icon: 'globe' as ContactIconType, label: '', value: '' },
      ],
    }));
  };

  const updateField = (id: string, patch: Partial<Omit<CustomContactField, 'id'>>) => {
    onChange(p => ({
      ...p,
      customContacts: (p.customContacts ?? []).map(c => c.id === id ? { ...c, ...patch } : c),
    }), true);
  };

  const removeField = (id: string) => {
    onChange(p => ({
      ...p,
      customContacts: (p.customContacts ?? []).filter(c => c.id !== id),
    }));
  };

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
          onBlur={(e) => {
            const name = e.target.value.trim();
            if (name) {
              const today = new Date().toLocaleDateString('en-GB');
              const newTitle = `${name} - Resume (${today})`;
              onChange((p) => ({ ...p, title: newTitle }), true);
            }
            onCommit();
          }}
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

      {/* ── Custom / extra contact fields ──────────────────────────────── */}
      {customContacts.length > 0 && (
        <div className="space-y-2 pt-1">
          <label className={labelCls}>Extra Links &amp; Fields</label>
          {customContacts.map((field) => (
            <div key={field.id} className="flex items-center gap-1.5">
              <ContactIconPicker
                value={field.icon}
                onChange={(icon) => updateField(field.id, { icon })}
              />
              <input
                className={inputCls}
                placeholder="Label"
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                onBlur={onCommit}
                style={{ maxWidth: '90px' }}
              />
              <input
                className={inputCls}
                placeholder="Value / URL"
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                onBlur={onCommit}
              />
              <button
                type="button"
                onClick={() => removeField(field.id)}
                className="flex-shrink-0 text-text-muted hover:text-red-400 transition cursor-pointer p-1"
                title="Remove field"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={addField} className={addButtonCls}>
        <Plus size={13} /> Add field
      </button>

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
