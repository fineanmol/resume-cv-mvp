import React, { useState, useEffect } from 'react';
import { EditableText } from './EditableText';

export const SkillsEditor: React.FC<{
  value: string;
  isEditable: boolean;
  ec: string;
  onSave: (v: string) => void;
  badgeStyle: () => React.CSSProperties;
  defaultBadgeStyle?: React.CSSProperties;
  className?: string;
  skillsStyle?: 'chips' | 'normal';
}> = ({ value, isEditable, ec, onSave, badgeStyle, defaultBadgeStyle, className = '', skillsStyle = 'chips' }) => {
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
    if (focusedSkillIdx !== null) {
      e.preventDefault();
      return;
    }
    setDragIdx(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
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
              draggable={focusedSkillIdx === null}
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={resetDrag}
              className={`${chipBase} pl-2 pr-1.5 relative group/chip edit-only transition-[box-shadow,opacity] duration-100 ${
                isFocused ? 'border-teal-400 ring-1 ring-teal-400/30' : 'hover:border-slate-300'
              } ${focusedSkillIdx === null ? 'cursor-grab active:cursor-grabbing' : 'cursor-text'} ${chipDropClass(i)}`}
              style={baseStyle}
            >
              <span
                contentEditable={true}
                suppressContentEditableWarning={true}
                className="outline-none inline min-w-0 align-middle"
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
                title="Click to edit · Enter to add next · Backspace on empty to delete · Drag to reorder"
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
                className="text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 rounded-full flex items-center justify-center opacity-0 overflow-hidden transition-[width,height,opacity,margin] duration-150 font-bold text-[9px] cursor-pointer shrink-0 w-0 h-0 ml-0 group-hover/chip:w-3.5 group-hover/chip:h-3.5 group-hover/chip:opacity-100 group-hover/chip:ml-1"
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
            className={`inline-flex items-center justify-center min-w-[28px] min-h-[22px] rounded-md border-2 border-dashed transition-colors ${
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
};
