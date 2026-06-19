import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const OfflineBanner: React.FC = () => (
  <div className="bg-amber-950/80 border-b border-amber-600/40 text-amber-200 text-xs py-2 px-8 flex items-center justify-center gap-2">
    <AlertTriangle className="w-4 h-4 text-amber-400" />
    <span>Offline — AI features are disabled. Reconnect to resume.</span>
  </div>
);
