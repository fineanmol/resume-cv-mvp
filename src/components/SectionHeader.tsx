import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface SectionHeaderProps {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  openSection: string;
  onToggle: (id: string) => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ id, icon: Icon, label, badge, openSection, onToggle }) => (
  <button
    onClick={() => onToggle(id)}
    className="w-full flex items-center justify-between p-4 font-bold text-xs text-text-main hover:bg-card/20 transition uppercase tracking-wider cursor-pointer"
  >
    <span className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-brand-accent" />
      {label}
      {badge !== undefined && <span className="ml-1 text-text-muted font-normal normal-case">({badge})</span>}
    </span>
    {openSection === id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
  </button>
);
