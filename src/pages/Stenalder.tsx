import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Hammer, Info, AlertTriangle, Gem } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MapLegend } from '@/components/map/MapLegend';
import { useMapLegendState, type LegendLayerDef } from '@/hooks/map/useMapLegendState';

// /sv/stenalder — samlingssida för stenålderns Sverige: lokaler (heritage_sites) på karta +
// föremål (museum_objects). Fakta ur Klein 1931 (paraphraserad) + SHM/Wikidata. Bilder bara CC0/CC.
// Längst ner: TODO-lista över objekt/platser som saknar geokoordinat.

interface Site { id: string; name: string; raa_type: string | null; period: string | null; parish: string | null; landscape: string | null; lat: number | null; lng: number | null; description: string | null; }
interface Obj { id: string; name: string; title: string | null; category: string | null; material: string | null; size: string | null; find_place: string | null; find_landscape: string | null; period: string | null; lat: number | null; lng: number | null; image_url: string | null; }

const StenalderMap: React.FC<{ sites: Site[] }> = ({ sites }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const sitesG = useRef<L.LayerGroup>(L.layerGroup());

  const LEGEND: LegendLayerDef[] = [
    { key: 'sites', label: 'Stenålderslokaler', color: '#a16207', defaultOn: true },
    { key: 'osm', label: 'Baskarta (OSM)', color: '#64748b', group: 'basemap', defaultOn: true },
  ];
  const { enabled, toggle } = useMapLegendState(LEGEND);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [58.5, 15.0], zoom: 5, scrollWheelZoom: true });
    tileRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    sitesG.current.addTo(map);
    mapRef.current = map;
    setTimeout(() => { try { map.invalidateSize(); } catch { /* noop */ } }, 120);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current, tile = tileRef.current;
    if (!map || !tile) return;
    if (enabled.osm) { if (!map.hasLayer(tile)) tile.addTo(map); }
    else if (map.hasLayer(tile)) map.removeLayer(tile);
  }, [enabled.osm]);

  useEffect(() => {
    const map = mapRef.current, g = sitesG.current;
    if (!map) return;
    g.clearLayers();
    const pts: [number, number][] = [];
    sites.filter((s) => s.lat != null && s.lng != null).forEach((s) => {
      pts.push([s.lat!, s.lng!]);
      L.circleMarker([s.lat!, s.lng!], { radius: 5, color: '#78350f', weight: 1.5, fillColor: '#eab308', fillOpacity: 0.85 })
        .bindPopup(`<b>${s.name}</b><br/><span style="font-size:11px;color:#666">${s.raa_type ?? ''}${s.period ? ` · ${s.period}` : ''}${s.parish ? `<br/>${s.parish} sn, ${s.landscape ?? ''}` : ''}</span>`)
        .addTo(g);
    });
    if (enabled.sites) { if (!map.hasLayer(g)) map.addLayer(g); } else if (map.hasLayer(g)) map.removeLayer(g);
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 8 });
  }, [sites, enabled.sites]);

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full h-[460px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 460 }} />
      <MapLegend defs={LEGEND} enabled={enabled} onToggle={toggle} mapRef={mapRef} />
    </div>
  );
};

const Stenalder = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [objs, setObjs] = useState<Obj[]>([]);

  useEffect(() => {
    (supabase.from('heritage_sites') as any)
      .select('id,name,raa_type,period,parish,landscape,lat,lng,description')
      .or('period.ilike.%stenålder%,raa_type.eq.dös,raa_type.eq.gånggrift,raa_type.ilike.%grottboplats%,raa_type.ilike.%pålbyggnad%,raa_type.eq.hällkista')
      .limit(300)
      .then(({ data }: { data: Site[] | null }) => setSites(data ?? []));
    (supabase.from('museum_objects') as any)
      .select('id,name,title,category,material,size,find_place,find_landscape,period,lat,lng,image_url')
      .or('period.ilike.%sten%,period.ilike.%neolit%,category.eq.yxa,category.eq.dolk,category.eq.stridsyxa,category.eq.kam,category.eq.kranium')
      .limit(120)
      .then(({ data }: { data: Obj[] | null }) => setObjs(data ?? []));
  }, []);

  const withCoord = sites.filter((s) => s.lat != null).length;
  const missingObjCoord = objs.filter((o) => o.lat == null);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Stenålderns Sverige — lokaler och föremål"
        titleEn="Stone Age Sweden — sites and objects"
        description="Samlingssida för stenålderns Sverige: boplatser, grottor och megalitgravar på karta, samt föremål (flintyxor, dolkar, stridsyxor, smycken, kammar och kranier). Källförd (Ernst Klein 1931, SHM, Wikidata), med redovisade osäkerheter."
        descriptionEn="Stone Age Sweden: settlements, caves and megalithic tombs on a map, plus objects (flint axes, daggers, battle axes, ornaments, combs and crania)."
        keywords="stenålder, Sverige, boplats, gånggrift, dös, megalitgrav, flintyxa, flintdolk, stridsyxa, Alvastra, Stora Förvar, Karleby, neolitikum"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Gem className="h-8 w-8 text-gold" /> Stenålderns Sverige
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Lokaler och föremål — boplatser, megalitgravar och stenålderns konst</p>
          <p className="text-muted-foreground text-lg">
            Från säljägarnas grottor och strandboplatser till böndernas gånggrifter. Sidan samlar stenålderns
            <strong> lokaler</strong> (på kartan) och <strong>föremål</strong> ur samlingarna. Faktakälla bl.a.
            Ernst Klein, <em>Bilder ur Sveriges historia</em> (1931), källkritiskt bearbetad — Kleins text är
            paraphraserad och bilder läggs bara in med fri licens.
          </p>
        </div>

        {/* KARTA */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> Stenålderslokaler på kartan ({withCoord})</CardTitle>
          </CardHeader>
          <CardContent>
            <StenalderMap sites={sites} />
          </CardContent>
        </Card>

        {/* FÖREMÅL */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Hammer className="h-5 w-5" /> Föremål ({objs.length})</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="grid gap-2 sm:grid-cols-2">
              {objs.map((o) => (
                <div key={o.id} className="border-l-2 border-amber-500/50 pl-3 py-1">
                  <div className="text-foreground font-medium flex items-center gap-2">
                    {o.title || o.name}
                    {o.category && <Badge variant="secondary" className="text-[10px]">{o.category}</Badge>}
                  </div>
                  <div className="text-xs">
                    {[o.material, o.size, o.find_place || o.find_landscape, o.period].filter(Boolean).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* TODO — saknas (objekt/platser utan geokoordinat) */}
        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> TODO — saknar geokoordinat / behöver verifieras</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <div>
              <div className="text-xs font-semibold text-amber-300 mb-1">Föremål utan fyndkoordinat ({missingObjCoord.length})</div>
              {missingObjCoord.length === 0 ? <p className="text-xs">—</p> : (
                <ul className="list-disc pl-5 space-y-0.5 text-xs">
                  {missingObjCoord.map((o) => (
                    <li key={o.id}>{o.title || o.name}{o.find_place || o.find_landscape ? ` — fyndplats: ${o.find_place || o.find_landscape} (koord saknas)` : ' — fyndplats okänd'}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300 mb-1">Platser med osäker/approximativ koordinat</div>
              <ul className="list-disc pl-5 space-y-0.5 text-xs">
                <li><strong>Stora Förvar (Stora Karlsö)</strong> — koordinaten är öns läge; grottans exakta position behöver verifieras (Fornsök).</li>
                <li><strong>Haväng (Ravlunda sn)</strong> — vi har Havängsdösen, men själva <em>kustboplatsen</em> som lämning saknas.</li>
              </ul>
            </div>
            <p className="text-[11px] opacity-70">Fyll på: när en fyndkoordinat verifierats (Fornsök/SHM/Wikidata) sätts <code>lat/lng</code> på objektet och det försvinner härifrån. CC0-bilder (SHM) läggs till per objekt.</p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Källor: Ernst Klein, <em>Bilder ur Sveriges historia</em> (Nordisk Rotogravyr 1931/1932) — faktakälla, paraphraserad; Statens historiska museum (SHM); Wikidata (P625, koordinater); RAÄ Fornsök. Data: <code>heritage_sites</code>, <code>museum_objects</code>. Kleins text är upphovsrättsskyddad t.o.m. 2039 — endast fakta återges; bilder bara med fri licens.</span>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Stenalder;
