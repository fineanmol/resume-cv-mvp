import React, { useEffect, useState } from 'react';
import type { EditableFieldKey } from '../../config/fieldPlaceholders';
import { getFieldPlaceholder } from '../../config/fieldPlaceholders';
import { clearEditableIfEmpty, isEditableEmpty, normalizeEditableText } from '../../utils/editableText';
import { formatMarkdownInline } from '../../utils/markdown';

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
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setIsEmpty(isEditableEmpty(value));
  }, [value]);

  const Tag = tag;
  if (isEditable) {
    if (!isFocused) {
      return (
        <Tag
          data-href={href}
          data-placeholder={resolvedPlaceholder}
          data-empty={isEmpty ? 'true' : undefined}
          className={`${className || ''} ${editableClass}`}
          style={style}
          dangerouslySetInnerHTML={{ __html: formatMarkdownInline(value ?? '') }}
          onClick={() => setIsFocused(true)}
        />
      );
    }

    return (
      <Tag
        data-href={href}
        data-placeholder={resolvedPlaceholder}
        data-empty={isEmpty ? 'true' : undefined}
        className={`${className || ''} ${editableClass}`}
        style={style}
        contentEditable={true}
        suppressContentEditableWarning={true}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        onFocus={(e) => {
          const empty = clearEditableIfEmpty(e.currentTarget);
          setIsEmpty(empty);
        }}
        onInput={(e) => {
          setIsEmpty(isEditableEmpty(e.currentTarget.textContent ?? ''));
        }}
        onBlur={(e) => {
          const txt = normalizeEditableText(e.currentTarget.textContent ?? '');
          const empty = isEditableEmpty(txt);
          if (empty) {
            e.currentTarget.innerHTML = '';
          }
          setIsEmpty(empty);
          setIsFocused(false);
          if (txt !== value) onSave(txt);
        }}
      >
        {value}
      </Tag>
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
