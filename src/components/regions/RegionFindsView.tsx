import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Church, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { addRunicInscriptionMarkers } from '@/hooks/map/useRunicInscriptionMarkers';
import { useParishGovernance, useRegionForts } from '@/hooks/useParishGovernance';
import { buildRegionGroups, type RegionGroup, type RegionMode } from './regionGrouping';

const ROLE_LABEL: Record<string, string> = {
  archbishop: 'ärkebiskop', bishop: 'biskop', parish_priest: 'kyrkoherde',
  abbot: 'abbot', abbess: 'abbedissa', prior: 'prior', dean: 'dekan', provost: 'prost',
};

interface RegionFindsViewProps {
  /** Hela den laddade inskriftsuppsättningen (med socken/harad + coordinates). */
  inscriptions: any[];
  mode: RegionMode;
  onResultClick?: (inscription: any) => void;
}

// Land-etikett (SV). Land härleds ur signum/härad-suffix i regionGrouping.ts.
const COUNTRY_LABEL_SV: Record<string, string> = {
  sweden: 'Sverige', denmark: 'Danmark', norway: 'Norge', greenland: 'Grönland',
  germany: 'Tyskland', netherlands: 'Nederländerna', poland: 'Polen', ukraine: 'Ukraina',
  'united kingdom': 'Storbritannien', finland: 'Finland', britain: 'Storbritannien',
  estonia: 'Estland', ireland: 'Irland', scotland: 'Skottland', iceland: 'Island', other: 'Övrigt',
};

export const RegionFindsView: React.FC<RegionFindsViewProps> = ({ inscriptions, mode, onResultClick }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const c = sv
    ? {
        title: mode === 'hundreds' ? 'Härader' : 'Socknar',
        intro: mode === 'hundreds'
          ? 'Historiska härader med fynd. Välj ett för att se dess runstenar på kartan.'
          : 'Historiska socknar med fynd. Välj en för att se dess runstenar på kartan.',
        search: mode === 'hundreds' ? 'Sök härad…' : 'Sök socken…',
        finds: 'fynd',
        pick: 'Välj ett område i listan för att se fynden på kartan.',
        showing: 'Visar',
        all: 'Alla områden',
        sortName: 'A–Ö',
        sortCount: 'Flest fynd',
        sortCountry: 'Land',
      }
    : {
        title: mode === 'hundreds' ? 'Hundreds' : 'Parishes',
        intro: mode === 'hundreds'
          ? 'Historical hundreds with finds. Pick one to see its runestones on the map.'
          : 'Historical parishes with finds. Pick one to see its runestones on the map.',
        search: mode === 'hundreds' ? 'Search hundred…' : 'Search parish…',
        finds: 'finds',
        pick: 'Pick a region in the list to see its finds on the map.',
        showing: 'Showing',
        all: 'All regions',
        sortName: 'A–Z',
        sortCount: 'Most finds',
        sortCountry: 'Country',
      };

  const countryLabel = (key: string): string => {
    if (!key) return '';
    if (sv) return COUNTRY_LABEL_SV[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  // Gruppera fynden namnkollisions-säkert (härad-annars-landskap) via ren modul.
  const regions = useMemo<RegionGroup[]>(() => buildRegionGroups(inscriptions, mode), [inscriptions, mode]);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'country'>('name');

  // `selected` håller gruppens unika NYCKEL (namn+härad/landskap) så att t.ex. de två
  // Kalmar-socknarna går att välja var för sig. Namnet härleds för visning/governance.
  const selectedGroup = useMemo(() => regions.find((r) => r.key === selected) ?? null, [regions, selected]);
  const selectedName = selectedGroup?.name ?? null;

  // Socken-styrpanel: kyrkor + stiftshistorik + ledarskap (bara i parishes-läget).
  // Skickar gruppens landskap → disambiguerar homonyma socknar (Kalmar Uppland vs Småland).
  const governance = useParishGovernance(
    mode === 'parishes' ? selectedName : null,
    mode === 'parishes' ? selectedGroup?.landscape ?? null : null,
  );
  // Fornborgar i regionen (svar på "har inte X en borg?") — visas på kartan + i panelen.
  const forts = useRegionForts(mode === 'parishes' ? selectedName : null);

  // Deep-link: /explore?focus=parishes&region=Runsten förväljer socknen/häradet.
  // (Globalsökets socken-träffar länkar hit — textsök på t.ex. "Runsten" är fel
  // verktyg för ett ortnamn som också är ett vanligt ord.)
  const appliedRegionParam = useRef(false);
  useEffect(() => {
    if (appliedRegionParam.current || regions.length === 0) return;
    const param = new URLSearchParams(window.location.search).get('region')?.trim();
    if (!param) { appliedRegionParam.current = true; return; }
    const match = regions.find((r) => r.name.toLowerCase() === param.toLowerCase())
      ?? regions.find((r) => r.name.toLowerCase().startsWith(param.toLowerCase()));
    if (match) { setSelected(match.key); setQuery(match.name); }
    else setQuery(param);
    appliedRegionParam.current = true;
  }, [regions]);

  const filteredRegions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? regions.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.landscape.toLowerCase().includes(q) ||
            r.country.toLowerCase().includes(q),
        )
      : regions;
    const sorted = [...base];
    if (sortBy === 'count') sorted.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'sv'));
    else if (sortBy === 'country')
      sorted.sort((a, b) => a.country.localeCompare(b.country, 'sv') || a.name.localeCompare(b.name, 'sv'));
    else sorted.sort((a, b) => a.name.localeCompare(b.name, 'sv'));
    return sorted;
  }, [regions, query, sortBy]);

  // Vid landssortering: gruppera under landsrubrik (landet skrivs EN gång, ej per rad).
  type ListItem = { kind: 'header'; country: string } | { kind: 'item'; region: RegionGroup };
  const listItems = useMemo<ListItem[]>(() => {
    if (sortBy !== 'country') return filteredRegions.map((r) => ({ kind: 'item', region: r }));
    const out: ListItem[] = [];
    let prev: string | null = null;
    for (const r of filteredRegions) {
      if (r.country !== prev) { out.push({ kind: 'header', country: r.country }); prev = r.country; }
      out.push({ kind: 'item', region: r });
    }
    return out;
  }, [filteredRegions, sortBy]);

  const activeInscriptions = useMemo(() => {
    if (selected) return selectedGroup?.inscriptions ?? [];
    return regions.flatMap((r) => r.inscriptions);
  }, [regions, selected, selectedGroup]);

  // ---- Leaflet-karta (fristående, samma mönster som CarversMap) ----
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<L.LayerGroup>(new L.LayerGroup());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [59.5, 16.5], zoom: 5, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    layerRef.current.addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Rita om markörer + zooma. ÖVERSIKT (inget valt): en proportionell cirkel per
  // socken/härad vid dess tyngdpunkt, storlek = antal fynd (klustrat → läsbart, i st.f.
  // tusentals enskilda punkter). VALT: enskilda runstensmarkörer (drill-in).
  const coordsOf = (i: any): [number, number] | null => {
    const lat = i?.coordinates?.lat ?? i?.latitude;
    const lng = i?.coordinates?.lng ?? i?.longitude;
    return lat && lng ? [lat, lng] : null;
  };
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layerRef.current.clearLayers();
    const pts: [number, number][] = [];

    if (selected) {
      // Drill-in: enskilda runstenar i den valda regionen.
      const added = addRunicInscriptionMarkers(map, activeInscriptions, onResultClick);
      added.forEach((m) => { map.removeLayer(m); layerRef.current.addLayer(m); });
      for (const i of activeInscriptions) { const p = coordsOf(i); if (p) pts.push(p); }

      // Relaterade kyrkor i socknen (från parish_governance) — egen markörstil (rosa kors),
      // så det medeltida kyrkolandskapet syns på kartan och ingår i inzoomningen.
      for (const k of governance.data?.churches ?? []) {
        if (k.lat == null || k.lng == null) continue; // obelagt läge → visas i listan, ej på kartan
        const ruin = k.status === 'ruin' || k.status === 'destroyed';
        L.circleMarker([k.lat, k.lng], {
          radius: 7, color: '#881337', weight: 1.5,
          fillColor: ruin ? '#fda4af' : '#e11d48', fillOpacity: 0.9,
        })
          .bindTooltip(
            `⛪ ${k.name}${k.patron_saint ? ` · ${k.patron_saint}` : ''}${k.built_from ? ` · ${sv ? 'ca' : 'c.'} ${k.built_from}` : ''}${ruin ? (sv ? ' · ruin' : ' · ruin') : ''}`,
            { direction: 'top' },
          )
          .addTo(layerRef.current);
        pts.push([k.lat, k.lng]);
      }

      // Fornborgar i regionen — mörka fyrkanter, egen stil, ingår i inzoomningen.
      for (const f of forts.data) {
        if (f.lat == null || f.lng == null) continue;
        L.circleMarker([f.lat, f.lng], {
          radius: 6, color: '#0f172a', weight: 1.5, fillColor: '#475569', fillOpacity: 0.9,
        })
          .bindTooltip(
            `🛡️ ${f.name}${f.dating_basis || f.period ? ` · ${f.period ?? f.dating_basis}` : ''}${f.raa_number ? ` · ${f.raa_number}` : ''}`,
            { direction: 'top' },
          )
          .addTo(layerRef.current);
        pts.push([f.lat, f.lng]);
      }
    } else {
      // Översikt: klustra per region → proportionell symbolkarta.
      for (const r of regions) {
        const cs = r.inscriptions.map(coordsOf).filter(Boolean) as [number, number][];
        if (!cs.length) continue;
        const lat = cs.reduce((s, p) => s + p[0], 0) / cs.length;
        const lng = cs.reduce((s, p) => s + p[1], 0) / cs.length;
        const radius = Math.min(30, 5 + Math.sqrt(r.count) * 2.2); // area ~ antal fynd
        L.circleMarker([lat, lng], { radius, color: '#78350f', weight: 1, fillColor: '#eab308', fillOpacity: 0.55 })
          .bindTooltip(`${r.name}${r.harad || r.landscape ? ` · ${r.harad || r.landscape}` : ''} — ${r.count} ${c.finds}`, { direction: 'top' })
          .on('click', () => setSelected(r.key))
          .addTo(layerRef.current);
        pts.push([lat, lng]);
      }
    }

    // Zooma BARA vid drill-in (vald region). Översikten behåller sitt stabila nationella läge —
    // annars "zoomas den in" på runsten-bältet så fort man går till Härader/Socknar (Daniel).
    if (selected && pts.length > 0) {
      map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 12 });
    }
    setTimeout(() => map.invalidateSize(), 100);
  }, [regions, activeInscriptions, selected, onResultClick, c.finds, governance.data, forts.data, sv]);

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {c.title}
          <Badge variant="secondary" className="ml-2">{regions.length}</Badge>
        </CardTitle>
        <p className="text-slate-300 text-sm">{c.intro}</p>
        {/* Snabblänkar till kyrko-/klosterlager på huvudkartan */}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs text-slate-400 self-center">{sv ? 'Visa på kartan:' : 'Show on map:'}</span>
          <Link to="/explore?focus=churches" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-rose-500/60 text-rose-200 hover:bg-rose-500/15">
            <Church className="h-3.5 w-3.5" />{sv ? 'Kyrkor & stift (medeltid)' : 'Churches & dioceses'}
          </Link>
          <Link to="/explore?focus=monasteries" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-fuchsia-500/60 text-fuchsia-200 hover:bg-fuchsia-500/15">
            <Landmark className="h-3.5 w-3.5" />{sv ? 'Kloster & kapell' : 'Monasteries & chapels'}
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
          {/* Vänster: sökbar lista */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={c.search}
                className="pl-8 bg-white/5 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-1 text-xs">
              {(['name', 'count', 'country'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-2 py-1 rounded transition-colors ${
                    sortBy === key ? 'bg-amber-500/20 text-amber-200' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {key === 'name' ? c.sortName : key === 'count' ? c.sortCount : c.sortCountry}
                </button>
              ))}
            </div>
            <ScrollArea className="h-[520px] pr-3">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setSelected(null)}
                    className={`w-full text-left p-2 rounded transition-colors ${
                      selected === null ? 'bg-amber-500/20 text-amber-200' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {c.all}
                  </button>
                </li>
                {listItems.map((it, idx) =>
                  it.kind === 'header' ? (
                    <li
                      key={`h-${it.country}-${idx}`}
                      className="sticky top-0 z-10 px-2 pt-3 pb-1 text-amber-200/90 text-xs font-semibold uppercase tracking-wide bg-slate-900/70 backdrop-blur"
                    >
                      {countryLabel(it.country) || (sv ? 'Okänt land' : 'Unknown country')}
                    </li>
                  ) : (
                    <li key={it.region.key}>
                      <button
                        onClick={() => setSelected(it.region.key)}
                        className={`w-full flex items-center justify-between gap-2 text-left p-2 rounded transition-colors ${
                          selected === it.region.key ? 'bg-amber-500/20 text-amber-200' : 'text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate">
                          {it.region.name}
                          {/* Disambiguator: härad om känt (auktoritativt), annars landskap. Skiljer
                              dubblettnamn åt (Kalmar · Håbo härad vs · Norra Möre härad). Vid
                              landssortering står landet i rubriken → visa ändå härad/landskap. */}
                          {(it.region.harad || it.region.landscape) ? (
                            <span className="text-slate-400 text-xs ml-1">· {it.region.harad || it.region.landscape}</span>
                          ) : null}
                        </span>
                        <Badge variant="secondary" className="shrink-0">{it.region.count}</Badge>
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </ScrollArea>
          </div>

          {/* Höger: karta + antal */}
          <div className="space-y-2">
            <div className="text-slate-300 text-sm">
              {c.showing}: <span className="text-white font-medium">{selectedName ?? c.all}</span>{' '}
              <span className="text-slate-400">({activeInscriptions.length} {c.finds})</span>
            </div>
            {!selected && (
              <div className="text-slate-400 text-xs">
                {sv
                  ? 'Cirklarnas storlek = antal fynd. Klicka en cirkel (eller en rad i listan) för att zooma in i regionen.'
                  : 'Circle size = number of finds. Click a circle (or a list row) to zoom into the region.'}
              </div>
            )}
            <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden border border-white/10" />
          </div>
        </div>

        {mode === 'parishes' && selected && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <h3 className="text-white font-semibold mb-3">⛪ {selectedName} — {sv ? 'kyrkor & stift' : 'churches & diocese'}</h3>
            {governance.loading ? (
              <p className="text-slate-400 text-sm">{sv ? 'Laddar…' : 'Loading…'}</p>
            ) : governance.data ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {/* Kyrkor i socknen */}
                <div>
                  <div className="text-amber-200 text-xs font-semibold mb-1">{sv ? 'Kyrkor' : 'Churches'} ({governance.data.churches.length})</div>
                  {governance.data.churches.length === 0 ? (
                    <p className="text-slate-400 text-xs">{sv ? 'Inga kopplade kyrkor än.' : 'No linked churches yet.'}</p>
                  ) : (
                    <ul className="space-y-2">
                      {governance.data.churches.map((k, i) => (
                        <li key={i} className="bg-white/5 rounded p-2">
                          {k.image_url && (
                            <img src={`${k.image_url}?width=320`} alt={k.name} loading="lazy"
                              className="w-full h-32 object-contain rounded mb-1 bg-slate-800/60"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                          )}
                          <div className="text-white">{k.name}
                            {k.status === 'ruin' ? <span className="text-slate-400"> · ruin</span>
                              : k.status === 'destroyed' ? <span className="text-slate-400"> · {sv ? 'utplånad' : 'destroyed'}</span> : null}
                          </div>
                          <div className="text-slate-400 text-xs">
                            {k.built_from ? `${sv ? 'ca' : 'c.'} ${k.built_from}` : (k.dating_class ?? '')}
                            {k.patron_saint ? ` · ${sv ? 'helgon' : 'patron'}: ${k.patron_saint}` : ''}
                            {k.diocese ? ` · ${k.diocese}` : ''}
                            {k.lat == null ? ` · ${sv ? 'läge obelagt' : 'location unverified'}` : ''}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Stiftshistorik */}
                <div>
                  <div className="text-amber-200 text-xs font-semibold mb-1">{sv ? 'Stift över tid' : 'Diocese over time'}</div>
                  {governance.data.history.length === 0 ? (
                    <p className="text-slate-400 text-xs">—</p>
                  ) : (
                    <ul className="space-y-1">
                      {governance.data.history.map((h, i) => (
                        <li key={i} className="text-slate-300 text-xs">
                          <span className="text-white">{h.from_year}{h.to_year ? `–${h.to_year}` : '–'}</span> {h.diocese}
                          {h.note ? <div className="text-slate-500">{h.note}</div> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Stiftets ledare */}
                <div>
                  <div className="text-amber-200 text-xs font-semibold mb-1">{sv ? 'Stiftets ledare' : 'Diocese leaders'} ({governance.data.leadership.length})</div>
                  {governance.data.leadership.length === 0 ? (
                    <p className="text-slate-400 text-xs">—</p>
                  ) : (
                    <ScrollArea className="h-48 pr-2">
                      <ul className="space-y-0.5">
                        {governance.data.leadership.map((l, i) => (
                          <li key={i} className="text-slate-300 text-xs">
                            <span className="text-slate-500">{l.from_year ?? '?'}{l.to_year ? `–${l.to_year}` : (l.from_year ? '–' : '')}</span> {l.person_name}
                            <span className="text-slate-500"> ({ROLE_LABEL[l.role] ?? l.role})</span>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">{sv ? 'Ingen data.' : 'No data.'}</p>
            )}
            {/* Fornborgar i regionen — svar på "har inte X en borg?" (mörka fyrkanter på kartan) */}
            {forts.data.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-3">
                <div className="text-slate-300 text-xs font-semibold mb-1.5">
                  🛡️ {sv ? 'Fornborgar i trakten' : 'Hillforts nearby'} ({forts.data.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {forts.data.slice(0, 40).map((f, i) => (
                    <span key={i} className="text-xs bg-white/5 rounded px-2 py-0.5 text-slate-200">
                      {f.name}{f.raa_number ? <span className="text-slate-500"> · {f.raa_number}</span> : null}
                    </span>
                  ))}
                  {forts.data.length > 40 && <span className="text-xs text-slate-500 self-center">+{forts.data.length - 40}</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
