import React, { useState, useEffect, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { EditableText } from './EditableText';
import { formatMarkdownInline } from '../../utils/markdown';
import { SkillGroupsContext, reconcileGroups, type SkillGroup } from './SkillGroupsContext';

export const SkillsEditor = React.memo<{
  value: string;
  groups?: SkillGroup[];
  isEditable: boolean;
  ec: string;
  onSave: (v: string) => void;
  badgeStyle: () => React.CSSProperties;
  defaultBadgeStyle?: React.CSSProperties;
  className?: string;
  skillsStyle?: 'chips' | 'normal' | 'grid' | 'grouped';
  /** Font scale factor (fontSize / 10). Used by grid mode to scale skill text size. */
  fontScale?: number;
  /** Font family for grid mode (defaults to Open Sans). Responds to Body Font picker. */
  gridFontFamily?: string;
  /** Text color for grid mode skill items (defaults to #3E3E3E). */
  gridTextColor?: string;
  /** Font family for chips mode. When set, overrides the hardcoded screen-pixel size. */
  chipFontFamily?: string;
  /** Text color for chips mode. When set, overrides default slate-600. */
  chipTextColor?: string;
}>(function SkillsEditor({ value, groups: suppliedGroups, isEditable, ec, onSave, badgeStyle, defaultBadgeStyle, className = '', skillsStyle = 'chips', fontScale = 1, gridFontFamily, gridTextColor = '#3E3E3E', chipFontFamily, chipTextColor }) {
  const [focusedSkillIdx, setFocusedSkillIdx] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const rootRef=useRef<HTMLDivElement>(null);
  const skipBlurRef=useRef(false);
  const pendingFocusRef=useRef<number|null>(null);
  const groupContext = React.useContext(SkillGroupsContext);
  const skillsList = value
    ? value
        .split(',')
        .map((s) => s.replace(/\*\*/g, '').replace(/^[-•*]\s*/, '').trim())
        .filter(Boolean)
    : [];

  useEffect(() => {
    if (!isEditable) return;
    const list = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
    const idx = pendingFocusRef.current ?? list.length - 1;
    pendingFocusRef.current=null;
    if (idx >= 0 && list[idx] === 'New Skill') {
      const el = rootRef.current?.querySelector(`[data-skill-index="${idx}"]`) as HTMLElement | null;
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

  const selectAll = (el: HTMLElement) => {
    try {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch (err) {
      console.warn('Failed to set selection range:', err);
    }
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
    if (dragIdx === i) return 'opacity-40 ring-2 ring-inset ring-red-200 cursor-not-allowed';
    if (overIdx === i) return 'ring-2 ring-inset ring-teal-500';
    return 'opacity-70';
  };

  if (skillsStyle === 'grouped') {
    const groups = reconcileGroups(value, suppliedGroups ?? groupContext.groups);
    const save = (next: SkillGroup[]) => {
      if (groupContext.save) groupContext.save(next);
      else onSave(next.flatMap(g => g.items).join(', '));
    };
    return <div className={className} data-skills-grouped style={{fontFamily: gridFontFamily, color: gridTextColor, fontSize: gridFontFamily ? `${7.61 * fontScale}pt` : undefined}}>
      {groups.map((g, i) => <div key={i} className="hybrid-skills group/skillgroup relative" style={{marginBottom: '0.65em', breakInside: 'avoid'}}>
        <EditableText tag="strong" value={g.category} isEditable={isEditable} editableClass={ec} onSave={category => save(groups.map((x,j) => j===i ? {...x, category} : x))}/>
        <EditableText tag="p" value={g.items.join(' · ')} placeholder="Add skills separated by dots or commas" style={{lineHeight: 1.5, overflowWrap:'anywhere'}} isEditable={isEditable} editableClass={ec} onSave={text => save(groups.map((x,j) => j===i ? {...x, items: text.split(/[,·]/).map(s=>s.trim()).filter(Boolean)} : x))}/>
        {isEditable && <div className="edit-only absolute right-0 -top-4 z-10 flex gap-2 bg-white text-[10px] text-slate-500 opacity-0 group-hover/skillgroup:opacity-100 focus-within:opacity-100">
          <button type="button" aria-label={`Move ${g.category} up`} disabled={i===0} onClick={() => {const next=[...groups]; [next[i-1],next[i]]=[next[i],next[i-1]]; save(next);}}>Move up</button>
          <button type="button" aria-label={`Remove ${g.category}`} onClick={() => save(groups.filter((_,j)=>i!==j))}>Remove group</button>
        </div>}
      </div>)}
      {isEditable && <button type="button" className="edit-only text-xs text-teal-600" onClick={()=>save([...groups,{category:'New category',items:[]}])}>+ Add category</button>}
    </div>;
  }

  if (skillsStyle === 'normal') {
    return <div className={className} style={{fontFamily: gridFontFamily, color: gridTextColor, fontSize:gridFontFamily ? `${7.61 * fontScale}pt` : undefined}}>
      <ul data-skills-list style={{display:'flex',flexWrap:'wrap',columnGap:'1.4em',paddingLeft:'1.15em', margin:0, lineHeight:1.65}}>{skillsList.map((skill,i)=><li key={i} style={{breakInside:'avoid',overflowWrap:'anywhere',maxWidth:'100%',margin:0,padding:0}}><EditableText value={skill} isEditable={isEditable} editableClass={ec} onSave={text=>onSave(skillsList.flatMap((s,j)=>j===i ? text.split(',').map(x=>x.trim()).filter(Boolean) : [s]).join(', '))}/></li>)}</ul>
      {isEditable && <button type="button" className="edit-only text-xs text-teal-600" onClick={()=>onSave([...skillsList,'New Skill'].join(', '))}>+ Add skill</button>}
    </div>;
  }

  // Aligned columns with wrapping cells; the print stylesheet uses the same geometry.
  if (skillsStyle === 'grid') {
    // minmax(0, 1fr) keeps long labels within a narrow résumé sidebar.
    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      justifyContent: 'flex-start',
      columnGap: '12pt',
      rowGap: '5pt',
      width: '100%',
      maxWidth: '100%',
    };
    const itemStyle: React.CSSProperties = {
      fontFamily: gridFontFamily ?? "'Open Sans', sans-serif",
      fontSize: `${(8.25 * fontScale).toFixed(2)}pt`,
      fontWeight: 500,
      color: gridTextColor,
      flex: '0 0 auto',
      maxWidth: '100%',
      whiteSpace: 'normal',
      overflowWrap: 'anywhere',
      textAlign: 'left',
    };
    if (!isEditable) {
      return (
        <div data-skills-grid className={`w-full max-w-full ${className}`} style={gridStyle}>
          {skillsList.map((s, i) => (
            <span
              key={i}
              data-skill-grid-item
              className="border-b border-slate-300 pb-1 pt-0.5 whitespace-nowrap"
              style={itemStyle}
              dangerouslySetInnerHTML={{ __html: formatMarkdownInline(s) }}
            />
          ))}
        </div>
      );
    }
    // Editable grid: each cell is a contenteditable span, same keyboard contract as chips
    return (
      <div ref={rootRef} className={`w-full max-w-full ${className}`}>
        <div data-skills-grid className="w-full max-w-full" style={gridStyle}>
          {skillsList.map((s, i) => (
            <span
              key={i}
              contentEditable={true}
              suppressContentEditableWarning={true}
              data-skill-index={i}
              data-skill-grid-item
              className={`min-w-0 outline-none border-b border-slate-300 pb-1 pt-0.5 whitespace-nowrap ${ec}`}
              style={itemStyle}
              onFocus={() => setFocusedSkillIdx(i)}
              onBlur={(e) => {
                  if(skipBlurRef.current){skipBlurRef.current=false;return;}
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
                  skipBlurRef.current=true;pendingFocusRef.current=i+1;
                  const text = e.currentTarget.textContent?.trim() || '';
                  const list = [...skillsList];
                  if (text !== '') list[i] = text;
                  list.splice(i + 1, 0, 'New Skill');
                  onSave(list.join(', '));
                  setTimeout(() => {
                    const next = rootRef.current?.querySelector(`[data-skill-index="${i + 1}"]`) as HTMLElement | null;
                    if (next) { next.focus(); selectAll(next); }
                  }, 50);
                } else if (e.key === 'Backspace' && !e.currentTarget.textContent?.trim()) {
                  e.preventDefault();
                  skipBlurRef.current=true;
                  const list = [...skillsList];
                  list.splice(i, 1);
                  onSave(list.join(', '));
                }
              }}
              title="Click to edit · Enter to add · Backspace on empty to delete"
            >
              {s}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const list = [...skillsList];
            const active=document.activeElement as HTMLElement|null;
            if(active&&rootRef.current?.contains(active)&&active.dataset.skillIndex!==undefined){
              const index=Number(active.dataset.skillIndex);list[index]=active.textContent?.trim()||'';
              skipBlurRef.current=true;
            }
            pendingFocusRef.current=list.filter(Boolean).length;
            list.push('New Skill');
            onSave(list.join(', '));
          }}
          className="edit-only mt-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 hover:bg-teal-100 text-slate-400 hover:text-teal-600 border border-dashed border-slate-300 hover:border-teal-400 transition-colors cursor-pointer text-[11px] font-bold shrink-0"
          onMouseDown={e=>e.preventDefault()}
          title="Add skill"
        >
          +
        </button>
      </div>
    );
  }

  const chipBase =
    'inline-flex w-max max-w-full shrink-0 items-center rounded-md font-medium border leading-snug whitespace-nowrap px-2 py-0.5 min-h-[22px] bg-white text-slate-600 border-slate-200 box-border';

  // When a chip font family is provided (Designer template), use scaled pt sizes.
  // Otherwise fall back to the hardcoded 11px Tailwind class.
  const chipInlineStyle: React.CSSProperties = chipFontFamily
    ? {
        fontFamily: chipFontFamily,
        fontSize: `${(7.61 * fontScale).toFixed(2)}pt`,
        color: chipTextColor,
      }
    : {};

  const chipSizeClass = chipFontFamily ? '' : 'text-[11px]';

  if (!isEditable) {
    return (
      <div className={className}>
        <div className="flex flex-wrap items-center gap-1.5">
        {skillsList.map((s, i) => {
          const baseStyle = getChipStyle();
          return (
            <span
              key={i}
              className={`${chipBase} ${chipSizeClass}`}
              style={{ ...baseStyle, ...chipInlineStyle }}
              title={s}
              dangerouslySetInnerHTML={{ __html: formatMarkdownInline(s) }}
            />
          );
        })}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`w-full ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        {skillsList.map((s, i) => {
          const baseStyle = getChipStyle();
          const isFocused = focusedSkillIdx === i;
          return (
            <span
              key={i}
              data-skill-chip
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              className={`${chipBase} ${chipSizeClass} relative group/chip transition-[border-color,opacity] duration-100 ${
                isFocused ? 'border-teal-400' : 'hover:border-slate-300'
              } ${chipDropClass(i)}`}
              style={{ ...baseStyle, ...chipInlineStyle }}
            >
              <span
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragEnd={resetDrag}
                aria-label="Drag to reorder skill"
                title="Drag to reorder"
                className={`edit-only absolute -top-1.5 -left-1.5 z-10 w-3.5 h-3.5 rounded border border-slate-200 bg-white flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none select-none shadow-sm transition-opacity duration-150 ${
                  isFocused ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover/chip:opacity-100 group-hover/chip:pointer-events-auto'
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
                style={chipInlineStyle}
                onFocus={() => setFocusedSkillIdx(i)}
                onBlur={(e) => {
                  if(skipBlurRef.current){skipBlurRef.current=false;return;}
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
                    skipBlurRef.current=true;pendingFocusRef.current=i+1;
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
                      const nextEl = rootRef.current?.querySelector(`[data-skill-index="${i + 1}"]`) as HTMLElement | null;
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
                      skipBlurRef.current=true;
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
                onMouseDown={e=>e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  const active=document.activeElement as HTMLElement|null;
                  if(active&&rootRef.current?.contains(active)&&active.isContentEditable){skipBlurRef.current=true;active.blur();}
                  const list = [...skillsList];
                  list.splice(i, 1);
                  onSave(list.join(', '));
                }}
                className={`edit-only absolute -top-1.5 -right-1.5 z-10 w-3.5 h-3.5 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 shadow-sm flex items-center justify-center font-bold text-[9px] leading-none cursor-pointer transition-opacity duration-150 ${
                  isFocused ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover/chip:opacity-100 group-hover/chip:pointer-events-auto'
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
            const list = [...skillsList];
            const active=document.activeElement as HTMLElement|null;
            if(active&&rootRef.current?.contains(active)&&active.dataset.skillIndex!==undefined){
              const index=Number(active.dataset.skillIndex);list[index]=active.textContent?.trim()||'';
              skipBlurRef.current=true;
            }
            pendingFocusRef.current=list.filter(Boolean).length;
            list.push('New Skill');
            onSave(list.join(', '));
          }}
          className="edit-only inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 hover:bg-teal-100 text-slate-400 hover:text-teal-600 border border-dashed border-slate-300 hover:border-teal-400 transition-colors cursor-pointer text-[11px] font-bold shrink-0"
          onMouseDown={e=>e.preventDefault()}
          title="Add skill"
        >
          +
        </button>
      </div>
    </div>
  );
});
