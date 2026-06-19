import type { FontFamily } from '../types';

export const FONT_CSS: Record<FontFamily, string> = {
  inter:        "'Inter', -apple-system, sans-serif",
  outfit:       "'Outfit', -apple-system, sans-serif",
  merriweather: "'Merriweather', Georgia, serif",
  fira:         "'Fira Code', 'Cascadia Code', monospace",
};

export const FONT_OPTIONS: { id: FontFamily; label: string; preview: string }[] = [
  { id: 'inter',        label: 'Inter',        preview: 'Modern & Clean' },
  { id: 'outfit',       label: 'Outfit',       preview: 'Geometric & Fresh' },
  { id: 'merriweather', label: 'Merriweather', preview: 'Classic Serif' },
  { id: 'fira',         label: 'Fira Code',    preview: 'Tech Monospace' },
];
