import React from 'react';

export const ProfilePhotoWithWaves: React.FC<{
  avatar: string;
  brandColor: string;
  accentColor2?: string;
}> = ({ avatar, brandColor, accentColor2 = '#eab308' }) => (
  <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
    <svg className="absolute inset-0 w-full h-full opacity-30 overflow-visible pointer-events-none" viewBox="0 0 100 100" fill="none">
      <path d="M-20,40 Q15,15 50,40 T120,40" stroke={accentColor2} strokeWidth="1" strokeDasharray="3 3" />
      <path d="M-20,50 Q25,30 60,50 T120,50" stroke={brandColor} strokeWidth="0.75" />
      <path d="M-20,60 Q35,45 70,60 T120,60" stroke={accentColor2} strokeWidth="0.5" />
    </svg>

    <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#eab308] opacity-75 animate-[spin_180s_linear_infinite]" />

    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-50 flex items-center justify-center">
      {avatar ? (
        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <span className="text-slate-300 text-3xl font-bold font-sans">?</span>
      )}
    </div>
  </div>
);
