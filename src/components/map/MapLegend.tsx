import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import type { LegendLayerDef } from '@/hooks/map/useMapLegendState';

// Återanvändbar kartlegend — MONTERA på valfri kartsida (position: absolute i kart-wrappern).
// Tänder/släcker lager. Baskartor (group='basemap') visas i egen grupp; cappen (max 2)
// sköts av useMapLegendState. "En funktion man anropar" — samma legend överallt.
interface Props {
  defs: LegendLayerDef[];
  enabled: Record<string, boolean>;
  onToggle: (key: string) => void;
  title?: string;
  className?: string;
}

export const MapLegend: React.FC<Props> = ({ defs, enabled, onToggle, title = 'Lager', className = '' }) => {
  const [open, setOpen] = useState(true);
  const layers = defs.filter((d) => d.group !== 'basemap');
  const base = defs.filter((d) => d.group === 'basemap');

  const Item = (d: LegendLayerDef) => (
    <button
      key={d.key}
      onClick={() => onToggle(d.key)}
      aria-pressed={!!enabled[d.key]}
      className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors ${
        enabled[d.key] ? 'text-white' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <span
        className="inline-block h-3 w-3 shrink-0 rounded-sm border"
        style={{ borderColor: d.color ?? '#94a3b8', background: enabled[d.key] ? (d.color ?? '#94a3b8') : 'transparent' }}
      />
      <span className="truncate">{d.label}</span>
    </button>
  );

  return (
    <div className={`absolute right-2 top-2 z-[1000] w-48 rounded-lg border border-slate-700 bg-slate-900/95 shadow-xl backdrop-blur ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300"
      >
        <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> {title}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="max-h-[50vh] overflow-y-auto px-1 pb-2">
          {layers.map(Item)}
          {base.length > 0 && (
            <>
              <div className="mt-1.5 border-t border-slate-700 px-2 pt-1.5 text-[10px] uppercase tracking-wide text-slate-500">
                Kartor (max 2)
              </div>
              {base.map(Item)}
            </>
          )}
        </div>
      )}
    </div>
  );
};
