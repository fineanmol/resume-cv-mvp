import React, { useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import { EditableText } from './EditableText';

export const SkillsEditor = React.memo<{
  value: string;
  isEditable: boolean;
  ec: string;
  onSave: (v: string) => void;
  badgeStyle: () => React.CSSProperties;
  defaultBadgeStyle?: React.CSSProperties;
  className?: string;
  skillsStyle?: 'chips' | 'normal';
}>(function SkillsEditor({ value, isEditable, ec, onSave, badgeStyle, defaultBadgeStyle, className = '', skillsStyle = 'chips' }) {
  const [focusedSkillIdx, setFocusedSkillIdx] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const skillsList = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    if (!isEditable) return;
    const list = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
    const idx = list.length - 1;
    if (idx >= 0 && list[idx] === 'New Skill') {
      const el = document.querySelector(`[data-skill-index="${idx}"]`) as HTMLElement | null;
      if (el) {
        el.focus();
        try {
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(el);
          sel?.removeAllRanges();
          sel?.addRange(range);
        } catch (err) {
          console.warn('Failed to set selection range:', err);
        }
      }
    }
  }, [value, isEditable]);

  const resetDrag = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setFocusedSkillIdx(null);
    setDragIdx(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';

    const chipEl = (e.currentTarget as HTMLElement).closest('[data-skill-chip]');
    if (chipEl instanceof HTMLElement) {
      e.dataTransfer.setDragImage(
        chipEl,
        Math.min(chipEl.offsetWidth / 2, 40),
        chipEl.offsetHeight / 2,
      );
    }
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIdx === null) return;
    if (dragIdx === targetIndex) {
      e.dataTransfer.dropEffect = 'none';
      setOverIdx(null);
      return;
    }
    e.dataTransfer.dropEffect = 'move';
    setOverIdx(targetIndex);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (sourceIndexStr === '') {
      resetDrag();
      return;
    }
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) {
      resetDrag();
      return;
    }

    const list = [...skillsList];
    const [draggedItem] = list.splice(sourceIndex, 1);
    const insertAt = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
    list.splice(insertAt, 0, draggedItem);
    onSave(list.join(', '));
    resetDrag();
  };

  const getChipStyle = (): React.CSSProperties =>
    defaultBadgeStyle ?? badgeStyle();

  const chipDropClass = (i: number) => {
    if (dragIdx === null) return '';
    if (dragIdx === i) return 'opacity-40 ring-2 ring-red-200 ring-offset-1 cursor-not-allowed';
    if (overIdx === i) return 'ring-2 ring-teal-500 ring-offset-1 shadow-sm';
    return 'opacity-70';
  };

  if (skillsStyle === 'normal') {
    if (!isEditable) {
      return (
        <p className={`text-xs text-slate-700 leading-relaxed ${className}`}>
          {value}
        </p>
      );
    }
    return (
      <EditableText
        tag="p"
        value={value}
        isEditable={true}
        editableClass={ec}
        className={`text-xs text-slate-700 leading-relaxed w-full ${className}`}
        onSave={onSave}
      />
    );
  }

  const chipBase =
    'inline-flex w-max max-w-full shrink-0 items-center rounded-md font-medium border text-[11px] leading-snug whitespace-nowrap px-2 py-0.5 min-h-[22px] bg-white text-slate-600 border-slate-200';

  const chipFieldStyle: React.CSSProperties = {
    fieldSizing: 'content',
  };

  if (!isEditable) {
    return (
      <div className={className}>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {skillsList.map((s, i) => {
          const baseStyle = getChipStyle();
          return (
            <span
              key={i}
              className={chipBase}
              style={baseStyle}
              title={s}
            >
              {s}
            </span>
          );
        })}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {skillsList.map((s, i) => {
          const baseStyle = getChipStyle();
          const isFocused = focusedSkillIdx === i;
          return (
            <span
              key={i}
              data-skill-chip
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              className={`${chipBase} relative group/chip transition-[box-shadow,opacity] duration-100 ${
                isFocused ? 'border-teal-400 ring-1 ring-teal-400/30' : 'hover:border-slate-300'
              } ${chipDropClass(i)}`}
              style={baseStyle}
            >
              <span
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragEnd={resetDrag}
                aria-label="Drag to reorder skill"
                title="Drag to reorder"
                className={`edit-only absolute -top-1.5 -left-1.5 z-10 w-3.5 h-3.5 rounded border border-slate-200 bg-white flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none select-none shadow-sm pointer-events-none transition-opacity duration-150 ${
                  isFocused ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover/chip:opacity-100 group-hover/chip:pointer-events-auto'
                }`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-2.5 h-2.5 pointer-events-none" />
              </span>
              <span
                contentEditable={true}
                suppressContentEditableWarning={true}
                className="outline-none inline min-w-0 align-middle cursor-text"
                style={chipFieldStyle}
                onFocus={() => setFocusedSkillIdx(i)}
                onBlur={(e) => {
                  setFocusedSkillIdx(null);
                  const text = e.currentTarget.textContent?.trim() || '';
                  const list = [...skillsList];
                  if (text === '') {
                    list.splice(i, 1);
                  } else if (text !== s) {
                    list[i] = text;
                  }
                  onSave(list.join(', '));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const text = e.currentTarget.textContent?.trim() || '';
                    const list = [...skillsList];
                    if (text === '') {
                      list.splice(i, 1);
                    } else {
                      list[i] = text;
                    }
                    list.splice(i + 1, 0, 'New Skill');
                    onSave(list.join(', '));
                    setTimeout(() => {
                      const nextEl = document.querySelector(`[data-skill-index="${i + 1}"]`) as HTMLElement | null;
                      if (nextEl) {
                        nextEl.focus();
                        try {
                          const range = document.createRange();
                          const sel = window.getSelection();
                          range.selectNodeContents(nextEl);
                          sel?.removeAllRanges();
                          sel?.addRange(range);
                        } catch (err) {
                          console.warn('Failed to set selection range:', err);
                        }
                      }
                    }, 50);
                  } else if (e.key === 'Backspace') {
                    const text = e.currentTarget.textContent?.trim() || '';
                    if (text === '') {
                      e.preventDefault();
                      const list = [...skillsList];
                      list.splice(i, 1);
                      onSave(list.join(', '));
                    }
                  }
                }}
                data-skill-index={i}
                title="Click to edit · Enter to add next · Backspace on empty to delete · Drag handle to reorder"
              >
                {s}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const list = [...skillsList];
                  list.splice(i, 1);
                  onSave(list.join(', '));
                }}
                className={`edit-only absolute -top-1.5 -right-1.5 z-10 w-3.5 h-3.5 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 shadow-sm flex items-center justify-center font-bold text-[9px] leading-none cursor-pointer pointer-events-none transition-opacity duration-150 ${
                  isFocused ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover/chip:opacity-100 group-hover/chip:pointer-events-auto'
                }`}
                title="Remove skill"
                type="button"
              >
                ×
              </button>
            </span>
          );
        })}

        {dragIdx !== null && (
          <span
            onDragOver={(e) => handleDragOver(e, skillsList.length)}
            onDrop={(e) => handleDrop(e, skillsList.length)}
            className={`edit-only inline-flex items-center justify-center min-w-[28px] min-h-[22px] rounded-md border-2 border-dashed transition-colors ${
              overIdx === skillsList.length
                ? 'border-teal-500 bg-teal-50 text-teal-600'
                : 'border-slate-200 text-slate-300'
            }`}
            title="Drop here to move to end"
          >
            ↓
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            const list = [...skillsList, 'New Skill'];
            onSave(list.join(', '));
          }}
          className="edit-only inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 hover:bg-teal-100 text-slate-400 hover:text-teal-600 border border-dashed border-slate-300 hover:border-teal-400 transition-colors cursor-pointer text-[11px] font-bold shrink-0"
          title="Add skill"
        >
          +
        </button>
      </div>
    </div>
  );
});
