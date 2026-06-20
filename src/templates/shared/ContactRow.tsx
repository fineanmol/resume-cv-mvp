import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import type { LayoutSettings } from '../../types';
import { EditableText } from './EditableText';
import { LI } from './LinkedInIcon';
import { formatLinkedinUrl } from '../../utils/linkedin';
import type { EditField } from '../header/types';

export type { EditField };

export const ContactRow: React.FC<{
  phone: EditField;
  email: EditField;
  location: EditField;
  linkedin: EditField;
  isEditable: boolean;
  ec: string;
  cls?: string;
  itemCls?: string;
  layoutSettings?: LayoutSettings;
}> = ({ phone, email, location, linkedin, isEditable, ec, cls, itemCls, layoutSettings }) => {
  const settings: Partial<LayoutSettings> = layoutSettings ?? {};
  const hasPhone = (settings.showPhone ?? true) && !!(phone?.value && phone.value.trim());
  const hasEmail = (settings.showEmail ?? true) && !!(email?.value && email.value.trim());
  const hasLocation = (settings.showLocation ?? true) && !!(location?.value && location.value.trim());
  const hasLinkedin = (settings.showLinkedin ?? true) && !!(linkedin?.value && linkedin.value.trim());

  if (!hasPhone && !hasEmail && !hasLocation && !hasLinkedin) {
    return null;
  }

  return (
    <div className={cls ?? 'flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2'}>
      {hasPhone && (
        <span className={`flex items-center gap-1 ${itemCls ?? ''}`}>
          <Phone className="w-3 h-3 flex-shrink-0 mt-[1px]" />
          <EditableText value={phone.value} onSave={phone.onSave} isEditable={isEditable} editableClass={ec} />
        </span>
      )}
      {hasEmail && (
        <span className={`flex items-center gap-1 ${itemCls ?? ''}`}>
          <Mail className="w-3 h-3 flex-shrink-0 mt-[1px]" />
          <EditableText value={email.value} onSave={email.onSave} isEditable={isEditable} editableClass={ec} href={`mailto:${email.value}`} />
        </span>
      )}
      {hasLocation && (
        <span className={`flex items-center gap-1 ${itemCls ?? ''}`}>
          <MapPin className="w-3 h-3 flex-shrink-0 mt-[1px]" />
          <EditableText value={location.value} onSave={location.onSave} isEditable={isEditable} editableClass={ec} />
        </span>
      )}
      {hasLinkedin && (
        <span className={`flex items-center gap-1 ${itemCls ?? ''}`}>
          <LI />
          <EditableText value={linkedin.value} onSave={linkedin.onSave} isEditable={isEditable} editableClass={ec} href={formatLinkedinUrl(linkedin.value)} />
        </span>
      )}
    </div>
  );
};
