import React, { useState } from 'react';
import { X, GripVertical, Lock, Layout } from 'lucide-react';
import { Modal } from './ui/Modal';

interface RearrangeSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leftSections: string[];
  rightSections: string[];
  onSave: (left: string[], right: string[]) => void;
}

const SECTION_NAMES: Record<string, string> = {
  summary: 'Profile Summary',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  certs: 'Projects & Certs',
  achievements: 'Key Achievements',
  languages: 'Languages',
};

export const RearrangeSectionsModal: React.FC<RearrangeSectionsModalProps> = ({
  isOpen,
  onClose,
  leftSections,
  rightSections,
  onSave,
}) => {
  const [localLeft, setLocalLeft] = useState<string[]>(leftSections);
  const [localRight, setLocalRight] = useState<string[]>(rightSections);

  // Drag State
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<'left' | 'right' | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<'left' | 'right' | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string, from: 'left' | 'right') => {
    setDraggedId(id);
    setDraggedFrom(from);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, column: 'left' | 'right', targetId?: string) => {
    e.preventDefault();
    setDragOverColumn(column);
    if (targetId) {
      setDragOverId(targetId);
    } else {
      setDragOverId(null);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumn: 'left' | 'right', targetId?: string) => {
    e.preventDefault();
    if (!draggedId || !draggedFrom) return;

    let newLeft = [...localLeft];
    let newRight = [...localRight];

    // Remove from source
    if (draggedFrom === 'left') {
      newLeft = newLeft.filter((id) => id !== draggedId);
    } else {
      newRight = newRight.filter((id) => id !== draggedId);
    }

    // Insert into destination
    if (targetColumn === 'left') {
      if (targetId) {
        const targetIdx = newLeft.indexOf(targetId);
        newLeft.splice(targetIdx, 0, draggedId);
      } else {
        newLeft.push(draggedId);
      }
    } else {
      if (targetId) {
        const targetIdx = newRight.indexOf(targetId);
        newRight.splice(targetIdx, 0, draggedId);
      } else {
        newRight.push(draggedId);
      }
    }

    setLocalLeft(newLeft);
    setLocalRight(newRight);

    // Reset Drag state
    setDraggedId(null);
    setDraggedFrom(null);
    setDragOverId(null);
    setDragOverColumn(null);
  };

  const handleApply = () => {
    onSave(localLeft, localRight);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      noPadding
      panelClassName="overflow-hidden my-8"
      overlayClassName="bg-editor/85 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-color/60 flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-text-main">Rearrange Sections</h2>
          <p className="text-xs text-text-muted mt-1">Hold &amp; drag the section cards to rearrange them or move them between columns</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-text-muted hover:text-text-main hover:bg-card border border-transparent hover:border-border-color rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center bg-[#dde3ec]/40 scrollbar-none" style={{ maxHeight: 'calc(90vh - 140px)' }}>
        {/* Mockup A4 panel */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-6 w-full max-w-md flex flex-col">
          {/* Header section (Locked) */}
          <div className="w-full mb-5 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg p-3.5 flex items-center justify-between opacity-80 select-none">
            <span className="text-xs font-bold uppercase tracking-wider">Applicant Header Block</span>
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Split Columns Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column Drop Zone */}
            <div
              onDragOver={(e) => handleDragOver(e, 'left')}
              onDrop={(e) => handleDrop(e, 'left')}
              className={`bg-slate-50/50 border-2 border-dashed rounded-xl p-3 min-h-[220px] transition-colors ${
                dragOverColumn === 'left' && !dragOverId ? 'border-brand-accent bg-brand-accent/5' : 'border-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                <Layout className="w-3 h-3 text-slate-400" /> Left Column
              </div>

              <div className="space-y-2">
                {localLeft.map((id) => (
                  <div
                    key={id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, id, 'left')}
                    onDragOver={(e) => handleDragOver(e, 'left', id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'left', id)}
                    className={`bg-white border text-xs font-medium text-slate-700 p-2.5 rounded-lg shadow-sm flex items-center justify-between cursor-move transition-all ${
                      draggedId === id ? 'opacity-40' : ''
                    } ${
                      dragOverId === id ? 'border-brand-accent ring-1 ring-brand-accent bg-brand-accent/5 scale-[1.02]' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{SECTION_NAMES[id] || id}</span>
                    <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
                {localLeft.length === 0 && (
                  <div className="text-[10px] text-slate-400 text-center py-8">Drag sections here</div>
                )}
              </div>
            </div>

            {/* Right Column Drop Zone */}
            <div
              onDragOver={(e) => handleDragOver(e, 'right')}
              onDrop={(e) => handleDrop(e, 'right')}
              className={`bg-slate-50/50 border-2 border-dashed rounded-xl p-3 min-h-[220px] transition-colors ${
                dragOverColumn === 'right' && !dragOverId ? 'border-brand-accent bg-brand-accent/5' : 'border-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                <Layout className="w-3 h-3 text-slate-400" /> Right Column
              </div>

              <div className="space-y-2">
                {localRight.map((id) => (
                  <div
                    key={id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, id, 'right')}
                    onDragOver={(e) => handleDragOver(e, 'right', id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'right', id)}
                    className={`bg-white border text-xs font-medium text-slate-700 p-2.5 rounded-lg shadow-sm flex items-center justify-between cursor-move transition-all ${
                      draggedId === id ? 'opacity-40' : ''
                    } ${
                      dragOverId === id ? 'border-brand-accent ring-1 ring-brand-accent bg-brand-accent/5 scale-[1.02]' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{SECTION_NAMES[id] || id}</span>
                    <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
                {localRight.length === 0 && (
                  <div className="text-[10px] text-slate-400 text-center py-8">Drag sections here</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-border-color/60 bg-sidebar flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-border-color hover:bg-card text-xs font-semibold rounded-lg text-text-muted hover:text-text-main transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover text-editor font-bold rounded-lg text-xs transition cursor-pointer"
        >
          Apply Changes
        </button>
      </div>
    </Modal>
  );
};
