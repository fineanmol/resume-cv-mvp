import { describe, it, expect } from 'vitest';
import {
  resolvePhotoShape,
  getPhotoShapeClass,
  photoShapePatch,
} from '../utils/photoShape';

describe('photoShape', () => {
  it('prefers photoShape when set', () => {
    expect(resolvePhotoShape({ photoShape: 'squircle', roundPhoto: true })).toBe('squircle');
  });

  it('falls back to roundPhoto boolean', () => {
    expect(resolvePhotoShape({ roundPhoto: false })).toBe('rounded');
    expect(resolvePhotoShape({ roundPhoto: true })).toBe('circle');
  });

  it('maps shapes to tailwind classes', () => {
    expect(getPhotoShapeClass('circle')).toBe('rounded-full');
    expect(getPhotoShapeClass('square')).toBe('rounded-sm');
  });

  it('syncs roundPhoto when patching photoShape', () => {
    expect(photoShapePatch('circle')).toEqual({ photoShape: 'circle', roundPhoto: true });
    expect(photoShapePatch('square')).toEqual({ photoShape: 'square', roundPhoto: false });
  });
});
