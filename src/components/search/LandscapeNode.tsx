import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Landmark, ChevronRight, ScrollText, MapPin, Sprout } from 'lucide-react';

// Strukturerad LANDSKAPSNOD i söksvaret. Matar ur RPC:n landscape_overview(): kategori-antal +
// kollapsbara drill-in-sektioner (Ö1/G1 + namn → detaljsida) + lokala rättskällor + EGEN karta med
// grupperad legend (Kärnbestånd / Fornlämningar / Äventyr & natur / Svamp). INGEN GISSNING: siffror ur DB;
// svampläget visas som FÖRBERETT (inga påhittade plockplatser). Kartan visar ett urval per kategori.

export interface LandscapeItem { id: string; label: string; signum?: string | null; sub?: string | number | null; note?: string | null; lat?: number | null; lng?: number | null; }
export interface LandscapeCategory { key: string; link_kind: string; group?: string; label_sv: string; label_en: string; count: number; items: LandscapeItem[]; }
export interface LandscapeSource { id: string; title: string; work_type: string | null; year: number | null; note: string | null; }
export interface LandscapeOverview {
  name: string;
  center?: { lat: number; lng: number } | null;
  bbox?: [number, number, number, number] | null;
  categories: LandscapeCategory[];
  local_sources: LandscapeSource[];
  svamp?: { status: string; note: string } | null;
}

const CAT_COLOR: Record<string, string> = {
  landmarks: '#fcd34d', runestones: '#f59e0b', hillforts: '#fca5a5', churches: '#a78bfa', coins: '#eab308',
  events: '#f9a8d4', wrecks: '#fb7185',
  picture_stones: '#38bdf8', gravefields: '#34d399', stone_monuments: '#94a3b8', church_ruins: '#c4b5fd',
  rock_art: '#fbbf24', labyrinths: '#f0abfc', caves: '#a3a3a3', execution_sites: '#f87171',
  thing_sites: '#fdba74', bathing: '#22d3ee',
};
const GROUP_LABEL: Record<string, { sv: string; en: string }> = {
  core: { sv: 'Kärnbestånd', en: 'Core' },
  history: { sv: 'Historia & händelser', en: 'History & events' },
  monuments: { sv: 'Fornlämningar & monument', en: 'Monuments' },
  adventure: { sv: 'Äventyr & natur', en: 'Adventure & nature' },
};
const GROUP_ORDER = ['core', 'history', 'monuments', 'adventure'];

const itemRoute = (kind: string, it: LandscapeItem): string => {
  switch (kind) {
    case 'inscription': return `/inscription/${encodeURIComponent(it.signum ?? it.label)}`;
    case 'hillfort': return `/fortresses/${it.id}`;
    case 'coin': return `/coins/${it.id}`;
    default: return `/explore?searchQuery=${encodeURIComponent(it.label)}`; // church, heritage, landmarks, event, wreck, experience
  }
};

const CatSection: React.FC<{ cat: LandscapeCategory; sv: boolean; onGo: (r: string) => void }> = ({ cat, sv, onGo }) => {
  const label = sv ? cat.label_sv : cat.label_en;
  return (
    <details className="group rounded-lg border border-slate-700 bg-slate-800/40 open:bg-slate-800/70">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CAT_COLOR[cat.key] ?? '#f59e0b' }} />
        <span className="font-medium text-slate-100">{label}</span>
        <span className="tabular-nums text-amber-300">{cat.count}</span>
        <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-90" />
      </summary>
      <div className="px-3 pb-3 pt-0.5">
        <div className="flex flex-wrap gap-1.5">
          {cat.items.map((it) => (
            <button key={it.id} type="button" onClick={() => onGo(itemRoute(cat.link_kind, it))}
              title={it.note ?? (it.signum && it.signum !== it.label ? it.signum : undefined) ?? undefined}
              className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-200 hover:border-amber-500/50 hover:text-amber-100">
              {cat.link_kind === 'inscription' && it.signum && (
                <span className="font-mono text-[10px] text-amber-300/80">{it.signum}</span>
              )}
              <span className="max-w-[220px] truncate">{it.label}</span>
              {['churches', 'events', 'wrecks'].includes(cat.key) && it.sub && <span className="text-[10px] text-slate-500">{it.sub}</span>}
            </button>
          ))}
        </div>
        {cat.count > cat.items.length && (
          <p className="mt-1.5 text-[11px] text-slate-500">
            {sv ? `Visar ${cat.items.length} av ${cat.count} — öppna på kartan för alla.` : `Showing ${cat.items.length} of ${cat.count}.`}
          </p>
        )}
      </div>
    </details>
  );
};

export const LandscapeNode: React.FC<{ overview: LandscapeOverview; sv: boolean; onGo: (r: string) => void }> = ({ overview, sv, onGo }) => {
  const cats = (overview.categories ?? []).filter((c) => c.count > 0);
  const byKey = (k: string) => cats.find((c) => c.key === k);
  const summaryBits = ['runestones', 'churches', 'hillforts', 'picture_stones']
    .map((k) => { const c = byKey(k); return c ? `${c.count} ${(sv ? c.label_sv : c.label_en).toLowerCase()}` : null; })
    .filter(Boolean);

  // Kartlager-togglar: en per kategori som har koordinatbärande poster (default PÅ). Svamp = förberett (av).
  const mappable = cats.filter((c) => c.items.some((it) => it.lat != null && it.lng != null));
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [svampOn, setSvampOn] = useState(false);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Record<string, L.LayerGroup>>({});

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const b = overview.bbox;
    const map = L.map(mapEl.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    if (b) map.fitBounds([[b[1], b[0]], [b[3], b[2]]], { padding: [16, 16] });
    else if (overview.center) map.setView([overview.center.lat, overview.center.lng], 9);
    mapRef.current = map;
    const ro = new ResizeObserver(() => { try { map.invalidateSize(); } catch { /* noop */ } });
    ro.observe(mapEl.current);
    [0, 120, 400].forEach((d) => setTimeout(() => { try { map.invalidateSize(); } catch { /* noop */ } }, d));
    return () => { ro.disconnect(); map.remove(); mapRef.current = null; layersRef.current = {}; };
  }, [overview.name]);

  // (Om)rita kategori-lager när togglar ändras.
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    for (const cat of mappable) {
      if (!layersRef.current[cat.key]) {
        const lg = L.layerGroup();
        const color = CAT_COLOR[cat.key] ?? '#f59e0b';
        for (const it of cat.items) {
          if (it.lat == null || it.lng == null) continue;
          L.circleMarker([it.lat, it.lng], { radius: 5, color: '#0f172a', weight: 1, fillColor: color, fillOpacity: 0.9 })
            .bindPopup(`<b>${it.signum ? it.signum + ' ' : ''}${it.label}</b>`)
            .on('click', () => onGo(itemRoute(cat.link_kind, it)))
            .addTo(lg);
        }
        layersRef.current[cat.key] = lg;
      }
      const lg = layersRef.current[cat.key];
      if (hidden.has(cat.key)) map.removeLayer(lg); else lg.addTo(map);
    }
  }, [hidden, overview.name]);

  const toggle = (k: string) => setHidden((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const renderGroup = (g: string) => {
    const inGroup = cats.filter((c) => (c.group ?? 'core') === g);
    if (inGroup.length === 0) return null;
    return (
      <div key={g} className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{GROUP_LABEL[g]?.[sv ? 'sv' : 'en'] ?? g}</div>
        {inGroup.map((c) => <CatSection key={c.key} cat={c} sv={sv} onGo={onGo} />)}
      </div>
    );
  };

  return (
    <div className="border-b border-slate-800 bg-slate-900 px-5 pt-4 pb-4">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300/70">
        <Landmark className="h-3 w-3" />{sv ? 'Landskap · kunskapsnod' : 'Province · knowledge node'}
      </div>
      <h2 className="text-2xl font-bold leading-tight text-white">{overview.name}</h2>
      {summaryBits.length > 0 && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-300">{summaryBits.join(' · ')}</p>}

      {/* KARTA med grupperad legend till höger (Daniel: badplatser + äventyr grupperade på högersidan) */}
      {mappable.length > 0 && (
        <div className="relative mt-3 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800" style={{ height: '48vh', minHeight: 320 }}>
          <div ref={mapEl} className="absolute inset-0" />
          <div className="absolute right-3 top-3 z-[500] max-h-[calc(100%-1.5rem)] w-[190px] overflow-y-auto rounded-lg border border-slate-600 bg-slate-900/90 p-2.5 backdrop-blur-sm">
            {GROUP_ORDER.map((g) => {
              const inGroup = mappable.filter((c) => (c.group ?? 'core') === g);
              if (!inGroup.length) return null;
              return (
                <div key={g} className="mb-2 last:mb-0">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300/80">{GROUP_LABEL[g]?.[sv ? 'sv' : 'en'] ?? g}</div>
                  {inGroup.map((c) => {
                    const on = !hidden.has(c.key);
                    return (
                      <button key={c.key} onClick={() => toggle(c.key)} className="flex w-full items-center gap-2 py-0.5 text-left text-xs">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: on ? CAT_COLOR[c.key] : 'transparent', border: `1.5px solid ${CAT_COLOR[c.key]}` }} />
                        <span className={`truncate ${on ? 'text-slate-100' : 'text-slate-500'}`}>{sv ? c.label_sv : c.label_en}</span>
                        <span className="ml-auto shrink-0 tabular-nums text-[10px] text-slate-500">{c.count}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {/* Svamp: förberedd sektion (ingen data ännu — inga påhittade plockplatser) */}
            {overview.svamp && (
              <div className="mt-2 border-t border-slate-700 pt-2">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300/80">{sv ? 'Svamp' : 'Mushrooms'}</div>
                <button onClick={() => setSvampOn((v) => !v)} className="flex w-full items-center gap-2 py-0.5 text-left text-xs" title={overview.svamp.note}>
                  <Sprout className="h-3 w-3 shrink-0 text-emerald-400/70" />
                  <span className="truncate text-slate-400">{sv ? 'Svampläge' : 'Foraging'}</span>
                  <span className="ml-auto shrink-0 rounded bg-slate-700 px-1 text-[9px] uppercase text-slate-300">{sv ? 'förbereds' : 'soon'}</span>
                </button>
                {svampOn && <p className="mt-1 text-[10px] leading-snug text-slate-500">{overview.svamp.note}</p>}
              </div>
            )}
          </div>
          <p className="absolute bottom-2 left-3 z-[500] rounded bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-400">
            {sv ? 'Kartan visar ett urval per kategori' : 'Map shows a sample per category'}
          </p>
        </div>
      )}

      {/* Kollapsbara drill-in-sektioner i grupperade kolumner */}
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {GROUP_ORDER.map(renderGroup)}
      </div>

      {overview.local_sources?.length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300/80">
            <ScrollText className="h-3.5 w-3.5" />{sv ? 'Lokala källor & lagar' : 'Local sources & laws'}
          </div>
          <ul className="space-y-1.5">
            {overview.local_sources.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => onGo(`/sources/${s.id}`)} className="text-left text-sm text-slate-200 hover:text-amber-100">
                  <span className="font-medium">{s.title}</span>
                  {(s.work_type || s.year) && <span className="text-[11px] text-slate-500"> — {[s.work_type, s.year].filter(Boolean).join(', ')}</span>}
                </button>
                {s.note && <p className="text-[11px] leading-snug text-slate-500">{s.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="button" onClick={() => onGo(`/explore?searchQuery=${encodeURIComponent(overview.name)}`)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-500/20">
        <MapPin className="h-3.5 w-3.5" />{sv ? `Öppna hela ${overview.name} på kartan` : `Open all of ${overview.name} on the map`}
      </button>
    </div>
  );
};
