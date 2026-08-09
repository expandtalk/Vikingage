import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map as MapIcon, Info, AlertTriangle, Anchor } from 'lucide-react';
import { useShorelineOverlay } from '@/hooks/useShorelineOverlay';
import { ShorelinePeriodControl } from '@/components/map/ShorelinePeriodControl';
import { MapLegend } from '@/components/map/MapLegend';
import { useMapLegendState, type LegendLayerDef } from '@/hooks/map/useMapLegendState';
import { supabase } from '@/integrations/supabase/client';

// /sv/kalmar/medeltid — medeltidskarta över Kalmar byggd på D. Larssons källkritiska fältkorpus
// (tabell kalmar_field_features). Lagren är TIDSSKIKTADE: medeltida Gamla stan (vid slottet) skilt
// från nya staden (Kvarnholmen 1640-tal), båtdrag/överfart mot Öland, samt natur-/navigationsgeografi.
// Koordinater = D. Larssons kartavläsning (approx.); rita mot MEDELTIDA strandlinje (reglaget).

const KALMAR_BBOX: [number, number, number, number] = [16.30, 56.63, 16.55, 56.79];

type Layer = 'medieval' | 'new_town_1600s' | 'multi_period' | 'crossing' | 'natural' | 'modern' | 'hypothesis';

interface Feat {
  name: string; feature_type: string; time_layer: Layer;
  lat: number; lng: number; route_group: string | null; seq: number | null;
  belegg_status: string | null; confidence: string | null; reconcile_ref: string | null; note: string | null;
}

const LAYER: Record<Layer, { color: string; label: string }> = {
  medieval:       { color: '#d4a63c', label: 'Medeltida (Gamla stan / slottet)' },
  new_town_1600s: { color: '#64748b', label: 'Nya staden (Kvarnholmen, 1640-tal)' },
  multi_period:   { color: '#7b3f00', label: 'Landväg på sandås (Kungs-/Sandåsgatan)' },
  crossing:       { color: '#ef4444', label: 'Båtdrag & Öland-överfart' },
  natural:        { color: '#10b981', label: 'Natur: näs, öar, grund' },
  modern:         { color: '#94a3b8', label: 'Modernt (Ölandsleden/bron)' },
  hypothesis:     { color: '#a855f7', label: 'Onomastisk hypotes (Jut-/Svensk-/vad-)' },
};
const LAYER_KEYS = Object.keys(LAYER) as Layer[];

function useKalmarFeatures(): Feat[] {
  const [feats, setFeats] = useState<Feat[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await (supabase.from('kalmar_field_features') as unknown as {
        select: (c: string) => Promise<{ data: unknown; error: unknown }>;
      }).select('name,feature_type,time_layer,lat,lng,route_group,seq,belegg_status,confidence,reconcile_ref,note');
      if (!alive || error || !Array.isArray(data)) return;
      setFeats(data as Feat[]);
    })();
    return () => { alive = false; };
  }, []);
  return feats;
}

const KalmarMedeltidMap: React.FC<{ feats: Feat[] }> = ({ feats }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const groupsRef = useRef<Record<string, L.LayerGroup>>({});
  const [shoreYear, setShoreYear] = useState<number | null>(null);
  useShorelineOverlay(mapRef, shoreYear, 'get_paleo_shorelines_dem', KALMAR_BBOX);

  const LEGEND: LegendLayerDef[] = [
    ...LAYER_KEYS.map((k) => ({ key: k, label: LAYER[k].label, color: LAYER[k].color, defaultOn: true })),
    { key: 'osm', label: 'Baskarta (OSM)', color: '#64748b', group: 'basemap' as const, defaultOn: true },
  ];
  const { enabled, toggle } = useMapLegendState(LEGEND);

  // Init en gång
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [56.69, 16.42], zoom: 11, scrollWheelZoom: true });
    tileRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    LAYER_KEYS.forEach((k) => { groupsRef.current[k] = L.layerGroup(); });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Rita features när de laddats
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !feats.length) return;
    LAYER_KEYS.forEach((k) => groupsRef.current[k]?.clearLayers());

    // Linjära features (route_group) → polyline i sitt tidsskikts färg
    const byGroup = new Map<string, Feat[]>();
    feats.forEach((f) => {
      if (!f.route_group) return;
      const arr = byGroup.get(f.route_group) ?? [];
      arr.push(f); byGroup.set(f.route_group, arr);
    });
    byGroup.forEach((arr) => {
      const sorted = [...arr].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
      const layer = sorted[0].time_layer;
      const col = (LAYER[layer] ?? LAYER.natural).color;
      L.polyline(sorted.map((f) => [f.lat, f.lng] as [number, number]), { color: col, weight: 3, opacity: 0.8, dashArray: '5 5' })
        .addTo(groupsRef.current[layer]);
    });

    // Punkter (alla) → circleMarker
    feats.forEach((f) => {
      const layer = (LAYER[f.time_layer] ? f.time_layer : 'natural') as Layer;
      const col = LAYER[layer].color;
      const bel = f.belegg_status ? ` · belägg: ${f.belegg_status}` : '';
      const rec = f.reconcile_ref ? `<br/><span style="font-size:10px;color:#888">↔ ${f.reconcile_ref}</span>` : '';
      L.circleMarker([f.lat, f.lng], { radius: 5, color: col, weight: 2, fillColor: col, fillOpacity: 0.75 })
        .bindTooltip(f.name, { direction: 'top', offset: [0, -6], className: 'ang-clabel' })
        .bindPopup(`<b>${f.name}</b> <span style="font-size:10px;color:#888">${f.feature_type}${bel}</span>${f.note ? `<br/><span style="font-size:11px">${f.note}</span>` : ''}${rec}`)
        .addTo(groupsRef.current[layer]);
    });

    map.fitBounds(L.latLngBounds(feats.map((f) => [f.lat, f.lng] as [number, number])), { padding: [30, 30] });
  }, [feats]);

  // Baskarta på/av
  useEffect(() => {
    const map = mapRef.current, tile = tileRef.current;
    if (!map || !tile) return;
    if (enabled.osm) { if (!map.hasLayer(tile)) tile.addTo(map); }
    else if (map.hasLayer(tile)) map.removeLayer(tile);
  }, [enabled.osm]);

  // Toggla tidsskikts-lager enligt legenden
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    LAYER_KEYS.forEach((k) => {
      const g = groupsRef.current[k];
      if (!g) return;
      if (enabled[k]) { if (!map.hasLayer(g)) map.addLayer(g); }
      else if (map.hasLayer(g)) map.removeLayer(g);
    });
  }, [enabled]);

  return (
    <div>
      <div className="hidden sm:block">
        <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} />
      </div>
      <div className="relative">
        <div className="sm:hidden absolute left-2 top-16 z-[1105]">
          <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} variant="floating" />
        </div>
        <div ref={containerRef} className="w-full h-[560px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 560 }} />
        <MapLegend defs={LEGEND} enabled={enabled} onToggle={toggle} mapRef={mapRef} />
      </div>
    </div>
  );
};

const KalmarMedeltid = () => {
  const feats = useKalmarFeatures();
  const counts = feats.reduce<Record<string, number>>((a, f) => { a[f.time_layer] = (a[f.time_layer] ?? 0) + 1; return a; }, {});

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Kalmar medeltidskarta — stad, slott, båtdrag och Öland-överfart"
        titleEn="Medieval Kalmar map — town, castle, boat-portage and the Öland crossing"
        description="Källkritisk medeltidskarta över Kalmar: Gamla stans gatunät och medeltidshamnen vid slottet, båtdraget över Stensö-näset (Dragvik), överfarten till Öland (Ölandskajen–Färjestaden) och Kvarnholmens senare stad. Tidsskiktade lager mot medeltida strandlinje."
        descriptionEn="Source-critical medieval map of Kalmar: the old-town street grid and harbour by the castle, the boat-portage across the Stensö isthmus (Dragvik), the crossing to Öland (Ölandskajen–Färjestaden) and the later town on Kvarnholmen. Time-layered against the medieval shoreline."
        keywords="Kalmar medeltid, medeltidskarta Kalmar, Kalmar slott, medeltidshamnen, Dragvik, båtdrag, Stensö, Ölandskajen, Färjestaden, Öland överfart, Kvarnholmen, Gamla stan, Kalmarsund"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <MapIcon className="h-8 w-8 text-gold" />
            Kalmar — medeltidskarta
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Stad, slott, båtdrag och Öland-överfart — tidsskiktat och källkritiskt</p>
          <p className="text-muted-foreground text-lg">
            En rekonstruktion av Kalmar med omland byggd på fältkännedom (D. Larsson) och verifierat mot
            befintliga register där sådana finns. Lagren är <strong>tidsskiktade</strong>: den medeltida staden
            vid <strong>slottet</strong> (Gamla stan) hålls skild från den <strong>nya staden på Kvarnholmen</strong>
            {' '}(anlagd 1640-tal), och från båtdrag, överfart och naturgeografi i sundet.
          </p>
        </div>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><MapIcon className="h-5 w-5" /> Kartan</CardTitle>
          </CardHeader>
          <CardContent>
            <KalmarMedeltidMap feats={feats} />
            <p className="text-xs text-muted-foreground mt-2 opacity-75">
              {feats.length} punkter ur <code>kalmar_field_features</code>. Reglaget lägger på en{' '}
              <strong>paleo-strandlinje</strong> — avgörande här, eftersom Kvarnholmen till stor del var vatten
              på medeltiden. Toggla lager i legenden (t.ex. släck "Nya staden" för att se den medeltida bilden).
            </p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4 border-gold/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Anchor className="h-5 w-5" /> Båtdrag & överfart</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 text-xs">
            <p>
              Över det smala <strong>Stensö-näset</strong> drogs båtar mellan Västra sjön och Kalmarsund —{' '}
              <strong>Dragvik/Dragviksudd</strong> (ledet <em>drag-</em> = båtdrag, belagt appellativ, SOL). Ett
              andra båtdrag finns vid <strong>Drag/Revsudden</strong> (bebyggelsenamnet <em>Drag</em> + Drags kanal).
              Båda har senare kanaler — sannolikt formaliseringar av äldre drag. Att just dessa var förhistoriska
              båtdrag är en <em>hypotes</em> tills höjddata (DEM)/arkeologi belägger den.
            </p>
            <p>
              Överfarten till Öland gick <strong>Ölandskajen (Kalmar) ↔ Färjestaden (Öland)</strong> — namnet
              <em> Färje-staden</em> är själva belägget för färjefunktionen. Namnparet <strong>Jutnabben</strong>
              {' '}(danskar?) och <strong>Svensknabben</strong> (svenskar?) antyder Kalmarsund som dansk–svensk
              gränszon — onomastiskt indicium, ännu obelagt (kräver Isof/SOL).
            </p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> Förbehåll (källkritik)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1 text-xs">
            <p>• <strong>Koordinaterna är dagens lägen</strong> (D. Larssons kartavläsning) — medeltidens strandlinje var en annan (landhöjning + utfyllnad). Använd strandlinje-reglaget; lägena är approximativa.</p>
            <p>• <strong>Kvarnholmen = nya staden (1640-tal)</strong>. Spikgatan, Kattrumpan och befästningslinjen hör dit — <em>inte</em> medeltiden. Medeltida features ligger i Gamla stan vid slottet.</p>
            <p>• <strong>Belägg-status per punkt</strong> (belagt / tradition / hypotes / obelagt) visas i popupen. "Lär ha varit"-gator (Västerlång-, Spikgatan) är tradition, ej fastställda.</p>
            <p>• <strong>Namn/etymologier</strong> (Olsan, Flundrans äldre namn, Jut-/Svensk-/Vadsten-, Högås lokalt) är <em>obelagda</em> tills en Isof-slagning på Kalmar sn gjorts. Isof 935472 "Högås" avser Tveta sn — annan plats.</p>
            <p>• Flera punkter <strong>sammanfaller med befintliga register</strong> (Grimskär, Olsan, gamla torget/S:t Nicolai, Varvsholmen, Kalmar slott) — visas med <code>↔</code>-referens och ska inte dubbleras.</p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Underlag: D. Larsson (fältkännedom/kartavläsning) + sjökort; reconcile mot heritage_sites / crossing_points / location_hypotheses. Strandlinjemetoden (DEM, Copernicus GLO-30 + landhöjning) delas med <a href="/sv/gota-landsvag" className="text-gold hover:underline">Göta landsväg</a>. Fältdata: <code>docs/kalmar-medeltidskarta-faltdata.md</code>.</span>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default KalmarMedeltid;
