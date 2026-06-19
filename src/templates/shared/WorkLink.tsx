import React from 'react';
import { ExternalLink } from 'lucide-react';

export const WorkLink: React.FC<{ url?: string; brandColor?: string }> = ({ url, brandColor }) => {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-href={url}
      className="inline-flex items-center ml-1.5 hover:opacity-80 transition flex-shrink-0 align-middle cursor-pointer"
      style={{ color: brandColor }}
      title={url}
    >
      <ExternalLink className="w-3 h-3 mt-[1px]" />
    </a>
  );
};
