import type { LayoutSettings } from '../types';

export type PhotoShape = 'circle' | 'rounded' | 'square' | 'squircle';

export const PHOTO_SHAPES: { id: PhotoShape; label: string; previewClass: string }[] = [
  { id: 'circle', label: 'Circle', previewClass: 'rounded-full' },
  { id: 'rounded', label: 'Rounded', previewClass: 'rounded-lg' },
  { id: 'square', label: 'Square', previewClass: 'rounded-sm' },
  { id: 'squircle', label: 'Squircle', previewClass: 'rounded-[32%]' },
];

export function resolvePhotoShape(
  settings?: Pick<LayoutSettings, 'photoShape' | 'roundPhoto'>,
): PhotoShape {
  if (settings?.photoShape) return settings.photoShape;
  return settings?.roundPhoto === false ? 'rounded' : 'circle';
}

export function getPhotoShapeClass(shape: PhotoShape): string {
  switch (shape) {
    case 'circle':
      return 'rounded-full';
    case 'rounded':
      return 'rounded-xl';
    case 'square':
      return 'rounded-sm';
    case 'squircle':
      return 'rounded-[32%]';
    default:
      return 'rounded-full';
  }
}

export function photoShapePatch(shape: PhotoShape): Pick<LayoutSettings, 'photoShape' | 'roundPhoto'> {
  return { photoShape: shape, roundPhoto: shape === 'circle' };
}
