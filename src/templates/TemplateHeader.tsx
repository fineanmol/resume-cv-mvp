/**
 * Shared header component used by ALL resume and cover-letter templates.
 * Drives: headerStyle, showPhoto/avatar, brandColor, headingFont.
 * Every template imports this so a change here applies everywhere.
 */
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import type { HeaderStyle } from '../types';

export function formatLinkedinUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('linkedin.com') || trimmed.startsWith('www.linkedin.com')) {
    return `https://${trimmed}`;
  }
  if (trimmed.startsWith('in/')) {
    return `https://linkedin.com/${trimmed}`;
  }
  return `https://linkedin.com/in/${trimmed}`;
}

const LI: React.FC = () => (
  <svg className="w-3 h-3 flex-shrink-0 mt-[1px]" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);

interface EditField {
  value: string;
  onSave: (v: string) => void;
}

export interface TemplateHeaderProps {
  name: EditField;
  subtitle: EditField;
  phone: EditField;
  email: EditField;
  location: EditField;
  linkedin: EditField;
  avatar: string;
  showAvatar: boolean;
  brandColor: string;
  headingFontCss: string;
  headerStyle: HeaderStyle;
  isEditable: boolean;
  ec: string; // editableClass
  sectionSpacing: number;
}

// Reusable editable span / link anchor
const EF: React.FC<{
  field: EditField;
  isEditable: boolean;
  ec: string;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
}> = ({ field, isEditable, ec, className, style, href }) => {
  if (isEditable) {
    return (
      <span
        data-href={href}
        className={`${className ?? ''} ${ec}`}
        style={style}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={e => field.onSave((e.currentTarget as HTMLElement).textContent ?? '')}
      >
        {field.value}
      </span>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${className ?? ''} hover:underline cursor-pointer`} style={style}>
        {field.value}
      </a>
    );
  }
  return (
    <span className={className} style={style}>
      {field.value}
    </span>
  );
};

const AvatarCircle: React.FC<{ src: string; name: string; size?: string; border?: string }> = (
  { src, name, size = 'w-16 h-16', border }
) => (
  <div className={`${size} rounded-full overflow-hidden border-2 flex-shrink-0`}
    style={border ? { borderColor: border } : { borderColor: 'rgba(255,255,255,0.4)' }}>
    <img src={src} alt={name} className="w-full h-full object-cover" />
  </div>
);

const ContactRow: React.FC<{
  phone: EditField; email: EditField; location: EditField; linkedin: EditField;
  isEditable: boolean; ec: string; cls?: string; itemCls?: string;
}> = ({ phone, email, location, linkedin, isEditable, ec, cls, itemCls }) => (
  <div className={cls ?? 'flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2'}>
    {(phone.value || isEditable) && (
      <span className={`flex items-center gap-1 ${itemCls ?? ''}`}>
        <Phone className="w-3 h-3 flex-shrink-0 mt-[1px]" />
        <EF field={phone} isEditable={isEditable} ec={ec} />
      </span>
    )}
    {(email.value || isEditable) && (
      <span className={`flex items-center gap-1 ${itemCls ?? ''}`}>
        <Mail className="w-3 h-3 flex-shrink-0 mt-[1px]" />
        <EF field={email} isEditable={isEditable} ec={ec} href={isEditable ? undefined : `mailto:${email.value}`} />
      </span>
    )}
    {(location.value || isEditable) && (
      <span className={`flex items-center gap-1 ${itemCls ?? ''}`}>
        <MapPin className="w-3 h-3 flex-shrink-0 mt-[1px]" />
        <EF field={location} isEditable={isEditable} ec={ec} />
      </span>
    )}
    {(linkedin.value || isEditable) && (
      <span className={`flex items-center gap-1 ${itemCls ?? ''}`}>
        <LI />
        <EF field={linkedin} isEditable={isEditable} ec={ec} href={isEditable ? undefined : formatLinkedinUrl(linkedin.value)} />
      </span>
    )}
  </div>
);

export const TemplateHeader: React.FC<TemplateHeaderProps> = (p) => {
  const lightEc = 'outline-none hover:bg-white/10 focus:bg-white/10 rounded px-1 -mx-1 transition';
  const nameStyle: React.CSSProperties = { fontFamily: p.headingFontCss };

  // ── BANNER: full-width colour block ────────────────────────────────────────
  if (p.headerStyle === 'banner') {
    return (
      <header className="text-white mb-5"
        style={{
          background: `linear-gradient(135deg, ${p.brandColor} 0%, ${p.brandColor}cc 100%)`,
          padding: '20px 28px 16px',
          margin: '0',
        }}>
        <div className="flex justify-between items-start gap-4">
          <div>
            <EF field={p.name} isEditable={p.isEditable} ec={lightEc}
              className="block text-3xl font-bold tracking-tight text-white" style={nameStyle} />
            <EF field={p.subtitle} isEditable={p.isEditable} ec={lightEc}
              className="block text-sm text-white/80 mt-1 uppercase tracking-wide" />
          </div>
          {p.showAvatar && <AvatarCircle src={p.avatar} name={p.name.value} />}
        </div>
        <ContactRow {...p} cls="flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-white/80 mt-2" />
      </header>
    );
  }

  // ── LEFT: name left, contact right, optional photo ─────────────────────────
  if (p.headerStyle === 'left') {
    return (
      <header className="flex justify-between items-start border-b-2 pb-4 mb-4 gap-4"
        style={{ borderColor: p.brandColor }}>
        <div className="flex items-start gap-3">
          {p.showAvatar && <AvatarCircle src={p.avatar} name={p.name.value} size="w-14 h-14" border={`${p.brandColor}60`} />}
          <div>
            <EF field={p.name} isEditable={p.isEditable} ec={p.ec}
              className="block text-3xl font-bold tracking-tight" style={{ ...nameStyle, color: p.brandColor }} />
            <EF field={p.subtitle} isEditable={p.isEditable} ec={p.ec}
              className="block text-sm text-slate-500 uppercase mt-1 tracking-wide" />
          </div>
        </div>
        <ContactRow {...p} cls="flex flex-col gap-1 text-xs text-slate-600 text-right items-end mt-1" />
      </header>
    );
  }

  // ── MINIMAL: just name + subtitle, no border, optional small photo ──────────
  if (p.headerStyle === 'minimal') {
    return (
      <header className="mb-5">
        <div className="flex items-center gap-3">
          {p.showAvatar && <AvatarCircle src={p.avatar} name={p.name.value} size="w-12 h-12" border={`${p.brandColor}40`} />}
          <div>
            <EF field={p.name} isEditable={p.isEditable} ec={p.ec}
              className="block text-3xl font-bold tracking-tight" style={{ ...nameStyle, color: p.brandColor }} />
            <EF field={p.subtitle} isEditable={p.isEditable} ec={p.ec}
              className="block text-sm text-slate-500 uppercase mt-1 tracking-wide" />
          </div>
        </div>
        <ContactRow {...p} cls="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2" />
      </header>
    );
  }

  // ── CENTERED (default): name/subtitle centred, optional photo above ─────────
  return (
    <header className="text-center border-b-2 pb-4 mb-4" style={{ borderColor: p.brandColor }}>
      {p.showAvatar && (
        <div className="flex justify-center mb-2">
          <AvatarCircle src={p.avatar} name={p.name.value} size="w-16 h-16" border={`${p.brandColor}60`} />
        </div>
      )}
      <EF field={p.name} isEditable={p.isEditable} ec={p.ec}
        className="block text-3xl font-bold tracking-tight" style={{ ...nameStyle, color: p.brandColor }} />
      <EF field={p.subtitle} isEditable={p.isEditable} ec={p.ec}
        className="block text-sm text-slate-500 uppercase mt-1 tracking-wide" />
      <ContactRow {...p} cls="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-3" />
    </header>
  );
};
