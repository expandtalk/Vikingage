import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPinned, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// "Vad finns här?" — löser tät-kart-problemet: med alla lager på är bara ÖVERSTA canvas-markören
// klickbar (preferCanvas), så underliggande lagers innehåll går inte att nå. Detta läge fångar
// klicket på KART-CONTAINERN (capture-fas → funkar även ovanpå markörer) och listar ALLT inom en
// KORT radie (meter) via place_features_near — samma motor som PlaceMap, men liten radie.

type Feat = { layer: string; id: string; name: string | null; lat: number; lng: number; sublabel: string | null; source: string };

const LABELS: Record<string, { label: string; color: string }> = {
  megalit: { label: 'Megalitgrav/stensättning', color: '#a78bfa' },
  hallristning: { label: 'Hällristning', color: '#fb923c' },
  grotta: { label: 'Grotta', color: '#9ca3af' },
  rest_sten: { label: 'Rest sten', color: '#cbd5e1' },
  offer: { label: 'Offer/kultplats', color: '#34d399' },
  fornlamning: { label: 'Fornlämning', color: '#64748b' },
  runsten: { label: 'Runsten', color: '#f59e0b' },
  bildsten: { label: 'Bildsten', color: '#eab308' },
  mynt: { label: 'Myntfynd', color: '#fbbf24' },
  kristen: { label: 'Kristen plats', color: '#38bdf8' },
  kyrka: { label: 'Kyrka', color: '#0ea5e9' },
  avrattning: { label: 'Avrättningsplats', color: '#ef4444' },
};

export const WhatsHereProbe: React.FC<{ map: L.Map | null }> = ({ map }) => {
  const [active, setActive] = useState(false);
  const [radius, setRadius] = useState(250);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Feat[] | null>(null);
  const markRef = useRef<L.LayerGroup | null>(null);

  // Klick-fångare på kart-containern (capture) — funkar även på täta canvas-markörer.
  useEffect(() => {
    if (!map || !active) return;
    const el = map.getContainer();
    const prevCursor = el.style.cursor;
    el.style.cursor = 'crosshair';
    const onClick = (ev: MouseEvent) => {
      ev.stopPropagation(); ev.preventDefault();
      const ll = map.mouseEventToLatLng(ev);
      void probe(ll.lat, ll.lng);
    };
    el.addEventListener('click', onClick, true);
    return () => { el.removeEventListener('click', onClick, true); el.style.cursor = prevCursor; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, active, radius]);

  // Rensa markering + panel när läget stängs.
  useEffect(() => {
    if (active) return;
    setResults(null);
    try { markRef.current?.clearLayers(); } catch { /* noop */ }
  }, [active]);

  const probe = async (lat: number, lng: number) => {
    if (!map) return;
    setBusy(true); setResults(null);
    // Rita var man klickade + radien.
    if (!markRef.current) markRef.current = L.layerGroup().addTo(map);
    markRef.current.clearLayers();
    L.circle([lat, lng], { radius, color: '#fbbf24', weight: 1.5, fillColor: '#fbbf24', fillOpacity: 0.08, dashArray: '4 4' }).addTo(markRef.current);
    try {
      const { data, error } = await (supabase as any).rpc('place_features_near', {
        p_lat: lat, p_lng: lng, p_radius_m: radius, p_per_layer: 50,
      });
      if (error) throw error;
      const feats = ((data ?? []) as Feat[]).slice().sort((a, b) => a.layer.localeCompare(b.layer) || (a.name ?? '').localeCompare(b.name ?? '', 'sv'));
      setResults(feats);
    } catch {
      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  const openFeature = (f: Feat) => {
    if (!map) return;
    map.flyTo([f.lat, f.lng], Math.max(map.getZoom(), 14), { duration: 0.5 });
    if (f.source === 'runic_inscriptions') {
      const open = (window as unknown as { __openInscriptionById?: (id: string) => void }).__openInscriptionById;
      if (open) open(f.id);
    }
  };

  return (
    <div className="absolute bottom-4 left-4 z-[1100] max-w-[min(20rem,calc(100vw-2rem))]">
      {!active ? (
        <button
          onClick={() => setActive(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/60 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-amber-100 shadow-lg backdrop-blur hover:bg-slate-800"
        >
          <MapPinned className="h-3.5 w-3.5" /> Vad finns här?
        </button>
      ) : (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-200">
              <MapPinned className="h-3.5 w-3.5" /> Vad finns här?
            </span>
            <div className="flex items-center gap-1">
              {[100, 250, 500].map((r) => (
                <button key={r} onClick={() => setRadius(r)}
                  className={`rounded px-1.5 py-0.5 text-[10px] ${radius === r ? 'bg-amber-500/25 text-amber-100' : 'text-slate-400 hover:text-slate-200'}`}>
                  {r} m
                </button>
              ))}
              <button onClick={() => setActive(false)} className="ml-1 text-slate-400 hover:text-white" aria-label="Stäng">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="max-h-[40vh] overflow-y-auto px-2 py-2">
            {!results && !busy && <p className="px-1 text-xs text-slate-400">Klicka på en punkt på kartan.</p>}
            {busy && <p className="flex items-center gap-1.5 px-1 text-xs text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Söker…</p>}
            {results && results.length === 0 && !busy && <p className="px-1 text-xs text-slate-400">Inget katalogfört inom {radius} m.</p>}
            {results && results.length > 0 && (
              <ul className="space-y-0.5">
                {results.map((f) => {
                  const m = LABELS[f.layer] ?? { label: f.layer, color: '#94a3b8' };
                  return (
                    <li key={`${f.source}-${f.id}`}>
                      <button onClick={() => openFeature(f)} className="flex w-full items-start gap-2 rounded px-1.5 py-1 text-left hover:bg-amber-500/10">
                        <span className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: m.color }} />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium text-slate-100">{f.name || '(namnlös)'}</span>
                          <span className="block truncate text-[10px] text-slate-400">{m.label}{f.sublabel && f.sublabel !== f.name ? ` · ${f.sublabel}` : ''}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
