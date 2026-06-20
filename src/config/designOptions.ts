import type { LayoutSettings, HeaderStyle } from '../types';

export const HEADER_STYLES: { id: HeaderStyle; label: string; desc: string }[] = [
  { id: 'centered', label: 'Centered',    desc: 'Name & contact centered' },
  { id: 'left',     label: 'Left Align',  desc: 'Name left, contact right' },
  { id: 'banner',   label: 'Full Banner', desc: 'Coloured full-width header' },
  { id: 'minimal',  label: 'Minimal',     desc: 'Name only, no border' },
  { id: 'enhancv',  label: 'Enhance CV',  desc: 'Modern split grid style' },
];

export const BULLET_STYLES: { id: LayoutSettings['bulletStyle']; label: string; preview: string }[] = [
  { id: 'disc',   label: 'Disc',     preview: '●' },
  { id: 'circle', label: 'Circle',   preview: '○' },
  { id: 'square', label: 'Square',   preview: '■' },
  { id: 'dash',   label: 'Dash',     preview: '—' },
  { id: 'arrow',  label: 'Arrow',    preview: '➤' },
  { id: 'number', label: 'Numbered', preview: '1.' },
  { id: 'none',   label: 'None',     preview: '(none)' },
];

export const COLOR_PRESETS: string[] = [
  '#314855', '#1e293b', '#0284c7', '#10b981', '#6366f1', '#b45309',
  '#dc2626', '#7c3aed', '#0891b2', '#059669', '#d97706', '#be185d',
  '#3E3E3E', '#4B5563', '#6B7280', '#374151',
];
