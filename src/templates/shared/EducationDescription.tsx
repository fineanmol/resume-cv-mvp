import React from 'react';
import { BulletList } from './BulletList';
import { mergeEducationBullets, parseEducationGrade } from './parseEducationGrade';

type BulletStyle = 'disc' | 'circle' | 'square' | 'dash' | 'arrow' | 'number' | 'none';

export interface EducationDescriptionProps {
  bullets: string;
  isEditable: boolean;
  editableClass: string;
  onBulletChange: (updated: string) => void;
  prefixId: string;
  className?: string;
  bulletStyle?: BulletStyle;
  brandColor?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  showGpa?: boolean;
  showBullets?: boolean;
  /** Section field key — resolves bullet placeholder text automatically. */
  field?: import('../../config/fieldPlaceholders').EditableFieldKey;
  splitGpa?: boolean;
}

export const EducationDescription: React.FC<EducationDescriptionProps> = ({
  bullets,
  isEditable,
  editableClass,
  onBulletChange,
  prefixId,
  className = '',
  bulletStyle = 'disc',
  brandColor,
  align = 'left',
  showGpa = true,
  showBullets = true,
  field = 'education.bullets',
  splitGpa = false,
}) => {
  const { gradeText, remaining } = parseEducationGrade(bullets);

  if (splitGpa) {
    if (!showBullets) return null;
    return (
      <BulletList
        bullets={remaining}
        isEditable={isEditable}
        editableClass={editableClass}
        onBulletChange={(updated) => onBulletChange(mergeEducationBullets(bullets, updated))}
        className={className}
        bulletStyle={bulletStyle}
        brandColor={brandColor}
        align={align}
        prefixId={prefixId}
        field={field}
      />
    );
  }

  const gpaContent = showGpa ? gradeText : '';
  const bulletContent = showBullets ? remaining : '';
  const bulletsDisplay = [gpaContent, bulletContent].filter(Boolean).join('\n');

  if (!bulletsDisplay && !(isEditable && showBullets)) return null;

  return (
    <BulletList
      bullets={bulletsDisplay}
      isEditable={isEditable}
      editableClass={editableClass}
      onBulletChange={onBulletChange}
      className={className}
      bulletStyle={bulletStyle}
      brandColor={brandColor}
      align={align}
      prefixId={prefixId}
      field={field}
    />
  );
};
