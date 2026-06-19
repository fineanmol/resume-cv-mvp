import { useState, useRef, useEffect, useContext } from 'react';
import {
  createContentEditableBulletKeyDownHandler,
  normalizeBulletText,
  parseEditableBullets,
} from '../../hooks/useBulletKeyboard';
import { splitIntoBullets } from '../../utils/bullets';
import { formatMarkdownBold } from '../../utils/markdown';
import type { EditableFieldKey } from '../../config/fieldPlaceholders';
import { getFieldPlaceholder } from '../../config/fieldPlaceholders';
import { clearEditableIfEmpty } from '../../utils/editableText';
import { ActiveItemContext } from './ActiveItemContext';

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
  field,
  placeholder,
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
  field?: EditableFieldKey;
  placeholder?: string;
}) {
  const resolvedPlaceholder = placeholder ?? (field ? getFieldPlaceholder(field) : undefined);
  const isParentItemActive = useContext(ActiveItemContext);
  const lines = isEditable ? parseEditableBullets(bullets) : splitIntoBullets(bullets);

  // Track which bullet index is currently focused so we can show the marker
  // even when the content is empty (gives the user a visual anchor to type into).
  const [focusedBullet, setFocusedBullet] = useState<number | null>(null);
  // Enter/Backspace handlers save via onChange; skip the blur save that would overwrite with stale lines.
  const suppressBlurSaveRef = useRef(false);
  const pendingFocusIdxRef = useRef<number | null>(null);

  useEffect(() => {
    const targetIdx = pendingFocusIdxRef.current;
    if (targetIdx === null) return;
    pendingFocusIdxRef.current = null;

    const focusTarget = () => {
      const el = document.querySelector(
        `[data-bullet-id="${prefixId}-${targetIdx}"]`,
      ) as HTMLElement | null;
      if (!el) return false;
      el.focus();
      setFocusedBullet(targetIdx);
      return true;
    };

    if (focusTarget()) return;
    requestAnimationFrame(() => {
      if (!focusTarget()) {
        requestAnimationFrame(focusTarget);
      }
    });
  }, [bullets, prefixId]);

  if (!lines.length) return null;

  const getMarker = (index: number) => {
    switch (bulletStyle) {
      case 'none':
        return null;
      case 'dash':
        return <span style={{ color: brandColor }} className="select-none font-semibold">—</span>;
      case 'arrow':
        return <span style={{ color: brandColor }} className="select-none text-[8px]">➤</span>;
      case 'number':
        return <span style={{ color: brandColor }} className="select-none font-semibold text-[10px]">{index + 1}.</span>;
      case 'circle':
        return <span style={{ color: brandColor }} className="select-none text-[8px]">○</span>;
      case 'square':
        return <span style={{ color: brandColor }} className="select-none text-[7px]">■</span>;
      case 'disc':
      default:
        return <span style={{ color: brandColor }} className="select-none text-[8px]">●</span>;
    }
  };

  const hasCustomMarker = bulletStyle !== 'none';

  return (
    <ul className={`list-none pl-0 space-y-1 ${className}`}>
      {lines.map((bullet, bIdx) => {
        const isEmpty = !bullet.trim();
        // In read-only / PDF mode, skip blank bullets entirely
        if (!isEditable && isEmpty) return null;

        // Show marker when: line has content, bullet is focused, or parent entry is active
        const showMarker = hasCustomMarker && (!isEmpty || (isEditable && (focusedBullet === bIdx || isParentItemActive)));
        // Empty-and-unfocused editable rows collapse unless the parent entry is active
        const isHiddenRow = isEditable && isEmpty && focusedBullet !== bIdx && !isParentItemActive;
        const showPlaceholder = isEditable && isEmpty && (focusedBullet === bIdx || isParentItemActive);

        return (
          <li
            key={`${prefixId}-${bIdx}`}
            className={hasCustomMarker ? 'grid grid-cols-[1rem_1fr] gap-x-1.5 items-baseline' : ''}
            style={isHiddenRow ? { height: 0, overflow: 'hidden', margin: 0 } : undefined}
          >
            {hasCustomMarker && showMarker && (
              <span contentEditable={false} className="select-none flex items-center justify-center leading-snug text-[10px]">
                {getMarker(bIdx)}
              </span>
            )}
            {/* When editable and empty and not focused, still render the span (invisible placeholder)
                so the user can click into it and start typing. */}
            {hasCustomMarker && !showMarker && isEditable && isEmpty && (
              <span contentEditable={false} />
            )}
            {isEditable ? (
              <span
                data-bullet-id={`${prefixId}-${bIdx}`}
                data-placeholder={resolvedPlaceholder}
                data-empty={isEmpty ? 'true' : undefined}
                className={`min-w-0 text-${align} ${hasCustomMarker ? 'col-start-2' : ''} ${editableClass}`}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onFocus={(e) => {
                  clearEditableIfEmpty(e.currentTarget);
                  setFocusedBullet(bIdx);
                }}
                onBlur={(e) => {
                  if (suppressBlurSaveRef.current) {
                    suppressBlurSaveRef.current = false;
                    return;
                  }
                  setFocusedBullet(null);
                  const updated = [...lines];
                  updated[bIdx] = normalizeBulletText(e.currentTarget.textContent ?? '');
                  if (!updated[bIdx].trim()) {
                    e.currentTarget.innerHTML = '';
                  }
                  onBulletChange(updated.join('\n'));
                }}
                onKeyDown={(e) => {
                  const handler = createContentEditableBulletKeyDownHandler({
                    bullets: lines,
                    bIdx,
                    prefixId,
                    onChange: onBulletChange,
                    onEnter: (nextIdx) => {
                      pendingFocusIdxRef.current = nextIdx;
                    },
                  });
                  if (e.key === 'Enter') {
                    suppressBlurSaveRef.current = true;
                    setFocusedBullet(bIdx + 1);
                  }
                  handler(e);
                  if (e.key === 'Backspace' && e.defaultPrevented) {
                    suppressBlurSaveRef.current = true;
                  }
                }}
              >
                {showPlaceholder ? '' : (bullet || '\u200B')}
              </span>
            ) : (
              <span
                className={`min-w-0 text-${align} ${hasCustomMarker ? 'col-start-2' : ''}`}
                dangerouslySetInnerHTML={{ __html: formatMarkdownBold(bullet) }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
