import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { addRunicInscriptionMarkers } from '@/hooks/map/useRunicInscriptionMarkers';

type RegionMode = 'hundreds' | 'parishes';

interface RegionFindsViewProps {
  /** Hela den laddade inskriftsuppsättningen (med socken/harad + coordinates). */
  inscriptions: any[];
  mode: RegionMode;
  onResultClick?: (inscription: any) => void;
}

interface RegionGroup {
  name: string;          // härads-/sockennamn (auktoritativt ur fyndens egen kolumn)
  landscape: string;     // majoritets-landskap (tom om för spretigt, t.ex. "Okänd")
  country: string;       // normaliserat land (majoritet)
  inscriptions: any[];
  count: number;
}

const hasCoords = (i: any): boolean =>
  (i?.coordinates && i.coordinates.lat && i.coordinates.lng) || (i?.latitude && i?.longitude);

// Normalisera land — källan har både "Sverige" och "Sweden".
const COUNTRY_LABEL_SV: Record<string, string> = {
  sweden: 'Sverige', denmark: 'Danmark', norway: 'Norge', greenland: 'Grönland',
  germany: 'Tyskland', netherlands: 'Nederländerna', poland: 'Polen', ukraine: 'Ukraina',
  'united kingdom': 'Storbritannien', finland: 'Finland', britain: 'Storbritannien',
  estonia: 'Estland', ireland: 'Irland', scotland: 'Skottland', iceland: 'Island', other: 'Övrigt',
};
// Land härleds ur SIGNUM-PREFIXET, inte country-kolumnen (som är fel för t.ex.
// Akershus fylke = felmärkt Denmark). Prefixet är auktoritativt: N=Norge, DR/DK=
// Danmark, IS=Island, GR=Grönland osv.; övriga svenska landskapsprefix → Sverige.
const COUNTRY_BY_PREFIX: Record<string, string> = {
  DR: 'denmark', DK: 'denmark', N: 'norway', IS: 'iceland', GR: 'greenland',
  E: 'estonia', IR: 'ireland', SC: 'scotland', BR: 'britain', X: 'other',
};
const countryKeyFromSignum = (signum?: string): string => {
  const p = (signum ?? '').trim().split(/\s+/)[0]?.toUpperCase() ?? '';
  return COUNTRY_BY_PREFIX[p] ?? 'sweden';
};
// Härads-suffixet är auktoritativt för land (fylke=Norge, herred=Danmark,
// härad=Sverige, kihlakunta=Finland, Kreis=Tyskland) — mer pålitligt än signum
// för specialkataloger (KJ, NIÆR) i t.ex. "Akershus fylke".
const countryKeyFromRegionName = (name: string): string | null => {
  const n = name.toLowerCase();
  if (/fylke$/.test(n)) return 'norway';
  if (/herred$/.test(n)) return 'denmark';
  if (/härad$/.test(n)) return 'sweden';
  if (/kihlakunta/.test(n)) return 'finland';
  if (/\bkreis\b|landkreis/.test(n)) return 'germany';
  return null;
};
const topVote = (votes: Map<string, number>): { key: string; share: number } => {
  let key = '';
  let best = 0;
  let total = 0;
  for (const [k, n] of votes) { total += n; if (n > best) { best = n; key = k; } }
  return { key, share: total ? best / total : 0 };
};

export const RegionFindsView: React.FC<RegionFindsViewProps> = ({ inscriptions, mode, onResultClick }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const field = mode === 'hundreds' ? 'harad' : 'socken';

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

  // Gruppera fynden per härad/socken (bara de med koordinat — annars syns de inte).
  const regions = useMemo<RegionGroup[]>(() => {
    const map = new Map<string, { name: string; inscriptions: any[]; landscapeVotes: Map<string, number>; countryVotes: Map<string, number> }>();
    for (const i of inscriptions) {
      const name = (i?.[field] ?? '').toString().trim();
      if (!name || !hasCoords(i)) continue;
      let g = map.get(name);
      if (!g) {
        g = { name, inscriptions: [], landscapeVotes: new Map(), countryVotes: new Map() };
        map.set(name, g);
      }
      g.inscriptions.push(i);
      // Landskap + land via MAJORITETSRÖSTNING — kolumnerna är fel för en del
      // Bautil-stenar (Vallentuna felmärkt Småland). Ett härad hör historiskt till
      // ETT landskap, så majoriteten ger rätt; catch-allen "Okänd" spänner dock många.
      const ls = (i?.landscape ?? '').toString().trim();
      if (ls) g.landscapeVotes.set(ls, (g.landscapeVotes.get(ls) ?? 0) + 1);
      const ck = countryKeyFromSignum(i?.signum);
      if (ck) g.countryVotes.set(ck, (g.countryVotes.get(ck) ?? 0) + 1);
    }
    const isUnknown = (n: string) => /^(okänd|unknown)$/i.test(n.trim());
    return [...map.values()]
      .map((g) => {
        const ls = topVote(g.landscapeVotes);
        const co = topVote(g.countryVotes);
        // Dölj landskap för catch-allen "Okänd" och när gruppen är för spretig (<60%).
        const landscape = isUnknown(g.name) || ls.share < 0.6 ? '' : ls.key;
        // Land: härad-suffix först (auktoritativt), annars signum-majoritet.
        const country = countryKeyFromRegionName(g.name) ?? co.key;
        return { name: g.name, landscape, country, inscriptions: g.inscriptions, count: g.inscriptions.length };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'sv'));
  }, [inscriptions, field]);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'country'>('name');

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
    if (match) { setSelected(match.name); setQuery(match.name); }
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
    if (selected) return regions.find((r) => r.name === selected)?.inscriptions ?? [];
    return regions.flatMap((r) => r.inscriptions);
  }, [regions, selected]);

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

  // Rita om markörer + zooma till aktiva fynd.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layerRef.current.clearLayers();

    // Temporär undergrupp så addRunicInscriptionMarkers (som addTo(map)) hamnar i layer-gruppen.
    const added = addRunicInscriptionMarkers(map, activeInscriptions, onResultClick);
    added.forEach((m) => {
      map.removeLayer(m);          // flytta från kartan till vår hanterade grupp
      layerRef.current.addLayer(m);
    });

    const pts = activeInscriptions
      .map((i) => {
        const lat = i?.coordinates?.lat ?? i?.latitude;
        const lng = i?.coordinates?.lng ?? i?.longitude;
        return lat && lng ? ([lat, lng] as [number, number]) : null;
      })
      .filter(Boolean) as [number, number][];
    if (pts.length > 0) {
      map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: selected ? 12 : 6 });
    }
    setTimeout(() => map.invalidateSize(), 100);
  }, [activeInscriptions, selected, onResultClick]);

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {c.title}
          <Badge variant="secondary" className="ml-2">{regions.length}</Badge>
        </CardTitle>
        <p className="text-slate-300 text-sm">{c.intro}</p>
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
                    <li key={it.region.name}>
                      <button
                        onClick={() => setSelected(it.region.name)}
                        className={`w-full flex items-center justify-between gap-2 text-left p-2 rounded transition-colors ${
                          selected === it.region.name ? 'bg-amber-500/20 text-amber-200' : 'text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate">
                          {it.region.name}
                          {/* Landssortering: landet står i rubriken → visa bara landskap i övriga lägen. */}
                          {sortBy !== 'country' && it.region.landscape ? (
                            <span className="text-slate-400 text-xs ml-1">· {it.region.landscape}</span>
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
              {c.showing}: <span className="text-white font-medium">{selected ?? c.all}</span>{' '}
              <span className="text-slate-400">({activeInscriptions.length} {c.finds})</span>
            </div>
            <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden border border-white/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
