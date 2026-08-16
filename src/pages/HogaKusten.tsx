import React, { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertTriangle, Church, Landmark, Video, Info, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapLegend } from '@/components/map/MapLegend';
import { useMapLegendState, type LegendLayerDef } from '@/hooks/map/useMapLegendState';

// /sv/hoga-kusten (en: /en/high-coast) — HUBB för Höga kusten / Ångermanlandskusten.
//
// Sidan skiljer STRIKT tre saker (INGEN GISSNING):
//   A) DET VI HAR (belagt): kyrkor (ecclesiastical_sites) + fornlämningar (heritage_sites)
//      i Höga kustens fyra kommuner — hämtas LIVE, ritas på karta med källa i popupen.
//      Heritage kapas medvetet vid 400; UI:t SÄGER att det är kapat (ingen tyst trunkering).
//   B) DET SOM ÄR PLANERAT: berättelsevandringarna "Historier om Höga kusten" — en kurerad
//      DISPOSITION (projektförslag), tydligt märkt "ej publicerat innehåll än". Inte fakta.
//   C) MEDIA: vi har ingen Höga kusten-kanal i mediegrafen än → platshållare, ingen påhittad länk.
//
// Bilingval via URL (mönster som Grottor/Vikingatid): /en/high-coast = engelska, annars svenska.
// Imperativ Leaflet + cookiefri OSM-raster (samma mönster som Angermanland/TunaNames/Grottor).

// De fyra Höga kusten-kommunerna. Motsvarar taskens municipality ~* '...' (PostgREST imatch).
const REGION_REGEX = 'Härnösand|Örnsköldsvik|Kramfors|Sollefteå';
const HERITAGE_CAP = 400; // medveten kapning av kartlagret; totalen visas ärligt bredvid

// Kartsymbolik — färg BÄR lagret OCH formen bär det (WCAG 1.4.1: skiljs på form, ej bara färg).
// Kyrka = gyllene rundad kvadrat med kors (matchar --gold-tokenet). Fornlämning = teal cirkel.
const CHURCH_COLOR = '#f59e0b';
const HERITAGE_COLOR = '#14b8a6';

const ok = (a?: number | null, b?: number | null) =>
  Number.isFinite(a as number) && Number.isFinite(b as number);
// Minimal HTML-escape för popup-text (RAÄ-fält är CC0 klartext, men undvik trasig HTML).
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

interface ChurchSite {
  id: string; name: string | null; name_en: string | null; kind: string | null;
  municipality: string | null; register_url: string | null; lat: number; lng: number;
}
interface HeritageSite {
  id: string; name: string | null; raa_type: string | null; description: string | null;
  municipality: string | null; source_uri: string | null; lat: number; lng: number;
}

// Divikon för kyrka: gyllene rundad kvadrat med kors. Egen form (ej cirkel) → syns utan färg.
const churchIcon = L.divIcon({
  className: '',
  html:
    `<div style="width:16px;height:16px;border-radius:4px;background:${CHURCH_COLOR};` +
    `border:1.5px solid #78350f;display:flex;align-items:center;justify-content:center;` +
    `font-size:11px;line-height:1;color:#78350f;font-weight:700">✚</div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const LEGEND: LegendLayerDef[] = [
  { key: 'church', label: 'Kyrkor', color: CHURCH_COLOR, defaultOn: true },
  { key: 'heritage', label: 'Fornlämningar', color: HERITAGE_COLOR, defaultOn: true },
  { key: 'osm', label: 'Baskarta (OSM)', color: '#64748b', group: 'basemap', defaultOn: true },
];

const HogaKustenMap: React.FC<{
  sv: boolean;
  churches: ChurchSite[];
  heritage: HeritageSite[];
}> = ({ sv, churches, heritage }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const churchLayerRef = useRef<L.LayerGroup | null>(null);
  const heritageLayerRef = useRef<L.LayerGroup | null>(null);
  const { enabled, toggle } = useMapLegendState(LEGEND);

  // Init en gång.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      preferCanvas: true, center: [63.05, 18.2], zoom: 8, scrollWheelZoom: true,
    });
    tileRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 18,
    }).addTo(map);
    heritageLayerRef.current = L.layerGroup().addTo(map);
    churchLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null; tileRef.current = null;
      churchLayerRef.current = null; heritageLayerRef.current = null;
    };
  }, []);

  // Baskarta på/av.
  useEffect(() => {
    const map = mapRef.current, tile = tileRef.current;
    if (!map || !tile) return;
    if (enabled.osm) { if (!map.hasLayer(tile)) tile.addTo(map); }
    else if (map.hasLayer(tile)) map.removeLayer(tile);
  }, [enabled.osm]);

  // Rita lagren + passa bounds till regionen.
  useEffect(() => {
    const map = mapRef.current;
    const cl = churchLayerRef.current;
    const hl = heritageLayerRef.current;
    if (!map || !cl || !hl) return;
    cl.clearLayers();
    hl.clearLayers();
    const pts: [number, number][] = [];

    if (enabled.heritage) {
      heritage.forEach((h) => {
        pts.push([h.lat, h.lng]);
        const src = h.source_uri
          ? (h.source_uri.startsWith('http') ? h.source_uri : 'https://' + h.source_uri) : null;
        const html =
          '<div style="max-width:250px">' +
          `<b>${esc(h.name ?? (sv ? 'Fornlämning' : 'Heritage site'))}</b>` +
          (h.raa_type ? `<br/><span style="font-size:11px;color:#0f766e">${esc(h.raa_type)}</span>` : '') +
          (h.municipality ? `<br/><span style="font-size:10px;color:#64748b">${esc(h.municipality)}</span>` : '') +
          (h.description ? `<div style="font-size:12px;color:#334155;margin-top:5px;line-height:1.35;max-height:160px;overflow-y:auto">${esc(h.description)}</div>` : '') +
          (src ? `<a href="${src}" target="_blank" rel="noopener" style="font-size:11px;color:#0f766e;margin-top:6px;display:inline-block">${sv ? 'Källa: RAÄ Fornsök (CC0) →' : 'Source: RAÄ Fornsök (CC0) →'}</a>` : '') +
          '</div>';
        L.circleMarker([h.lat, h.lng], {
          radius: 5, color: '#0f766e', weight: 1.5, fillColor: HERITAGE_COLOR, fillOpacity: 0.9,
        }).bindPopup(html).addTo(hl);
      });
    }

    if (enabled.church) {
      churches.forEach((c) => {
        pts.push([c.lat, c.lng]);
        const name = sv ? (c.name ?? c.name_en) : (c.name_en ?? c.name);
        const reg = c.register_url;
        const html =
          '<div style="max-width:240px">' +
          `<b>✚ ${esc(name ?? (sv ? 'Kyrka' : 'Church'))}</b>` +
          (c.kind ? `<br/><span style="font-size:11px;color:#92400e">${esc(c.kind)}</span>` : '') +
          (c.municipality ? `<br/><span style="font-size:10px;color:#64748b">${esc(c.municipality)}</span>` : '') +
          (reg ? `<a href="${esc(reg)}" target="_blank" rel="noopener" style="font-size:11px;color:#b45309;margin-top:6px;display:inline-block">${sv ? 'RAÄ Bebyggelseregister →' : 'Heritage building register →'}</a>` : '') +
          '</div>';
        L.marker([c.lat, c.lng], {
          icon: churchIcon,
          title: name ?? undefined,
          keyboard: true,
          alt: name ? (sv ? `Kyrka: ${name}` : `Church: ${name}`) : (sv ? 'Kyrka' : 'Church'),
        }).bindPopup(html).addTo(cl);
      });
    }

    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [28, 28] });
  }, [churches, heritage, enabled.church, enabled.heritage, sv]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        role="region"
        aria-label={sv
          ? 'Karta över kyrkor och fornlämningar i Höga kusten'
          : 'Map of churches and heritage sites in the High Coast'}
        className="w-full h-[520px] rounded-lg overflow-hidden border border-border"
        style={{ minHeight: 520 }}
      />
      <MapLegend defs={LEGEND} enabled={enabled} onToggle={toggle} mapRef={mapRef} />
    </div>
  );
};

// ---- B) PLANERAT: "Historier om Höga kusten" — kurerad disposition (projektförslag) ----
// Detta är EJ publicerat innehåll. Innehållet är en tänkt struktur för tematiska
// koordinat-berättelsevandringar, grupperade per kommun. Renderas som förslag, aldrig som fakta.

interface StoryTheme { title: { sv: string; en: string }; note?: { sv: string; en: string } }
interface StoryKommun {
  key: string;
  name: { sv: string; en: string };
  blurb: { sv: string; en: string };
  satellites?: { sv: string; en: string };
  themes: StoryTheme[];
}

const STORY_KOMMUNER: StoryKommun[] = [
  {
    key: 'harnosand',
    name: { sv: 'Härnösand', en: 'Härnösand' },
    blurb: {
      sv: 'Stiftsstaden vid mynningen — stadshistoria, kvinnominne, trolldomsprocesser och landhöjning.',
      en: 'The cathedral town at the estuary — town history, women remembered, witch trials and land uplift.',
    },
    satellites: {
      sv: 'Kringorter: Högsjö, Säbrå, Viksjö-Brunne, Häggdånger.',
      en: 'Surrounding parishes: Högsjö, Säbrå, Viksjö-Brunne, Häggdånger.',
    },
    themes: [
      { title: { sv: 'Allmän stadshistoria', en: 'General town history' } },
      {
        title: { sv: 'Kvinnominne', en: 'Women remembered' },
        note: {
          sv: '~10–15 platser: Vangsta-kvinnan (~760), Elisabeth Beronia (1630–1721), häxanklagade i Näggärd, Alfhild Agrell m.fl.',
          en: '~10–15 sites: the Vangsta woman (~760), Elisabeth Beronia (1630–1721), the witch-accused of Näggärd, Alfhild Agrell and others.',
        },
      },
      {
        title: { sv: 'Män att minnas', en: 'Men to remember' },
        note: { sv: 'Nils Gissler, Olof Högberg m.fl.', en: 'Nils Gissler, Olof Högberg and others.' },
      },
      {
        title: { sv: 'Vikingaleden: biblioteket → Vangsta gravfält', en: 'Viking trail: the library → Vangsta grave field' },
        note: { sv: 'Med sameleden tillbaka.', en: 'With the Sámi trail on the return.' },
      },
      { title: { sv: 'Trolldomsprocess-stadsvandring', en: 'Witch-trial town walk' } },
      { title: { sv: 'Dark side of Herna — mord & mysterier', en: 'Dark side of Herna — murders & mysteries' } },
      { title: { sv: 'Härnösands 10 viktigaste byggnader', en: 'The 10 key buildings of Härnösand' } },
      { title: { sv: 'Skulpturer & offentlig konst', en: 'Sculptures & public art' } },
      { title: { sv: 'Landhöjningen', en: 'The land uplift' } },
      { title: { sv: 'Grottorna', en: 'The caves' } },
      {
        title: { sv: 'Samerna', en: 'The Sámi' },
        note: { sv: 'Lappkyrkan i Vangsta.', en: 'The Sámi church at Vangsta.' },
      },
    ],
  },
  {
    key: 'kramfors',
    name: { sv: 'Kramfors–Ådalen', en: 'Kramfors–Ådalen' },
    blurb: {
      sv: 'Flottningens och arbetarrörelsens dal — och häxprocessernas mörkaste kapitel.',
      en: 'The valley of log-driving and the labour movement — and the darkest chapter of the witch trials.',
    },
    themes: [
      {
        title: { sv: 'Ådalen 31', en: 'Ådalen 31' },
        note: { sv: 'Skotten i Lunde 1931, ~11 platser.', en: 'The shootings at Lunde 1931, ~11 sites.' },
      },
      {
        title: { sv: 'Häxprocesserna i Ångermanland', en: 'The Ångermanland witch trials' },
        note: {
          sv: 'Torsåker → bålberget; massavrättningen 1 juni 1675, ~10 platser.',
          en: 'Torsåker → the execution hill; the mass execution of 1 June 1675, ~10 sites.',
        },
      },
      { title: { sv: 'Sandslåns flottningshistoria', en: 'The log-driving history of Sandslån' } },
      { title: { sv: 'Nora', en: 'Nora' } },
      {
        title: { sv: 'Nordingrå', en: 'Nordingrå' },
        note: {
          sv: 'Höga kusten-leden, Rotsidans klapperfält, fornborg.',
          en: 'The High Coast Trail, the Rotsidan shingle field, hillfort.',
        },
      },
      {
        title: { sv: 'Fornborgar', en: 'Hillforts' },
        note: { sv: 'Bollsta, Hola, Nordingrå.', en: 'Bollsta, Hola, Nordingrå.' },
      },
      { title: { sv: 'Avrättningsplatser', en: 'Execution sites' } },
      { title: { sv: 'Samerna i Ådalen', en: 'The Sámi in Ådalen' } },
      {
        title: { sv: 'Kyrkor', en: 'Churches' },
        note: { sv: 'Gudmundrå, Bjärtrå m.fl.', en: 'Gudmundrå, Bjärtrå and others.' },
      },
    ],
  },
  {
    key: 'solleftea',
    name: { sv: 'Sollefteå', en: 'Sollefteå' },
    blurb: {
      sv: 'Älvdalens inland — hällristningar, garnison och kvinnominne.',
      en: 'The river-valley interior — rock carvings, garrison and women remembered.',
    },
    themes: [
      { title: { sv: 'Näsåkers hällristningar', en: 'The rock carvings at Näsåker' } },
      { title: { sv: 'Bruks- och militärhistoria', en: 'Ironworks and military history' } },
      {
        title: { sv: 'Kvinnominne', en: 'Women remembered' },
        note: {
          sv: '49 häxanklagade 1674; Gunnil Snälla, Laura Fitinghof, Kerstin Thorwall.',
          en: '49 witch-accused in 1674; Gunnil Snälla, Laura Fitinghof, Kerstin Thorwall.',
        },
      },
      {
        title: { sv: 'Resele, Junsele, Ramsele, Ådalsliden', en: 'Resele, Junsele, Ramsele, Ådalsliden' },
      },
      { title: { sv: 'Kyrkor', en: 'Churches' } },
    ],
  },
  {
    key: 'ornskoldsvik',
    name: { sv: 'Örnsköldsvik', en: 'Örnsköldsvik' },
    blurb: {
      sv: 'Köpingen vid vikens botten — järnålderns Gene, bronsålder och labyrinter.',
      en: 'The market town at the head of the bay — Iron Age Gene, Bronze Age and labyrinths.',
    },
    satellites: {
      sv: 'Kringorter: Bjästa, Gideå, Husum, Trehörningsjö, Björna, Skorped m.fl.',
      en: 'Surrounding localities: Bjästa, Gideå, Husum, Trehörningsjö, Björna, Skorped and others.',
    },
    themes: [
      { title: { sv: 'Gene fornby', en: 'The Gene Iron Age village' } },
      { title: { sv: 'Bronsåldersgravfält Killingsnäs', en: 'The Killingsnäs Bronze Age grave field' } },
      { title: { sv: 'Labyrinter', en: 'Labyrinths' } },
      { title: { sv: 'Köpings- och hamnhistoria', en: 'Market-town and harbour history' } },
    ],
  },
];

// ---- Sidan ----

const HogaKusten: React.FC = () => {
  // Språk styrs av URL:en (mönster som Grottor/Vikingatid): /en/high-coast = engelska.
  const sv = !useLocation().pathname.toLowerCase().includes('high-coast');

  const churchesQ = useQuery<ChurchSite[]>({
    queryKey: ['hoga-kusten-churches'],
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('ecclesiastical_sites')
        .select('id, name, name_en, kind, municipality, register_url, lat, lng')
        .filter('municipality', 'imatch', REGION_REGEX)
        .not('lat', 'is', null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((data ?? []) as any[])
        .map((r) => ({
          id: r.id, name: r.name, name_en: r.name_en, kind: r.kind,
          municipality: r.municipality, register_url: r.register_url,
          lat: Number(r.lat), lng: Number(r.lng),
        }))
        .filter((c) => ok(c.lat, c.lng));
    },
  });

  const heritageQ = useQuery<{ rows: HeritageSite[]; total: number }>({
    queryKey: ['hoga-kusten-heritage'],
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      // count:'exact' ger den SANNA totalen även när vi kapar raderna vid HERITAGE_CAP,
      // så UI:t kan säga hur många som INTE ritas (ingen tyst trunkering).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, count } = await (supabase as any)
        .from('heritage_sites')
        .select('id, name, raa_type, description, municipality, source_uri, lat, lng', { count: 'exact' })
        .filter('municipality', 'imatch', REGION_REGEX)
        .not('lat', 'is', null)
        .limit(HERITAGE_CAP);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = ((data ?? []) as any[])
        .map((r) => ({
          id: r.id, name: r.name, raa_type: r.raa_type, description: r.description,
          municipality: r.municipality, source_uri: r.source_uri,
          lat: Number(r.lat), lng: Number(r.lng),
        }))
        .filter((h) => ok(h.lat, h.lng));
      return { rows, total: typeof count === 'number' ? count : rows.length };
    },
  });

  const churches = churchesQ.data ?? [];
  const heritage = heritageQ.data?.rows ?? [];
  const heritageTotal = heritageQ.data?.total ?? 0;
  const heritageCapped = heritageTotal > heritage.length;
  const loading = churchesQ.isLoading || heritageQ.isLoading;

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title={sv ? 'Höga kusten — forskningshubb' : 'The High Coast — research hub'}
        titleEn={sv ? 'Höga kusten — forskningshubb' : 'The High Coast — research hub'}
        description={sv
          ? 'Höga kusten (Ångermanlandskusten) som forskningshubb: kartlagda kyrkor och fornlämningar i Härnösand, Kramfors, Sollefteå och Örnsköldsvik — plus den planerade berättelsevandringen "Historier om Höga kusten".'
          : 'The High Coast (the Ångermanland coast) as a research hub: mapped churches and heritage sites across Härnösand, Kramfors, Sollefteå and Örnsköldsvik — plus the planned "High Coast stories" walking routes.'}
        descriptionEn={sv
          ? 'Höga kusten (Ångermanlandskusten) som forskningshubb: kartlagda kyrkor och fornlämningar i Härnösand, Kramfors, Sollefteå och Örnsköldsvik — plus den planerade berättelsevandringen "Historier om Höga kusten".'
          : 'The High Coast (the Ångermanland coast) as a research hub: mapped churches and heritage sites across Härnösand, Kramfors, Sollefteå and Örnsköldsvik — plus the planned "High Coast stories" walking routes.'}
        keywords={sv
          ? 'Höga kusten, Ångermanland, Härnösand, Kramfors, Ådalen, Sollefteå, Örnsköldsvik, fornlämningar, kyrkor, berättelsevandring, karta'
          : 'High Coast, Höga kusten, Ångermanland, Härnösand, Kramfors, Sollefteå, Örnsköldsvik, heritage sites, churches, story walks, map'}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-gold" aria-hidden="true" />
            {sv ? 'Höga kusten' : 'The High Coast'}
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">
            {sv ? 'Forskningshubb för Ångermanlandskusten' : 'A research hub for the Ångermanland coast'}
          </p>
          <p className="text-muted-foreground text-lg max-w-3xl">
            {sv
              ? 'Höga kusten är landhöjningens landskap — kusten som stiger ur havet snabbast i världen. Den här hubben samlar det plattformen redan har kartlagt i regionens fyra kommuner, och skisserar en planerad berättelsevandring som ännu inte är publicerad.'
              : 'The High Coast is the landscape of land uplift — the coastline rising from the sea faster than anywhere on Earth. This hub gathers what the platform has already mapped across the region’s four municipalities, and sketches a planned set of story walks not yet published.'}
          </p>
        </div>

        {/* Hur du läser sidan (HAR vs PLANERAT) */}
        <div className="mb-6 rounded-lg border border-amber-600/30 bg-amber-950/20 p-4">
          <p className="text-sm text-foreground font-medium mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />
            {sv ? 'Så läser du sidan' : 'How to read this page'}
          </p>
          <p className="text-sm text-muted-foreground max-w-3xl">
            {sv
              ? 'Kartan visar belagda platser ur databasen (kyrkor och fornlämningar med källa i varje popup). Avsnittet "Historier om Höga kusten" är ett projektförslag — en disposition, inte publicerat innehåll. Vi hittar inte på: saknas data säger vi det rakt ut.'
              : 'The map shows attested sites from the database (churches and heritage sites, each popup carrying its source). The "High Coast stories" section is a project proposal — a disposition, not published content. We do not invent: where data is missing we say so plainly.'}
          </p>
        </div>

        {/* A) DET VI HAR — karta */}
        <section aria-labelledby="karta-rubrik">
          <Card className="viking-card mb-6">
            <CardHeader className="pb-2">
              <CardTitle id="karta-rubrik" className="text-lg flex flex-wrap items-center gap-2 text-gold">
                <MapPin className="h-5 w-5" aria-hidden="true" />
                {sv ? 'Kartlagt i regionen' : 'Mapped in the region'}
                <Badge variant="secondary" className="text-[10px] border-emerald-500/60 text-emerald-300 bg-transparent">
                  {sv ? 'Belagt · databas' : 'Attested · database'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[520px] rounded-lg border border-border flex items-center justify-center">
                  <span className="animate-pulse text-sm text-muted-foreground">
                    {sv ? 'Laddar kartan…' : 'Loading the map…'}
                  </span>
                </div>
              ) : (
                <HogaKustenMap sv={sv} churches={churches} heritage={heritage} />
              )}

              {/* Räkningar + ärlig kap-notis */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-foreground">
                  <Church className="h-3.5 w-3.5" style={{ color: CHURCH_COLOR }} aria-hidden="true" />
                  {churches.length} {sv ? 'kyrkor' : 'churches'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-foreground">
                  <Landmark className="h-3.5 w-3.5" style={{ color: HERITAGE_COLOR }} aria-hidden="true" />
                  {heritageCapped
                    ? (sv
                      ? `${heritage.length} av ${heritageTotal} fornlämningar (kapat)`
                      : `${heritage.length} of ${heritageTotal} heritage sites (capped)`)
                    : `${heritage.length} ${sv ? 'fornlämningar' : 'heritage sites'}`}
                </span>
              </div>
              {heritageCapped && (
                <p className="mt-2 flex items-start gap-2 text-[11px] text-amber-300/90">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  {sv
                    ? `Kartan ritar de första ${HERITAGE_CAP} fornlämningarna av ${heritageTotal} registrerade i regionen — resten är inte utelämnade i tysthet, de ryms bara inte i ett prestandavänligt kartlager. Se hela beståndet i RAÄ Fornsök.`
                    : `The map draws the first ${HERITAGE_CAP} of ${heritageTotal} heritage sites registered in the region — the rest are not silently dropped, they simply do not fit a performance-friendly map layer. See the full set in RAÄ Fornsök.`}
                </p>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground/80">
                {sv
                  ? <><strong>Färg + form</strong> skiljer lagren: gyllene kvadrat med kors = kyrka, teal cirkel = fornlämning. <strong>Data:</strong> <code>ecclesiastical_sites</code> (RAÄ Bebyggelseregister, CC0) och <code>heritage_sites</code> (RAÄ Fornsök, CC0), kommun ≈ Härnösand/Kramfors/Sollefteå/Örnsköldsvik. Klicka en punkt för källa.</>
                  : <><strong>Colour + shape</strong> separate the layers: golden square with a cross = church, teal circle = heritage site. <strong>Data:</strong> <code>ecclesiastical_sites</code> (RAÄ building register, CC0) and <code>heritage_sites</code> (RAÄ Fornsök, CC0), municipality ≈ Härnösand/Kramfors/Sollefteå/Örnsköldsvik. Click a point for its source.</>}
              </p>

              {/* Tillgängligt textalternativ till kartlagret (skärmläsare/AI kan inte läsa kartmarkörer) */}
              {!loading && churches.length > 0 && (
                <details className="mt-3 rounded border border-border/60 bg-slate-800/20 p-3">
                  <summary className="cursor-pointer text-sm font-medium text-foreground">
                    {sv ? `Kyrkorna som lista (${churches.length})` : `The churches as a list (${churches.length})`}
                  </summary>
                  <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    {[...churches]
                      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'sv'))
                      .map((c) => {
                        const name = sv ? (c.name ?? c.name_en) : (c.name_en ?? c.name);
                        return (
                          <li key={c.id} className="py-0.5">
                            <span className="text-foreground">{name}</span>
                            {c.municipality && <span className="text-xs opacity-70"> · {c.municipality}</span>}
                          </li>
                        );
                      })}
                  </ul>
                </details>
              )}
            </CardContent>
          </Card>
        </section>

        {/* B) PLANERAT — Historier om Höga kusten */}
        <section aria-labelledby="historier-rubrik">
          <Card className="viking-card mb-6 border-purple-600/40">
            <CardHeader className="pb-2">
              <CardTitle id="historier-rubrik" className="text-lg flex flex-wrap items-center gap-2 text-foreground">
                {sv ? 'Historier om Höga kusten' : 'High Coast stories'}
                <Badge
                  variant="secondary"
                  className="text-[10px] border-purple-500/60 text-purple-300 bg-transparent"
                >
                  {sv ? 'Projektförslag · ej publicerat än' : 'Project proposal · not yet published'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground max-w-3xl mb-4">
                {sv
                  ? 'En planerad serie tematiska, koordinatsatta berättelsevandringar — grupperade per kommun. Nedan är dispositionen (arbetsmaterial). Inget av detta är ännu publicerat, källkritiskt granskat eller kartsatt; det visar bara vad vandringarna skulle kunna innehålla.'
                  : 'A planned series of themed, geocoded story walks — grouped by municipality. Below is the disposition (working material). None of this is yet published, source-critically reviewed or placed on the map; it only shows what the walks could contain.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STORY_KOMMUNER.map((k) => (
                  <div key={k.key} className="rounded-lg border border-slate-700/50 bg-slate-800/20 p-4">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-300" aria-hidden="true" />
                      {sv ? k.name.sv : k.name.en}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">{sv ? k.blurb.sv : k.blurb.en}</p>
                    <ul className="space-y-2">
                      {k.themes.map((t, i) => (
                        <li key={i} className="text-sm">
                          <span className="text-foreground">{sv ? t.title.sv : t.title.en}</span>
                          {t.note && (
                            <span className="block text-xs text-muted-foreground mt-0.5">
                              {sv ? t.note.sv : t.note.en}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {k.satellites && (
                      <p className="text-[11px] text-muted-foreground/70 mt-3 pt-2 border-t border-slate-700/40">
                        {sv ? k.satellites.sv : k.satellites.en}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* C) MEDIA — platshållare (ingen kanal i mediegrafen än) */}
        <section aria-labelledby="video-rubrik">
          <Card className="viking-card mb-6">
            <CardHeader className="pb-2">
              <CardTitle id="video-rubrik" className="text-lg flex items-center gap-2 text-gold">
                <Video className="h-5 w-5" aria-hidden="true" />
                {sv ? 'Höga kusten på video' : 'The High Coast on video'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Projektets visionsfilm. Cookiefritt: statisk thumbnail (i.ytimg.com, ingen YouTube-iframe/
                  -cookie) + länk som öppnar på YouTube vid klick — respekterar plattformens cookie-fria policy. */}
              <a
                href="https://www.youtube.com/watch?v=eiLiuiKG-To"
                target="_blank" rel="noopener noreferrer"
                className="group block max-w-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg"
                aria-label={sv ? 'Se filmen om projektet Historier om Höga kusten (öppnas på YouTube)' : 'Watch the film about the High Coast stories project (opens on YouTube)'}
              >
                <div className="relative overflow-hidden rounded-lg border border-slate-700">
                  <img
                    src="https://i.ytimg.com/vi/eiLiuiKG-To/hqdefault.jpg"
                    alt={sv ? 'Stillbild ur filmen Historier om Höga kusten' : 'Video still: High Coast stories'}
                    loading="lazy" className="w-full transition-transform group-hover:scale-[1.02]"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/15" aria-hidden="true">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/90 text-slate-900">
                      <Video className="h-7 w-7" />
                    </span>
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground">
                  {sv ? 'Film om projektet ”Historier om Höga kusten”' : 'Film about the “High Coast stories” project'}
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                </p>
              </a>
              <p className="text-xs text-muted-foreground max-w-xl">
                {sv
                  ? 'Filmen presenterar visionen bakom berättelsevandringarna ovan. Vandringarna är ännu ett projektförslag, inte publicerat innehåll. Vi länkar filmen; den ligger på YouTube (öppnas i ny flik).'
                  : 'The film presents the vision behind the story-walks above. The walks are still a project proposal, not published content. We link the film; it lives on YouTube (opens in a new tab).'}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Proveniens */}
        <p className="text-xs text-muted-foreground mt-6 opacity-75 max-w-3xl">
          {sv
            ? <><strong>Källor:</strong> kyrkor ur <code>ecclesiastical_sites</code> (RAÄ Bebyggelseregister, CC0), fornlämningar ur <code>heritage_sites</code> (RAÄ Fornsök, CC0). Regionen avgränsas på kommunfältet (Härnösand, Kramfors, Sollefteå, Örnsköldsvik). Se även <Link to={sv ? '/sv/angermanland' : '/angermanland'} className="text-gold hover:underline">Centralortsprojektet Ångermanland</Link>.</>
            : <><strong>Sources:</strong> churches from <code>ecclesiastical_sites</code> (RAÄ building register, CC0), heritage sites from <code>heritage_sites</code> (RAÄ Fornsök, CC0). The region is delimited on the municipality field (Härnösand, Kramfors, Sollefteå, Örnsköldsvik). See also <Link to={sv ? '/sv/angermanland' : '/angermanland'} className="text-gold hover:underline">the Ångermanland central-places project</Link>.</>}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default HogaKusten;
