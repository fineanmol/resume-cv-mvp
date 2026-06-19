import React from 'react';
import type { PhotoShape } from '../../utils/photoShape';

interface PhotoDecorativeFrameProps {
  shape: PhotoShape;
  brandColor?: string;
}

function shapeRx(shape: PhotoShape): number {
  switch (shape) {
    case 'circle':
      return 50;
    case 'rounded':
      return 14;
    case 'squircle':
      return 32;
    case 'square':
    default:
      return 4;
  }
}

/** Minimal animated dashed ring in the gutter outside the profile photo. */
export const PhotoDecorativeFrame: React.FC<PhotoDecorativeFrameProps> = ({
  shape,
  brandColor = '#314855',
}) => {
  const rx = shapeRx(shape);
  const isCircle = shape === 'circle';

  return (
    <svg
      className="profile-photo-frame absolute inset-0 w-full h-full pointer-events-none pdf-keep overflow-visible z-0"
      data-pdf-keep
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
    >
      {isCircle ? (
        <circle
          cx="50"
          cy="50"
          r="49.5"
          stroke={brandColor}
          strokeWidth="1.25"
          strokeDasharray="4 4"
          strokeOpacity="0.6"
          className="photo-frame-dash"
        />
      ) : (
        <rect
          x="1.25"
          y="1.25"
          width="97.5"
          height="97.5"
          rx={rx}
          stroke={brandColor}
          strokeWidth="1.25"
          strokeDasharray="4 4"
          strokeOpacity="0.6"
          className="photo-frame-dash"
        />
      )}
    </svg>
  );
};
