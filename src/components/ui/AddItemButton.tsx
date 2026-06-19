import React from 'react';
import { Plus } from 'lucide-react';
import { addButtonCls } from '../../constants/formClasses';

interface AddItemButtonProps {
  label: string;
  onClick: () => void;
}

export const AddItemButton: React.FC<AddItemButtonProps> = ({ label, onClick }) => (
  <button type="button" onClick={onClick} className={addButtonCls}>
    <Plus className="w-3.5 h-3.5" /> {label}
  </button>
);
