import React from 'react';
import { EditableText } from '../shared/EditableText';
import { HeaderWrapper } from '../shared/HeaderWrapper';
import { AvatarCircleEditable } from '../shared/AvatarCircleEditable';
import { ContactRow } from '../shared/ContactRow';
import type { TemplateHeaderProps } from './types';

export const LeftHeader: React.FC<TemplateHeaderProps> = (p) => {
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
      className="flex justify-between items-start border-b-2 pb-4 mb-4 gap-4"
      style={{ borderColor: p.brandColor }}
    >
      <div className="flex-1">
        <div>
          <EditableText value={p.name.value} onSave={p.name.onSave} isEditable={p.isEditable} editableClass={p.ec}
            className={`block text-3xl font-bold tracking-tight ${nameClassName}`} style={{ ...nameStyle, color: p.brandColor }} />
          {showTitle && (
            <EditableText value={p.subtitle.value} onSave={p.subtitle.onSave} isEditable={p.isEditable} editableClass={p.ec}
              className="block text-sm text-slate-500 uppercase mt-1 tracking-wide" />
          )}
        </div>
        <ContactRow {...p} cls="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2.5" />
      </div>
      {showPhoto && (
        <AvatarCircleEditable
          src={p.avatar}
          name={p.name.value}
          size="w-24 h-24"
          border={`${p.brandColor}60`}
          isEditable={p.isEditable}
          onAvatarChange={p.onAvatarChange}
          layoutSettings={p.layoutSettings}
          onLayoutSettingsChange={p.onLayoutSettingsChange}
        />
      )}
    </HeaderWrapper>
  );
};
