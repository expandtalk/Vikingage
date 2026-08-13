import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFieldNav } from '@/hooks/useFieldNav';
import { useRoadtrip } from '@/hooks/useRoadtrip';
import { supabase } from '@/integrations/supabase/client';

// MapLibre Fas 2 — äkta tiltat 3D-förarperspektiv (course-up), det Leaflet inte kan.
// Cookiefritt: motorn bundlas (npm), basemap = OSM-raster (samma tiles som Leaflet-kartorna,
// inga cookies/spårning, ingen API-nyckel/extern style-JSON). Terräng (raster-DEM) och
// husextrudering (PMTiles-vektor) är nästa iterationer inom Fas 2 (kräver självhostade tiles).
// Principen "lagren är källan" gäller: pos ur useFieldNav, rutt ur useRoadtrip.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OSM_STYLE: any = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

// RouteResult.coords är [lat,lng] (Leaflet-konvention) → MapLibre vill ha [lng,lat].
const routeGeoJSON = (coords?: [number, number][]) => ({
  type: 'Feature' as const,
  properties: {},
  geometry: {
    type: 'LineString' as const,
    coordinates: (coords ?? []).map(([lat, lng]) => [lng, lat]),
  },
});

export const DriveView3D: React.FC<{ className?: string; demoCenter?: { lat: number; lng: number } }> = ({ className, demoCenter }) => {
  const { pos, following } = useFieldNav();
  const { route } = useRoadtrip();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const loadedRef = useRef(false);
  const advCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  // Init MapLibre en gång.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    // Utan GPS (t.ex. desktop där platsåtkomst nekas) → demoläge: starta på en belagd plats i
    // körvy-zoom i st.f. utzoomad Sverigekarta, så 3D-förarperspektivet faktiskt syns och kan
    // panoreras/lutas fritt. Ingen gissad "här"-pil visas då (bara vid riktig position).
    const start = pos ?? demoCenter ?? { lat: 56.66, lng: 16.34 };
    const map = new maplibregl.Map({
      container: elRef.current,
      style: OSM_STYLE,
      center: [start.lng, start.lat],
      zoom: pos ? 17 : (demoCenter ? 14.5 : 6),
      pitch: 60,
      maxPitch: 75,
      bearing: pos?.headingDeg ?? 0,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    // "Här"-markör: guldpil som roteras efter kursen. Dold tills en RIKTIG GPS-position finns
    // (aldrig en gissad "du är här" i demoläget).
    const arrow = document.createElement('div');
    arrow.style.cssText = 'width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:22px solid #fbbf24;filter:drop-shadow(0 0 3px rgba(0,0,0,.6));transition:transform .3s';
    if (!pos) arrow.style.display = 'none';
    arrowRef.current = arrow;
    markerRef.current = new maplibregl.Marker({ element: arrow, rotationAlignment: 'map' })
      .setLngLat([start.lng, start.lat])
      .addTo(map);

    map.on('load', () => {
      map.addSource('route', { type: 'geojson', data: routeGeoJSON(route?.coords) as any });
      map.addLayer({
        id: 'route-line', type: 'line', source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#f59e0b', 'line-width': 6, 'line-opacity': 0.9 },
      });
      // Äventyr & motion i walk-läget: grottor + badplatser + fiske nära positionen,
      // ritat ovanpå rutt/basemap (adventures-lagret läggs sist → överst). Tomt tills
      // positions-fetchen fyller källan. Färg per kind (samma palett som AnswerContext).
      map.addSource('adventures', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } as any });
      map.addLayer({
        id: 'adventures-pts', type: 'circle', source: 'adventures',
        paint: {
          'circle-radius': 6,
          'circle-color': ['match', ['get', 'kind'],
            'grotta', '#a16207', 'fiske', '#3b82f6', 'nakenbad', '#f472b6',
            'hundbad', '#f59e0b', 'barnbad', '#eab308', 'klippbad', '#64748b',
            /* default: badplats */ '#22c55e'] as any,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95,
        },
      });
      map.on('click', 'adventures-pts', (e) => {
        const f = e.features?.[0]; if (!f) return;
        const p = (f.properties ?? {}) as any;
        const coords = (f.geometry as any).coordinates as [number, number];
        new maplibregl.Popup({ closeButton: true })
          .setLngLat(coords)
          .setHTML(`<b>${p.label ?? ''}</b>${p.kind ? `<br/><span style="font-size:11px;color:#64748b">${p.kind}</span>` : ''}`)
          .addTo(map);
      });
      map.on('mouseenter', 'adventures-pts', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'adventures-pts', () => { map.getCanvas().style.cursor = ''; });
      loadedRef.current = true;
    });

    // Drar användaren i kartan → sluta följa (samma semantik som fältnav).
    map.on('dragstart', () => { /* följning styrs av useFieldNav.following i förälder */ });

    return () => { map.remove(); mapRef.current = null; loadedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Följ live-position: tiltad, course-up kamera.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pos) return;
    markerRef.current?.setLngLat([pos.lng, pos.lat]);
    if (arrowRef.current) {
      arrowRef.current.style.display = ''; // riktig position finns → visa pilen
      if (pos.headingDeg != null) arrowRef.current.style.transform = `rotate(${pos.headingDeg}deg)`;
    }
    if (!following) return;
    map.easeTo({
      center: [pos.lng, pos.lat],
      bearing: pos.headingDeg ?? map.getBearing(),
      pitch: 60,
      zoom: Math.max(map.getZoom(), 16.5),
      duration: 700,
    });
  }, [pos, following]);

  // Uppdatera rutten när billäget ändrar mål.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource('route') as maplibregl.GeoJSONSource | undefined;
    src?.setData(routeGeoJSON(route?.coords) as any);
  }, [route]);

  // Äventyr & motion nära positionen (grottor + bad + fiske). Throttlat: hämtar bara om
  // man rört sig > ~3 km sedan senaste hämtning (glesa grottor — 143 i hela landet — så
  // bbox ~±0,28°/0,45° ≈ 25 km). Fyller 'adventures'-källan; layer ritas i on('load').
  useEffect(() => {
    const map = mapRef.current;
    const c = pos ?? demoCenter;           // demoläge: visa närliggande äventyr kring demo-platsen
    if (!map || !c) return;
    const last = advCenterRef.current;
    if (last) {
      const dLat = (c.lat - last.lat) * 111000;
      const dLng = (c.lng - last.lng) * 111000 * Math.cos((c.lat * Math.PI) / 180);
      if (Math.hypot(dLat, dLng) < 3000) return; // < 3 km → behåll befintliga träffar
    }
    advCenterRef.current = { lat: c.lat, lng: c.lng };
    let cancelled = false;
    (async () => {
      const lat = c.lat, lng = c.lng;
      const [expRes, grottRes] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).rpc('nearby_experiences', { p_lat: lat, p_lng: lng, p_radius_km: 25, p_limit: 80, p_ignore_season: true }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from('heritage_sites').select('id, name, raa_type, lat, lng')
          .gte('lat', lat - 0.28).lte('lat', lat + 0.28).gte('lng', lng - 0.45).lte('lng', lng + 0.45)
          .ilike('raa_type', '%grott%').not('lat', 'is', null).limit(60),
      ]);
      if (cancelled) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const features: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((expRes.data ?? []) as any[]).forEach((a) => {
        if (a.lat == null || a.lng == null) return;
        const kind = a.feature_type === 'fiske' ? 'fiske' : (a.bath_kind || 'badplats');
        features.push({ type: 'Feature', properties: { kind, label: a.label ?? '' }, geometry: { type: 'Point', coordinates: [Number(a.lng), Number(a.lat)] } });
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((grottRes.data ?? []) as any[]).forEach((g) => {
        if (g.lat == null || g.lng == null) return;
        features.push({ type: 'Feature', properties: { kind: 'grotta', label: g.name ?? '' }, geometry: { type: 'Point', coordinates: [Number(g.lng), Number(g.lat)] } });
      });
      const fc = { type: 'FeatureCollection', features };
      const apply = () => {
        const src = map.getSource('adventures') as maplibregl.GeoJSONSource | undefined;
        src?.setData(fc as any);
      };
      if (loadedRef.current) apply(); else map.once('load', apply);
    })();
    return () => { cancelled = true; };
  }, [pos, demoCenter]);

  return <div ref={elRef} className={className ?? 'absolute inset-0'} />;
};

export default DriveView3D;
