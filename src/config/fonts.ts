import type { FontFamily } from '../types';

export const FONT_CSS: Record<FontFamily, string> = {
  inter:             "'Inter', -apple-system, sans-serif",
  outfit:            "'Outfit', -apple-system, sans-serif",
  'plus-jakarta':    "'Plus Jakarta Sans', -apple-system, sans-serif",
  poppins:           "'Poppins', -apple-system, sans-serif",
  playfair:          "'Playfair Display', Georgia, serif",
  'eb-garamond':     "'EB Garamond', Georgia, serif",
  lora:              "'Lora', Georgia, serif",
  'jetbrains-mono':  "'JetBrains Mono', 'Fira Code', monospace",
  raleway:           "'Raleway', -apple-system, sans-serif",
  'open-sans':       "'Open Sans', -apple-system, sans-serif",
};

export const FONT_OPTIONS: { id: FontFamily; label: string; preview: string }[] = [
  { id: 'raleway',         label: 'Raleway',           preview: 'Clean & Professional' },
  { id: 'open-sans',       label: 'Open Sans',         preview: 'Readable & Modern' },
  { id: 'inter',           label: 'Inter',             preview: 'Modern & Clean' },
  { id: 'outfit',          label: 'Outfit',            preview: 'Geometric & Fresh' },
  { id: 'plus-jakarta',    label: 'Plus Jakarta',      preview: 'Premium Corporate' },
  { id: 'poppins',         label: 'Poppins',           preview: 'Friendly & Bold' },
  { id: 'playfair',        label: 'Playfair Display',  preview: 'Elegant Serif' },
  { id: 'eb-garamond',     label: 'EB Garamond',       preview: 'Timeless Serif' },
  { id: 'lora',            label: 'Lora Serif',        preview: 'Readable Serif' },
  { id: 'jetbrains-mono',  label: 'JetBrains Mono',    preview: 'Tech Monospace' },
];
