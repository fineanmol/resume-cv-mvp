import React from 'react';

export const LanguageBubbles: React.FC<{ count: number; activeColor: string }> = ({ count, activeColor }) => (
  <div className="flex gap-1 items-center flex-shrink-0 font-sans">
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className="w-2.5 h-2.5 rounded-full border"
        style={{
          backgroundColor: i <= count ? activeColor : 'transparent',
          borderColor: i <= count ? activeColor : '#cbd5e1',
        }}
      />
    ))}
  </div>
);
