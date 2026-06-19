import React from 'react';

export interface DraggableSectionProps {
  id: string;
  showLayoutBounds: boolean;
  isEditable: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  dragOverId?: string | null;
  onDragEnter?: (e: React.DragEvent, id: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export const DraggableSection: React.FC<DraggableSectionProps> = ({
  id,
  showLayoutBounds,
  isEditable,
  onDragStart,
  onDragOver,
  onDrop,
  children,
  className = '',
  style,
  dragOverId,
  onDragEnter,
  onDragLeave,
  onDragEnd,
}) => {
  const isDraggable = isEditable && showLayoutBounds;
  const isOver = dragOverId === id;

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart(e, id)}
      onDragOver={(e) => isDraggable && onDragOver(e)}
      onDragEnter={(e) => isDraggable && onDragEnter?.(e, id)}
      onDragLeave={(e) => isDraggable && onDragLeave?.(e)}
      onDragEnd={(e) => isDraggable && onDragEnd?.(e)}
      onDrop={(e) => {
        if (!isDraggable) return;
        e.stopPropagation();
        onDrop(e, id);
      }}
      style={style}
      className={`relative group/draggable ${className} ${
        isDraggable
          ? `border-2 border-dashed p-2 rounded-xl transition-all duration-200 cursor-move ${
              isOver
                ? 'border-brand-accent bg-brand-accent/5 scale-[1.02] shadow-md z-10'
                : 'border-slate-300 hover:border-brand-accent/50 bg-slate-50/10 hover:bg-slate-50/30'
            }`
          : ''
      }`}
    >
      {isDraggable && (
        <div className="absolute -top-2.5 left-2 bg-brand-accent text-[8px] font-bold text-white px-1.5 py-0.5 rounded shadow select-none opacity-0 group-hover/draggable:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider z-20">
          Drag Section: {id}
        </div>
      )}
      {children}
    </div>
  );
};
