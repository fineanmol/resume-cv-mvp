import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, MapPin, Settings, Camera, Trash2 } from 'lucide-react';
import type { HeaderStyle, LayoutSettings } from '../types';
import { EditableText } from './shared/EditableText';
import { formatLinkedinUrl } from '../utils/linkedin';

const LI: React.FC = () => (
  <svg className="w-3 h-3 flex-shrink-0 mt-[1px]" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);

/** Visual circle/square photo shape picker — matches EnhanceCV header settings UX */
const PhotoShapeSelector: React.FC<{
  roundPhoto: boolean;
  onChange: (round: boolean) => void;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ roundPhoto, onChange, onClick }) => (
  <div className="flex items-center space-x-2">
    <button
      type="button"
      aria-label="Circle photo"
      onClick={(e) => { onClick?.(e); e.stopPropagation(); onChange(true); }}
      className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition ${
        roundPhoto ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-slate-400'
      }`}
    >
      {roundPhoto && <div className="w-4 h-4 bg-teal-500 rounded-full" />}
    </button>
    <button
      type="button"
      aria-label="Square photo"
      onClick={(e) => { onClick?.(e); e.stopPropagation(); onChange(false); }}
      className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer transition ${
        !roundPhoto ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-slate-400'
      }`}
    >
      {!roundPhoto && <div className="w-4 h-4 bg-teal-500 rounded-sm" />}
    </button>
  </div>
);

interface EditField {
  value: string;
  onSave: (v: string) => void;
}

export interface TemplateHeaderProps {
  name: EditField;
  subtitle: EditField;
  phone: EditField;
  email: EditField;
  location: EditField;
  linkedin: EditField;
  avatar: string;
  showAvatar: boolean;
  brandColor: string;
  headingFontCss: string;
  headerStyle: HeaderStyle;
  isEditable: boolean;
  ec: string; // editableClass
  sectionSpacing: number;
  layoutSettings?: LayoutSettings;
  onLayoutSettingsChange?: (settings: Partial<LayoutSettings>) => void;
  onAvatarChange?: (url: string) => void;
  isActive?: boolean;
  onSelect?: () => void;
}

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

  const settings = layoutSettings || {};
  const roundPhoto = settings.roundPhoto ?? true;
  const showPhoto = settings.showPhoto ?? true;

  // Determine shape class
  const shapeClass = roundPhoto ? 'rounded-full' : 'rounded-lg';

  if (!isEditable) {
    return (
      <div className={`${size} ${shapeClass} overflow-hidden border-2 flex-shrink-0`}
        style={border ? { borderColor: border } : { borderColor: 'rgba(255,255,255,0.4)' }}>
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

  const handleToggleRoundPhoto = (val: boolean) => {
    if (onLayoutSettingsChange) {
      onLayoutSettingsChange({ roundPhoto: val });
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
        className={`${size} ${shapeClass} overflow-hidden border-2 bg-slate-100 flex items-center justify-center cursor-pointer relative hover:border-teal-500 transition-all shadow-sm`}
        style={border ? { borderColor: border } : { borderColor: 'rgba(200,200,200,0.4)' }}
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
      
      {/* Hidden file input */}
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

      {/* Click Settings Popover */}
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

          {/* Photo Visibility Switch */}
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

          {/* Photo Shape Style Selector */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-slate-600 font-medium">Photo Style</span>
            <PhotoShapeSelector
              roundPhoto={roundPhoto}
              onChange={handleToggleRoundPhoto}
            />
          </div>

          {/* Upload / Delete Action Buttons */}
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
        </div>
      )}
    </div>
  );
};

const ContactRow: React.FC<{
  phone: EditField; email: EditField; location: EditField; linkedin: EditField;
  isEditable: boolean; ec: string; cls?: string; itemCls?: string;
  layoutSettings?: LayoutSettings;
}> = ({ phone, email, location, linkedin, isEditable, ec, cls, itemCls, layoutSettings }) => {
  const settings = layoutSettings || {};
  const hasPhone = (settings.showPhone ?? true) && !!(phone?.value && phone.value.trim());
  const hasEmail = (settings.showEmail ?? true) && !!(email?.value && email.value.trim());
  const hasLocation = (settings.showLocation ?? true) && !!(location?.value && location.value.trim());
  const hasLinkedin = (settings.showLinkedin ?? true) && !!(linkedin?.value && linkedin.value.trim());

  if (!hasPhone && !hasEmail && !hasLocation && !hasLinkedin) {
    return null;
  }

  return (
    <div className={cls ?? 'flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2'}>
      {hasPhone && (
        <span className={`flex items-center gap-1 ${itemCls ?? ''}`}>
          <Phone className="w-3 h-3 flex-shrink-0 mt-[1px]" />
          <EditableText value={phone.value} onSave={phone.onSave} isEditable={isEditable} editableClass={ec} />
        </span>
      )}
      {hasEmail && (
        <span className={`flex items-center gap-1 ${itemCls ?? ''}`}>
          <Mail className="w-3 h-3 flex-shrink-0 mt-[1px]" />
          <EditableText value={email.value} onSave={email.onSave} isEditable={isEditable} editableClass={ec} href={`mailto:${email.value}`} />
        </span>
      )}
      {hasLocation && (
        <span className={`flex items-center gap-1 ${itemCls ?? ''}`}>
          <MapPin className="w-3 h-3 flex-shrink-0 mt-[1px]" />
          <EditableText value={location.value} onSave={location.onSave} isEditable={isEditable} editableClass={ec} />
        </span>
      )}
      {hasLinkedin && (
        <span className={`flex items-center gap-1 ${itemCls ?? ''}`}>
          <LI />
          <EditableText value={linkedin.value} onSave={linkedin.onSave} isEditable={isEditable} editableClass={ec} href={formatLinkedinUrl(linkedin.value)} />
        </span>
      )}
    </div>
  );
};

export const TemplateHeader: React.FC<TemplateHeaderProps> = (p) => {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSettings) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showSettings]);

  const lightEc = 'outline-none hover:bg-white/10 focus:bg-white/10 rounded px-1 -mx-1 transition';
  const nameStyle: React.CSSProperties = { fontFamily: p.headingFontCss };

  const handleSettingsChange = (patch: Partial<LayoutSettings>) => {
    if (p.onLayoutSettingsChange) {
      p.onLayoutSettingsChange(patch);
    }
  };

  const renderSettingsPanel = () => {
    if (!p.layoutSettings) return null;
    const showPhoto = p.layoutSettings.showPhoto ?? true;
    return (
      <div
        ref={settingsRef}
        className="absolute right-2 top-10 z-[110] w-64 bg-white text-slate-800 border border-slate-200 rounded-xl p-4 shadow-xl text-left font-sans text-xs space-y-4 edit-only"
        style={{ transformOrigin: 'top right' }}
      >
        <div className="font-bold text-slate-900 border-b pb-1.5 flex items-center justify-between">
          <span>Header Settings</span>
          <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
        </div>

        {/* 1. Header Style */}
        <div className="space-y-1">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[9px]">Header Variant</span>
          <div className="grid grid-cols-5 gap-0.5">
            {(['centered', 'left', 'banner', 'minimal', 'enhancv'] as HeaderStyle[]).map(style => (
              <button
                key={style}
                onClick={() => handleSettingsChange({ headerStyle: style })}
                className={`py-1 text-[9px] rounded border cursor-pointer capitalize transition ${p.layoutSettings.headerStyle === style ? 'bg-teal-50 border-teal-500 text-teal-600 font-bold' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                {style === 'enhancv' ? 'Enhance' : style}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Settings Toggles */}
        <div className="space-y-3 pt-3 border-t text-[11px] text-slate-600">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[9px] block">Field Visibility</span>
          
          <div className="space-y-2.5">
            {/* Show Title */}
            <div className="flex items-center justify-between">
              <span>Show Title</span>
              <button
                type="button"
                role="switch"
                aria-checked={p.layoutSettings.showTitle ?? true}
                onClick={() => handleSettingsChange({ showTitle: !(p.layoutSettings.showTitle ?? true) })}
                className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (p.layoutSettings.showTitle ?? true) ? 'bg-teal-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    (p.layoutSettings.showTitle ?? true) ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Show Phone */}
            <div className="flex items-center justify-between">
              <span>Show Phone</span>
              <button
                type="button"
                role="switch"
                aria-checked={p.layoutSettings.showPhone ?? true}
                onClick={() => handleSettingsChange({ showPhone: !(p.layoutSettings.showPhone ?? true) })}
                className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (p.layoutSettings.showPhone ?? true) ? 'bg-teal-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    (p.layoutSettings.showPhone ?? true) ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Show Email */}
            <div className="flex items-center justify-between">
              <span>Show Email</span>
              <button
                type="button"
                role="switch"
                aria-checked={p.layoutSettings.showEmail ?? true}
                onClick={() => handleSettingsChange({ showEmail: !(p.layoutSettings.showEmail ?? true) })}
                className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (p.layoutSettings.showEmail ?? true) ? 'bg-teal-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    (p.layoutSettings.showEmail ?? true) ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Show Location */}
            <div className="flex items-center justify-between">
              <span>Show Location</span>
              <button
                type="button"
                role="switch"
                aria-checked={p.layoutSettings.showLocation ?? true}
                onClick={() => handleSettingsChange({ showLocation: !(p.layoutSettings.showLocation ?? true) })}
                className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (p.layoutSettings.showLocation ?? true) ? 'bg-teal-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    (p.layoutSettings.showLocation ?? true) ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Show Linkedin */}
            <div className="flex items-center justify-between">
              <span>Show LinkedIn</span>
              <button
                type="button"
                role="switch"
                aria-checked={p.layoutSettings.showLinkedin ?? true}
                onClick={() => handleSettingsChange({ showLinkedin: !(p.layoutSettings.showLinkedin ?? true) })}
                className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (p.layoutSettings.showLinkedin ?? true) ? 'bg-teal-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    (p.layoutSettings.showLinkedin ?? true) ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Uppercase Name */}
            <div className="flex items-center justify-between">
              <span>Uppercase Name</span>
              <button
                type="button"
                role="switch"
                aria-checked={p.layoutSettings.uppercaseName ?? false}
                onClick={() => handleSettingsChange({ uppercaseName: !(p.layoutSettings.uppercaseName ?? false) })}
                className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (p.layoutSettings.uppercaseName ?? false) ? 'bg-teal-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    (p.layoutSettings.uppercaseName ?? false) ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Show Profile Photo */}
            <div className="flex items-center justify-between">
              <span>Show Profile Photo</span>
              <button
                type="button"
                role="switch"
                aria-checked={showPhoto}
                onClick={() => handleSettingsChange({ showPhoto: !showPhoto })}
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

            {/* Photo Style Shape Selector */}
            <div className="flex items-center justify-between">
              <span>Photo Style</span>
              <PhotoShapeSelector
                roundPhoto={p.layoutSettings.roundPhoto ?? true}
                onChange={(round) => handleSettingsChange({ roundPhoto: round })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHeaderContent = () => {
    const showPhoto = p.layoutSettings?.showPhoto ?? true;
    const showTitle = p.layoutSettings?.showTitle ?? true;
    const uppercaseName = p.layoutSettings?.uppercaseName ?? false;

    const nameClassName = uppercaseName ? 'uppercase' : '';

    // ── BANNER: full-width colour block ────────────────────────────────────────
    if (p.headerStyle === 'banner') {
      return (
        <header 
          onClick={(e) => { if (p.isEditable) { e.stopPropagation(); p.onSelect?.(); } }}
          className={`text-white mb-5 relative group ${p.isEditable ? 'cursor-pointer' : ''} ${p.isActive ? 'header-active' : ''}`}
          style={{
            background: `linear-gradient(135deg, ${p.brandColor} 0%, ${p.brandColor}cc 100%)`,
            padding: '20px 28px 16px',
            margin: '0',
          }}>
          <div className="flex justify-between items-start gap-4">
            <div>
              <EditableText value={p.name.value} onSave={p.name.onSave} isEditable={p.isEditable} editableClass={lightEc}
                className={`block text-3xl font-bold tracking-tight text-white ${nameClassName}`} style={nameStyle} />
              {showTitle && (
                <EditableText value={p.subtitle.value} onSave={p.subtitle.onSave} isEditable={p.isEditable} editableClass={lightEc}
                  className="block text-sm text-white/80 mt-1 uppercase tracking-wide" />
              )}
            </div>
            {showPhoto && (
              <AvatarCircleEditable
                src={p.avatar}
                name={p.name.value}
                isEditable={p.isEditable}
                onAvatarChange={p.onAvatarChange}
                layoutSettings={p.layoutSettings}
                onLayoutSettingsChange={p.onLayoutSettingsChange}
              />
            )}
          </div>
          <ContactRow {...p} cls="flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-white/80 mt-2" />

          {/* Hover Settings Trigger */}
          {p.isEditable && (
            <div className={`absolute top-2 right-2 transition-opacity edit-only z-10 ${p.isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                className="bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-full border border-slate-200 shadow-md cursor-pointer transition flex items-center justify-center"
                title="Header & Layout Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {showSettings && renderSettingsPanel()}
        </header>
      );
    }

    // ── ENHANCV: 2-column layout (name/title/2x2-contact left, optional photo right)
    if (p.headerStyle === 'enhancv') {
      const hasPhone = (p.layoutSettings.showPhone ?? true) && !!(p.phone?.value && p.phone.value.trim());
      const hasEmail = (p.layoutSettings.showEmail ?? true) && !!(p.email?.value && p.email.value.trim());
      const hasLocation = (p.layoutSettings.showLocation ?? true) && !!(p.location?.value && p.location.value.trim());
      const hasLinkedin = (p.layoutSettings.showLinkedin ?? true) && !!(p.linkedin?.value && p.linkedin.value.trim());

      return (
        <header 
          onClick={(e) => { if (p.isEditable) { e.stopPropagation(); p.onSelect?.(); } }}
          className={`flex justify-between items-start border-b pb-5 mb-5 gap-6 relative group ${p.isEditable ? 'cursor-pointer' : ''} ${p.isActive ? 'header-active' : ''}`}
          style={{ borderColor: `${p.brandColor}30` }}
        >
          <div className="flex-1 min-w-0">
            <div>
              <EditableText value={p.name.value} onSave={p.name.onSave} isEditable={p.isEditable} editableClass={p.ec}
                className={`block text-3xl font-extrabold tracking-tight ${nameClassName}`} style={{ ...nameStyle, color: p.brandColor }} />
              {showTitle && (
                <EditableText value={p.subtitle.value} onSave={p.subtitle.onSave} isEditable={p.isEditable} editableClass={p.ec}
                  className="block text-sm font-semibold uppercase mt-1.5 tracking-wide text-slate-500" />
              )}
            </div>
            
            {/* 2x2 Grid for Contact Details */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-[11px] text-slate-600 max-w-[550px]">
              {hasEmail && (
                <span className="flex items-center gap-1.5 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">
                    <EditableText value={p.email.value} onSave={p.email.onSave} isEditable={p.isEditable} editableClass={p.ec} href={`mailto:${p.email.value}`} />
                  </span>
                </span>
              )}
              {hasPhone && (
                <span className="flex items-center gap-1.5 min-w-0">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">
                    <EditableText value={p.phone.value} onSave={p.phone.onSave} isEditable={p.isEditable} editableClass={p.ec} />
                  </span>
                </span>
              )}
              {hasLocation && (
                <span className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">
                    <EditableText value={p.location.value} onSave={p.location.onSave} isEditable={p.isEditable} editableClass={p.ec} />
                  </span>
                </span>
              )}
              {hasLinkedin && (
                <span className="flex items-center gap-1.5 min-w-0">
                  <LI />
                  <span className="truncate">
                    <EditableText value={p.linkedin.value} onSave={p.linkedin.onSave} isEditable={p.isEditable} editableClass={p.ec} href={formatLinkedinUrl(p.linkedin.value)} />
                  </span>
                </span>
              )}
            </div>
          </div>
          {showPhoto && (
            <AvatarCircleEditable
              src={p.avatar}
              name={p.name.value}
              size="w-20 h-20"
              border={`${p.brandColor}50`}
              isEditable={p.isEditable}
              onAvatarChange={p.onAvatarChange}
              layoutSettings={p.layoutSettings}
              onLayoutSettingsChange={p.onLayoutSettingsChange}
            />
          )}

          {/* Hover Settings Trigger */}
          {p.isEditable && (
            <div className={`absolute top-2 right-2 transition-opacity edit-only z-10 ${p.isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                className="bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-full border border-slate-200 shadow-md cursor-pointer transition flex items-center justify-center"
                title="Header & Layout Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {showSettings && renderSettingsPanel()}
        </header>
      );
    }

    // ── LEFT: name left, contact right, optional photo ─────────────────────────
    if (p.headerStyle === 'left') {
      return (
        <header 
          onClick={(e) => { if (p.isEditable) { e.stopPropagation(); p.onSelect?.(); } }}
          className={`flex justify-between items-start border-b-2 pb-4 mb-4 gap-4 relative group ${p.isEditable ? 'cursor-pointer' : ''} ${p.isActive ? 'header-active' : ''}`}
          style={{ borderColor: p.brandColor }}>
          <div className="flex-1">
            <div>
              <EditableText value={p.name.value} onSave={p.name.onSave} isEditable={p.isEditable} editableClass={p.ec}
                className={`block text-3xl font-bold tracking-tight ${nameClassName}`} style={{ ...nameStyle, color: p.brandColor }} />
              {showTitle && (
                <EditableText value={p.subtitle.value} onSave={p.subtitle.onSave} isEditable={p.isEditable} editableClass={p.ec}
                  className="block text-sm text-slate-500 uppercase mt-1 tracking-wide" />
              )}
            </div>
            <ContactRow {...p} cls="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2.5" />
          </div>
          {showPhoto && (
            <AvatarCircleEditable
              src={p.avatar}
              name={p.name.value}
              size="w-16 h-16"
              border={`${p.brandColor}60`}
              isEditable={p.isEditable}
              onAvatarChange={p.onAvatarChange}
              layoutSettings={p.layoutSettings}
              onLayoutSettingsChange={p.onLayoutSettingsChange}
            />
          )}

          {/* Hover Settings Trigger */}
          {p.isEditable && (
            <div className={`absolute top-2 right-2 transition-opacity edit-only z-10 ${p.isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                className="bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-full border border-slate-200 shadow-md cursor-pointer transition flex items-center justify-center"
                title="Header & Layout Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {showSettings && renderSettingsPanel()}
        </header>
      );
    }

    // ── MINIMAL: just name + subtitle, no border, optional small photo ──────────
    if (p.headerStyle === 'minimal') {
      return (
        <header 
          onClick={(e) => { if (p.isEditable) { e.stopPropagation(); p.onSelect?.(); } }}
          className={`mb-5 relative group ${p.isEditable ? 'cursor-pointer' : ''} ${p.isActive ? 'header-active' : ''}`}
        >
          <div className="flex items-center gap-3">
            {showPhoto && (
              <AvatarCircleEditable
                src={p.avatar}
                name={p.name.value}
                size="w-12 h-12"
                border={`${p.brandColor}40`}
                isEditable={p.isEditable}
                onAvatarChange={p.onAvatarChange}
                layoutSettings={p.layoutSettings}
                onLayoutSettingsChange={p.onLayoutSettingsChange}
              />
            )}
            <div>
              <EditableText value={p.name.value} onSave={p.name.onSave} isEditable={p.isEditable} editableClass={p.ec}
                className={`block text-3xl font-bold tracking-tight ${nameClassName}`} style={{ ...nameStyle, color: p.brandColor }} />
              {showTitle && (
                <EditableText value={p.subtitle.value} onSave={p.subtitle.onSave} isEditable={p.isEditable} editableClass={p.ec}
                  className="block text-sm text-slate-500 uppercase mt-1 tracking-wide" />
              )}
            </div>
          </div>
          <ContactRow {...p} cls="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2" />

          {/* Hover Settings Trigger */}
          {p.isEditable && (
            <div className={`absolute top-2 right-2 transition-opacity edit-only z-10 ${p.isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                className="bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-full border border-slate-200 shadow-md cursor-pointer transition flex items-center justify-center"
                title="Header & Layout Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {showSettings && renderSettingsPanel()}
        </header>
      );
    }

    // ── CENTERED (default): name/subtitle centred, optional photo above ─────────
    return (
      <header 
        onClick={(e) => { if (p.isEditable) { e.stopPropagation(); p.onSelect?.(); } }}
        className={`text-center border-b-2 pb-4 mb-4 relative group ${p.isEditable ? 'cursor-pointer' : ''} ${p.isActive ? 'header-active' : ''}`}
        style={{ borderColor: p.brandColor }}
      >
        {showPhoto && (
          <div className="flex justify-center mb-2">
            <AvatarCircleEditable
              src={p.avatar}
              name={p.name.value}
              size="w-16 h-16"
              border={`${p.brandColor}60`}
              isEditable={p.isEditable}
              onAvatarChange={p.onAvatarChange}
              layoutSettings={p.layoutSettings}
              onLayoutSettingsChange={p.onLayoutSettingsChange}
            />
          </div>
        )}
        <EditableText value={p.name.value} onSave={p.name.onSave} isEditable={p.isEditable} editableClass={p.ec}
          className={`block text-3xl font-bold tracking-tight ${nameClassName}`} style={{ ...nameStyle, color: p.brandColor }} />
        {showTitle && (
          <EditableText value={p.subtitle.value} onSave={p.subtitle.onSave} isEditable={p.isEditable} editableClass={p.ec}
            className="block text-sm text-slate-500 uppercase mt-1 tracking-wide" />
        )}
        <ContactRow {...p} cls="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-3" />

        {/* Hover Settings Trigger */}
        {p.isEditable && (
          <div className={`absolute top-2 right-2 transition-opacity edit-only z-10 ${p.isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
              className="bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-full border border-slate-200 shadow-md cursor-pointer transition flex items-center justify-center"
              title="Header & Layout Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {showSettings && renderSettingsPanel()}
      </header>
    );
  };

  return renderHeaderContent();
};
