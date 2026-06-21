import React, { useLayoutEffect, useRef, useState } from 'react';
import type { EditableFieldKey } from '../../config/fieldPlaceholders';
import { getFieldPlaceholder } from '../../config/fieldPlaceholders';
import { isEditableEmpty, normalizeEditableText } from '../../utils/editableText';
import { formatMarkdownInline, htmlToMarkdown } from '../../utils/markdown';

export interface EditableTextProps {
  value: string;
  className?: string;
  onSave: (val: string) => void;
  isEditable: boolean;
  editableClass: string;
  tag?: 'span' | 'p' | 'strong' | 'div' | 'h1' | 'h2' | 'h3' | 'a';
  style?: React.CSSProperties;
  dangerousInnerHtml?: string;
  href?: string;
  /** Section field key — resolves placeholder text automatically. */
  field?: EditableFieldKey;
  placeholder?: string;
}

export const EditableText = React.memo<EditableTextProps>(function EditableText({
  value, className, onSave, isEditable, editableClass, tag = 'span', style, dangerousInnerHtml, href, field, placeholder,
}) {
  const resolvedPlaceholder = placeholder ?? (field ? getFieldPlaceholder(field) : undefined);
  const [isEmpty, setIsEmpty] = useState(() => isEditableEmpty(value));
  // Keep a stable ref to `value` so the onFocus/onBlur closures stay current
  // without re-mounting the focused element on every parent re-render.
  const valueRef = useRef(value);
  valueRef.current = value;
  // Guard against re-entrant innerHTML writes (same issue as BulletList):
  // writing innerHTML on a focused element can trigger a browser blur+focus
  // cycle; this ref ensures we only initialise the element once per session.
  const htmlInitializedRef = useRef(false);
  // Stable ref to the DOM element for imperative innerHTML sync.
  const elRef = useRef<HTMLElement | null>(null);

  // Sync innerHTML when value changes externally but the element is not focused.
  // useLayoutEffect ensures the update happens before paint, avoiding a flash.
  useLayoutEffect(() => {
    setIsEmpty(isEditableEmpty(value));
    const el = elRef.current;
    if (el && document.activeElement !== el) {
      el.innerHTML = formatMarkdownInline(value ?? '');
    }
  }, [value]);

  // Intercept Ctrl/Cmd+B/I/U: apply rich-text formatting via execCommand so
  // it produces HTML tags (<b>, <i>, <u>) that htmlToMarkdown converts on blur,
  // rather than letting the browser silently apply inline styles that get lost.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const isMod = e.ctrlKey || e.metaKey;
    if (!isMod) return;
    if (e.key === 'b') { e.preventDefault(); document.execCommand('bold'); }
    else if (e.key === 'i') { e.preventDefault(); document.execCommand('italic'); }
    else if (e.key === 'u') { e.preventDefault(); document.execCommand('underline'); }
  };

  const Tag = tag;
  if (isEditable) {
    // Single persistent element — no DOM swap when focus changes.
    // innerHTML is managed imperatively (useLayoutEffect + onFocus) so React
    // never tracks or reconciles it, preventing execCommand formatting from
    // being wiped on re-renders.
    return (
      <Tag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={((el: HTMLElement | null) => { elRef.current = el; }) as any}
        data-href={href}
        data-placeholder={resolvedPlaceholder}
        data-empty={isEmpty ? 'true' : undefined}
        className={`${className || ''} ${editableClass}`}
        style={style}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onFocus={(e) => {
          const el = e.currentTarget;
          // Only initialise innerHTML once per focus session to prevent the
          // blur+focus re-entry loop (see htmlInitializedRef comment above).
          if (!htmlInitializedRef.current) {
            htmlInitializedRef.current = true;
            el.innerHTML = formatMarkdownInline(valueRef.current ?? '');
            const empty = isEditableEmpty(el.textContent ?? '');
            if (empty) el.innerHTML = '';
            setIsEmpty(empty);
            // Place cursor at end so the user starts typing from the right side.
            const sel = window.getSelection();
            if (sel) {
              const range = document.createRange();
              range.selectNodeContents(el);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
        }}
        onInput={(e) => {
          setIsEmpty(isEditableEmpty(e.currentTarget.textContent ?? ''));
        }}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          // Clear the init guard so the next focus session re-populates innerHTML.
          htmlInitializedRef.current = false;
          // Convert the live HTML back to markdown so formatting (bold, italic,
          // underline) applied via execCommand is persisted as **…**, *…*, __…__.
          const txt = normalizeEditableText(htmlToMarkdown(e.currentTarget.innerHTML));
          const empty = isEditableEmpty(txt);
          if (empty) {
            e.currentTarget.innerHTML = '';
          }
          setIsEmpty(empty);
          if (txt !== value) onSave(txt);
        }}
      />
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${className || ''} hover:underline cursor-pointer`} style={style}>
        {value}
      </a>
    );
  }
  if (dangerousInnerHtml !== undefined) {
    return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: dangerousInnerHtml }} />;
  }
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: formatMarkdownInline(value ?? '') }} />;
});
