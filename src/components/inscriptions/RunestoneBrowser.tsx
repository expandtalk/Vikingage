import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Search, X, Cross, Layers, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRunestoneBrowser, type BrowserStone } from '@/hooks/useRunestoneBrowser';

/* ---------- Ärlig normalisering (signum-serie = landskapsindelningen i runologin) ---------- */

type LandKey = string;
interface LandDef { key: LandKey; sv: string; en: string; region: 'svealand' | 'gotaland' | 'norrland' | 'oar' | 'norden' | 'utland'; }

// Nyckel = uppercasad ledande bokstavsdel i signum (som RPC returnerar).
const SERIES_TO_LAND: Record<string, LandDef> = {
  U:   { key: 'U',  sv: 'Uppland',       en: 'Uppland',        region: 'svealand' },
  'SÖ':{ key: 'SÖ', sv: 'Södermanland',  en: 'Södermanland',   region: 'svealand' },
  VS:  { key: 'VS', sv: 'Västmanland',   en: 'Västmanland',    region: 'svealand' },
  'NÄ':{ key: 'NÄ', sv: 'Närke',         en: 'Närke',          region: 'svealand' },
  VR:  { key: 'VR', sv: 'Värmland',      en: 'Värmland',       region: 'svealand' },
  D:   { key: 'D',  sv: 'Dalarna',       en: 'Dalarna',        region: 'svealand' },
  GS:  { key: 'GS', sv: 'Gästrikland',   en: 'Gästrikland',    region: 'norrland' },
  HS:  { key: 'HS', sv: 'Hälsingland',   en: 'Hälsingland',    region: 'norrland' },
  M:   { key: 'M',  sv: 'Medelpad',      en: 'Medelpad',       region: 'norrland' },
  J:   { key: 'J',  sv: 'Jämtland',      en: 'Jämtland',       region: 'norrland' },
  'ÖG':{ key: 'ÖG', sv: 'Östergötland',  en: 'Östergötland',   region: 'gotaland' },
  VG:  { key: 'VG', sv: 'Västergötland', en: 'Västergötland',  region: 'gotaland' },
  SM:  { key: 'SM', sv: 'Småland',       en: 'Småland',        region: 'gotaland' },
  BO:  { key: 'BO', sv: 'Bohuslän',      en: 'Bohuslän',       region: 'gotaland' },
  HL:  { key: 'HL', sv: 'Halland',       en: 'Halland',        region: 'gotaland' },
  SK:  { key: 'SK', sv: 'Skåne',         en: 'Skåne',          region: 'gotaland' },
  BL:  { key: 'BL', sv: 'Blekinge',      en: 'Blekinge',       region: 'gotaland' },
  'ÖL':{ key: 'ÖL', sv: 'Öland',         en: 'Öland',          region: 'oar' },
  G:   { key: 'G',  sv: 'Gotland',       en: 'Gotland',        region: 'oar' },
  DR:  { key: 'DR', sv: 'Danmark',       en: 'Denmark',        region: 'norden' },
  DK:  { key: 'DR', sv: 'Danmark',       en: 'Denmark',        region: 'norden' },
  N:   { key: 'N',  sv: 'Norge',         en: 'Norway',         region: 'norden' },
  BERGEN: { key: 'N', sv: 'Norge',       en: 'Norway',         region: 'norden' },
  IS:  { key: 'IS', sv: 'Island',        en: 'Iceland',        region: 'norden' },
  GR:  { key: 'GR', sv: 'Grönland',      en: 'Greenland',      region: 'norden' },
  FR:  { key: 'FR', sv: 'Färöarna',      en: 'Faroe Islands',  region: 'norden' },
  KJ:  { key: 'KJ', sv: 'Urnordiska (äldre futhark)', en: 'Proto-Norse (Elder Futhark)', region: 'norden' },
  // Utland — vikingafärdernas inskrifter (serie-koder bekräftade mot exempel-signum i Rundata).
  E:   { key: 'E',  sv: 'England',        en: 'England',        region: 'utland' },
  SC:  { key: 'SC', sv: 'Skottland',      en: 'Scotland',       region: 'utland' },
  OR:  { key: 'OR', sv: 'Orkney',         en: 'Orkney',         region: 'utland' },
  IR:  { key: 'IR', sv: 'Irland',         en: 'Ireland',        region: 'utland' },
  IM:  { key: 'IM', sv: 'Isle of Man',    en: 'Isle of Man',    region: 'utland' },
  BR:  { key: 'BR', sv: 'Brittiska öarna', en: 'British Isles', region: 'utland' },
  RU:  { key: 'RU', sv: 'Ryssland (Rus)', en: 'Russia (Rus)',   region: 'utland' },
  UA:  { key: 'UA', sv: 'Ukraina',        en: 'Ukraine',        region: 'utland' },
  HAGIA: { key: 'HAGIA', sv: 'Bysans (Istanbul)', en: 'Byzantium (Istanbul)', region: 'utland' },
  PL:  { key: 'PL', sv: 'Polen',          en: 'Poland',         region: 'utland' },
};
const OVRIGT: LandDef = { key: 'OVRIGT', sv: 'Övrigt / oidentifierad serie', en: 'Other / unidentified series', region: 'utland' };

function landOf(series: string | null): LandDef {
  if (!series) return OVRIGT;
  return SERIES_TO_LAND[series] ?? OVRIGT;
}

const REGION_ORDER: Array<{ key: LandDef['region']; sv: string; en: string }> = [
  { key: 'svealand', sv: 'Svealand', en: 'Svealand' },
  { key: 'gotaland', sv: 'Götaland', en: 'Götaland' },
  { key: 'oar',      sv: 'Öland & Gotland', en: 'Öland & Gotland' },
  { key: 'norrland', sv: 'Norrland', en: 'Norrland' },
  { key: 'norden',   sv: 'Övriga Norden', en: 'Rest of the Nordics' },
  { key: 'utland',   sv: 'Utland (vikingafärder)', en: 'Abroad (Viking voyages)' },
];

/* Ornamentstil (Gräslund) — primär stil ur ev. kombinerad bedömning. */
function styleBucket(s: string | null): string {
  if (!s || !s.trim()) return 'none';
  const t = s.trim().toLowerCase();
  if (t.startsWith('pr 1') || t.startsWith('pr1')) return 'Pr1';
  if (t.startsWith('pr 2') || t.startsWith('pr2')) return 'Pr2';
  if (t.startsWith('pr 3') || t.startsWith('pr3')) return 'Pr3';
  if (t.startsWith('pr 4') || t.startsWith('pr4')) return 'Pr4';
  if (t.startsWith('pr 5') || t.startsWith('pr5')) return 'Pr5';
  if (t.startsWith('fp')) return 'Fp';
  if (t.startsWith('rak')) return 'RAK';
  if (t.startsWith('kb')) return 'KB';
  return 'ovrig';
}
const STYLE_ORDER: Array<{ key: string; sv: string; en: string }> = [
  { key: 'RAK', sv: 'RAK (odjurshuvud, ~980–1015)', en: 'RAK (~980–1015)' },
  { key: 'Fp',  sv: 'Fp (fågelperspektiv, ~1010–1050)', en: 'Fp (~1010–1050)' },
  { key: 'KB',  sv: 'KB (korsband)', en: 'KB (cross-band)' },
  { key: 'Pr1', sv: 'Pr1 (~1010–1040)', en: 'Pr1 (~1010–1040)' },
  { key: 'Pr2', sv: 'Pr2 (~1020–1050)', en: 'Pr2 (~1020–1050)' },
  { key: 'Pr3', sv: 'Pr3 (~1045–1075)', en: 'Pr3 (~1045–1075)' },
  { key: 'Pr4', sv: 'Pr4 (~1070–1100)', en: 'Pr4 (~1070–1100)' },
  { key: 'Pr5', sv: 'Pr5 (Urnesstil, ~1100–1130)', en: 'Pr5 (Urnes, ~1100–1130)' },
  { key: 'ovrig', sv: 'Äldre / övrig stil', en: 'Elder / other style' },
  { key: 'none', sv: 'Ingen stilbedömning', en: 'No style assessment' },
];

const CAT_LABELS: Record<string, [string, string]> = {
  runestone: ['Runsten', 'Rune stone'],
  plaster_inscription: ['Putsinskrift', 'Plaster inscription'],
  building_inscription: ['Byggnadsinskrift', 'Building inscription'],
  wall_inscription: ['Vägginskrift', 'Wall inscription'],
  portable_object: ['Lösföremål', 'Portable object'],
  grave_slab: ['Gravhäll', 'Grave slab'],
  fragment: ['Fragment', 'Fragment'],
  rock_carving: ['Hällristning', 'Rock carving'],
  wood: ['Trä', 'Wood'],
  bracteate: ['Brakteat', 'Bracteate'],
  liturgical_object: ['Liturgiskt föremål', 'Liturgical object'],
  cross: ['Stenkors', 'Stone cross'],
  other: ['Annat', 'Other'],
  unknown: ['Okänd kategori', 'Unknown category'],
};
function catKey(c: string | null): string { return c && CAT_LABELS[c] ? c : 'unknown'; }

/* ---------- Filtertillstånd ---------- */
interface Filters {
  lands: Set<string>;
  styles: Set<string>;
  cats: Set<string>;
  crossOnly: boolean;
  q: string;
}
const EMPTY: Filters = { lands: new Set(), styles: new Set(), cats: new Set(), crossOnly: false, q: '' };

function matches(s: BrowserStone, f: Filters, except?: keyof Filters): boolean {
  if (except !== 'lands' && f.lands.size && !f.lands.has(landOf(s.series).key)) return false;
  if (except !== 'styles' && f.styles.size && !f.styles.has(styleBucket(s.style_group))) return false;
  if (except !== 'cats' && f.cats.size && !f.cats.has(catKey(s.object_category))) return false;
  if (except !== 'crossOnly' && f.crossOnly && !s.has_cross) return false;
  if (except !== 'q' && f.q) {
    const q = f.q.trim().toLowerCase();
    if (q && !(s.signum || '').toLowerCase().includes(q)) return false;
  }
  return true;
}

const MAP_MAX = 12000;   // säkerhetstak (korpusen är ~7 400)
const LIST_CAP = 250;    // renderad lista (ingen tyst trunkering — antal visas)

export const RunestoneBrowser: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const navigate = useNavigate();
  const { data, isLoading, error } = useRunestoneBrowser();
  const stones = useMemo(() => data ?? [], [data]);

  const [f, setF] = useState<Filters>(EMPTY);

  const filtered = useMemo(() => stones.filter((s) => matches(s, f)), [stones, f]);

  // Fasetträkning: räkna varje fasetts alternativ mot alla ANDRA aktiva filter (äkta faceting).
  const landCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of stones) if (matches(s, f, 'lands')) { const k = landOf(s.series).key; m.set(k, (m.get(k) || 0) + 1); }
    return m;
  }, [stones, f]);
  const styleCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of stones) if (matches(s, f, 'styles')) { const k = styleBucket(s.style_group); m.set(k, (m.get(k) || 0) + 1); }
    return m;
  }, [stones, f]);
  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of stones) if (matches(s, f, 'cats')) { const k = catKey(s.object_category); m.set(k, (m.get(k) || 0) + 1); }
    return m;
  }, [stones, f]);
  const crossCount = useMemo(
    () => stones.reduce((n, s) => n + (matches(s, f, 'crossOnly') && s.has_cross ? 1 : 0), 0),
    [stones, f],
  );

  // Landskap grupperade per region, i geografisk ordning; endast de som finns i datan.
  const landGroups = useMemo(() => {
    const seen = new Map<string, LandDef>();
    for (const s of stones) { const d = landOf(s.series); if (!seen.has(d.key)) seen.set(d.key, d); }
    return REGION_ORDER.map((r) => ({
      region: r,
      lands: [...seen.values()]
        .filter((d) => d.region === r.key)
        .sort((a, b) => (landCounts.get(b.key) || 0) - (landCounts.get(a.key) || 0)),
    })).filter((g) => g.lands.length > 0);
  }, [stones, landCounts]);

  const sortedList = useMemo(
    () => [...filtered].sort((a, b) => (a.signum || '').localeCompare(b.signum || '', 'sv', { numeric: true })),
    [filtered],
  );

  const toggle = (key: keyof Filters, v: string) => setF((prev) => {
    const next = new Set(prev[key] as Set<string>);
    next.has(v) ? next.delete(v) : next.add(v);
    return { ...prev, [key]: next };
  });
  const anyActive = f.lands.size || f.styles.size || f.cats.size || f.crossOnly || f.q;

  /* ---------- Karta ---------- */
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.LayerGroup | null>(null);
  const canvasRef = useRef<L.Canvas | null>(null);

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { preferCanvas: true, center: [59.3, 16.5], zoom: 5, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 18,
    }).addTo(map);
    canvasRef.current = L.canvas({ padding: 0.5 });
    clusterRef.current = typeof (L as any).markerClusterGroup === 'function'
      ? (L as any).markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 50, disableClusteringAtZoom: 12 })
      : L.layerGroup();
    clusterRef.current!.addTo(map);
    map.on('popupopen', (e: L.PopupEvent) => {
      const a = (e.popup as any).getElement()?.querySelector('[data-nav]') as HTMLAnchorElement | null;
      if (a) a.onclick = (ev) => { ev.preventDefault(); navigate('/inscription/' + encodeURIComponent(a.getAttribute('data-nav') || '')); };
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rita om markörer när urvalet ändras.
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    cluster.clearLayers();
    const pts = filtered.slice(0, MAP_MAX);
    for (const s of pts) {
      const cross = !!s.has_cross;
      const m = L.circleMarker([s.lat, s.lng], {
        renderer: canvasRef.current || undefined,
        radius: 4,
        color: '#ffffff',
        weight: 1,
        fillColor: cross ? '#c084fc' : '#f59e0b',
        fillOpacity: 0.9,
      });
      const land = landOf(s.series);
      const st = styleBucket(s.style_group);
      const stLabel = STYLE_ORDER.find((x) => x.key === st);
      m.bindPopup(
        `<div style="min-width:180px">
           <div style="font-weight:700;font-size:14px;color:#111">${s.signum || ''}</div>
           <div style="font-size:12px;color:#444;margin-top:2px">${sv ? land.sv : land.en}${s.dating_text ? ' · ' + s.dating_text : ''}</div>
           ${st !== 'none' ? `<div style="font-size:12px;color:#444">${sv ? 'Stil' : 'Style'}: ${stLabel ? stLabel.sv.split(' (')[0] : st}</div>` : ''}
           ${cross ? `<div style="font-size:12px;color:#7c3aed">${sv ? '† korsmarkerad' : '† cross-marked'}</div>` : ''}
           <a data-nav="${encodeURIComponent(s.signum || '').replace(/"/g, '')}" href="/inscription/${encodeURIComponent(s.signum || '')}" style="display:inline-block;margin-top:6px;font-size:12px;font-weight:600;color:#b45309">${sv ? 'Öppna inskrift →' : 'Open inscription →'}</a>
         </div>`,
      );
      cluster.addLayer(m);
    }
  }, [filtered, sv]);

  const zoomToSelection = () => {
    const map = mapRef.current;
    if (!map || !filtered.length) return;
    map.fitBounds(L.latLngBounds(filtered.slice(0, MAP_MAX).map((s) => [s.lat, s.lng] as [number, number])), { padding: [30, 30] });
  };

  /* ---------- UI ---------- */
  const FacetRow: React.FC<{ label: string; count: number; active: boolean; onClick: () => void }> = ({ label, count, active, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-[13px] transition-colors ${active ? 'bg-amber-500/20 text-amber-200' : 'text-slate-300 hover:bg-slate-700/50'}`}
    >
      <span className="flex items-center gap-1.5">
        <span className={`inline-block h-3 w-3 shrink-0 rounded-sm border ${active ? 'border-amber-400 bg-amber-400' : 'border-slate-500'}`} />
        <span>{label}</span>
      </span>
      <span className="tabular-nums text-slate-400">{count}</span>
    </button>
  );

  return (
    <Card className="border-slate-700 bg-slate-800/60">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
          {/* Vänster: fasetter */}
          <aside className="border-b border-slate-700 lg:border-b-0 lg:border-r max-h-[68vh] overflow-y-auto p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <Layers className="h-4 w-4 text-amber-400" /> {sv ? 'Filtrera' : 'Filter'}
              </div>
              {anyActive ? (
                <button onClick={() => setF(EMPTY)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
                  <RotateCcw className="h-3 w-3" /> {sv ? 'Nollställ' : 'Reset'}
                </button>
              ) : null}
            </div>

            {/* Sök signum */}
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
              <input
                value={f.q}
                onChange={(e) => setF((p) => ({ ...p, q: e.target.value }))}
                placeholder={sv ? 'Sök signum (t.ex. U 240)' : 'Search signum (e.g. U 240)'}
                className="w-full rounded border border-slate-600 bg-slate-900 py-1.5 pl-8 pr-7 text-[13px] text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
              {f.q ? (
                <button onClick={() => setF((p) => ({ ...p, q: '' }))} className="absolute right-2 top-2 text-slate-500 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {/* Korsmarkerade */}
            <button
              type="button"
              onClick={() => setF((p) => ({ ...p, crossOnly: !p.crossOnly }))}
              className={`mb-3 flex w-full items-center justify-between rounded px-2 py-1.5 text-[13px] ${f.crossOnly ? 'bg-purple-500/20 text-purple-200' : 'text-slate-300 hover:bg-slate-700/50'}`}
            >
              <span className="flex items-center gap-1.5"><Cross className="h-3.5 w-3.5" /> {sv ? 'Endast korsmarkerade' : 'Cross-marked only'}</span>
              <span className="tabular-nums text-slate-400">{crossCount}</span>
            </button>

            {/* Landskap (signum-serie) */}
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{sv ? 'Landskap (signum-serie)' : 'Province (signum series)'}</div>
            {landGroups.map((g) => (
              <div key={g.region.key} className="mb-2">
                <div className="px-2 py-0.5 text-[11px] font-medium text-slate-500">{sv ? g.region.sv : g.region.en}</div>
                {g.lands.map((d) => (
                  <FacetRow
                    key={d.key}
                    label={`${sv ? d.sv : d.en}`}
                    count={landCounts.get(d.key) || 0}
                    active={f.lands.has(d.key)}
                    onClick={() => toggle('lands', d.key)}
                  />
                ))}
              </div>
            ))}

            {/* Ornamentstil */}
            <div className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{sv ? 'Ornamentstil (Gräslund)' : 'Ornament style (Gräslund)'}</div>
            {STYLE_ORDER.filter((x) => (styleCounts.get(x.key) || 0) > 0).map((x) => (
              <FacetRow key={x.key} label={sv ? x.sv : x.en} count={styleCounts.get(x.key) || 0} active={f.styles.has(x.key)} onClick={() => toggle('styles', x.key)} />
            ))}

            {/* Objektkategori */}
            <div className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{sv ? 'Objektkategori' : 'Object category'}</div>
            {Object.keys(CAT_LABELS).filter((k) => (catCounts.get(k) || 0) > 0).map((k) => (
              <FacetRow key={k} label={sv ? CAT_LABELS[k][0] : CAT_LABELS[k][1]} count={catCounts.get(k) || 0} active={f.cats.has(k)} onClick={() => toggle('cats', k)} />
            ))}
          </aside>

          {/* Höger: karta + lista */}
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 px-3 py-2">
              <div className="flex items-center gap-1.5 text-sm text-slate-200">
                <MapPin className="h-4 w-4 text-amber-400" />
                {isLoading
                  ? (sv ? 'Laddar…' : 'Loading…')
                  : (sv ? `${filtered.length.toLocaleString('sv-SE')} av ${stones.length.toLocaleString('sv-SE')} inskrifter` : `${filtered.length} of ${stones.length} inscriptions`)}
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={zoomToSelection} disabled={!filtered.length}>
                {sv ? 'Zooma till urval' : 'Zoom to selection'}
              </Button>
            </div>

            {error ? (
              <div className="p-4 text-sm text-red-300">{sv ? 'Kunde inte ladda korpusen.' : 'Could not load the corpus.'}</div>
            ) : null}

            <div className="relative">
              <div ref={mapEl} className="h-[46vh] min-h-[320px] w-full bg-slate-900" />
              {/* Teckenförklaring till höger — marker-nyckel (Daniel). pointer-events-none så den
                  inte blockerar kartinteraktion. */}
              <div className="pointer-events-none absolute right-3 top-3 z-[500] rounded-lg border border-slate-600 bg-slate-900/90 px-3 py-2 text-[11px] backdrop-blur-sm">
                <div className="mb-1 font-semibold uppercase tracking-wide text-amber-300/80">
                  {sv ? 'Teckenförklaring' : 'Legend'}
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#f59e0b', border: '1.5px solid #ffffff' }} />
                  {sv ? 'Runsten' : 'Runestone'}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-slate-200">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#c084fc', border: '1.5px solid #ffffff' }} />
                  {sv ? 'Korsmarkerad (kristen)' : 'Cross-marked (Christian)'}
                </div>
              </div>
            </div>

            {/* Lista (signum-sorterad) */}
            <div className="max-h-[34vh] overflow-y-auto border-t border-slate-700">
              {sortedList.slice(0, LIST_CAP).map((s) => {
                const land = landOf(s.series);
                const st = styleBucket(s.style_group);
                return (
                  <button
                    key={s.id}
                    onClick={() => navigate('/inscription/' + encodeURIComponent(s.signum || ''))}
                    className="flex w-full items-center justify-between gap-3 border-b border-slate-800 px-3 py-1.5 text-left hover:bg-slate-700/40"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="w-24 shrink-0 truncate font-mono text-[13px] font-semibold text-amber-300">{s.signum}</span>
                      <span className="truncate text-[12px] text-slate-400">{sv ? land.sv : land.en}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {s.has_cross ? <span className="text-[11px] text-purple-300">†</span> : null}
                      {st !== 'none' ? <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300">{st === 'ovrig' ? (sv ? 'övr.' : 'other') : st}</span> : null}
                      {s.dating_text ? <span className="hidden text-[11px] text-slate-500 sm:inline">{s.dating_text}</span> : null}
                    </span>
                  </button>
                );
              })}
              {sortedList.length > LIST_CAP ? (
                <div className="px-3 py-2 text-center text-[12px] text-slate-500">
                  {sv
                    ? `Visar ${LIST_CAP} av ${sortedList.length.toLocaleString('sv-SE')} — förfina filtret för att se fler i listan (alla ${filtered.length.toLocaleString('sv-SE')} ritas på kartan).`
                    : `Showing ${LIST_CAP} of ${sortedList.length} — refine the filter to list more (all ${filtered.length} are drawn on the map).`}
                </div>
              ) : null}
              {!isLoading && sortedList.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-slate-500">{sv ? 'Inga inskrifter matchar filtret.' : 'No inscriptions match the filter.'}</div>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RunestoneBrowser;
