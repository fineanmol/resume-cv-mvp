import React from 'react';
import { EditableText as E } from './EditableText';
import { BulletList } from './BulletList';
import { formatMarkdownBold } from '../../utils/markdown';

type BulletStyle = 'disc' | 'circle' | 'square' | 'dash' | 'arrow' | 'number' | 'none';

export interface SummaryContentProps {
  value: string;
  isEditable: boolean;
  editableClass: string;
  onSave: (updated: string) => void;
  className?: string;
  bulletStyle?: BulletStyle;
  align?: 'left' | 'center' | 'right' | 'justify';
  showBullets?: boolean;
}

/** Summary body — bullet list or plain paragraph based on section layout setting. */
export const SummaryContent: React.FC<SummaryContentProps> = ({
  value,
  isEditable,
  editableClass,
  onSave,
  className = '',
  bulletStyle = 'disc',
  align = 'justify',
  showBullets = true,
}) => {
  if (showBullets) {
    return (
      <BulletList
        field="summary"
        bullets={value || ''}
        isEditable={isEditable}
        editableClass={editableClass}
        onBulletChange={onSave}
        className={className}
        bulletStyle={bulletStyle}
        align={align}
        prefixId="summary"
      />
    );
  }

  const paragraphValue = value ? value.replace(/\n+/g, ' ').trim() : '';

  return (
    <E
      tag="p"
      field="summary"
      value={paragraphValue}
      isEditable={isEditable}
      editableClass={editableClass}
      className={className}
      onSave={onSave}
      dangerousInnerHtml={isEditable ? undefined : formatMarkdownBold(paragraphValue)}
    />
  );
};
