import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { Route as RouteIcon } from 'lucide-react';

// Generisk vägsida: ritar VILKEN väg som helst ur viking_roads via road_overview(slug) —
// linje genom waypoints + waypoint-/landmark-markörer. Ersätter den Eriksgata-specifika logiken
// som allmän mekanism (Daniel: generalisera renderaren).

interface Waypoint { name: string | null; type: string | null; lat: number; lng: number; ord: number }
interface Landmark { name: string; type: string | null; lat: number; lng: number; description: string | null; significance: string | null }
interface Endpoint { lat: number; lng: number }
interface RoadData { name: string; type: string | null; description: string | null; slug: string; waypoints: Waypoint[]; landmarks: Landmark[]; start?: Endpoint | null; end?: Endpoint | null }

const sb = supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }> };

// Linjefärg per vägtyp.
const ROAD_COLOR: Record<string, string> = {
  kungavag: '#d97706', landsvag: '#b45309', halvag: '#a0522d', rullstensas: '#cd853f',
  vintervag: '#4682b4', farled: '#0ea5e9', bro: '#2f4f4f', vadstalle: '#2f4f4f', knutpunkt: '#8b4513',
};

const RoadPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const { data: road } = useQuery({
    queryKey: ['road-overview', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data } = await sb.rpc('road_overview', { p_slug: slug });
      return (data ?? null) as RoadData | null;
    },
  });

  useEffect(() => {
    if (!road || !mapEl.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(mapEl.current, { scrollWheelZoom: true, zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(mapRef.current);
    }
    const m = mapRef.current;
    // rensa gamla lager (behåll tile-lagret)
    m.eachLayer((l) => { if (!(l instanceof L.TileLayer)) m.removeLayer(l); });

    const color = ROAD_COLOR[road.type ?? ''] ?? '#8b4513';
    const pts = (road.waypoints ?? []).filter((w) => w.lat != null && w.lng != null).map((w) => [w.lat, w.lng] as [number, number]);
    const allPts: [number, number][] = [...pts];

    if (pts.length >= 2) {
      L.polyline(pts, { color, weight: 3, opacity: 0.9, dashArray: '10,6' })
        .bindPopup(`<b>${road.name}</b>${road.description ? `<br/><span style="font-size:11px;color:#78350f">${road.description}</span>` : ''}`).addTo(m);
    }
    (road.waypoints ?? []).forEach((w) => {
      if (w.lat == null || w.lng == null) return;
      const border = w.type === 'junction' || w.type === 'bridge';
      L.circleMarker([w.lat, w.lng], { radius: border ? 6 : 5, color: '#7c2d12', weight: 2, fillColor: border ? '#f59e0b' : color, fillOpacity: 0.95 })
        .bindPopup(`<b>${w.name ?? ''}</b>`).addTo(m);
    });
    (road.landmarks ?? []).forEach((f) => {
      if (f.lat == null || f.lng == null) return;
      allPts.push([f.lat, f.lng]);
      L.circleMarker([f.lat, f.lng], { radius: 7, color: '#78350f', weight: 2, fillColor: '#fbbf24', fillOpacity: 1 })
        .bindPopup(`<b>${f.name}</b>${f.description ? `<br/><span style="font-size:11px;color:#78350f">${f.description}</span>` : ''}${f.significance ? `<br/><span style="font-size:10px;color:#b45309">${f.significance}</span>` : ''}`).addTo(m);
    });

    // Stub-väg (ås/isväg/hålväg utan inlagd sträckning): rita INGEN gissad linje, men sätt
    // ändpunkts-nålar (start/slut ur viking_roads.start/end_coordinates) så kartan CENTRERAR på rätt
    // region (Daniel: "ser inte ens Gotland"). Ändpunkterna är källbelagda punkter, ej en sträckning.
    if (allPts.length === 0) {
      const ends: Array<[Endpoint, string]> = [];
      if (road.start?.lat != null && road.start?.lng != null) ends.push([road.start, sv ? 'Ände' : 'Endpoint']);
      if (road.end?.lat != null && road.end?.lng != null) ends.push([road.end, sv ? 'Ände' : 'Endpoint']);
      ends.forEach(([e, lbl]) => {
        allPts.push([e.lat, e.lng]);
        L.circleMarker([e.lat, e.lng], { radius: 7, color: '#78350f', weight: 2, fillColor: color, fillOpacity: 0.9, dashArray: '3,3' })
          .bindTooltip(lbl, { direction: 'top', offset: [0, -6] })
          .bindPopup(`<b>${road.name}</b><br/><span style="font-size:11px;color:#78350f">${sv ? 'Ändpunkt — detaljerad sträckning ej inlagd' : 'Endpoint — detailed route not mapped'}</span>`).addTo(m);
      });
    }

    if (allPts.length >= 2) m.fitBounds(L.latLngBounds(allPts), { padding: [40, 40], maxZoom: 10 });
    else if (allPts.length === 1) m.setView(allPts[0], 10);
    else m.setView([59.5, 17.5], 7);
    [0, 120, 400].forEach((d) => setTimeout(() => { try { m.invalidateSize(); } catch { /* noop */ } }, d));
  }, [road, sv]);

  useEffect(() => () => { try { mapRef.current?.remove(); } catch { /* noop */ } mapRef.current = null; }, []);

  const title = road?.name ?? (sv ? 'Färdväg' : 'Route');
  return (
    <div className="min-h-screen viking-bg">
      <PageMeta title={title} titleEn={title} description={road?.description ?? ''} descriptionEn={road?.description ?? ''} />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <h1 className="text-3xl font-bold text-gold mb-2 flex items-center gap-2">
          <RouteIcon className="h-7 w-7" />{title}
        </h1>
        {road?.description && <p className="text-slate-300 mb-4 max-w-3xl leading-relaxed text-sm">{road.description}</p>}
        {!road && <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>}
        {/* Väg finns i DB men saknar geometri (0 waypoints + 0 landmarks) → ärlig tom-status
            i stället för en blank Sverigekarta (Daniel: badelundaasen "visar ingenting"). */}
        {road && (road.waypoints?.length ?? 0) === 0 && (road.landmarks?.length ?? 0) === 0 && (
          <div className="mb-4 rounded-lg border border-amber-700/40 bg-amber-950/20 p-3 text-sm text-amber-200/90">
            {sv
              ? 'Sträckningen är ännu inte inlagd för den här vägen — inga verifierade hållpunkter finns i databasen. Kartan visas tom tills källbelagd geometri lagts in (ingen gissad linje ritas).'
              : 'The route geometry for this road has not been added yet — no verified waypoints exist in the database. The map stays empty until sourced geometry is added (no guessed line is drawn).'}
          </div>
        )}
        <div ref={mapEl} className="w-full rounded-xl border border-slate-700 bg-slate-800" style={{ height: '60vh', minHeight: 380 }} />
        {road && (road.landmarks?.length > 0 || road.waypoints?.length > 0) && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {road.landmarks?.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-300">{sv ? 'Platser längs vägen' : 'Places along the route'}</h2>
                <ul className="space-y-2">
                  {road.landmarks.map((l, i) => (
                    <li key={i} className="border-l-2 border-slate-700 pl-2.5">
                      <span className="text-sm font-medium text-white">{l.name}</span>
                      {l.description && <span className="block text-xs text-slate-400 leading-snug">{l.description}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {road.waypoints?.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-300">{sv ? 'Sträckning (etapper)' : 'Route (waypoints)'}</h2>
                <ol className="space-y-1">
                  {road.waypoints.map((w, i) => (
                    <li key={i} className="text-sm text-slate-300">{i + 1}. {w.name}{w.type === 'junction' ? (sv ? ' · landskapsgräns' : ' · border') : ''}</li>
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

export default RoadPage;
