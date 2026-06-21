import React from 'react';
import { Mail, Phone, MapPin, Star } from 'lucide-react';
import { EditableText } from '../shared/EditableText';
import { HeaderWrapper } from '../shared/HeaderWrapper';
import { AvatarCircleEditable } from '../shared/AvatarCircleEditable';
import { LI } from '../shared/LinkedInIcon';
import { formatLinkedinUrl } from '../../utils/linkedin';
import { CONTACT_ICON_MAP } from '../../components/ui/ContactIconPicker';
import type { TemplateHeaderProps } from './types';

export const EnhancvHeader: React.FC<TemplateHeaderProps> = (p) => {
  const showPhoto = p.layoutSettings?.showPhoto ?? true;
  const showTitle = p.layoutSettings?.showTitle ?? true;
  const uppercaseName = p.layoutSettings?.uppercaseName ?? false;
  const nameClassName = uppercaseName ? 'uppercase' : '';
  const nameStyle: React.CSSProperties = { fontFamily: p.headingFontCss };

  const hasPhone = (p.layoutSettings?.showPhone ?? true) && !!(p.phone?.value && p.phone.value.trim());
  const hasEmail = (p.layoutSettings?.showEmail ?? true) && !!(p.email?.value && p.email.value.trim());
  const hasLocation = (p.layoutSettings?.showLocation ?? true) && !!(p.location?.value && p.location.value.trim());
  const hasLinkedin = (p.layoutSettings?.showLinkedin ?? true) && !!(p.linkedin?.value && p.linkedin.value.trim());

  return (
    <HeaderWrapper
      isEditable={p.isEditable}
      layoutSettings={p.layoutSettings}
      onLayoutSettingsChange={p.onLayoutSettingsChange}
      className="flex justify-between items-start border-b pb-5 mb-5 gap-6"
      style={{ borderColor: `${p.brandColor}30` }}
    >
      <div className="flex-1 min-w-0">
        <div>
          <EditableText value={p.name.value} onSave={p.name.onSave} isEditable={p.isEditable} editableClass={p.ec}
            className={`block text-3xl font-extrabold tracking-tight ${nameClassName}`} style={{ ...nameStyle, color: p.brandColor }} />
          {showTitle && (
            <EditableText value={p.subtitle.value} onSave={p.subtitle.onSave} isEditable={p.isEditable} editableClass={p.ec}
              className="block text-sm font-semibold uppercase mt-1.5 tracking-wide text-slate-500" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-[11px] text-slate-600 max-w-[550px]">
          {hasEmail && (
            <span className="flex items-center gap-1.5 min-w-0">
              <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                <EditableText value={p.email.value} onSave={p.email.onSave} isEditable={p.isEditable} editableClass={p.ec} href={`mailto:${p.email.value}`} />
              </span>
            </span>
          )}
          {hasPhone && (
            <span className="flex items-center gap-1.5 min-w-0">
              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                <EditableText value={p.phone.value} onSave={p.phone.onSave} isEditable={p.isEditable} editableClass={p.ec} />
              </span>
            </span>
          )}
          {hasLocation && (
            <span className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                <EditableText value={p.location.value} onSave={p.location.onSave} isEditable={p.isEditable} editableClass={p.ec} />
              </span>
            </span>
          )}
          {hasLinkedin && (
            <span className="flex items-center gap-1.5 min-w-0">
              <LI />
              <span className="truncate">
                <EditableText value={p.linkedin.value} onSave={p.linkedin.onSave} isEditable={p.isEditable} editableClass={p.ec} href={formatLinkedinUrl(p.linkedin.value)} />
              </span>
            </span>
          )}
          {(p.customContacts ?? []).filter(c => c.value.trim()).map((field) => {
            // Fallback to Star icon guards against unknown icon values from stale/migrated data.
            const Icon = CONTACT_ICON_MAP[field.icon] ?? Star;
            return (
              <span key={field.id} className="flex items-center gap-1.5 min-w-0">
                <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{field.value}</span>
              </span>
            );
          })}
        </div>
      </div>
      {showPhoto && (
        <AvatarCircleEditable
          src={p.avatar}
          name={p.name.value}
          size="w-20 h-20"
          border={`${p.brandColor}50`}
          isEditable={p.isEditable}
          onAvatarChange={p.onAvatarChange}
          layoutSettings={p.layoutSettings}
          onLayoutSettingsChange={p.onLayoutSettingsChange}
        />
      )}
    </HeaderWrapper>
  );
};
