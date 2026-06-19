import React from 'react';
import { getLanguageLevelFromBubbleCount } from '../../utils/languageLevel';

export interface LanguageBubblesProps {
  count: number;
  activeColor: string;
  isEditable?: boolean;
  onCountChange?: (count: number) => void;
}

export const LanguageBubbles: React.FC<LanguageBubblesProps> = ({
  count,
  activeColor,
  isEditable = false,
  onCountChange,
}) => (
  <div className="flex gap-1 items-center shrink-0 font-sans">
    {[1, 2, 3, 4, 5].map((i) => {
      const filled = i <= count;
      const style = {
        backgroundColor: filled ? activeColor : 'transparent',
        borderColor: filled ? activeColor : '#cbd5e1',
      };
      const bubbleClass = 'w-2.5 h-2.5 rounded-full border transition-colors';

      if (isEditable && onCountChange) {
        return (
          <button
            key={i}
            type="button"
            title={`Set to ${getLanguageLevelFromBubbleCount(i)}`}
            aria-label={`Proficiency ${i} of 5`}
            className={`${bubbleClass} edit-only cursor-pointer hover:scale-125 hover:opacity-90 p-0`}
            style={style}
            onClick={(e) => {
              e.stopPropagation();
              onCountChange(i);
            }}
          />
        );
      }

      return <span key={i} className={bubbleClass} style={style} />;
    })}
  </div>
);
