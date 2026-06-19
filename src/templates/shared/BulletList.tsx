import { splitIntoBullets } from '../../utils/bullets';
import { formatMarkdownBold } from '../../utils/markdown';

export function BulletList({
  bullets, isEditable, editableClass, onBulletChange, className = '', bulletStyle = 'disc', brandColor, align = 'left',
}: {
  bullets: string; isEditable: boolean; editableClass: string;
  onBulletChange: (updated: string) => void; className?: string;
  bulletStyle?: 'disc' | 'circle' | 'square' | 'dash' | 'arrow' | 'number' | 'none';
  brandColor?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
}) {
  const lines = splitIntoBullets(bullets);
  if (!lines.length) return null;

  const getMarker = (index: number) => {
    switch (bulletStyle) {
      case 'none':
        return null;
      case 'dash':
        return <span style={{ color: brandColor }} className="select-none font-semibold">—</span>;
      case 'arrow':
        return <span style={{ color: brandColor }} className="select-none text-[8px] align-middle">➤</span>;
      case 'number':
        return <span style={{ color: brandColor }} className="select-none font-semibold text-[10px]">{index + 1}.</span>;
      case 'circle':
        return <span style={{ color: brandColor }} className="select-none text-[8px] align-middle">○</span>;
      case 'square':
        return <span style={{ color: brandColor }} className="select-none text-[7px] align-middle">■</span>;
      case 'disc':
      default:
        return <span style={{ color: brandColor }} className="select-none text-[8px] align-middle">●</span>;
    }
  };

  const hasCustomMarker = bulletStyle !== 'none';

  return (
    <ul className={`list-none pl-0 space-y-1 ${className}`}>
      {lines.map((bullet, bIdx) => (
        <li key={bIdx} className="flex items-start">
          {hasCustomMarker && (
            <span contentEditable={false} className="flex-shrink-0 mt-[4px] select-none flex items-center justify-start text-[10px] w-4">
              {getMarker(bIdx)}
            </span>
          )}
          {isEditable ? (
            <span
              className={`flex-1 min-w-0 text-${align} ${editableClass}`}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                const updated = [...lines];
                updated[bIdx] = e.currentTarget.textContent || '';
                onBulletChange(updated.join('\n'));
              }}
            >
              {bullet}
            </span>
          ) : (
            <span
              className={`flex-1 min-w-0 text-${align}`}
              dangerouslySetInnerHTML={{ __html: formatMarkdownBold(bullet) }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
