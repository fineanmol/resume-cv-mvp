import React, { useState, useRef, useEffect } from 'react';
import { Camera, Settings, Trash2 } from 'lucide-react';
import type { LayoutSettings } from '../../types';
import {
  getPhotoShapeClass,
  photoShapePatch,
  resolvePhotoShape,
  type PhotoShape,
} from '../../utils/photoShape';
import { PhotoShapeSelector } from './PhotoShapeSelector';

export const AvatarCircleEditable: React.FC<{
  src: string;
  name: string;
  size?: string;
  border?: string;
  isEditable: boolean;
  onAvatarChange?: (url: string) => void;
  layoutSettings?: LayoutSettings;
  onLayoutSettingsChange?: (settings: Partial<LayoutSettings>) => void;
}> = ({ src, name, size = 'w-16 h-16', border, isEditable, onAvatarChange, layoutSettings, onLayoutSettingsChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!showPopover) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showPopover]);

  const settings: Partial<LayoutSettings> = layoutSettings ?? {};
  const photoShape = resolvePhotoShape(settings);
  const showPhoto = settings.showPhoto ?? true;

  const shapeClass = getPhotoShapeClass(photoShape);

  if (!isEditable) {
    const borderStyle = border ? { borderColor: border } : { borderColor: 'rgba(255,255,255,0.4)' };
    const borderClass = border === 'transparent' ? 'border-0' : 'border-2';
    return (
      <div className={`${size} ${shapeClass} overflow-hidden ${borderClass} flex-shrink-0`}
        style={border !== 'transparent' ? borderStyle : undefined}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
            <span className="text-[10px]">No Photo</span>
          </div>
        )}
      </div>
    );
  }

  const handlePhotoShapeChange = (shape: PhotoShape) => {
    if (onLayoutSettingsChange) {
      onLayoutSettingsChange(photoShapePatch(shape));
    }
  };

  const handleToggleShowPhoto = (val: boolean) => {
    if (onLayoutSettingsChange) {
      onLayoutSettingsChange({ showPhoto: val });
    }
  };

  const triggerUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div
      className="relative group/avatar flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); }}
    >
      <div
        onClick={triggerUpload}
        className={`${size} ${shapeClass} overflow-hidden ${border === 'transparent' ? 'border-0' : 'border-2'} bg-slate-100 flex items-center justify-center cursor-pointer relative hover:border-teal-500 transition-all shadow-sm`}
        style={border && border !== 'transparent' ? { borderColor: border } : border === 'transparent' ? undefined : { borderColor: 'rgba(200,200,200,0.4)' }}
      >
        {src ? (
          <>
            <img src={src} alt={name} className={`w-full h-full object-cover transition-opacity ${isHovered ? 'opacity-60' : ''}`} />
            <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity edit-only ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <Camera className="w-5 h-5 text-white drop-shadow" />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center text-slate-400 p-1">
              <Camera className="w-4 h-4 mb-0.5" />
              <span className="text-[8px] text-center font-bold">PHOTO</span>
            </div>
            <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity edit-only ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <Camera className="w-5 h-5 text-white drop-shadow" />
            </div>
          </>
        )}
      </div>

      {isHovered && (
        <div className="absolute -top-1 -right-1 flex space-x-0.5 z-20 edit-only">
          <button
            type="button"
            onClick={triggerUpload}
            className="h-6 w-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-teal-600 cursor-pointer transition"
            title="Upload photo"
          >
            <Camera className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowPopover(!showPopover); }}
            className="h-6 w-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-teal-600 cursor-pointer transition"
            title="Photo settings"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden edit-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onAvatarChange) {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                onAvatarChange(reader.result);
                setShowPopover(false);
              }
            };
            reader.readAsDataURL(file);
          }
        }}
      />

      {showPopover && (
        <div
          ref={popoverRef}
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-[110] w-56 bg-white text-slate-800 border border-slate-200 rounded-xl p-3 shadow-xl text-left font-sans text-xs space-y-3 edit-only"
        >
          <div className="font-bold text-slate-900 border-b pb-1 flex items-center justify-between">
            <span>Photo Settings</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowPopover(false); }}
              className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm"
            >
              ×
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Show Photo</span>
            <button
              type="button"
              role="switch"
              aria-checked={showPhoto}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleShowPhoto(!showPhoto);
              }}
              className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showPhoto ? 'bg-teal-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  showPhoto ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {showPhoto && (
            <>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-600 font-medium">Photo Style</span>
                <PhotoShapeSelector
                  shape={photoShape}
                  onChange={handlePhotoShapeChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  Upload
                </button>
                {src && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAvatarChange) onAvatarChange('');
                      setShowPopover(false);
                    }}
                    className="py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-red-200 hover:bg-red-50 text-red-600 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
