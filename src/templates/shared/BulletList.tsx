import { useState, useRef, useEffect, useContext } from 'react';
import {
  createContentEditableBulletKeyDownHandler,
  normalizeBulletText,
  parseEditableBullets,
} from '../../hooks/useBulletKeyboard';
import { splitIntoBullets } from '../../utils/bullets';
import { formatMarkdownInline } from '../../utils/markdown';
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

  const markerColor = brandColor ?? 'currentColor';

  const getMarker = (index: number) => {
    const markerClass = 'select-none leading-snug';
    switch (bulletStyle) {
      case 'none':
        return null;
      case 'dash':
        return <span style={{ color: markerColor }} className={`${markerClass} font-semibold`}>—</span>;
      case 'arrow':
        return <span style={{ color: markerColor }} className={markerClass}>➤</span>;
      case 'number':
        return <span style={{ color: markerColor }} className={`${markerClass} font-semibold tabular-nums`}>{index + 1}.</span>;
      case 'circle':
        return <span style={{ color: markerColor }} className={markerClass}>○</span>;
      case 'square':
        return <span style={{ color: markerColor }} className={markerClass}>■</span>;
      case 'disc':
      default:
        return <span style={{ color: markerColor }} className={markerClass}>●</span>;
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
            className={hasCustomMarker ? 'flex gap-x-1.5 items-baseline' : ''}
            style={isHiddenRow ? { height: 0, overflow: 'hidden', margin: 0 } : undefined}
          >
            {hasCustomMarker && showMarker && (
              <span
                contentEditable={false}
                className="select-none shrink-0 w-4 text-center leading-snug self-baseline"
              >
                {getMarker(bIdx)}
              </span>
            )}
            {/* Reserve marker column width when editable and empty and not focused */}
            {hasCustomMarker && !showMarker && isEditable && isEmpty && (
              <span contentEditable={false} className="shrink-0 w-4" />
            )}
            {isEditable && focusedBullet === bIdx ? (
              <span
                data-bullet-id={`${prefixId}-${bIdx}`}
                data-placeholder={resolvedPlaceholder}
                data-empty={isEmpty ? 'true' : undefined}
                className={`min-w-0 flex-1 text-${align} ${editableClass}`}
                contentEditable={true}
                suppressContentEditableWarning={true}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
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
            ) : isEditable ? (
              <span
                data-bullet-id={`${prefixId}-${bIdx}`}
                data-placeholder={resolvedPlaceholder}
                data-empty={isEmpty ? 'true' : undefined}
                className={`min-w-0 flex-1 text-${align} ${editableClass}`}
                dangerouslySetInnerHTML={{ __html: formatMarkdownInline(bullet) }}
                onClick={() => setFocusedBullet(bIdx)}
              />
            ) : (
              <span
                className={`min-w-0 flex-1 text-${align}`}
                dangerouslySetInnerHTML={{ __html: formatMarkdownInline(bullet) }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
