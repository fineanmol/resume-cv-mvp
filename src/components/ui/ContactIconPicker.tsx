import React, { useState, useRef, useEffect } from 'react';
import { Globe, Phone, Mail, MapPin, Link, Briefcase, Calendar, Star } from 'lucide-react';
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import type { ContactIconType } from '../../types';

export const CONTACT_ICON_MAP: Record<ContactIconType, React.ElementType> = {
  globe: Globe,
  github: FaGithub,
  twitter: FaTwitter,
  instagram: FaInstagram,
  youtube: FaYoutube,
  phone: Phone,
  mail: Mail,
  linkedin: FaLinkedin,
  location: MapPin,
  link: Link,
  briefcase: Briefcase,
  calendar: Calendar,
  custom: Star,
};

const ICON_LABELS: Record<ContactIconType, string> = {
  globe: 'Website',
  github: 'GitHub',
  twitter: 'Twitter',
  instagram: 'Instagram',
  youtube: 'YouTube',
  phone: 'Phone',
  mail: 'Email',
  linkedin: 'LinkedIn',
  location: 'Location',
  link: 'Link',
  briefcase: 'Company',
  calendar: 'Availability',
  custom: 'Custom',
};

const ALL_ICONS = Object.keys(CONTACT_ICON_MAP) as ContactIconType[];

interface ContactIconPickerProps {
  value: ContactIconType;
  onChange: (icon: ContactIconType) => void;
}

export const ContactIconPicker: React.FC<ContactIconPickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const CurrentIcon = CONTACT_ICON_MAP[value];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        title={ICON_LABELS[value]}
        onClick={() => setOpen(p => !p)}
        className="flex items-center justify-center w-7 h-7 rounded border border-border-color bg-input-bg hover:border-brand-accent/60 hover:bg-brand-accent/10 text-text-muted hover:text-brand-accent transition cursor-pointer"
      >
        <CurrentIcon size={13} />
      </button>

      {open && (
        <div className="absolute left-0 top-9 z-50 bg-card border border-border-color rounded-xl shadow-xl p-2 grid grid-cols-4 gap-1 w-[136px]">
          {ALL_ICONS.map((iconKey) => {
            const Icon = CONTACT_ICON_MAP[iconKey];
            const isSelected = iconKey === value;
            return (
              <button
                key={iconKey}
                type="button"
                title={ICON_LABELS[iconKey]}
                onClick={() => { onChange(iconKey); setOpen(false); }}
                className={`flex items-center justify-center w-7 h-7 rounded transition cursor-pointer
                  ${isSelected
                    ? 'bg-brand-accent text-white'
                    : 'text-text-muted hover:bg-brand-accent/10 hover:text-brand-accent'
                  }`}
              >
                <Icon size={13} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
