import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { MapPin, ExternalLink, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// LOCATE-svar: "var ligger X" → lös X mot VÅR kartdata (place_names) och ram in svaret.
//   • Träff → grönt "hittad", kartan under (AnswerContext, matad med X) visar läget.
//   • MISS → försök öppna register (Wikidata/OSM via resolve-modern-place, klient-Wikidata som fallback):
//       – modern plats hittad → visa punkten på karta, TYDLIGT märkt "modern · utanför vår historiska
//         täckning". Daniel: "jag vill kunna hitta moderna byggnader men fokus är historia."
//       – inget → ärlig studs + OSM-utlänk. Vi hittar aldrig på ett läge.

type Row = { name: string; feature_type: string | null; lat: number; lng: number };
type Modern = { found: boolean; label?: string; description?: string; lat?: number; lng?: number; source?: string; id?: string };

// Klient-fallback (om edge-funktionen inte är deployad): Wikidata wbsearchentities → P625 (CORS via origin=*).
async function wikidataClient(q: string, lang: string): Promise<Modern> {
  try {
    const s = await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=${lang}&uselang=${lang}&format=json&limit=5&origin=*`);
    const sj = await s.json();
    const cands = (sj.search ?? []) as { id: string; label?: string; description?: string }[];
    if (!cands.length) return { found: false };
    const ids = cands.map((c) => c.id).join('|');
    const e = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=claims&format=json&origin=*`);
    const ej = await e.json();
    for (const c of cands) {
      const p625 = ej.entities?.[c.id]?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
      if (p625 && typeof p625.latitude === 'number') return { found: true, label: c.label ?? q, description: c.description, lat: p625.latitude, lng: p625.longitude, source: 'wikidata', id: c.id };
    }
    return { found: false };
  } catch { return { found: false }; }
}

export const LocateAnswer: React.FC<{ place: string; sv: boolean }> = ({ place, sv }) => {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['locate-place', place],
    enabled: place.trim().length >= 2,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Row[]> => {
      const q = place.trim();
      const { data } = await (supabase as any).from('place_names')
        .select('name, feature_type, lat, lng')
        .ilike('name', `${q}%`).not('lat', 'is', null).limit(12);
      return ((data ?? []) as any[])
        .map((r) => ({ name: r.name as string, feature_type: r.feature_type as string | null, lat: Number(r.lat), lng: Number(r.lng) }))
        .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng))
        .sort((a, b) => Number(b.name.toLowerCase() === q.toLowerCase()) - Number(a.name.toLowerCase() === q.toLowerCase()));
    },
  });
  const hit = rows[0];
  const missed = !isLoading && !hit;

  // MISS → öppna register. Edge-funktion (Wikidata+OSM, cachebar) med klient-Wikidata som fallback.
  const { data: modern, isLoading: modernLoading } = useQuery({
    queryKey: ['modern-place', place],
    enabled: missed && place.trim().length >= 2,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Modern> => {
      try {
        const { data, error } = await supabase.functions.invoke('resolve-modern-place', { body: { q: place.trim(), language: sv ? 'sv' : 'en' } });
        if (!error && data && (data as Modern).found) return data as Modern;
      } catch { /* ej deployad → fallback nedan */ }
      return wikidataClient(place.trim(), sv ? 'sv' : 'en');
    },
  });
  const modernHit = modern?.found ? modern : null;

  // Minikarta för modern träff (amber, märkt modern).
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!modernHit || modernHit.lat == null || modernHit.lng == null || !mapEl.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(mapEl.current, { zoomControl: true, attributionControl: false, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapRef.current);
    }
    const m = mapRef.current;
    m.setView([modernHit.lat, modernHit.lng], 14);
    L.marker([modernHit.lat, modernHit.lng], {
      icon: L.divIcon({ className: '', iconSize: [26, 34], iconAnchor: [13, 32],
        html: `<svg viewBox="0 0 30 40" width="26" height="34"><path d="M15 39C15 39 27 24 27 14A12 12 0 1 0 3 14C3 24 15 39 15 39Z" fill="#38bdf8" stroke="#0c4a6e" stroke-width="2"/><circle cx="15" cy="14" r="5" fill="#f0f9ff" stroke="#0c4a6e" stroke-width="1.5"/></svg>` }),
    }).addTo(m);
    setTimeout(() => { try { m.invalidateSize(); } catch { /* noop */ } }, 60);
    return () => { try { mapRef.current?.remove(); mapRef.current = null; } catch { /* noop */ } };
  }, [modernHit?.lat, modernHit?.lng]);

  const osm = `https://www.openstreetmap.org/search?query=${encodeURIComponent(place)}`;

  return (
    <div className="text-left">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
        <MapPin className="h-3 w-3" />{sv ? 'Var ligger' : 'Where is'} — {place}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />{sv ? 'Söker i kartdatan…' : 'Searching the map data…'}
        </div>
      )}

      {/* Träff i VÅR historiska kartdata. */}
      {!isLoading && hit && (
        <div className="flex items-start gap-2 text-sm text-slate-200">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-50">{hit.name}</span>
            {hit.feature_type ? <span className="text-slate-400"> · {hit.feature_type}</span> : null}
            {rows.length > 1 && <span className="text-slate-400"> {sv ? `— ${rows.length > 11 ? '12+' : rows.length} platser med det namnet` : `— ${rows.length > 11 ? '12+' : rows.length} places by that name`}</span>}
            <span className="block text-slate-400">{sv ? 'Kartan nedan visar läget.' : 'The map below shows the location.'}</span>
          </p>
        </div>
      )}

      {/* MISS → söker öppna register. */}
      {missed && modernLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" />{sv ? 'Inte i vår historiska data — söker öppna register…' : 'Not in our historical data — checking open registers…'}
        </div>
      )}

      {/* MISS + modern träff (Wikidata/OSM). Tydligt märkt modern, utanför historisk täckning. */}
      {missed && !modernLoading && modernHit && (
        <div>
          <div className="flex items-start gap-2 text-sm text-slate-200">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
            <p className="leading-relaxed">
              <span className="font-semibold text-slate-50">{modernHit.label}</span>
              {modernHit.description ? <span className="text-slate-400"> · {modernHit.description}</span> : null}
              <span className="block text-sky-300/80">{sv ? 'Modern plats — utanför vår historiska täckning (vikingatid–medeltid).' : 'Modern place — outside our historical coverage.'} <span className="text-slate-500">({modernHit.source === 'wikidata' ? 'Wikidata' : 'OpenStreetMap'})</span></span>
            </p>
          </div>
          <div ref={mapEl} className="mt-2 h-40 w-full overflow-hidden rounded-lg border border-slate-700" />
        </div>
      )}

      {/* MISS + inget register-svar → ärlig studs + OSM-utlänk. */}
      {missed && !modernLoading && !modernHit && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <p className="text-sm leading-relaxed text-slate-300">
            {sv
              ? <>Vi hittar inte <span className="text-slate-100">”{place}”</span> — varken i vår historiska kartdata eller i öppna register. Vi hittar aldrig på ett läge.</>
              : <>We can’t find <span className="text-slate-100">“{place}”</span> — neither in our historical map data nor in open registers. We never invent a location.</>}
          </p>
          <a href={osm} target="_blank" rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300 hover:border-amber-500/50 hover:text-amber-100">
            {sv ? 'Sök på karta' : 'Search on map'} (OpenStreetMap) <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
};
