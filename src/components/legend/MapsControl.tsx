import React from 'react';
import { HISTORICAL_MAP_LAYERS } from '@/config/historicalMapLayers';
import type { BasemapId } from '@/config/exploreCapabilities';
import { useMapOverlaySettings, setBasemapOverride, setMapOpacity, setMapTone } from '@/hooks/useMapOverlaySettings';

// "Kartor"-sektionen i legenden: Bakgrundskarta (radio, en i taget) + Historiska kartor
// (kryssruta + opacitets-reglage + Färg/Gråskala-växel + zoom-notis). Se maps-design-diskussionen.
const BASEMAP_OPTS: { id: BasemapId; label: string }[] = [
  { id: 'osm', label: 'Färg' },
  { id: 'terrain', label: 'Terräng' },
  { id: 'light', label: 'Ljus' },
];

interface Child { id: string; label: string; enabled: boolean }
interface Props {
  historicalChildren: Child[];
  onToggleItem: (id: string) => void;
}

export const MapsControl: React.FC<Props> = ({ historicalChildren, onToggleItem }) => {
  const settings = useMapOverlaySettings();
  // basemapOverride null = profilens default; radion visar osm som synlig utgångspunkt tills man väljer.
  const basemap = settings.basemapOverride ?? 'osm';

  return (
    <div className="space-y-2 px-1">
      {/* Bakgrundskarta — ett grundlager i taget (radio) */}
      <div>
        <p className="text-[10px] text-gray-400 mb-1">Bakgrundskarta <span className="text-gray-600">(en i taget)</span></p>
        <div className="flex gap-1">
          {BASEMAP_OPTS.map((o) => (
            <button
              key={o.id}
              onClick={() => setBasemapOverride(o.id)}
              className={`flex-1 py-1 rounded border text-[11px] transition-colors ${basemap === o.id ? 'bg-sky-600/30 border-sky-500 text-sky-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Historiska kartor — staplingsbara overlays. Döljs helt när ej lanserade (tom lista). */}
      {historicalChildren.length > 0 && (
      <div>
        <p className="text-[10px] text-gray-400 mb-1">Historiska kartor <span className="text-gray-600">(stapla flera)</span></p>
        <div className="space-y-1.5">
          {historicalChildren.map((c) => {
            const cfg = HISTORICAL_MAP_LAYERS.find((h) => h.key === c.id);
            const op = settings.opacity[c.id] ?? cfg?.opacity ?? 0.75;
            const tone = settings.tone[c.id] ?? 'color';
            return (
              <div key={c.id} className="rounded border border-slate-700/60 p-1.5">
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input type="checkbox" checked={c.enabled} onChange={() => onToggleItem(c.id)} className="accent-sky-500" />
                  <span className="flex-1 truncate">{c.label}</span>
                </label>
                {c.enabled && (
                  <div className="mt-1.5 pl-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-14 shrink-0">Opacitet</span>
                      <input
                        type="range" min={0.1} max={1} step={0.05} value={op}
                        onChange={(e) => setMapOpacity(c.id, Number(e.target.value))}
                        className="flex-1 accent-sky-500 cursor-pointer" aria-label={`Opacitet ${c.label}`}
                      />
                      <span className="text-[10px] text-slate-400 tabular-nums w-8 text-right">{Math.round(op * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 w-14 shrink-0">Ton</span>
                      {(['color', 'grayscale'] as const).map((tn) => (
                        <button
                          key={tn} onClick={() => setMapTone(c.id, tn)}
                          className={`px-2 py-0.5 rounded border text-[10px] transition-colors ${tone === tn ? 'bg-slate-700 border-slate-500 text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                        >
                          {tn === 'color' ? 'Färg' : 'Gråskala'}
                        </button>
                      ))}
                    </div>
                    {cfg && (
                      <p className="text-[10px] text-slate-500">
                        Skarp t.o.m. zoom {cfg.maxNativeZoom}{cfg.minZoom ? ` · syns från zoom ${cfg.minZoom}` : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
};
