import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
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
// Äventyr & natur (nutid) ÖVERST — besökaren först (Daniel); forskningskategorierna följer.
const GROUP_ORDER = ['adventure', 'core', 'history', 'monuments'];

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
              {it.sub != null && String(it.sub) !== '' && <span className="text-[10px] text-slate-500">{it.sub}</span>}
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

export const LandscapeNode: React.FC<{ overview: LandscapeOverview; sv: boolean; onGo: (r: string) => void }> = ({ overview: overviewProp, sv, onGo }) => {
  // Radie-vy för STÄDER (city_radius_overview → bär 'radius_m'): reglaget räknar om inom vald radie.
  const isCity = (overviewProp as unknown as { radius_m?: number }).radius_m != null;
  const [radiusKm, setRadiusKm] = useState(25);
  // overviewProp är redan 25 km-vyn (AnswerContext anropar city_radius_overview med 25000 m).
  // Hämta bara om på nytt när användaren flyttar reglaget bort från 25 — annars återanvänds
  // prop:en → inget dubblerat round-trip vid varje visning av kommunnoden.
  const customRadius = radiusKm !== 25;
  const { data: cityData } = useQuery({
    queryKey: ['city-radius-ov', overviewProp.name, radiusKm],
    enabled: isCity && customRadius,
    queryFn: async () => (((await (supabase as unknown as { rpc: (f: string, a: Record<string, unknown>) => Promise<{ data: unknown }> })
      .rpc('city_radius_overview', { p_name: overviewProp.name, p_radius_m: radiusKm * 1000 })).data) ?? null) as LandscapeOverview | null,
  });
  const overview = isCity && customRadius ? (cityData ?? overviewProp) : overviewProp;
  // Visningsnamn: kapitalisera första bokstaven (RPC/query kan ge "nybro" gement — Daniel).
  const displayName = overview.name ? overview.name.charAt(0).toUpperCase() + overview.name.slice(1) : overview.name;
  // MODERN ortsfakta: folkmängd per kommun (SCB, municipality_stats). Fyller "ingen info om orten"
  // (Daniel). Namnmatch mot kommun; modern fakta, tydligt daterad + källmärkt, aldrig historiskt lager.
  const { data: muni } = useQuery({
    queryKey: ['muni-stats', overview.name],
    enabled: !!overview.name,
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<{ population: number; population_year: number; source: string } | null> => {
      const { data } = await (supabase as unknown as { from: (t: string) => any }).from('municipality_stats')
        .select('population,population_year,source').ilike('name', overview.name).limit(1);
      return (data ?? [])[0] ?? null;
    },
  });
  // KÄNDA PERSONER HÄRIFRÅN: personer med födelseort = orten (persons.birthplace_label). Modern +
  // historisk (t.ex. Elin av Skövde 1100-tal). Belagt ur DB, aldrig påhittat. Ordnas på notabilitet.
  const { data: bornHere } = useQuery({
    queryKey: ['born-here', overview.name],
    enabled: !!overview.name,
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<Array<{ id: string; name: string; birth_year: number | null; death_year: number | null; occupations: string | null }>> => {
      const { data } = await (supabase as unknown as { from: (t: string) => any }).from('persons')
        .select('id,name,birth_year,death_year,occupations,sitelinks')
        .ilike('birthplace_label', overview.name)
        .order('sitelinks', { ascending: false, nullsFirst: false })
        .limit(10);
      return (data ?? []) as any[];
    },
  });

  const cats = (overview.categories ?? []).filter((c) => c.count > 0);
  const byKey = (k: string) => cats.find((c) => c.key === k);
  const summaryBits = ['runestones', 'churches', 'hillforts', 'picture_stones']
    .map((k) => { const c = byKey(k); return c ? `${c.count} ${(sv ? c.label_sv : c.label_en).toLowerCase()}` : null; })
    .filter(Boolean);
  // Äventyr & natur (nutid) — de "intressanta" besökskategorierna med antal, som en egen strip i noden
  // (Daniel: "visa huvudkategorierna också … samt hur många"), inte bara gömt i kart-legenden.
  const adventureCats = cats.filter((c) => (c.group ?? 'core') === 'adventure');

  // Kartlager-togglar: en per kategori som har koordinatbärande poster (default PÅ). Svamp = förberett (av).
  const mappable = cats.filter((c) => c.items.some((it) => it.lat != null && it.lng != null));
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [svampOn, setSvampOn] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false); // mobil: legenden kollapsad bakom en knapp
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Record<string, L.LayerGroup>>({});
  const circleRef = useRef<L.Circle | null>(null);
  const heroRef = useRef<L.Marker | null>(null); // markör för SÖKTA orten (så man ser var t.ex. Nybro ligger)
  const onGoRef = useRef(onGo); onGoRef.current = onGo; // stabil referens för popup-delegering

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const b = overview.bbox;
    const map = L.map(mapEl.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    if (b) map.fitBounds([[b[1], b[0]], [b[3], b[2]]], { padding: [16, 16] });
    else if (overview.center) map.setView([overview.center.lat, overview.center.lng], 9);
    // Popup öppnas vid TAP (viktigt på mobil) — "Läs mer"-länken i popupen navigerar (via ref).
    map.on('popupopen', (e: L.PopupEvent) => {
      const a = e.popup.getElement()?.querySelector<HTMLAnchorElement>('a.ln-more');
      if (a) a.addEventListener('click', (ev) => { ev.preventDefault(); const r = a.getAttribute('data-route'); if (r) onGoRef.current(r); }, { once: true });
    });
    mapRef.current = map;
    const ro = new ResizeObserver(() => { try { map.invalidateSize(); } catch { /* noop */ } });
    ro.observe(mapEl.current);
    [0, 120, 400].forEach((d) => setTimeout(() => { try { map.invalidateSize(); } catch { /* noop */ } }, d));
    return () => { ro.disconnect(); map.remove(); mapRef.current = null; layersRef.current = {}; };
  }, [overview.name]);

  // (Om)rita kategori-lager + radie-cirkel. Byggs OM vid data/radie-ändring (städer omfrågas per radie)
  // ELLER toggling — cache per cat.key räckte inte när radien byter datamängd (Daniel: räknen stämde
  // i listan men markörerna satt kvar). Därför: rensa allt och bygg om.
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    // Rensa gamla lager + cirkel.
    Object.values(layersRef.current).forEach((lg) => { try { map.removeLayer(lg); } catch { /* noop */ } });
    layersRef.current = {};
    if (circleRef.current) { try { map.removeLayer(circleRef.current); } catch { /* noop */ } circleRef.current = null; }
    if (heroRef.current) { try { map.removeLayer(heroRef.current); } catch { /* noop */ } heroRef.current = null; }
    // Radie-cirkel för städer → gör OMRÅDET synligt så man förstår att antalen är en radie-aggregation.
    if (isCity && overview.center) {
      const c = L.circle([overview.center.lat, overview.center.lng], { radius: radiusKm * 1000, color: '#f59e0b', weight: 1.5, opacity: 0.6, fillColor: '#f59e0b', fillOpacity: 0.05, dashArray: '6 6', interactive: false });
      c.addTo(map); circleRef.current = c;
      try { map.fitBounds(c.getBounds(), { padding: [16, 16] }); } catch { /* noop */ }
    }
    // HERO-markör för den sökta orten (Daniel: "jag ser inte var Nybro ligger på kartan"). Stor guldpin
    // + permanent namntagg, överst (zIndexOffset). Utanför layersRef → togglas aldrig bort av legenden.
    if (overview.center) {
      const hero = L.marker([overview.center.lat, overview.center.lng], {
        zIndexOffset: 1000,
        icon: L.divIcon({ className: '', iconSize: [30, 40], iconAnchor: [15, 38], tooltipAnchor: [0, -32],
          html: `<div style="filter:drop-shadow(0 3px 4px rgba(0,0,0,.55))"><svg viewBox="0 0 30 40" width="30" height="40"><path d="M15 39C15 39 27 24 27 14A12 12 0 1 0 3 14C3 24 15 39 15 39Z" fill="#f59e0b" stroke="#78350f" stroke-width="2"/><circle cx="15" cy="14" r="5" fill="#fff7ed" stroke="#78350f" stroke-width="1.5"/></svg></div>` }),
      });
      hero.bindTooltip(displayName, { permanent: true, direction: 'top', offset: [0, -32], className: 'answer-hero-label' });
      hero.addTo(map); heroRef.current = hero;
    }
    const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] as string));
    for (const cat of mappable) {
      const lg = L.layerGroup();
      const color = CAT_COLOR[cat.key] ?? '#f59e0b';
      const catLabel = sv ? cat.label_sv : cat.label_en;
      for (const it of cat.items) {
        if (it.lat == null || it.lng == null) continue;
        const route = itemRoute(cat.link_kind, it);
        const title = `${it.signum ? `<span style="font-family:monospace;color:#fcd34d">${esc(it.signum)}</span> ` : ''}${esc(it.label)}`;
        const sub = it.sub != null && String(it.sub) !== '' ? `<div style="font-size:11px;color:#94a3b8">${esc(String(it.sub))}</div>` : '';
        const note = it.note ? `<div style="font-size:11px;color:#94a3b8">${esc(it.note)}</div>` : '';
        // Klick = ÖPPNA POPUP (fungerar med tap på mobil). "Läs mer" navigerar via delegering (popupopen).
        L.circleMarker([it.lat, it.lng], { radius: 5, color: '#0f172a', weight: 1, fillColor: color, fillOpacity: 0.9 })
          .bindPopup(`<div style="min-width:130px"><b>${title}</b><div style="font-size:10px;color:#f59e0b;margin-top:1px">${esc(catLabel)}</div>${sub}${note}<a href="${esc(route)}" class="ln-more" data-route="${esc(route)}" style="display:inline-block;margin-top:6px;color:#fcd34d;font-size:12px">${sv ? 'Läs mer →' : 'Read more →'}</a></div>`)
          .addTo(lg);
      }
      layersRef.current[cat.key] = lg;
      if (!hidden.has(cat.key)) lg.addTo(map);
    }
    // mappable/sv härleds ur overview → overview som dep räcker (undviker re-run varje render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden, overview, radiusKm, isCity]);

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
    <div className="border-b border-slate-800 bg-slate-900 px-5 pt-4 pb-4 text-left">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300/70">
        <Landmark className="h-3 w-3" />{isCity ? (sv ? 'Ort · kunskapsnod' : 'Place · knowledge node') : (sv ? 'Landskap · kunskapsnod' : 'Province · knowledge node')}
      </div>
      <h2 className="text-2xl font-bold leading-tight text-white">{displayName}</h2>
      {muni?.population != null && (
        <p className="mt-1 text-sm text-slate-300">
          {sv ? 'Folkmängd' : 'Population'}: <span className="font-semibold text-slate-100">{muni.population.toLocaleString('sv-SE')}</span>
          <span className="text-[11px] text-slate-500"> · {muni.source} {muni.population_year}</span>
        </p>
      )}
      {summaryBits.length > 0 && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-300">{summaryBits.join(' · ')}</p>}

      {/* ÄVENTYR & NATUR (nutid) — de intressanta besökskategorierna med antal, klickbara → kartlager på/av. */}
      {adventureCats.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300/80">{sv ? 'Äventyr & natur' : 'Adventure & nature'}</span>
          {adventureCats.map((c) => {
            const on = !hidden.has(c.key);
            return (
              <button key={c.key} type="button" onClick={() => toggle(c.key)}
                title={sv ? 'Visa/dölj på kartan' : 'Toggle on map'}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${on ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100' : 'border-slate-600 text-slate-400'}`}>
                <span className="h-2 w-2 rounded-full" style={{ background: on ? (CAT_COLOR[c.key] ?? '#22d3ee') : 'transparent', border: `1.5px solid ${CAT_COLOR[c.key] ?? '#22d3ee'}` }} />
                {sv ? c.label_sv : c.label_en}<span className="tabular-nums text-emerald-300/90">{c.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Radie-reglage för städer: antalen är en OMRÅDES-aggregation man kan justera (Daniel). */}
      {isCity && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">{sv ? 'Antal inom' : 'Counts within'}</span>
          {[5, 10, 25, 50].map((km) => (
            <button key={km} onClick={() => setRadiusKm(km)}
              className={`rounded-full border px-2.5 py-0.5 ${radiusKm === km ? 'border-amber-500/60 bg-amber-500/15 text-amber-100' : 'border-slate-600 text-slate-300 hover:border-amber-500/40'}`}>
              {km} km
            </button>
          ))}
          <span className="text-slate-500">{sv ? `av ${overview.name} (justerbar radie — inte en fast lista)` : `of ${overview.name} (adjustable radius)`}</span>
        </div>
      )}

      {/* KARTA med grupperad legend till höger (Daniel: badplatser + äventyr grupperade på högersidan) */}
      {mappable.length > 0 && (
        <div className="relative mt-3 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800" style={{ height: '48vh', minHeight: 320 }}>
          <div ref={mapEl} className="absolute inset-0" />
          {/* Mobil: legenden är kollapsad bakom en knapp så den inte täcker kartan; alltid öppen från sm. */}
          <button
            type="button"
            onClick={() => setLegendOpen((v) => !v)}
            className="sm:hidden absolute right-3 top-3 z-[600] rounded-lg border border-slate-600 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-100 backdrop-blur-sm"
            aria-expanded={legendOpen}
          >
            {legendOpen ? (sv ? 'Dölj lager ✕' : 'Hide layers ✕') : (sv ? 'Lager ☰' : 'Layers ☰')}
          </button>
          <div className={`${legendOpen ? 'block' : 'hidden'} sm:block absolute right-3 top-14 sm:top-3 z-[500] max-h-[calc(100%-4rem)] sm:max-h-[calc(100%-1.5rem)] w-[190px] max-w-[70vw] overflow-y-auto rounded-lg border border-slate-600 bg-slate-900/90 p-2.5 backdrop-blur-sm`}>
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

      {/* KÄNDA PERSONER HÄRIFRÅN — belagt ur persons.birthplace_label (modern + historisk). Klick → sök personen. */}
      {bornHere && bornHere.length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300/80">
            <MapPin className="h-3.5 w-3.5" />{sv ? `Kända personer från ${displayName}` : `Notable people from ${displayName}`}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {bornHere.map((p) => {
              const yrs = p.birth_year ? `${p.birth_year}${p.death_year ? `–${p.death_year}` : ''}` : null;
              const occ = p.occupations ? String(p.occupations).split(',')[0].trim() : null;
              return (
                <button key={p.id} type="button" onClick={() => onGo(`/?q=${encodeURIComponent(p.name)}`)}
                  title={[occ, yrs].filter(Boolean).join(' · ') || undefined}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-200 hover:border-amber-500/50 hover:text-amber-100">
                  <span className="max-w-[200px] truncate">{p.name}</span>
                  {yrs && <span className="text-[10px] text-slate-500">{yrs}</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500">{sv ? 'Personer med angiven födelseort — ur databasen, ej uttömmande.' : 'People with this recorded birthplace — from the database, not exhaustive.'}</p>
        </div>
      )}

      {overview.local_sources?.length > 0 && (
        <div className="mt-3 max-w-md rounded-lg border border-slate-700 bg-slate-800/40 p-3">
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
