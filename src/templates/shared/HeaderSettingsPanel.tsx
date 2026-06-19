import React from 'react';
import type { HeaderStyle, LayoutSettings } from '../../types';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import {
  PHOTO_SHAPES,
  photoShapePatch,
  resolvePhotoShape,
  type PhotoShape,
} from '../../utils/photoShape';

const HEADER_STYLES: HeaderStyle[] = ['centered', 'left', 'banner', 'minimal', 'enhancv'];

const sectionLabelClass =
  'text-[9px] font-semibold text-slate-400 uppercase tracking-wide select-none leading-none';

const PhotoShapeSelector: React.FC<{
  shape: PhotoShape;
  onChange: (shape: PhotoShape) => void;
}> = ({ shape, onChange }) => (
  <div className="flex items-center gap-1">
    {PHOTO_SHAPES.map(({ id, label, previewClass }) => (
      <button
        key={id}
        type="button"
        aria-label={`${label} photo`}
        title={label}
        onClick={(e) => {
          e.stopPropagation();
          onChange(id);
        }}
        className={`w-5 h-5 border flex items-center justify-center cursor-pointer transition ${
          shape === id ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className={`w-3 h-3 bg-teal-500 ${previewClass} ${shape === id ? 'opacity-100' : 'opacity-40'}`} />
      </button>
    ))}
  </div>
);

export interface HeaderSettingsPanelProps {
  layoutSettings: LayoutSettings;
  onChange: (patch: Partial<LayoutSettings>) => void;
  onClose?: () => void;
  variant?: 'compact' | 'full';
}

export const HeaderSettingsPanel: React.FC<HeaderSettingsPanelProps> = ({
  layoutSettings: ls,
  onChange,
  onClose,
  variant = 'compact',
}) => {
  const showPhoto = ls.showPhoto ?? true;
  const isCompact = variant === 'compact';

  return (
    <div
      className={
        isCompact
          ? 'bg-white border border-slate-200 shadow-lg rounded-md p-2.5 flex flex-col gap-2 w-[228px] max-h-[min(70vh,420px)] overflow-y-auto overscroll-contain'
          : 'w-64 bg-white text-slate-800 border border-slate-200 rounded-xl p-4 shadow-xl text-left font-sans text-xs space-y-4'
      }
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`flex items-center justify-between ${isCompact ? 'pb-1 border-b border-slate-100' : ''}`}>
        <span className={`font-bold text-slate-800 ${isCompact ? 'text-[11px]' : 'text-xs'}`}>Header Settings</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm leading-none px-1"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={sectionLabelClass}>Header Style</span>
        <div className="grid grid-cols-3 gap-1">
          {HEADER_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ headerStyle: style });
              }}
              className={`py-1 px-1 text-[9px] rounded border cursor-pointer capitalize transition leading-tight ${
                (ls.headerStyle ?? 'centered') === style
                  ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              {style === 'enhancv' ? 'Enhance' : style}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2">
        <span className={sectionLabelClass}>Field Visibility</span>
        <div className="flex flex-col gap-1">
          <ToggleSwitch
            label="Show Title"
            checked={ls.showTitle ?? true}
            onChange={(checked) => onChange({ showTitle: checked })}
            variant="teal"
            compact
          />
          <ToggleSwitch
            label="Show Phone"
            checked={ls.showPhone ?? true}
            onChange={(checked) => onChange({ showPhone: checked })}
            variant="teal"
            compact
          />
          <ToggleSwitch
            label="Show Email"
            checked={ls.showEmail ?? true}
            onChange={(checked) => onChange({ showEmail: checked })}
            variant="teal"
            compact
          />
          <ToggleSwitch
            label="Show Location"
            checked={ls.showLocation ?? true}
            onChange={(checked) => onChange({ showLocation: checked })}
            variant="teal"
            compact
          />
          <ToggleSwitch
            label="Show LinkedIn"
            checked={ls.showLinkedin ?? true}
            onChange={(checked) => onChange({ showLinkedin: checked })}
            variant="teal"
            compact
          />
          <ToggleSwitch
            label="Uppercase Name"
            checked={ls.uppercaseName ?? false}
            onChange={(checked) => onChange({ uppercaseName: checked })}
            variant="teal"
            compact
          />
          <ToggleSwitch
            label="Show Photo"
            checked={showPhoto}
            onChange={(checked) => onChange({ showPhoto: checked })}
            variant="teal"
            compact
          />
        </div>
        {showPhoto && (
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-600 font-medium">Photo Style</span>
            <PhotoShapeSelector
              shape={resolvePhotoShape(ls)}
              onChange={(shape) => onChange(photoShapePatch(shape))}
            />
          </div>
        )}
      </div>
    </div>
  );
};
