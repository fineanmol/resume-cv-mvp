import React, { useState, useEffect } from 'react';
import { EditableText } from './EditableText';

export const SkillsEditor: React.FC<{
  value: string;
  isEditable: boolean;
  ec: string;
  onSave: (v: string) => void;
  accentColor2?: string;
  brandColor: string;
  badgeStyle: (i: number) => React.CSSProperties;
  defaultBadgeStyle?: React.CSSProperties;
  className?: string;
  skillsStyle?: 'chips' | 'normal';
}> = ({ value, isEditable, ec, onSave, accentColor2, brandColor, badgeStyle, defaultBadgeStyle, className = '', skillsStyle = 'chips' }) => {
  const [focusedSkillIdx, setFocusedSkillIdx] = useState<number | null>(null);
  const skillsList = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    if (!isEditable) return;
    const idx = skillsList.length - 1;
    if (idx >= 0 && skillsList[idx] === 'New Skill') {
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
  }, [skillsList.length, isEditable]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (sourceIndexStr === '') return;
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const list = [...skillsList];
    const [draggedItem] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, draggedItem);
    onSave(list.join(', '));
  };

  const fallbackDefaultStyle = defaultBadgeStyle || { background: brandColor, color: '#fff' };

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

  if (!isEditable) {
    return (
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs ${className}`}>
        {skillsList.map((s, i) => {
          const baseStyle = accentColor2 ? badgeStyle(i) : fallbackDefaultStyle;
          return (
            <span key={i} className="inline-block align-middle text-center px-2 rounded font-medium border"
              style={{ ...baseStyle, height: '1.8em', lineHeight: '1.8em', paddingTop: 0, paddingBottom: 0 }}>
              {s}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs w-full ${className}`}>
        {skillsList.map((s, i) => {
          const baseStyle = accentColor2 ? badgeStyle(i) : fallbackDefaultStyle;
          return (
            <span
              key={i}
              draggable={focusedSkillIdx === null}
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, i)}
              className="inline-flex items-center gap-0.5 pl-2 pr-1 rounded font-medium border cursor-text hover:border-slate-400 focus-within:border-teal-400 transition-all duration-150 relative group/chip"
              style={{ ...baseStyle, height: '1.8em', lineHeight: '1.8em', paddingTop: 0, paddingBottom: 0 }}
            >
              <span
                contentEditable={true}
                suppressContentEditableWarning={true}
                className="outline-none px-0.5 rounded min-w-[20px]"
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
                        } catch {}
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
                title="Click to edit · Enter to add next · Backspace on empty to delete"
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
                className="text-current bg-black/20 hover:bg-black/40 rounded-full w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition-opacity font-bold text-[9px] cursor-pointer ml-0.5 flex-shrink-0"
                title="Remove skill"
                type="button"
              >
                ×
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => {
            const list = [...skillsList, 'New Skill'];
            onSave(list.join(', '));
          }}
          className="edit-only inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 hover:bg-teal-100 text-slate-400 hover:text-teal-600 border border-dashed border-slate-300 hover:border-teal-400 transition-colors cursor-pointer text-[11px] font-bold flex-shrink-0"
          title="Add skill"
        >
          +
        </button>
      </div>
    </div>
  );
};
