import React from 'react';
import type { LayoutSettings } from '../../types';
import { AvatarCircleEditable } from '../TemplateHeader';

export const ProfilePhotoWithWaves: React.FC<{
  avatar: string;
  name?: string;
  brandColor: string;
  accentColor2?: string;
  isEditable?: boolean;
  onAvatarChange?: (url: string) => void;
  layoutSettings?: LayoutSettings;
  onLayoutSettingsChange?: (settings: Partial<LayoutSettings>) => void;
}> = ({
  avatar,
  name = 'Profile',
  brandColor,
  accentColor2 = '#eab308',
  isEditable = false,
  onAvatarChange,
  layoutSettings,
  onLayoutSettingsChange,
}) => (
  <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
    <svg className="absolute inset-0 w-full h-full opacity-30 overflow-visible pointer-events-none" viewBox="0 0 100 100" fill="none">
      <path d="M-20,40 Q15,15 50,40 T120,40" stroke={accentColor2} strokeWidth="1" strokeDasharray="3 3" />
      <path d="M-20,50 Q25,30 60,50 T120,50" stroke={brandColor} strokeWidth="0.75" />
      <path d="M-20,60 Q35,45 70,60 T120,60" stroke={accentColor2} strokeWidth="0.5" />
    </svg>

    <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#eab308] opacity-75 animate-[spin_180s_linear_infinite] pointer-events-none" />

    <AvatarCircleEditable
      src={avatar}
      name={name}
      size="w-24 h-24"
      border="#ffffff"
      isEditable={isEditable}
      onAvatarChange={onAvatarChange}
      layoutSettings={layoutSettings}
      onLayoutSettingsChange={onLayoutSettingsChange}
    />
  </div>
);
