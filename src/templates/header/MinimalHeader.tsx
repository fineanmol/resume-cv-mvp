import React from 'react';
import { EditableText } from '../shared/EditableText';
import { HeaderWrapper } from '../shared/HeaderWrapper';
import { AvatarCircleEditable } from '../shared/AvatarCircleEditable';
import { ContactRow } from '../shared/ContactRow';
import type { TemplateHeaderProps } from './types';

export const MinimalHeader: React.FC<TemplateHeaderProps> = (p) => {
  const showPhoto = p.layoutSettings?.showPhoto ?? true;
  const showTitle = p.layoutSettings?.showTitle ?? true;
  const uppercaseName = p.layoutSettings?.uppercaseName ?? false;
  const nameClassName = uppercaseName ? 'uppercase' : '';
  const nameStyle: React.CSSProperties = { fontFamily: p.headingFontCss };

  return (
    <HeaderWrapper
      isEditable={p.isEditable}
      layoutSettings={p.layoutSettings}
      onLayoutSettingsChange={p.onLayoutSettingsChange}
      className="mb-5"
    >
      <div className="flex items-center gap-3">
        {showPhoto && (
          <AvatarCircleEditable
            src={p.avatar}
            name={p.name.value}
            size="w-12 h-12"
            border={`${p.brandColor}40`}
            isEditable={p.isEditable}
            onAvatarChange={p.onAvatarChange}
            layoutSettings={p.layoutSettings}
            onLayoutSettingsChange={p.onLayoutSettingsChange}
          />
        )}
        <div>
          <EditableText value={p.name.value} onSave={p.name.onSave} isEditable={p.isEditable} editableClass={p.ec}
            className={`block text-3xl font-bold tracking-tight ${nameClassName}`} style={{ ...nameStyle, color: p.brandColor }} />
          {showTitle && (
            <EditableText value={p.subtitle.value} onSave={p.subtitle.onSave} isEditable={p.isEditable} editableClass={p.ec}
              className="block text-sm text-slate-500 uppercase mt-1 tracking-wide" />
          )}
        </div>
      </div>
      <ContactRow {...p} cls="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2" />
    </HeaderWrapper>
  );
};
