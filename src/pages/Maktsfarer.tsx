import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Ship, Coins as CoinsIcon, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// /sv/maktsfarer — översiktsbilden: elit-monumenten färgade per maktsfär + handelslederna
// (Valdemars kustled, Östvägen/Dnjepr, Volgavägen) + solidus-guldfynden. Binder ihop noderna
// (elite_monuments) med bindväven (trade_routes + trade_route_points) och evidensen (coins).

const SPHERE: Record<string, { sv: string; color: string }> = {
  syd: { sv: 'Sydskandinavisk / dansk', color: '#38bdf8' },
  ostergotland: { sv: 'Östergötland (Folkungar)', color: '#22c55e' },
  svealand: { sv: 'Svealand – Mälardalen', color: '#eab308' },
  vastergotland: { sv: 'Västergötland (kristet)', color: '#f97316' },
  oland: { sv: 'Öland (autonom öbygd)', color: '#b45309' },
  gotland: { sv: 'Gotland (autonom)', color: '#a855f7' },
};
const ROUTE_STYLE: Record<string, { color: string; dash?: string; label: string }> = {
  'valdemar-segelled': { color: '#0ea5e9', dash: '6 5', label: 'Kung Valdemars segelled (kust, ~1300)' },
  'ostvagen': { color: '#f59e0b', label: 'Östvägen — Dnjepr → Miklagård' },
  'volgavagen': { color: '#f43f5e', label: 'Volgavägen — silverartären → kalifatet' },
};
const STATUS_SV: Record<string, string> = {
  water_then: 'låg i vatten då', shore_then: 'strandnära då', review: 'granska (landhöjning)', outside_model: 'utanför strandmodell', unchecked: 'ej testad',
};

interface EM { name: string; kind: string; lat: number; lng: number; sphere: string | null; note: string | null; eriksgata_km: number | null }
interface RP { route_id: string; seq: number; name: string; lat: number | null; lng: number | null; point_kind: string | null; is_major: boolean; section: string | null; shoreline_status: string | null; shoreline_note: string | null }
interface RT { id: string; slug: string; name: string; route_kind: string | null; orientation: string | null; description: string | null }
interface RG { route_id: string; direction: string | null; note: string | null; trade_goods: { name: string; commodity_class: string | null; evidence_note: string | null } | null }
interface SOL { name: string; find_place: string | null; period_start: number | null; period_end: number | null; mint: string | null; lat: number; lng: number }

// coins.coordinates är Postgres point — kan komma som "(x,y)"-sträng eller {x,y}
function parsePoint(c: unknown): { lat: number; lng: number } | null {
  if (!c) return null;
  if (typeof c === 'object' && c && 'x' in c && 'y' in c) return { lng: (c as any).x, lat: (c as any).y };
  if (typeof c === 'string') { const m = c.match(/\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/); if (m) return { lng: +m[1], lat: +m[2] }; }
  return null;
}

const OverviewMap: React.FC<{ monuments: EM[]; routes: RT[]; points: RP[]; solidi: SOL[]; on: Record<string, boolean> }> = ({ monuments, routes, points, solidi, on }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [57.5, 22], zoom: 5, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    const layer = layerRef.current, map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    const swePts: [number, number][] = [];

    // Lederna (linjer + punkter)
    routes.forEach((rt) => {
      if (on['route:' + rt.slug] === false) return;
      const st = ROUTE_STYLE[rt.slug] ?? { color: '#94a3b8', label: rt.name };
      const rpts = points.filter((p) => p.route_id === rt.id && p.lat != null && p.lng != null).sort((a, b) => a.seq - b.seq);
      const latlngs = rpts.map((p) => [p.lat as number, p.lng as number] as [number, number]);
      if (latlngs.length > 1) L.polyline(latlngs, { color: st.color, weight: 3, opacity: 0.75, dashArray: st.dash }).addTo(layer);
      rpts.forEach((p) => {
        const review = p.shoreline_status === 'review';
        L.circleMarker([p.lat as number, p.lng as number], {
          radius: p.is_major ? 5 : 3.5, color: review ? '#ef4444' : st.color, weight: review ? 2 : 1,
          dashArray: review ? '2 2' : undefined, fillColor: st.color, fillOpacity: 0.6,
        }).bindPopup(`<b>${p.name}</b>${p.section ? `<br/><span style="font-size:11px;color:#94a3b8">${p.section}</span>` : ''}${p.shoreline_status ? `<br/><span style="font-size:10px;color:${review ? '#f87171' : '#94a3b8'}">Paleo: ${STATUS_SV[p.shoreline_status] ?? p.shoreline_status}</span>` : ''}`).addTo(layer);
      });
    });

    // Elit-monument, färgade per sfär
    monuments.forEach((m) => {
      if (m.lat == null || m.lng == null || !m.sphere) return;
      if (on['sphere:' + m.sphere] === false) return;
      const sp = SPHERE[m.sphere] ?? { sv: m.sphere, color: '#94a3b8' };
      swePts.push([m.lat, m.lng]);
      L.circleMarker([m.lat, m.lng], { radius: 6, color: sp.color, weight: 2, fillColor: sp.color, fillOpacity: 0.7 })
        .bindPopup(`<b>${m.name}</b><br/><span style="font-size:11px;color:${sp.color}">${sp.sv}</span>${m.eriksgata_km != null && m.eriksgata_km <= 15 ? `<br/><span style="font-size:10px;color:#fbbf24">♛ på Eriksgatan (${m.eriksgata_km} km)</span>` : ''}${m.note ? `<br/><span style="font-size:10px;color:#94a3b8">${m.note}</span>` : ''}`).addTo(layer);
    });

    // Solidus-guldfynd (Öland) — precis östkontakt-evidens
    if (on['solidus'] !== false) solidi.forEach((s) => {
      swePts.push([s.lat, s.lng]);
      L.circleMarker([s.lat, s.lng], { radius: 7, color: '#fde047', weight: 2, fillColor: '#facc15', fillOpacity: 0.85 })
        .bindTooltip('◆', { permanent: true, direction: 'center', className: 'sol-star' })
        .bindPopup(`<b>${s.name}</b><br/><span style="font-size:11px;color:#facc15">Solidus-guld ${s.period_start ?? ''}–${s.period_end ?? ''} e.Kr.</span>${s.mint ? `<br/><span style="font-size:10px;color:#94a3b8">Mynt: ${s.mint}</span>` : ''}${s.find_place ? `<br/><span style="font-size:10px;color:#94a3b8">${s.find_place}</span>` : ''}`).addTo(layer);
    });

    if (swePts.length) map.fitBounds(L.latLngBounds(swePts), { padding: [30, 30], maxZoom: 7 });
  }, [monuments, routes, points, solidi, on]);

  const fitEast = () => {
    const map = mapRef.current; if (!map) return;
    const ep = points.filter((p) => p.lat != null && p.lng != null && (p.lng as number) > 25).map((p) => [p.lat, p.lng] as [number, number]);
    const swe = monuments.filter((m) => m.lat != null).map((m) => [m.lat, m.lng] as [number, number]);
    if (ep.length) map.fitBounds(L.latLngBounds([...swe, ...ep]), { padding: [30, 30] });
  };
  const fitSwe = () => {
    const map = mapRef.current; if (!map) return;
    const swe = monuments.filter((m) => m.lat != null).map((m) => [m.lat, m.lng] as [number, number]);
    if (swe.length) map.fitBounds(L.latLngBounds(swe), { padding: [30, 30], maxZoom: 7 });
  };

  return (
    <div>
      <div className="flex gap-2 mb-2 text-xs">
        <button onClick={fitSwe} className="rounded border border-slate-600 px-2 py-1 hover:bg-slate-800">Sfärer (Sverige)</button>
        <button onClick={fitEast} className="rounded border border-slate-600 px-2 py-1 hover:bg-slate-800">Hela östleden →</button>
      </div>
      <div ref={containerRef} className="w-full h-[560px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 560 }} />
    </div>
  );
};

const Maktsfarer = () => {
  const [monuments, setMonuments] = useState<EM[]>([]);
  const [routes, setRoutes] = useState<RT[]>([]);
  const [points, setPoints] = useState<RP[]>([]);
  const [goods, setGoods] = useState<RG[]>([]);
  const [solidi, setSolidi] = useState<SOL[]>([]);
  const [on, setOn] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setOn((s) => ({ ...s, [k]: s[k] === false ? true : false }));

  useEffect(() => {
    (supabase.from('elite_monuments') as any).select('name,kind,lat,lng,sphere,note,eriksgata_km').then(({ data }: { data: EM[] }) => setMonuments(data ?? []));
    (supabase.from('trade_routes') as any).select('id,slug,name,route_kind,orientation,description').then(({ data }: { data: RT[] }) => setRoutes(data ?? []));
    (supabase.from('trade_route_points') as any).select('route_id,seq,name,lat,lng,point_kind,is_major,section,shoreline_status,shoreline_note').order('seq').then(({ data }: { data: RP[] }) => setPoints(data ?? []));
    (supabase.from('route_goods') as any).select('route_id,direction,note,trade_goods(name,commodity_class,evidence_note)').then(({ data }: { data: RG[] }) => setGoods(data ?? []));
    (supabase.from('coins') as any).select('name,find_place,period_start,period_end,mint,coordinates,denomination').ilike('denomination', '%solid%').then(({ data }: { data: any[] }) => {
      setSolidi((data ?? []).map((c) => { const p = parsePoint(c.coordinates); return p ? { name: c.name, find_place: c.find_place, period_start: c.period_start, period_end: c.period_end, mint: c.mint, lat: p.lat, lng: p.lng } : null; }).filter(Boolean) as SOL[]);
    });
  }, []);

  const spheresPresent = Object.keys(SPHERE).filter((s) => monuments.some((m) => m.sphere === s));

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Maktsfärer & handelsleder"
        titleEn="Power spheres & trade routes"
        description="Översiktskarta: vikingatidens elit-monument färgade per maktsfär (dansk söder, Östergötland, Svealand, Västergötland, Öland, Gotland) + handelslederna österut (Dnjepr och Volga) och Kung Valdemars segelled, med paleo-hydrografisk validering och solidus-guldfynden."
        descriptionEn="Overview map: Viking-Age elite monuments coloured by power sphere plus the eastern trade routes and King Valdemar's sailing itinerary."
        keywords="maktsfärer, handelsleder, östvägen, Volgavägen, Kung Valdemars segelled, solidus, Rus, Miklagård, vikingatid"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3"><Crown className="h-8 w-8 text-gold" /> Maktsfärer &amp; handelsleder</h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Översiktsbilden — noder, bindväv och evidens</p>
          <p className="text-muted-foreground text-lg">
            Elit-monumenten klustrar inte slumpmässigt. De faller i <strong>samtida maktsfärer</strong> — den danska södern, Östergötland, Svealand, Västergötland, och de autonoma öarna Öland och Gotland — inte ett enat Sverige.
            Det som <em>band ihop</em> dem var rörelse: <strong>Eriksgatan</strong> (kungens legitimeringsrunda) på land, och <strong>vattenlederna</strong> österut. Kartan visar alla tre lager samtidigt.
          </p>
        </div>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-gold"><Ship className="h-5 w-5" /> Kartan</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5 text-xs mb-2">
              {spheresPresent.map((s) => { const active = on['sphere:' + s] !== false; const sp = SPHERE[s];
                return <button key={s} onClick={() => toggle('sphere:' + s)} className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${active ? 'border-slate-500 text-foreground' : 'border-slate-700 text-muted-foreground opacity-50'}`}><span style={{ width: 10, height: 10, borderRadius: 9999, background: sp.color, display: 'inline-block' }} /> {sp.sv}</button>; })}
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs mb-3">
              {routes.map((r) => { const active = on['route:' + r.slug] !== false; const st = ROUTE_STYLE[r.slug]; if (!st) return null;
                return <button key={r.slug} onClick={() => toggle('route:' + r.slug)} className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${active ? 'border-slate-500 text-foreground' : 'border-slate-700 text-muted-foreground opacity-50'}`}><span style={{ width: 16, height: 2, background: st.color, display: 'inline-block' }} /> {st.label}</button>; })}
              <button onClick={() => toggle('solidus')} className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${on['solidus'] !== false ? 'border-slate-500 text-foreground' : 'border-slate-700 text-muted-foreground opacity-50'}`}><span style={{ color: '#facc15' }}>◆</span> Solidus-guld</button>
            </div>
            <OverviewMap monuments={monuments} routes={routes} points={points} solidi={solidi} on={on} />
            <p className="text-xs text-muted-foreground mt-2 opacity-75"><strong>Röd streckad ring</strong> på en ledpunkt = flaggad för paleo-granskning (låg för långt från dåtida strandlinje — landhöjningszon). <strong>◆ guld</strong> = solidus-skatt (folkvandringstidens östkontakt). Klicka för detaljer.</p>
          </CardContent>
        </Card>

        {/* VAROR PER LED */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-gold"><CoinsIcon className="h-5 w-5" /> Varor på lederna</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            {routes.map((r) => { const rg = goods.filter((g) => g.route_id === r.id); if (!rg.length) return null;
              const exp = rg.filter((g) => g.direction === 'export'), imp = rg.filter((g) => g.direction === 'import');
              return (
                <div key={r.id}>
                  <div className="text-foreground font-medium text-xs">{ROUTE_STYLE[r.slug]?.label ?? r.name}</div>
                  {exp.length > 0 && <div className="text-xs"><span className="text-emerald-300">Export österut:</span> {exp.map((g) => g.trade_goods?.name).join(', ')}</div>}
                  {imp.length > 0 && <div className="text-xs"><span className="text-amber-300">Import hem:</span> {imp.map((g) => g.trade_goods?.name).join(', ')}</div>}
                </div>
              );
            })}
            <p className="text-[11px] opacity-70"><strong>Solidus-guldet</strong> är folkvandringstidens guldfas (394–476 e.Kr.) av samma östkontakt — 400 år före vikingaledernas silver. Fem skatter, alla på Öland, myntade i Konstantinopel/Ravenna/Milano; die-länkad precisionsforskning (Fischer). Se <Link to="/sv/mynt" className="text-gold hover:underline">mynt-sidan</Link>.</p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4 border-sky-700/40">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-sky-300"><Info className="h-5 w-5" /> Källor &amp; metod</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Noder:</strong> <code>elite_monuments</code> (kuraterad, koord ur runsten-/heritage-data + Wikidata). <strong className="text-foreground">Leder:</strong> <code>trade_routes</code>/<code>trade_route_points</code> — Kung Valdemars segelled (Kong Valdemars Jordebog ~1300) + östvägen/Volgavägen ur <code>viking_cities</code>. <strong className="text-foreground">Evidens:</strong> solidus-skatterna ur <code>coins</code>.</p>
            <p><strong className="text-amber-300">Paleo-validering:</strong> varje ledpunkt testas mot <code>paleo_shorelines</code> (vatten vid routens år). Modellen når 50–950 e.Kr. och är regional (Mälardalen/Kalmar/Ångermanland) — punkter utanför täckning kan inte valideras, och ytterskärgården (landhöjningszonen) flaggas för granskning.</p>
            <p>Fördjupning: <Link to="/sv/ortnamn" className="text-gold hover:underline">elit-monument &amp; maktsfärer</Link> · <Link to="/sv/oland" className="text-gold hover:underline">Öland</Link>.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Maktsfarer;
