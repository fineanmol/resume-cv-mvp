import React from 'react';
import type { PhotoShape } from '../../utils/photoShape';
import { getPhotoShapeClass } from '../../utils/photoShape';

interface PhotoDecorativeFrameProps {
  shape: PhotoShape;
  accentColor?: string;
  brandColor?: string;
}

/** Shape-aware accent frame for the designer profile photo — circle spins; others use static/pulse effects. */
export const PhotoDecorativeFrame: React.FC<PhotoDecorativeFrameProps> = ({
  shape,
  accentColor = '#eab308',
  brandColor = '#314855',
}) => {
  const shapeClass = getPhotoShapeClass(shape);

  if (shape === 'circle') {
    return (
      <div
        className={`absolute inset-0 ${shapeClass} border-4 border-dashed opacity-75 animate-[spin_180s_linear_infinite] pointer-events-none`}
        style={{ borderColor: accentColor }}
      />
    );
  }

  if (shape === 'rounded') {
    return (
      <>
        <div
          className={`absolute inset-0 ${shapeClass} border-[3px] border-dashed opacity-55 pointer-events-none`}
          style={{ borderColor: accentColor }}
        />
        <div
          className={`absolute inset-[3px] ${shapeClass} border-2 opacity-40 pointer-events-none animate-[photo-ring-pulse_4s_ease-in-out_infinite]`}
          style={{ borderColor: brandColor }}
        />
        <span
          className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
        <span
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
      </>
    );
  }

  if (shape === 'square') {
    const corner = 'absolute w-6 h-6 pointer-events-none';
    const stroke = { borderColor: accentColor };
    return (
      <>
        <span className={`${corner} top-0 left-0 border-t-[3px] border-l-[3px]`} style={stroke} />
        <span className={`${corner} top-0 right-0 border-t-[3px] border-r-[3px]`} style={stroke} />
        <span className={`${corner} bottom-0 left-0 border-b-[3px] border-l-[3px]`} style={stroke} />
        <span className={`${corner} bottom-0 right-0 border-b-[3px] border-r-[3px]`} style={stroke} />
        <div
          className="absolute inset-[6px] border border-dashed opacity-35 pointer-events-none animate-[photo-ring-pulse_5s_ease-in-out_infinite]"
          style={{ borderColor: brandColor }}
        />
      </>
    );
  }

  // squircle — soft double ring with gentle breathe (no rotation)
  return (
    <>
      <div
        className={`absolute inset-0 ${shapeClass} border-[3px] border-dotted opacity-60 pointer-events-none animate-[photo-ring-pulse_5s_ease-in-out_infinite]`}
        style={{ borderColor: accentColor }}
      />
      <div
        className={`absolute inset-[5px] ${shapeClass} border-2 border-solid opacity-45 pointer-events-none`}
        style={{ borderColor: brandColor }}
      />
      <span
        className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <span
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <span
        className="absolute top-1/2 -left-0.5 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <span
        className="absolute top-1/2 -right-0.5 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
    </>
  );
};
