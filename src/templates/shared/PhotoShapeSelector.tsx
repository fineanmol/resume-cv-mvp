import React from 'react';
import { PHOTO_SHAPES } from '../../utils/photoShape';
import type { PhotoShape } from '../../utils/photoShape';

export const PhotoShapeSelector: React.FC<{
  shape: PhotoShape;
  onChange: (shape: PhotoShape) => void;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ shape, onChange, onClick }) => (
  <div className="flex items-center gap-1.5">
    {PHOTO_SHAPES.map(({ id, label, previewClass }) => (
      <button
        key={id}
        type="button"
        aria-label={`${label} photo`}
        title={label}
        onClick={(e) => { onClick?.(e); e.stopPropagation(); onChange(id); }}
        className={`w-6 h-6 border flex items-center justify-center cursor-pointer transition ${
          shape === id ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className={`w-4 h-4 bg-teal-500 ${previewClass} ${shape === id ? 'opacity-100' : 'opacity-40'}`} />
      </button>
    ))}
  </div>
);
