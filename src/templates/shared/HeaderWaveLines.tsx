import React from 'react';

/** Subtle dashed curves from the page right margin inward toward the profile photo. */
export const HeaderWaveLines: React.FC<{
  brandColor: string;
  accentColor2?: string;
  /** Sheet right padding in mm — extends lines to the physical page edge */
  sheetPaddingRightMm?: number;
  /** Width of the photo column from the right (px), including border gutter */
  photoWidth?: number;
}> = ({
  brandColor,
  accentColor2 = '#10b981',
  sheetPaddingRightMm = 12,
  photoWidth = 152,
}) => (
  <svg
    className="profile-photo-waves absolute top-1/2 -translate-y-1/2 opacity-30 overflow-visible pointer-events-none pdf-keep z-0"
    data-pdf-keep
    aria-hidden
    fill="none"
    preserveAspectRatio="none"
    style={{
      right: `-${sheetPaddingRightMm}mm`,
      width: `calc(${photoWidth}px + ${sheetPaddingRightMm}mm)`,
      height: 88,
    }}
    viewBox="0 0 640 88"
  >
    <path
      d="M640,32 Q440,8 240,32 T48,36"
      stroke={accentColor2}
      strokeWidth="0.9"
      strokeDasharray="4 5"
      className="photo-wave-dash"
    />
    <path
      d="M640,48 Q420,26 220,48 T48,50"
      stroke={brandColor}
      strokeWidth="0.75"
      strokeDasharray="3 4"
      className="photo-wave-dash-slow"
    />
    <path
      d="M640,64 Q400,44 200,64 T48,66"
      stroke={accentColor2}
      strokeWidth="0.65"
      strokeDasharray="3 4"
      className="photo-wave-dash"
    />
  </svg>
);
