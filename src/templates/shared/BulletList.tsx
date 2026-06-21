import { useState, useRef, useLayoutEffect, useContext } from 'react';
import {
  createContentEditableBulletKeyDownHandler,
  normalizeBulletText,
  parseEditableBullets,
} from '../../hooks/useBulletKeyboard';
import { splitIntoBullets } from '../../utils/bullets';
import { formatMarkdownInline, htmlToMarkdown } from '../../utils/markdown';
import type { EditableFieldKey } from '../../config/fieldPlaceholders';
import { getFieldPlaceholder } from '../../config/fieldPlaceholders';
import { isEditableEmpty } from '../../utils/editableText';
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
  // Guard against re-entrant innerHTML writes: some browsers fire blur+focus
  // when innerHTML is written on a focused contentEditable element, which
  // triggers onFocus a second time before the first call has finished. We
  // track which bullet index has been initialised for the current focus
  // session and skip the write on any subsequent onFocus calls.
  const htmlInitializedRef = useRef<number | null>(null);

  // Stable Map from bullet index → span DOM element for imperative innerHTML writes.
  const spanRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  // Stable ref to lines so the layout effect doesn't need lines in its deps
  // (lines is a new array every render but its source of truth is bullets).
  const linesRef = useRef<string[]>(lines);
  linesRef.current = lines;

  // Sync innerHTML for every non-focused bullet whenever the bullets string changes.
  // useLayoutEffect ensures the DOM is updated before the browser paints, so
  // there is no flash of empty content on mount or after external updates.
  // Also handles pending focus moves synchronously so a rapid second Enter
  // fires on the newly-focused span (not the old one).
  useLayoutEffect(() => {
    spanRefs.current.forEach((el, idx) => {
      // Only skip if the user is actively typing in this exact span
      // (htmlInitializedRef tracks the current live-editing session).
      // After structural ops (Enter/Backspace), htmlInitializedRef is reset to
      // null so all spans — including the formerly-focused one — get refreshed.
      if (document.activeElement === el && htmlInitializedRef.current === idx) {
        return;
      }
      el.innerHTML = formatMarkdownInline(linesRef.current[idx] ?? '');
    });

    // Move focus synchronously (before paint) so a rapid second Enter lands
    // on the correct new span rather than the still-focused original one.
    const targetIdx = pendingFocusIdxRef.current;
    if (targetIdx !== null) {
      pendingFocusIdxRef.current = null;
      const el = spanRefs.current.get(targetIdx);
      if (el && document.activeElement !== el) {
        el.focus();
      }
    }
  }, [bullets]); // eslint-disable-line react-hooks/exhaustive-deps


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
            {isEditable ? (
              // Single persistent span — no DOM swap when focus changes.
              // innerHTML is managed imperatively (useLayoutEffect + onFocus) so
              // React never tracks or reconciles it, preventing execCommand
              // formatting from being wiped on re-renders.
              <span
                ref={(el) => {
                  if (el) spanRefs.current.set(bIdx, el);
                  else spanRefs.current.delete(bIdx);
                }}
                data-bullet-id={`${prefixId}-${bIdx}`}
                data-placeholder={resolvedPlaceholder}
                data-empty={isEmpty ? 'true' : undefined}
                className={`min-w-0 flex-1 text-${align} ${editableClass}`}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onFocus={(e) => {
                  const el = e.currentTarget;
                  // Guard: only initialise innerHTML once per focus session.
                  // Some browsers re-fire focus after an innerHTML write on a
                  // focused element; without this guard that creates an infinite
                  // loop: onFocus → innerHTML → blur → focus → onFocus → …
                  if (htmlInitializedRef.current !== bIdx) {
                    htmlInitializedRef.current = bIdx;
                    el.innerHTML = bullet ? formatMarkdownInline(bullet) : '';
                    if (isEditableEmpty(el.textContent ?? '')) el.innerHTML = '';
                    // Place cursor at end.
                    const sel = window.getSelection();
                    if (sel) {
                      const range = document.createRange();
                      range.selectNodeContents(el);
                      range.collapse(false);
                      sel.removeAllRanges();
                      sel.addRange(range);
                    }
                  }
                  // Safe to call here: span already exists in the DOM, so the
                  // resulting re-render only updates marker visibility — no node
                  // is unmounted or remounted.
                  setFocusedBullet(bIdx);
                }}
                onInput={(e) => {
                  // Keep data-empty in sync so the CSS placeholder hides while typing
                  const el = e.currentTarget;
                  if (el.textContent?.replace(/\u200B/g, '').trim()) {
                    el.removeAttribute('data-empty');
                  } else {
                    el.setAttribute('data-empty', 'true');
                  }
                }}
                onBlur={(e) => {
                  // Clear the init guard so the next focus session re-populates innerHTML.
                  htmlInitializedRef.current = null;
                  if (suppressBlurSaveRef.current) {
                    suppressBlurSaveRef.current = false;
                    return;
                  }
                  setFocusedBullet(null);
                  // Convert live HTML → markdown so bold/italic/underline persists.
                  const md = normalizeBulletText(htmlToMarkdown(e.currentTarget.innerHTML));
                  const updated = [...lines];
                  updated[bIdx] = md;
                  if (!md.trim()) {
                    e.currentTarget.innerHTML = '';
                  }
                  onBulletChange(updated.join('\n'));
                }}
                onKeyDown={(e) => {
                  // Intercept formatting shortcuts before the structural handler
                  // so execCommand applies HTML tags that htmlToMarkdown converts.
                  const isMod = e.ctrlKey || e.metaKey;
                  if (isMod && (e.key === 'b' || e.key === 'i' || e.key === 'u')) {
                    e.preventDefault();
                    if (e.key === 'b') document.execCommand('bold');
                    else if (e.key === 'i') document.execCommand('italic');
                    else document.execCommand('underline');
                    return;
                  }
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
                    htmlInitializedRef.current = null; // structural op — allow full refresh
                    setFocusedBullet(bIdx + 1);
                  }
                  handler(e);
                  if (e.key === 'Backspace' && e.defaultPrevented) {
                    suppressBlurSaveRef.current = true;
                    htmlInitializedRef.current = null; // structural op — allow full refresh
                  }
                }}
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
