import React from 'react';
import { X } from 'lucide-react';
import { useElementSpotlight } from '@/hooks/useElementSpotlight';

// Banner för 2c: visar vilket namnled som är framhävt på kartan + antal + stäng.
export const ElementSpotlightControl: React.FC = () => {
  const { key, count } = useElementSpotlight();
  if (!key) return null;
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1050] bg-amber-950/95 border border-amber-600 rounded-lg shadow-2xl px-3 py-1.5 flex items-center gap-3">
      <span className="text-amber-100 text-xs">
        Namnled <strong>{key}</strong> · {count.toLocaleString()} orter (registret)
      </span>
      <a href="/explore" aria-label="Stäng" className="text-amber-300 hover:text-white"><X className="h-4 w-4" /></a>
    </div>
  );
};
