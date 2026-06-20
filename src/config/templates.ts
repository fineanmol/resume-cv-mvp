import type { DocType, TemplateId } from '../types';

export interface TemplateCatalogEntry {
  id: TemplateId;
  name: string;
  accent: string;
  tagline: string;
  desc: string;
  /** Badge shown in TemplatesModal / TemplatePicker */
  badge?: string;
  /** Compact badge on DesignPanel template grid */
  designBadge?: string;
  /** Short label for carousel chip strip */
  chipName: string;
  /** Document types this template supports. Omit to support all types. */
  docTypes?: DocType[];
}

export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  {
    id: 'navy',
    name: 'Navy Elegant',
    accent: '#314855',
    chipName: 'Navy',
    tagline: 'Modern & Professional',
    desc: 'Clean centered header with an accent border. The classic choice for most industries.',
  },
  {
    id: 'serif',
    name: 'Harvard Serif',
    accent: '#1e293b',
    chipName: 'Serif',
    tagline: 'Academic & Executive',
    desc: 'Timeless serif typography. Ideal for academic, legal, and senior executive roles.',
  },
  {
    id: 'sidebar',
    name: 'Creative Sidebar',
    accent: '#0284c7',
    chipName: 'Sidebar',
    tagline: 'Two-Column Impact',
    desc: 'Branded sidebar for skills and contact info. Great for creative and technical roles.',
  },
  {
    id: 'tech',
    name: 'Tech Monospace',
    accent: '#10b981',
    chipName: 'Tech',
    tagline: 'Developer-First',
    desc: 'Code-inspired monospace accents. Perfect for engineers and developers.',
  },
  {
    id: 'ats',
    name: 'Clean ATS',
    accent: '#6366f1',
    chipName: 'ATS',
    tagline: 'Maximum ATS Score',
    badge: 'Best for ATS',
    designBadge: 'ATS',
    desc: 'Plain single-column with no graphics. Guaranteed to parse through any ATS system.',
  },
  {
    id: 'executive',
    name: 'Executive',
    accent: '#b45309',
    chipName: 'Executive',
    tagline: 'Premium Presence',
    badge: 'Premium',
    designBadge: '★',
    desc: 'Full-width gradient header with branded colour palette. Makes a lasting first impression.',
  },
  {
    id: 'designer',
    name: 'Modern Designer',
    accent: '#007ACC',
    chipName: 'Designer',
    tagline: 'Premium Designer Layout',
    badge: 'Interactive',
    designBadge: 'New',
    desc: 'Interactive two-column layout with wave details, custom photo shape options, and draggable sections.',
    docTypes: ['resume'],
  },
  {
    id: 'professional',
    name: 'Professional',
    accent: '#314855',
    chipName: 'Professional',
    tagline: 'Clean & ATS-Optimized',
    badge: 'ATS Friendly',
    designBadge: 'Pro',
    desc: 'Clean professional layout with highlights section — ATS optimized.',
    docTypes: ['coverletter'],
  },
];

export const TEMPLATE_IDS = TEMPLATE_CATALOG.map(t => t.id);

export function getTemplateById(id: TemplateId): TemplateCatalogEntry {
  return TEMPLATE_CATALOG.find(t => t.id === id) ?? TEMPLATE_CATALOG[0];
}

/** Returns templates that support the given document type. */
export function getTemplatesForDocType(docType: DocType): TemplateCatalogEntry[] {
  return TEMPLATE_CATALOG.filter(t => !t.docTypes || t.docTypes.includes(docType));
}

/** Design panel grid — name, accent, compact badge */
export const TEMPLATES_FOR_DESIGN = TEMPLATE_CATALOG.map(({ id, name, accent, designBadge, badge }) => ({
  id,
  name,
  accent,
  badge: designBadge ?? badge,
}));

/** Carousel chip strip */
export const TEMPLATES_FOR_CAROUSEL = TEMPLATE_CATALOG.map(({ id, chipName, accent }) => ({
  id,
  name: chipName,
  color: accent,
}));
