import React from 'react';

export const getLanguageBubbleCount = (levelText: string): number => {
  const l = levelText.toLowerCase();
  if (l.includes('native') || l.includes('fluent') || l.includes('bilingual') || l.includes('5')) return 5;
  if (l.includes('proficient') || l.includes('advanced') || l.includes('4') || l.includes('c1') || l.includes('c2')) return 4;
  if (l.includes('conversational') || l.includes('intermediate') || l.includes('upper') || l.includes('3') || l.includes('b1') || l.includes('b2')) return 3;
  if (l.includes('beginner') || l.includes('elementary') || l.includes('basic') || l.includes('1') || l.includes('2') || l.includes('a1') || l.includes('a2')) return 2;
  return 3;
};

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
