import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFieldNav, setFieldNavTarget } from '@/hooks/useFieldNav';
import { useRoadtrip, setRoadtripSearching, setRoadtripResult, setRoadtripError } from '@/hooks/useRoadtrip';
import { useTravelMode, type TravelMode } from '@/hooks/useTravelMode';
import { route as computeRoute } from '@/services/routing';
import { supabase } from '@/integrations/supabase/client';

// MapLibre Fas 2 — äkta tiltat 3D-förarperspektiv (course-up), det Leaflet inte kan.
// Cookiefritt: motorn bundlas (npm), basemap = OSM-raster (samma tiles som Leaflet-kartorna,
// inga cookies/spårning, ingen API-nyckel/extern style-JSON). Terräng (raster-DEM) och
// husextrudering (PMTiles-vektor) är nästa iterationer inom Fas 2 (kräver självhostade tiles).
// Principen "lagren är källan" gäller: pos ur useFieldNav, rutt ur useRoadtrip.

// Självhostade Terrarium-RGB terräng-tiles (raster-dem) för äkta 3D-relief. PILOT: Gåseborg
// (public_html/terrain/gaseborg/, genererade ur MHM 1m-DEM). Avgränsad med bounds+min/maxzoom
// så MapLibre bara efterfrågar tiles inom täckningen (inga 404 utanför). Fler områden läggs
// till som egna raster-dem-sources (t.ex. grott-områden) allt eftersom DEM+tiles finns.
const TERRAIN_AREAS: { id: string; bounds: [number, number, number, number] }[] = [
  { id: 'gaseborg', bounds: [17.70, 59.36, 17.83, 59.44] },
];
const TERRAIN_EXAGGERATION = 1.5;

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
    ...Object.fromEntries(TERRAIN_AREAS.map((a) => [`dem-${a.id}`, {
      type: 'raster-dem',
      tiles: [`https://vikingage.se/terrain/${a.id}/{z}/{x}/{y}.png`],
      encoding: 'terrarium',
      tileSize: 256,
      minzoom: 11,
      maxzoom: 15,
      bounds: a.bounds,
      attribution: 'Höjddata © Lantmäteriet (MHM)',
    }])),
    // OpenSeaMap sjömärkes-overlay (ODbL) — transparent, visas bara i båt-läge. Cookiefritt
    // (samma modell som OSM). Framtida licensierat Sjöfartsverket-sjökort byts in via basemaps.ts.
    seamark: {
      type: 'raster',
      tiles: ['https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenSeaMap contributors (ODbL)',
    },
  },
  // Sjömärkes-lagret ligger sist (överst) men börjar dolt (visibility none) → tänds i båt-läge.
  layers: [
    { id: 'osm', type: 'raster', source: 'osm' },
    { id: 'seamark', type: 'raster', source: 'seamark', layout: { visibility: 'none' } },
  ],
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

// Pitch per färdsätt: gående flackare (lättare överblick av omgivningen), bil mest tiltat
// 3D-förarperspektiv, cykel mittemellan. Höjt 2026-08-16 för starkare 3D-känsla (Daniel).
// Ej ända upp mot maxPitch: utan terräng/husextrudering blir extrem lutning mest tom himmel.
const pitchForMode = (m: TravelMode): number => (m === 'foot' ? 48 : m === 'bike' ? 62 : 72); // kör + båt = 72
// Radie (km) för "allt i närheten" per färdsätt (jfr Near me-skalorna; båt = 3 mil, Daniel).
const nearbyRadiusKm = (m: TravelMode): number => (m === 'foot' ? 5 : m === 'bike' ? 15 : m === 'boat' ? 30 : 25);
// Svenska typ-etiketter för popup (samma som Near me-panelen).
const FT_SV: Record<string, string> = {
  runestone: 'Runsten', church: 'Kyrka', fortress: 'Fornborg', heritage: 'Lämning',
  estate: 'Gods/gård', beacon: 'Vårdkase', thing_site: 'Tingsplats', coin: 'Myntfynd',
  cult_site: 'Kultplats', maritime_node: 'Maritim nod',
};

export const DriveView3D: React.FC<{ className?: string; demoCenter?: { lat: number; lng: number } }> = ({ className, demoCenter }) => {
  const { pos, following } = useFieldNav();
  const { route } = useRoadtrip();
  const travelMode = useTravelMode();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const loadedRef = useRef(false);
  const advCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const nearbyCenterRef = useRef<{ lat: number; lng: number; mode: string } | null>(null);
  const posRef = useRef<{ lat: number; lng: number } | null>(null);
  posRef.current = pos ? { lat: pos.lat, lng: pos.lng } : (demoCenter ?? null);
  const routeClickRef = useRef<((ev: Event) => void) | null>(null);

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
      pitch: pitchForMode(travelMode),
      maxPitch: 82,
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
      // Aktivera terräng-relief (pilot: Gåseborg). setTerrain tar en source; för fler
      // spridda områden (t.ex. grottor) slås de på sikt ihop till EN tile-träd-source.
      try { map.setTerrain({ source: `dem-${TERRAIN_AREAS[0].id}`, exaggeration: TERRAIN_EXAGGERATION }); } catch { /* noop */ }
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

      // "Allt i närheten" — nearby_features (runstenar/kyrkor/fornborgar/heritage/gods/vårdkasar/
      // tingsplatser/mynt/kultplatser/maritima noder) som ETT klickbart lager. Kärnan i att 3D-
      // rörelseläget visar samma upptäckts-uppsättning som explore, men tiltat. Radie per färdsätt.
      map.addSource('nearby', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } as any });
      map.addLayer({
        id: 'nearby-pts', type: 'circle', source: 'nearby',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 4, 16, 7],
          'circle-color': ['match', ['get', 'ft'],
            'runestone', '#f59e0b', 'church', '#38bdf8', 'fortress', '#fb923c',
            'heritage', '#c084fc', 'estate', '#34d399', 'beacon', '#f87171',
            'thing_site', '#22d3ee', 'coin', '#fbbf24', 'cult_site', '#e879f9',
            'maritime_node', '#22d3ee',
            /* default */ '#94a3b8'] as any,
          'circle-stroke-width': 1.2,
          'circle-stroke-color': '#1e293b',
          'circle-opacity': 0.9,
        },
      });
      map.on('click', 'nearby-pts', (e) => {
        const f = e.features?.[0]; if (!f) return;
        const p = (f.properties ?? {}) as any;
        const coords = (f.geometry as any).coordinates as [number, number];
        // "Visa vägen dit" i popupen → fältnav-mål (tap-to-route, steg 3 kopplar rutten).
        const html =
          `<b>${p.label ?? ''}</b>` +
          (p.typeSv ? `<br/><span style="font-size:11px;color:#64748b">${p.typeSv}</span>` : '') +
          `<br/><button data-route-lat="${coords[1]}" data-route-lng="${coords[0]}" data-route-label="${(p.label ?? '').replace(/"/g, '&quot;')}" ` +
          `style="margin-top:6px;font-size:12px;color:#b45309;background:none;border:none;padding:0;cursor:pointer;text-decoration:underline">Visa vägen dit →</button>`;
        new maplibregl.Popup({ closeButton: true }).setLngLat(coords).setHTML(html).addTo(map);
      });
      map.on('mouseenter', 'nearby-pts', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'nearby-pts', () => { map.getCanvas().style.cursor = ''; });

      // Farleder (historiska segelleder + moderna korridorer) — båt-läge. Streckad linje.
      map.addSource('fairways', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } as any });
      map.addLayer({
        id: 'fairways-line', type: 'line', source: 'fairways',
        layout: { 'line-cap': 'round', 'line-join': 'round', visibility: 'none' },
        paint: { 'line-color': '#a855f7', 'line-width': 2.5, 'line-opacity': 0.8, 'line-dasharray': [2, 2] },
      });
      loadedRef.current = true;
    });

    // Drar användaren i kartan → sluta följa (samma semantik som fältnav).
    map.on('dragstart', () => { /* följning styrs av useFieldNav.following i förälder */ });

    // TAP-TO-ROUTE: klick på popupens "Visa vägen dit" → rutt från min position till punkten.
    // Event-delegation på container (popupen är DOM inuti kartan). Bil/båt får riktig OSRM-rutt;
    // saknas position faller vi till att bara sätta målet (ledlinje/fågelväg).
    const onRouteClick = async (ev: Event) => {
      const btn = (ev.target as HTMLElement)?.closest?.('[data-route-lat]') as HTMLElement | null;
      if (!btn) return;
      ev.preventDefault();
      const tLat = parseFloat(btn.getAttribute('data-route-lat') || '');
      const tLng = parseFloat(btn.getAttribute('data-route-lng') || '');
      const label = btn.getAttribute('data-route-label') || 'Mål';
      if (!Number.isFinite(tLat) || !Number.isFinite(tLng)) return;
      setFieldNavTarget({ lat: tLat, lng: tLng, label });
      const from = posRef.current;
      if (!from) return; // ingen position → bara mål satt (ledlinje ritas av fältnavet)
      setRoadtripSearching();
      try {
        const r = await computeRoute(from, { lat: tLat, lng: tLng });
        if (r) setRoadtripResult({ lat: tLat, lng: tLng, label }, r);
        else setRoadtripError('Kunde inte beräkna en rutt dit.');
      } catch { setRoadtripError('Fel vid ruttberäkningen.'); }
    };
    elRef.current.addEventListener('click', onRouteClick);
    routeClickRef.current = onRouteClick;

    // ResizeObserver: MapLibre mäter containern vid init; om den ännu är 0 hög (layout ej klar)
    // blir kartan blank tills en resize sker. Ritar om när containern får/ändrar storlek.
    // (Fixar även SVART SKÄRM-buggen: MapLibres .maplibregl-map{position:relative} kan slå
    // Tailwinds .absolute → höjd 0; inline-stylen på return-diven + denna resize garanterar höjd.)
    const ro = new ResizeObserver(() => { try { map.resize(); } catch { /* noop */ } });
    ro.observe(elRef.current);
    requestAnimationFrame(() => { try { map.resize(); } catch { /* noop */ } });

    const container = elRef.current;
    return () => {
      ro.disconnect();
      if (container && routeClickRef.current) container.removeEventListener('click', routeClickRef.current);
      map.remove(); mapRef.current = null; loadedRef.current = false;
    };
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
      pitch: pitchForMode(travelMode),
      zoom: Math.max(map.getZoom(), 16.5),
      duration: 700,
    });
  }, [pos, following, travelMode]);

  // Uppdatera rutten när billäget ändrar mål.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource('route') as maplibregl.GeoJSONSource | undefined;
    src?.setData(routeGeoJSON(route?.coords) as any);
  }, [route]);

  // Båt-läge: tänd OpenSeaMap-sjömärken + farleder; hämta farledsgeometrin en gång. Andra lägen → dölj.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Kartan kanske inte laddats än vid mount → kör om på 'load'.
    if (!loadedRef.current) { const h = () => { setBoatLayers(); }; map.once('load', h); return () => { map.off('load', h); }; }
    return setBoatLayers();

    function setBoatLayers() {
    const boat = travelMode === 'boat';
    const setVis = (id: string, on: boolean) => { try { map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none'); } catch { /* noop */ } };
    setVis('seamark', boat);
    setVis('fairways-line', boat);
    if (!boat) return;
    let cancelled = false;
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).rpc('fairways_geojson');
      if (cancelled || !data) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const features = ((data ?? []) as any[]).map((f) => {
        let geom; try { geom = JSON.parse(f.geojson); } catch { return null; }
        return { type: 'Feature', properties: { name: f.name ?? '', kind: f.fairway_kind ?? '' }, geometry: geom };
      }).filter(Boolean);
      const src = map.getSource('fairways') as maplibregl.GeoJSONSource | undefined;
      src?.setData({ type: 'FeatureCollection', features } as any);
    })();
    return () => { cancelled = true; };
    }
  }, [travelMode]);

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

  // "Allt i närheten" (nearby_features) — multityp-lagret som gör 3D-vyn till en riktig upptäckts-
  // vy (samma uppsättning som explore). Radie per färdsätt; refetch när man rört sig eller bytt läge.
  useEffect(() => {
    const map = mapRef.current;
    const c = pos ?? demoCenter;
    if (!map || !c) return;
    const radiusKm = nearbyRadiusKm(travelMode);
    const last = nearbyCenterRef.current;
    if (last && last.mode === travelMode) {
      const dLat = (c.lat - last.lat) * 111000;
      const dLng = (c.lng - last.lng) * 111000 * Math.cos((c.lat * Math.PI) / 180);
      if (Math.hypot(dLat, dLng) < 2000) return; // < 2 km + samma läge → behåll
    }
    nearbyCenterRef.current = { lat: c.lat, lng: c.lng, mode: travelMode };
    let cancelled = false;
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).rpc('nearby_features', { p_lat: c.lat, p_lng: c.lng, p_radius_km: radiusKm, p_limit: 600 });
      if (cancelled || !data) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const features = ((data ?? []) as any[]).filter((f) => f.lat != null && f.lng != null).slice(0, 600).map((f) => {
        // heritage-label bär "raa_type – namn"; visa namnet om det finns.
        const raw = String(f.name ?? f.label ?? '');
        const name = raw.includes(' – ') ? raw.split(' – ').slice(1).join(' – ') || raw : raw;
        return {
          type: 'Feature',
          properties: { ft: f.feature_type, label: name, typeSv: FT_SV[f.feature_type] ?? f.feature_type },
          geometry: { type: 'Point', coordinates: [Number(f.lng), Number(f.lat)] },
        };
      });
      const fc = { type: 'FeatureCollection', features };
      const apply = () => {
        const src = map.getSource('nearby') as maplibregl.GeoJSONSource | undefined;
        src?.setData(fc as any);
      };
      if (loadedRef.current) apply(); else map.once('load', apply);
    })();
    return () => { cancelled = true; };
  }, [pos, demoCenter, travelMode]);

  // Inline-style GARANTERAR full storlek + absolut position — slår MapLibres egen
  // .maplibregl-map{position:relative} (som annars nollar höjden → svart skärm).
  return (
    <div
      ref={elRef}
      className={className ?? 'absolute inset-0'}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
};

export default DriveView3D;
