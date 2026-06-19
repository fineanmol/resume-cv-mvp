import React from 'react';
import type { LayoutSettings } from '../../types';
import { resolvePhotoShape } from '../../utils/photoShape';
import { AvatarCircleEditable } from '../TemplateHeader';
import { HeaderWaveLines } from './HeaderWaveLines';
import { PhotoDecorativeFrame } from './PhotoDecorativeFrame';

/** Gap between photo edge and dashed ring (px) */
const FRAME_GAP = 3;

export const ProfilePhotoWithWaves: React.FC<{
  avatar: string;
  name?: string;
  brandColor: string;
  accentColor2?: string;
  isEditable?: boolean;
  onAvatarChange?: (url: string) => void;
  layoutSettings?: LayoutSettings;
  onLayoutSettingsChange?: (settings: Partial<LayoutSettings>) => void;
  /** Tailwind size classes for the photo, e.g. w-32 h-32 */
  size?: string;
}> = ({
  avatar,
  name = 'Profile',
  brandColor,
  accentColor2,
  isEditable = false,
  onAvatarChange,
  layoutSettings,
  onLayoutSettingsChange,
  size = 'w-32 h-32',
}) => {
  const photoShape = resolvePhotoShape(layoutSettings);

  return (
    <div
      className={`relative flex-shrink-0 box-content overflow-visible z-[2] ${size}`}
      style={{ padding: FRAME_GAP }}
    >
      <HeaderWaveLines brandColor={brandColor} accentColor2={accentColor2} />
      <PhotoDecorativeFrame shape={photoShape} brandColor={brandColor} />
      <div className={`relative z-[1] ${size}`}>
        <AvatarCircleEditable
          src={avatar}
          name={name}
          size={size}
          border="transparent"
          isEditable={isEditable}
          onAvatarChange={onAvatarChange}
          layoutSettings={layoutSettings}
          onLayoutSettingsChange={onLayoutSettingsChange}
        />
      </div>
    </div>
  );
};
