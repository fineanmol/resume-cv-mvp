import React from 'react';
import type { TemplateId } from '../types';

/** Fast static wireframe previews — avoids mounting full template renderers in the modal. */
export const TemplateLayoutPreview: React.FC<{
  templateId: TemplateId;
  accent: string;
  className?: string;
}> = ({ templateId, accent, className = '' }) => {
  const bar = (w: string, h = 'h-1.5', opacity = 'opacity-90') => (
    <div className={`${h} rounded-sm ${opacity}`} style={{ width: w, background: accent }} />
  );
  const line = (w: string) => <div className="h-1 rounded-sm bg-slate-200" style={{ width: w }} />;
  const block = (flex = 1) => (
    <div className="rounded-sm bg-slate-100 border border-slate-200/80" style={{ flex }} />
  );

  const headerCentered = (
    <div className="flex flex-col items-center gap-1 pb-2 border-b border-slate-200 mb-2">
      {bar('55%', 'h-2')}
      {line('40%')}
      <div className="flex gap-2 mt-0.5">{line('18%')}{line('22%')}{line('16%')}</div>
    </div>
  );

  const headerLeft = (
    <div className="flex justify-between items-start gap-2 pb-2 border-b mb-2" style={{ borderColor: `${accent}55` }}>
      <div className="flex-1 space-y-1">{bar('50%', 'h-2')}{line('35%')}</div>
      <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0" />
    </div>
  );

  const headerBanner = (
    <div className="rounded-sm px-2 py-1.5 mb-2 text-white space-y-1" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
      {bar('45%', 'h-2', 'opacity-100')}
      {line('30%')}
    </div>
  );

  const headerDesigner = (
    <div className="flex justify-between items-start gap-2 pb-2 border-b border-slate-200 mb-2">
      <div className="flex-1 space-y-1">{bar('48%', 'h-2')}{line('38%')}{line('55%')}</div>
      <div className="relative w-8 h-8 flex-shrink-0">
        <div className="absolute inset-0 rounded-full border border-dashed opacity-70" style={{ borderColor: accent }} />
        <div className="absolute inset-1 rounded-full bg-slate-200" />
      </div>
    </div>
  );

  const bodySingle = (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-1">
          {bar('28%', 'h-1')}
          <div className="space-y-0.5">{line('95%')}{line('88%')}{line('72%')}</div>
        </div>
      ))}
    </div>
  );

  const bodyTwoCol = (
    <div className="flex gap-2 flex-1 min-h-0">
      <div className="w-[38%] space-y-1.5">{block()}{block()}{block(0.6)}</div>
      <div className="flex-1 space-y-1.5">{block()}{block()}{block(0.8)}</div>
    </div>
  );

  const bodySidebar = (
    <div className="flex gap-2 flex-1 min-h-0">
      <div className="w-[32%] rounded-sm p-1 space-y-1" style={{ background: `${accent}18`, borderRight: `2px solid ${accent}` }}>
        <div className="w-5 h-5 rounded-full bg-slate-200 mx-auto" />
        {line('80%')}{line('70%')}{line('75%')}
      </div>
      <div className="flex-1 space-y-1.5">{bar('42%', 'h-1.5')}{block()}{block()}</div>
    </div>
  );

  let header = headerCentered;
  let body: React.ReactNode = bodySingle;

  switch (templateId) {
    case 'sidebar':
      header = headerLeft;
      body = bodySidebar;
      break;
    case 'designer':
      header = headerDesigner;
      body = bodyTwoCol;
      break;
    case 'executive':
      header = headerBanner;
      body = bodySingle;
      break;
    default:
      break;
  }

  if (templateId === 'ats') {
    header = (
      <div className="pb-2 border-b border-slate-300 mb-2 space-y-1">
        {bar('50%', 'h-2')}
        {line('60%')}
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-white p-3 flex flex-col text-[0px] ${className}`}>
      {header}
      {body}
    </div>
  );
};
