import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Anchor, Crown, ScrollText, Info, Ship, MapPin, Cross } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useShorelineOverlay } from '@/hooks/useShorelineOverlay';
import { ShorelinePeriodControl } from '@/components/map/ShorelinePeriodControl';
import { MapLegend } from '@/components/map/MapLegend';
import { useMapLegendState, type LegendLayerDef } from '@/hooks/map/useMapLegendState';

// /sv/birka — forskningshubb för Birka på Björkö i Mälaren (ca 750–975), Sveriges första stad.
// Källbelagt: viking_cities (stad, Bj 581), historical_kings (Kung Björn/Ansgar), trade_routes
// (österled/Volgavägen m.fl.). Kartan visar Björkö vid vikingatida havsnivå (paleo-strandlinje).
// Hederlighet: inga påhittade rutt-geometrier — lederna redovisas som källförd text.

const BIRKA: [number, number] = [59.3362, 17.5455];
const BIRKA_BBOX: [number, number, number, number] = [17.30, 59.20, 17.80, 59.48];

interface City { description: string | null; historical_significance: string | null; period_start: number | null; period_end: number | null; unesco_site: boolean | null; }
interface King { name: string; reign_start: number | null; reign_end: number | null; description: string | null; }
interface Route { name: string; orientation: string | null; description: string | null; source: string | null; link: string | null; }

const BirkaMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const birkaG = useRef<L.LayerGroup>(L.layerGroup());
  const [shoreYear, setShoreYear] = useState<number | null>(900);
  useShorelineOverlay(mapRef, shoreYear, 'get_paleo_shorelines_dem', BIRKA_BBOX);

  const LEGEND: LegendLayerDef[] = [
    { key: 'birka', label: 'Birka (Björkö)', color: '#f59e0b', defaultOn: true },
    { key: 'osm', label: 'Baskarta (OSM)', color: '#64748b', group: 'basemap', defaultOn: true },
  ];
  const { enabled, toggle } = useMapLegendState(LEGEND);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: BIRKA, zoom: 11, scrollWheelZoom: true });
    tileRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    L.circleMarker(BIRKA, { radius: 9, color: '#b45309', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.55 })
      .bindTooltip('Birka', { permanent: true, direction: 'top', offset: [0, -8], className: 'ang-clabel' })
      .bindPopup('<b>Birka</b><br/><span style="font-size:11px">Handelsstad på Björkö i Mälaren, ca 750–975. Sveriges första stad. UNESCO-världsarv (med Hovgården på Adelsö).</span>')
      .addTo(birkaG.current);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current, tile = tileRef.current;
    if (!map || !tile) return;
    if (enabled.osm) { if (!map.hasLayer(tile)) tile.addTo(map); }
    else if (map.hasLayer(tile)) map.removeLayer(tile);
  }, [enabled.osm]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const g = birkaG.current;
    if (enabled.birka) { if (!map.hasLayer(g)) map.addLayer(g); }
    else if (map.hasLayer(g)) map.removeLayer(g);
  }, [enabled.birka]);

  return (
    <div>
      <div className="hidden sm:block">
        <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} />
      </div>
      <div className="relative">
        {/* Mobil: flytande strandlinje-kontroll (frigör kartytan) — inline på desktop ovan. */}
        <div className="sm:hidden absolute left-2 top-16 z-[1105]">
          <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} variant="floating" />
        </div>
        <div ref={containerRef} className="w-full h-[460px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 460 }} />
        <MapLegend defs={LEGEND} enabled={enabled} onToggle={toggle} mapRef={mapRef} />
      </div>
    </div>
  );
};

const Birka = () => {
  const [city, setCity] = useState<City | null>(null);
  const [king, setKing] = useState<King | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    (supabase.from('viking_cities') as any).select('description, historical_significance, period_start, period_end, unesco_site').ilike('name', 'Birka').maybeSingle()
      .then(({ data }: { data: City | null }) => setCity(data));
    (supabase.from('historical_kings') as any).select('name, reign_start, reign_end, description').eq('name', 'Kung Björn').maybeSingle()
      .then(({ data }: { data: King | null }) => setKing(data));
    (supabase.from('trade_routes') as any).select('name, orientation, description, source, link')
      .or('orientation.eq.öst,name.ilike.%birka%,name.ilike.%östväg%,name.ilike.%volga%')
      .then(({ data }: { data: Route[] | null }) => setRoutes(data ?? []));
  }, []);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Birka — Sveriges första stad på Björkö i Mälaren"
        titleEn="Birka — Sweden's first town on Björkö in Lake Mälaren"
        description="Forskningshubb om Birka på Björkö (ca 750–975): handelsstaden och dess österled mot Rus och kalifatet, kung Björn och Ansgars mission omkring 830, samt kammargraven Bj 581. Källförd (Rimberts Vita Ansgarii, Kjellström 2016, Hedenstierna-Jonson m.fl. 2017)."
        descriptionEn="Research hub on Birka on Björkö island (c. 750–975): the trading town and its eastern routes toward the Rus' and the Caliphate, King Björn and Ansgar's mission around 830, and the chamber grave Bj 581."
        keywords="Birka, Björkö, Mälaren, vikingatid, handelsstad, Ansgar, kung Björn, Bj 581, Hovgården, Adelsö, österled, Rus, UNESCO"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Ship className="h-8 w-8 text-gold" /> Birka — Sveriges första stad
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Handelsstaden på Björkö i Mälaren, ca 750–975</p>
          <p className="text-muted-foreground text-lg">
            Birka på <strong>Björkö</strong> i Mälaren var vikingatidens dominerande handelsplats i Svealand —
            en nod i nätverket som band Norden till <strong>Rus-floderna</strong> och vidare mot Bysans och
            kalifatet. Här mötte munken <strong>Ansgar</strong> kung <strong>Björn</strong> omkring 830. Birka
            och <strong>Hovgården</strong> (kungsgården på grannön Adelsö) är sedan 1993 <strong>UNESCO-världsarv</strong>.
          </p>
        </div>

        {/* KARTA */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> Birka på Björkö</CardTitle>
          </CardHeader>
          <CardContent>
            <BirkaMap />
            <p className="text-xs text-muted-foreground mt-2 opacity-75">
              Reglaget höjer havet till vikingatida nivå — Mälaren var då en vik av Östersjön, och farlederna
              in mot Birka såg annorlunda ut. Koordinat verifierad (sv.wikipedia P625). Legenden uppe till höger;
              klicka kartan för att öppna den, eller expandera till helskärm.
            </p>
          </CardContent>
        </Card>

        {/* ANSGAR & KUNG BJÖRN */}
        {king && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gold"><Cross className="h-5 w-5" /> Kung Björn & Ansgars mission (~830)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">{king.name}</strong>
                {king.reign_start ? <span className="text-xs"> ({king.reign_start}{king.reign_end ? `–${king.reign_end}` : ''})</span> : null}
                {' — '}{king.description}
              </p>
              <p className="text-xs opacity-80">
                Berättelsen kommer från <em>Vita Ansgarii</em>, skriven av ärkebiskop <strong>Rimbert</strong> (Ansgars
                efterträdare) på 800-talet — vår viktigaste skriftliga källa till Birka. <span className="text-amber-300">Källförd berättelse, inte samtida arkiv.</span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* HANDELSSTADEN — leder */}
        {routes.length > 0 && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gold"><Anchor className="h-5 w-5" /> Handelslederna österut ({routes.length})</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p className="text-xs opacity-80">Birkas rikedom byggde på fjärrhandeln. Lederna redovisas som källförd text — exakta rutt-geometrier ritas inte ut (kräver verifierade waypoints).</p>
              {routes.map((r) => (
                <div key={r.name} className="border-l-2 border-amber-500/60 pl-3 py-1">
                  <div className="text-foreground font-medium flex items-center gap-2">
                    {r.name}
                    {r.orientation && <Badge variant="secondary" className="text-[10px]">{r.orientation}</Badge>}
                  </div>
                  {r.description && <div className="text-xs mt-0.5">{r.description}</div>}
                  {r.source && <div className="text-[10px] text-slate-500 mt-0.5">Källa: {r.source}</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* BJ 581 + STADEN */}
        {city && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gold"><ScrollText className="h-5 w-5" /> Staden och kammargraven Bj 581</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>{city.description}</p>
              <p className="text-xs opacity-80">
                <strong className="text-foreground">Källkritik:</strong> könsbestämningen (aDNA, två X-kromosomer) är belagd; det
                omtvistade är <em>tolkningen</em> — krigare eller vapengrav — inte biologin. Källor: Kjellström 2016 (osteologi),
                Hedenstierna-Jonson m.fl. 2017 (aDNA, Uppsala).
              </p>
            </CardContent>
          </Card>
        )}

        {/* RELATERAT */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Crown className="h-5 w-5" /> Vidare</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <Link to="/explore?searchQuery=Birka" className="block border-l-2 border-emerald-500 pl-3 py-1 hover:bg-slate-800/30 rounded-r transition-colors">
              <div className="text-foreground font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-400" /> Birka på huvudkartan →</div>
              <div className="text-xs mt-0.5">Se Birka i sitt landskap med runstenar, handelsplatser och farleder.</div>
            </Link>
            <Link to="/royal-chronicles" className="block border-l-2 border-amber-500 pl-3 py-1 hover:bg-slate-800/30 rounded-r transition-colors">
              <div className="text-foreground font-medium flex items-center gap-2"><Crown className="h-4 w-4 text-amber-400" /> Kungakrönikor →</div>
              <div className="text-xs mt-0.5">Kung Björn och de tidiga sveakungarna.</div>
            </Link>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Källor: Rimbert, <em>Vita Ansgarii</em> (800-tal); Kjellström 2016; Hedenstierna-Jonson m.fl. 2017 (aDNA Bj 581); UNESCO världsarvslista (Birka &amp; Hovgården, 1993). Data: <code>viking_cities</code>, <code>historical_kings</code>, <code>trade_routes</code>. Bilder läggs bara in med fri licens (Wikimedia CC) — inget upphovsrättsskyddat.</span>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Birka;
