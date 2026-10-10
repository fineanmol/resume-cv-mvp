import {ContactRow} from '../shared/ContactRow';
import React from 'react';
import { EditableText } from '../shared/EditableText';
import { HeaderWrapper } from '../shared/HeaderWrapper';
import { AvatarCircleEditable } from '../shared/AvatarCircleEditable';
import type { TemplateHeaderProps } from './types';

export const EnhancvHeader: React.FC<TemplateHeaderProps> = (p) => {
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
        <ContactRow {...p} cls="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-[11px] text-slate-600"/>
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
