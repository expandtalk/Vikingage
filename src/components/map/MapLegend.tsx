import React, { useState, useEffect } from 'react';
import { Layers, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import type L from 'leaflet';
import type { LegendLayerDef } from '@/hooks/map/useMapLegendState';

// Återanvändbar kartlegend — MONTERA på valfri kartsida (position: absolute i kart-wrappern).
// Tänder/släcker lager. Baskartor (group='basemap') visas i egen "Kartor (max 2)"-grupp.
// Med `mapRef`: (1) klick på kartan öppnar legenden om den är hopfälld, (2) expandera-knapp
// (helskärm) — samma två funktioner på ALLA kartor.
interface Props {
  defs: LegendLayerDef[];
  enabled: Record<string, boolean>;
  onToggle: (key: string) => void;
  title?: string;
  className?: string;
  mapRef?: React.MutableRefObject<L.Map | null>;
  // 'overlay' (default) = absolut uppe till höger PÅ kartan (stora kartor). 'inline' = statisk panel
  // UNDER kartan (smala kartor/dossier-aside där overlay täcker halva kartan — Daniel).
  placement?: 'overlay' | 'inline';
}

export const MapLegend: React.FC<Props> = ({ defs, enabled, onToggle, title = 'Lager', className = '', mapRef, placement = 'overlay' }) => {
  const [open, setOpen] = useState(true);
  const [fs, setFs] = useState(false);
  // Sortera lagren efter antal (fallande) — labeln bär "· N" (t.ex. "Runstenar · 63"). Annars
  // hamnade "Avrättningsplatser · 1" före "Badplatser · 40" i godtycklig def-ordning (Daniel).
  // Stabil: lager utan siffra behåller sin relativa ordning och sjunker sist. Rör INTE `defs`
  // (toggle-cap för baskartor bygger på def-ordningen) — bara visningsordningen.
  const legendCount = (label: string): number => {
    const m = label.match(/·\s*(\d[\d\s]*)\s*$/);
    return m ? parseInt(m[1].replace(/\s/g, ''), 10) : -1;
  };
  const layers = defs
    .filter((d) => d.group !== 'basemap')
    .map((d, i) => ({ d, i, c: legendCount(d.label) }))
    .sort((a, b) => (b.c - a.c) || (a.i - b.i))
    .map((x) => x.d);
  const base = defs.filter((d) => d.group === 'basemap');

  // (1) Klick på kartan (när legenden är hopfälld) → öppna legenden. Gäller alla kartor.
  useEffect(() => {
    if (!mapRef) return;
    let map: L.Map | null = null;
    let handler: (() => void) | null = null;
    let id: number;
    const attach = () => {
      map = mapRef.current;
      if (!map) { id = window.setTimeout(attach, 200); return; }
      handler = () => setOpen(true);
      map.on('click', handler);
    };
    id = window.setTimeout(attach, 0);
    return () => { window.clearTimeout(id); if (map && handler) map.off('click', handler); };
  }, [mapRef]);

  // (2) Expandera kartan (helskärm på leaflet-containern) + invalidateSize efteråt.
  const toggleExpand = () => {
    const el = mapRef?.current?.getContainer?.();
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  };
  useEffect(() => {
    const onFs = () => {
      setFs(!!document.fullscreenElement);
      window.setTimeout(() => { try { mapRef?.current?.invalidateSize?.(); } catch { /* noop */ } }, 120);
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, [mapRef]);

  const Item = (d: LegendLayerDef) => (
    <button
      key={d.key}
      onClick={() => onToggle(d.key)}
      aria-pressed={!!enabled[d.key]}
      className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 ${
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

  const wrap = placement === 'inline'
    ? 'mt-2 w-full rounded-lg border border-slate-700 bg-slate-900/95'
    : 'absolute right-2 top-2 z-[1000] w-48 rounded-lg border border-slate-700 bg-slate-900/95 shadow-xl backdrop-blur';
  return (
    <div className={`${wrap} ${className}`}>
      <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
        <button onClick={() => setOpen((o) => !o)} className="flex flex-1 items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" /> {title}
        </button>
        <div className="flex items-center gap-1">
          {mapRef && (
            <button onClick={toggleExpand} title={fs ? 'Förminska' : 'Expandera'} className="text-slate-400 hover:text-amber-200">
              {fs ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          )}
          <button onClick={() => setOpen((o) => !o)} className="text-slate-400 hover:text-amber-200">
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="max-h-[50vh] overflow-y-auto px-1 pb-2">
          {layers.map(Item)}
          {base.length > 0 && (
            <>
              <div className="mt-1.5 border-t border-slate-700 px-2 pt-1.5 text-[10px] uppercase tracking-wide text-slate-400">
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
