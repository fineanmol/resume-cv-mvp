import React from 'react';
import type { PhotoShape } from '../../utils/photoShape';
import { getPhotoShapeClass } from '../../utils/photoShape';

interface PhotoDecorativeFrameProps {
  shape: PhotoShape;
  /** @deprecated use brandColor — kept for call-site compat */
  accentColor?: string;
  brandColor?: string;
}

/**
 * Subtle dashed ring hugging the profile photo (designer template).
 * Uses outline + offset so dots stay even on circles and rounded shapes.
 */
export const PhotoDecorativeFrame: React.FC<PhotoDecorativeFrameProps> = ({
  shape,
  brandColor = '#314855',
}) => {
  const shapeClass = getPhotoShapeClass(shape);

  return (
    <div
      className={`absolute inset-0 ${shapeClass} pointer-events-none`}
      style={{
        outline: `1px dashed ${brandColor}66`,
        outlineOffset: '5px',
      }}
      aria-hidden
    />
  );
};
