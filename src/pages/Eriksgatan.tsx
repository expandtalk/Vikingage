import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { PlaceMap } from '@/components/map/PlaceMap';
import { Crown } from 'lucide-react';

// /sv/eriksgatan — dedikerad sida för den kungliga riksrundan, på den delade PlaceMap-motorn.
// Tematisk kärna: det ZOOM-PROGRESSIVA landskaps-lagret (progressiveAdmin) — Eriksgatan följde
// LANDSKAPSLAGARNA (kungen "togs till konung" av varje lands ting). Rutt + landmärken ur DB
// (viking_roads 'eriksgatan' + road_overview); inget påhittat — saknad geometri ritas inte.

interface Waypoint { name: string | null; type: string | null; lat: number; lng: number; ord: number }
interface Landmark { name: string; type: string | null; lat: number; lng: number; description: string | null; significance: string | null }
interface RoadOverview { name: string; type: string | null; description: string | null; slug: string; waypoints: Waypoint[]; landmarks: Landmark[] }
interface RoadRow { name: string; name_en: string | null; description: string | null; description_en: string | null; total_length_km: number | null }

const sb = supabase as unknown as {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }>;
  from: (t: string) => any;
};

const EriksgatanMap: React.FC<{ road: RoadOverview | null }> = ({ road }) => {
  const mapRef = useRef<L.Map | null>(null);
  const routeRef = useRef<L.LayerGroup>(L.layerGroup());

  const draw = () => {
    const map = mapRef.current; const g = routeRef.current;
    if (!map || !road) return;
    g.clearLayers();
    const pts = (road.waypoints ?? []).filter((w) => w.lat != null && w.lng != null).map((w) => [w.lat, w.lng] as [number, number]);
    if (pts.length >= 2) {
      L.polyline(pts, { color: '#d97706', weight: 3, opacity: 0.9, dashArray: '10,6' })
        .bindPopup(`<b>${road.name}</b>`).addTo(g);
    }
    (road.waypoints ?? []).forEach((w) => {
      if (w.lat == null || w.lng == null) return;
      const ting = w.type === 'junction' || w.type === 'bridge';
      L.circleMarker([w.lat, w.lng], { radius: ting ? 6 : 5, color: '#7c2d12', weight: 2, fillColor: ting ? '#f59e0b' : '#d97706', fillOpacity: 0.95 })
        .bindPopup(`<b>${w.name ?? ''}</b>${ting ? '<br/><span style="font-size:11px;color:#78350f">landskapsgräns / tingsplats</span>' : ''}`).addTo(g);
    });
    (road.landmarks ?? []).forEach((f) => {
      if (f.lat == null || f.lng == null) return;
      L.circleMarker([f.lat, f.lng], { radius: 7, color: '#78350f', weight: 2, fillColor: '#fbbf24', fillOpacity: 1 })
        .bindPopup(`<b>${f.name}</b>${f.description ? `<br/><span style="font-size:11px;color:#78350f">${f.description}</span>` : ''}`).addTo(g);
    });
    const all: [number, number][] = [...pts, ...(road.landmarks ?? []).filter((f) => f.lat != null && f.lng != null).map((f) => [f.lat, f.lng] as [number, number])];
    if (all.length >= 2) map.fitBounds(L.latLngBounds(all), { padding: [40, 40], maxZoom: 8 });
  };

  const onMapReady = (map: L.Map) => { mapRef.current = map; routeRef.current.addTo(map); draw(); };
  useEffect(() => { draw(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [road]);

  // layers={[]} → ingen place_features_near-brus; progressiveAdmin → landskaps-lagret som kärna.
  return <PlaceMap center={{ lat: 59.3, lng: 16.2 }} zoom={6} layers={[]} progressiveAdmin heightClass="h-[70vh]" onMapReady={onMapReady} />;
};

const Eriksgatan: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const { data: road = null } = useQuery({
    queryKey: ['road-overview', 'eriksgatan'],
    queryFn: async () => {
      const { data } = await sb.rpc('road_overview', { p_slug: 'eriksgatan' });
      return (data ?? null) as RoadOverview | null;
    },
  });
  const { data: row = null } = useQuery({
    queryKey: ['viking-road-row', 'eriksgatan'],
    queryFn: async () => {
      const { data } = await sb.from('viking_roads').select('name,name_en,description,description_en,total_length_km').eq('slug', 'eriksgatan').maybeSingle();
      return (data ?? null) as RoadRow | null;
    },
  });

  const desc = sv ? row?.description : (row?.description_en ?? row?.description);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Eriksgatan — kungens rundresa genom landskapen"
        titleEn="The Eriksgata — the king's progress through the provinces"
        description="Den nyvalde kungens rundresa för att tas till konung av varje lands ting. Kartan visar leden genom landskapen med zoom-progressiva gränser (landskap → kommun → socken)."
        descriptionEn="The newly elected king's circuit to be accepted as king by each province's assembly. The map shows the route through the provinces with zoom-progressive boundaries."
        keywords="Eriksgatan, kungaval, landskapslagar, ting, Mora stenar, Uppland, Södermanland, Östergötland, Västergötland, Närke, Västmanland"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Crown className="h-8 w-8 text-gold" /> {sv ? 'Eriksgatan' : 'The Eriksgata'}
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">
            {sv ? 'Kungens rundresa genom landskapen' : "The king's progress through the provinces"}
            {row?.total_length_km ? ` · ~${row.total_length_km} km` : ''}
          </p>
          {desc && <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">{desc}</p>}
        </div>

        <EriksgatanMap road={road} />

        <p className="text-xs text-muted-foreground mt-3 mb-6 opacity-90">
          {sv
            ? 'Landskaps-lagret på kartan byts automatiskt när du zoomar: landskap (utzoomat) → kommun → socken/stad (inzoomat). Eriksgatan var bunden till landskapen — kungen togs till konung av varje lands ting och svor att hålla landskapets lag. Rutten och hållpunkterna kommer ur databasen; sträckor utan verifierad geometri ritas inte.'
            : 'The boundary layer switches automatically as you zoom: provinces (zoomed out) → municipalities → parishes/towns (zoomed in). The Eriksgata was bound to the provinces — the king was accepted by each province’s assembly and swore to uphold its law. Route and stops come from the database; segments without verified geometry are not drawn.'}
        </p>

        {road && ((road.landmarks?.length ?? 0) > 0 || (road.waypoints?.length ?? 0) > 0) && (
          <div className="grid gap-6 sm:grid-cols-2">
            {(road.landmarks?.length ?? 0) > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gold">{sv ? 'Platser längs vägen' : 'Places along the route'}</h2>
                <ul className="space-y-2">
                  {road!.landmarks.map((l, i) => (
                    <li key={i} className="border-l-2 border-slate-700 pl-2.5">
                      <span className="text-sm font-medium text-white">{l.name}</span>
                      {l.description && <span className="block text-xs text-slate-400 leading-snug">{l.description}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {(road.waypoints?.length ?? 0) > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gold">{sv ? 'Sträckning (etapper)' : 'Route (waypoints)'}</h2>
                <ol className="space-y-1">
                  {road!.waypoints.map((w, i) => (
                    <li key={i} className="text-sm text-slate-300">{i + 1}. {w.name}{w.type === 'junction' ? (sv ? ' · landskapsgräns/ting' : ' · border/assembly') : ''}</li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Eriksgatan;
