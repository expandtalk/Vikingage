import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins as CoinsIcon, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCoins, parseCoinCoord, type Coin } from '@/hooks/useCoins';

const CATEGORY_LABEL: Record<string, { sv: string; en: string }> = {
  nordic_royal: { sv: 'Nordisk kunglig myntning', en: 'Nordic royal coinage' },
  runmynt: { sv: 'Runmynt', en: 'Rune coins' },
  roman_solidus: { sv: 'Romerska solidi', en: 'Roman solidi' },
  hoard: { sv: 'Skatter', en: 'Hoards' },
  imitation: { sv: 'Imitationer', en: 'Imitations' },
};
const CATEGORY_COLOR: Record<string, string> = {
  nordic_royal: '#f59e0b', runmynt: '#a855f7', roman_solidus: '#eab308', hoard: '#22c55e', imitation: '#0ea5e9',
};
const CATEGORY_ORDER = ['nordic_royal', 'runmynt', 'roman_solidus', 'hoard', 'imitation'];

const CoinsMap: React.FC<{ coins: Coin[] }> = ({ coins }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<L.LayerGroup>(new L.LayerGroup());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: [58, 16], zoom: 4, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    layerRef.current.addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layerRef.current.clearLayers();
    const pts: [number, number][] = [];
    for (const c of coins) {
      const co = parseCoinCoord(c.coordinates);
      if (!co) continue;
      pts.push([co.lat, co.lng]);
      L.circleMarker([co.lat, co.lng], {
        radius: 7, color: '#78350f', fillColor: CATEGORY_COLOR[c.category] ?? '#f59e0b', fillOpacity: 0.85, weight: 2,
      })
        .bindPopup(`<strong>${c.name}</strong>${c.mint ? `<br/>${c.mint}` : ''}${c.issuer ? `<br/><em>${c.issuer}</em>` : ''}`)
        .addTo(layerRef.current);
    }
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 6 });
    setTimeout(() => map.invalidateSize(), 100);
  }, [coins]);

  return <div ref={containerRef} className="w-full h-[420px] rounded-lg overflow-hidden border border-white/10" />;
};

const Coins = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: coins = [], isLoading } = useCoins();

  const byCategory = useMemo(() => {
    const m = new Map<string, Coin[]>();
    for (const c of coins) {
      if (!m.has(c.category)) m.set(c.category, []);
      m.get(c.category)!.push(c);
    }
    return CATEGORY_ORDER.filter((k) => m.has(k)).map((k) => ({ key: k, coins: m.get(k)! }));
  }, [coins]);

  const catLabel = (k: string) => CATEGORY_LABEL[k]?.[sv ? 'sv' : 'en'] ?? k;
  const period = (a: number | null, b: number | null) => {
    const y = (n: number) => (n < 0 ? `${Math.abs(n)} f.Kr.` : `${n} e.Kr.`);
    if (a == null && b == null) return null;
    if (a != null && b != null) return `${y(a)} – ${y(b)}`;
    return y((a ?? b)!);
  };

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Mynt"
        titleEn="Coins"
        description="Mynt från nordisk historia: vikingatidens första svenska mynt, runmynt och romerska solidusskatter — kopplade till härskare och fyndplatser."
        descriptionEn="Coins from Nordic history: the first Swedish coins of the Viking Age, rune coins and Roman solidus hoards — linked to rulers and find sites."
        keywords="mynt, numismatik, solidus, runmynt, Olof Skötkonung, Sigtuna, vikingatid"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <CoinsIcon className="h-8 w-8 text-accent" />
            {sv ? 'Mynt' : 'Coins'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {sv
              ? 'Från de första svenska mynten i Sigtuna till runmynt och romerska solidusskatter — kopplade till härskare och fyndplatser.'
              : 'From the first Swedish coins in Sigtuna to rune coins and Roman solidus hoards — linked to rulers and find sites.'}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">{sv ? 'Laddar mynt…' : 'Loading coins…'}</div>
        ) : (
          <>
            <div className="mb-8">
              <CoinsMap coins={coins} />
            </div>

            {byCategory.map(({ key, coins: list }) => (
              <section key={key} className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: CATEGORY_COLOR[key] }} />
                  {catLabel(key)} <span className="text-muted-foreground text-base">({list.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map((c) => (
                    <Card key={c.id} className="viking-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-foreground text-base">{sv ? c.name : c.name_en ?? c.name}</CardTitle>
                        <div className="flex flex-wrap gap-1.5">
                          {c.issuer && <Badge variant="secondary" className="text-xs">{c.issuer}</Badge>}
                          {c.mint && <Badge variant="outline" className="text-xs">{c.mint}</Badge>}
                          {c.metal && <Badge variant="outline" className="text-xs">{c.metal}</Badge>}
                          {c.denomination && <Badge variant="outline" className="text-xs">{c.denomination}</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {period(c.period_start, c.period_end) && (
                          <div className="text-muted-foreground">{period(c.period_start, c.period_end)}</div>
                        )}
                        {c.significance && <div className="text-accent text-xs font-medium">{c.significance}</div>}
                        <p className="text-muted-foreground">{sv ? c.description : c.description_en ?? c.description}</p>
                        {(c.obverse || c.reverse) && (
                          <div className="text-xs text-muted-foreground/80">
                            {c.obverse && <div><strong>{sv ? 'Åtsida:' : 'Obverse:'}</strong> {c.obverse}</div>}
                            {c.reverse && <div><strong>{sv ? 'Frånsida:' : 'Reverse:'}</strong> {c.reverse}</div>}
                          </div>
                        )}
                        {c.find_place && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{c.find_place}
                          </div>
                        )}
                        {c.sources && <div className="text-[11px] text-muted-foreground/70 italic pt-1">{c.sources}</div>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Coins;
