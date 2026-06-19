import React from 'react';

/** Soft dashed arcs framing the profile photo — minimal, symmetric, stays behind the avatar. */
export const HeaderWaveLines: React.FC<{
  brandColor: string;
  accentColor2?: string;
}> = ({
  brandColor,
  accentColor2 = '#10b981',
}) => (
  <svg
    className="profile-photo-waves absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible pointer-events-none pdf-keep z-0"
    data-pdf-keep
    aria-hidden
    fill="none"
    preserveAspectRatio="xMidYMid meet"
    style={{
      width: 200,
      height: 120,
      opacity: 0.52,
    }}
    viewBox="0 0 200 120"
  >
    <path
      d="M 12 34 Q 100 20 188 34"
      stroke={accentColor2}
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeOpacity={0.75}
      strokeDasharray="5 10"
      className="photo-wave-dash"
    />
    <path
      d="M 12 60 Q 100 46 188 60"
      stroke={brandColor}
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeOpacity={0.5}
      strokeDasharray="4 9"
    />
    <path
      d="M 12 86 Q 100 100 188 86"
      stroke={accentColor2}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeOpacity={0.6}
      strokeDasharray="5 10"
      className="photo-wave-dash-slow"
    />
  </svg>
);
