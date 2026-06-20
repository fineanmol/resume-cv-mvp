import React from 'react';
import { EditableText } from '../shared/EditableText';
import { HeaderWrapper } from '../shared/HeaderWrapper';
import { AvatarCircleEditable } from '../shared/AvatarCircleEditable';
import { ContactRow } from '../shared/ContactRow';
import type { TemplateHeaderProps } from './types';

export const BannerHeader: React.FC<TemplateHeaderProps> = (p) => {
  const showPhoto = p.layoutSettings?.showPhoto ?? true;
  const showTitle = p.layoutSettings?.showTitle ?? true;
  const uppercaseName = p.layoutSettings?.uppercaseName ?? false;
  const nameClassName = uppercaseName ? 'uppercase' : '';
  const nameStyle: React.CSSProperties = { fontFamily: p.headingFontCss };
  const lightEc = 'outline-none hover:bg-white/10 focus:bg-white/10 rounded px-1 -mx-1 transition';

  return (
    <HeaderWrapper
      isEditable={p.isEditable}
      layoutSettings={p.layoutSettings}
      onLayoutSettingsChange={p.onLayoutSettingsChange}
      className="text-white mb-5"
      style={{
        background: `linear-gradient(135deg, ${p.brandColor} 0%, ${p.brandColor}cc 100%)`,
        padding: '20px 28px 16px',
        margin: '0',
      }}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <EditableText value={p.name.value} onSave={p.name.onSave} isEditable={p.isEditable} editableClass={lightEc}
            className={`block text-3xl font-bold tracking-tight text-white ${nameClassName}`} style={nameStyle} />
          {showTitle && (
            <EditableText value={p.subtitle.value} onSave={p.subtitle.onSave} isEditable={p.isEditable} editableClass={lightEc}
              className="block text-sm text-white/80 mt-1 uppercase tracking-wide" />
          )}
        </div>
        {showPhoto && (
          <AvatarCircleEditable
            src={p.avatar}
            name={p.name.value}
            isEditable={p.isEditable}
            onAvatarChange={p.onAvatarChange}
            layoutSettings={p.layoutSettings}
            onLayoutSettingsChange={p.onLayoutSettingsChange}
          />
        )}
      </div>
      <ContactRow {...p} cls="flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-white/80 mt-2" />
    </HeaderWrapper>
  );
};
