import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CharterFacsimileState } from '@/hooks/useCharterFacsimile';

/**
 * Renders the scanned original (via Riksarkivet IIIF) once resolved. Renders nothing
 * while unchecked or when no digitised original exists — no broken-image UI, no layout
 * placeholder. Non-digitised charters are the common case (formula letters, lost
 * originals), not an error state.
 */
export const CharterFacsimile: React.FC<{ sdhkId: number; facsimile: CharterFacsimileState }> = ({
  sdhkId,
  facsimile,
}) => {
  const sv = useLanguage().language === 'sv';
  const [broken, setBroken] = useState(false);

  if (!facsimile.imageUrl || broken) return null;

  return (
    <figure className="space-y-1">
      <img
        src={facsimile.imageUrl}
        alt={sv ? `Skannat original av SDHK ${sdhkId}` : `Scanned original of SDHK ${sdhkId}`}
        loading="lazy"
        className="max-h-[70vh] w-auto rounded-lg border border-slate-700 bg-slate-900"
        onError={() => setBroken(true)}
      />
      <figcaption className="text-xs text-slate-500">
        {sv ? 'Skannat original — Riksarkivet' : 'Scanned original — Riksarkivet'}
      </figcaption>
    </figure>
  );
};
