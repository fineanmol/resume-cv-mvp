import React, { useState, useEffect, useRef, useCallback } from 'react';
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

type Column = 'left' | 'right';

interface DragState {
  draggedId: string | null;
  draggedFrom: Column | null;
  overColumn: Column | null;
  overId: string | null;
}

const EMPTY_DRAG: DragState = {
  draggedId: null,
  draggedFrom: null,
  overColumn: null,
  overId: null,
};

export const RearrangeSectionsModal: React.FC<RearrangeSectionsModalProps> = ({
  isOpen,
  onClose,
  leftSections,
  rightSections,
  onSave,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    maxWidth="max-w-2xl"
    noPadding
    panelClassName="overflow-hidden my-8"
    overlayClassName="bg-editor/85 overflow-y-auto"
  >
    {isOpen && (
      <RearrangeSectionsModalBody
        onClose={onClose}
        leftSections={leftSections}
        rightSections={rightSections}
        onSave={onSave}
      />
    )}
  </Modal>
);

const RearrangeSectionsModalBody: React.FC<Omit<RearrangeSectionsModalProps, 'isOpen'>> = ({
  onClose,
  leftSections,
  rightSections,
  onSave,
}) => {
  const [localLeft, setLocalLeft] = useState<string[]>(leftSections);
  const [localRight, setLocalRight] = useState<string[]>(rightSections);
  const [dragUi, setDragUi] = useState<DragState>(EMPTY_DRAG);
  const dragRef = useRef<DragState>(EMPTY_DRAG);
  const rafRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  const syncDragUi = useCallback((next: DragState) => {
    dragRef.current = next;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const cur = dragRef.current;
      setDragUi(prev =>
        prev.draggedId === cur.draggedId &&
        prev.draggedFrom === cur.draggedFrom &&
        prev.overColumn === cur.overColumn &&
        prev.overId === cur.overId
          ? prev
          : { ...cur },
      );
    });
  }, []);

  const resetDrag = useCallback(() => {
    syncDragUi(EMPTY_DRAG);
  }, [syncDragUi]);

  const handleDragStart = (e: React.DragEvent, id: string, from: Column) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    syncDragUi({ draggedId: id, draggedFrom: from, overColumn: from, overId: id });
  };

  const handleDragOver = (e: React.DragEvent, column: Column, targetId?: string) => {
    e.preventDefault();
    const { draggedId } = dragRef.current;
    if (!draggedId) return;
    e.dataTransfer.dropEffect = 'move';
    syncDragUi({
      ...dragRef.current,
      overColumn: column,
      overId: targetId ?? null,
    });
  };

  const handleDrop = (e: React.DragEvent, targetColumn: Column, targetId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const { draggedId, draggedFrom } = dragRef.current;
    if (!draggedId || !draggedFrom) {
      resetDrag();
      return;
    }
    if (targetId && draggedId === targetId) {
      resetDrag();
      return;
    }

    let newLeft = [...localLeft];
    let newRight = [...localRight];

    if (draggedFrom === 'left') {
      newLeft = newLeft.filter((id) => id !== draggedId);
    } else {
      newRight = newRight.filter((id) => id !== draggedId);
    }

    if (targetColumn === 'left') {
      if (targetId) {
        const targetIdx = newLeft.indexOf(targetId);
        newLeft.splice(targetIdx >= 0 ? targetIdx : newLeft.length, 0, draggedId);
      } else {
        newLeft.push(draggedId);
      }
    } else if (targetId) {
      const targetIdx = newRight.indexOf(targetId);
      newRight.splice(targetIdx >= 0 ? targetIdx : newRight.length, 0, draggedId);
    } else {
      newRight.push(draggedId);
    }

    setLocalLeft(newLeft);
    setLocalRight(newRight);
    resetDrag();
  };

  const handleApply = () => {
    onSave(localLeft, localRight);
    onClose();
  };

  const renderColumn = (column: Column, ids: string[]) => {
    const isOverColumn = dragUi.overColumn === column && !dragUi.overId;

    return (
      <div
        onDragOver={(e) => handleDragOver(e, column)}
        onDrop={(e) => handleDrop(e, column)}
        className={`bg-slate-50/50 border-2 border-dashed rounded-xl p-3 min-h-[220px] ${
          isOverColumn ? 'border-brand-accent bg-brand-accent/5' : 'border-slate-200'
        }`}
      >
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
          <Layout className="w-3 h-3 text-slate-400" />
          {column === 'left' ? 'Left Column' : 'Right Column'}
        </div>

        <div className="space-y-2">
          {ids.map((id) => {
            const isDragging = dragUi.draggedId === id;
            const isDropTarget = dragUi.overId === id && dragUi.draggedId !== null && dragUi.draggedId !== id;

            return (
              <div
                key={id}
                draggable
                onDragStart={(e) => handleDragStart(e, id, column)}
                onDragOver={(e) => handleDragOver(e, column, id)}
                onDrop={(e) => handleDrop(e, column, id)}
                onDragEnd={resetDrag}
                className={`bg-white border text-xs font-medium text-slate-700 p-2.5 rounded-lg shadow-sm flex items-center justify-between cursor-move select-none ${
                  isDragging ? 'opacity-40' : ''
                } ${
                  isDropTarget ? 'border-brand-accent ring-1 ring-brand-accent bg-brand-accent/5' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="truncate">{SECTION_NAMES[id] || id}</span>
                <GripVertical className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
            );
          })}
          {ids.length === 0 && (
            <div className={`text-[10px] text-center py-8 rounded-lg border border-dashed ${
              isOverColumn ? 'text-brand-accent border-brand-accent/40' : 'text-slate-400 border-transparent'
            }`}
            >
              Drag sections here
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-color/60 flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-text-main">Rearrange Sections</h2>
          <p className="text-xs text-text-muted mt-1">Drag section cards to reorder or move between columns</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-text-muted hover:text-text-main hover:bg-card border border-transparent hover:border-border-color rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center bg-[#dde3ec]/40 scrollbar-none" style={{ maxHeight: 'calc(90vh - 140px)' }}>
        <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-6 w-full max-w-md flex flex-col">
          <div className="w-full mb-5 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg p-3.5 flex items-center justify-between opacity-80 select-none">
            <span className="text-xs font-bold uppercase tracking-wider">Applicant Header Block</span>
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {renderColumn('left', localLeft)}
            {renderColumn('right', localRight)}
          </div>
        </div>
      </div>

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
    </>
  );
};
