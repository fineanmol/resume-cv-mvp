import { useState } from 'react';
import {
  createContentEditableBulletKeyDownHandler,
  normalizeBulletText,
  parseEditableBullets,
} from '../../hooks/useBulletKeyboard';
import { splitIntoBullets } from '../../utils/bullets';
import { formatMarkdownBold } from '../../utils/markdown';

export function BulletList({
  bullets,
  isEditable,
  editableClass,
  onBulletChange,
  className = '',
  bulletStyle = 'disc',
  brandColor,
  align = 'left',
  prefixId = 'bullet',
}: {
  bullets: string;
  isEditable: boolean;
  editableClass: string;
  onBulletChange: (updated: string) => void;
  className?: string;
  bulletStyle?: 'disc' | 'circle' | 'square' | 'dash' | 'arrow' | 'number' | 'none';
  brandColor?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  prefixId?: string;
}) {
  const lines = isEditable ? parseEditableBullets(bullets) : splitIntoBullets(bullets);

  // Track which bullet index is currently focused so we can show the marker
  // even when the content is empty (gives the user a visual anchor to type into).
  const [focusedBullet, setFocusedBullet] = useState<number | null>(null);

  if (!lines.length) return null;

  const getMarker = (index: number) => {
    switch (bulletStyle) {
      case 'none':
        return null;
      case 'dash':
        return <span style={{ color: brandColor }} className="select-none font-semibold">—</span>;
      case 'arrow':
        return <span style={{ color: brandColor }} className="select-none text-[8px] align-middle">➤</span>;
      case 'number':
        return <span style={{ color: brandColor }} className="select-none font-semibold text-[10px]">{index + 1}.</span>;
      case 'circle':
        return <span style={{ color: brandColor }} className="select-none text-[8px] align-middle">○</span>;
      case 'square':
        return <span style={{ color: brandColor }} className="select-none text-[7px] align-middle">■</span>;
      case 'disc':
      default:
        return <span style={{ color: brandColor }} className="select-none text-[8px] align-middle">●</span>;
    }
  };

  const hasCustomMarker = bulletStyle !== 'none';

  return (
    <ul className={`list-none pl-0 space-y-1 ${className}`}>
      {lines.map((bullet, bIdx) => {
        const isEmpty = !bullet.trim();
        // In read-only / PDF mode, skip blank bullets entirely
        if (!isEditable && isEmpty) return null;

        // Show marker when: (a) line has content, OR (b) editable and this bullet is focused
        const showMarker = hasCustomMarker && (!isEmpty || (isEditable && focusedBullet === bIdx));
        // Empty-and-unfocused editable rows are visually hidden and collapse to zero height
        // so the gap between real bullets is not affected.
        const isHiddenRow = isEditable && isEmpty && focusedBullet !== bIdx;

        return (
          <li
            key={`${prefixId}-${lines.length}-${bIdx}`}
            className="flex items-start"
            style={isHiddenRow ? { height: 0, overflow: 'hidden', margin: 0 } : undefined}
          >
            {showMarker && (
              <span contentEditable={false} className="flex-shrink-0 mt-[4px] select-none flex items-center justify-start text-[10px] w-4">
                {getMarker(bIdx)}
              </span>
            )}
            {/* When editable and empty and not focused, still render the span (invisible placeholder)
                so the user can click into it and start typing. */}
            {!showMarker && isEditable && isEmpty && (
              <span contentEditable={false} className="flex-shrink-0 w-4" />
            )}
            {isEditable ? (
              <span
                data-bullet-id={`${prefixId}-${bIdx}`}
                className={`flex-1 min-w-0 text-${align} ${editableClass}`}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onFocus={() => setFocusedBullet(bIdx)}
                onBlur={(e) => {
                  setFocusedBullet(null);
                  const updated = [...lines];
                  updated[bIdx] = normalizeBulletText(e.currentTarget.textContent ?? '');
                  onBulletChange(updated.join('\n'));
                }}
                onKeyDown={createContentEditableBulletKeyDownHandler({
                  bullets: lines,
                  bIdx,
                  prefixId,
                  onChange: onBulletChange,
                })}
              >
                {bullet || '\u200B'}
              </span>
            ) : (
              <span
                className={`flex-1 min-w-0 text-${align}`}
                dangerouslySetInnerHTML={{ __html: formatMarkdownBold(bullet) }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
