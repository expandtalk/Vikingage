import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { useProximityProbe, setProbeCounts, setProbeResult, moveProbe } from '@/hooks/useProximityProbe';
import { probeShapeLatLngs } from '@/utils/probeGeometry';

// Ritar omkrets-cirkel + närliggande lager kring vald punkt (kyrka/fornborg).
// Data via features_near_point-RPC. Färgkod: ortnamn grön, kulturlager lila,
// runstenar röd, fornborg orange.
const sb = supabase as unknown as { rpc: (fn: string, args: unknown) => Promise<{ data: any; error: any }> };

interface Props {
  map: L.Map | null;
  isMapReady: React.RefObject<boolean>;
}

const dot = (color: string) =>
  L.divIcon({ className: 'prox-dot', html: `<span style="display:block;width:9px;height:9px;border-radius:50%;background:${color};border:1px solid #fff;box-shadow:0 0 2px rgba(0,0,0,.6)"></span>`, iconSize: [9, 9], iconAnchor: [5, 5] });

const coordKey = (lat: number, lng: number) => `${lat.toFixed(5)},${lng.toFixed(5)}`;

export const useMapProximityProbe = ({ map, isMapReady }: Props) => {
  const { probe, radiusKm, shape } = useProximityProbe();
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const tokenRef = useRef(0);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    markersRef.current.clear();
    // Låt panelen (ProximityControl) fokusera ett listat objekt: flyg dit + öppna popup.
    (window as unknown as { __focusProbeFeature?: (lat: number, lng: number) => void }).__focusProbeFeature = (lat, lng) => {
      if (!map || lat == null || lng == null) return;
      map.flyTo([lat, lng], Math.max(map.getZoom(), 13), { duration: 0.6 });
      const m = markersRef.current.get(coordKey(lat, lng));
      if (m) map.once('moveend', () => m.openPopup());
    };
    if (!probe) return;

    const myToken = ++tokenRef.current;
    const radiusM = radiusKm * 1000;

    // Form: cirkel (isotrop), fyrkant (rutnät/väg) eller hexagon (central-place).
    const shapeStyle = { color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.06, dashArray: '6 4' };
    let shapeLayer: L.Circle | L.Polygon;
    if (shape === 'circle') {
      shapeLayer = L.circle([probe.lat, probe.lng], { radius: radiusM, ...shapeStyle }).addTo(layer);
    } else {
      // Fyrkant: 4 hörn roterade 45° (platt topp). Hexagon: 6 hörn (spetsig topp).
      shapeLayer = L.polygon(probeShapeLatLngs(probe.lat, probe.lng, radiusKm, shape), shapeStyle).addTo(layer);
    }
    const shapeSv = shape === 'circle' ? 'cirkel' : shape === 'square' ? 'fyrkant' : 'hexagon';
    // Draggbar center-markör — HELA sonden följer med LIVE medan man drar (så man ser
    // vad som ligger under), antal räknas om vid släpp. Träffprickarna tonas bort under
    // draget så de inte skymmer, och ritas om på nya läget vid släpp.
    const centerIcon = L.divIcon({ className: 'probe-center', html: '<span style="display:block;width:15px;height:15px;border-radius:50%;background:#fbbf24;border:2px solid #78350f;box-shadow:0 0 4px rgba(0,0,0,.6);cursor:grab"></span>', iconSize: [15, 15], iconAnchor: [7, 7] });
    L.marker([probe.lat, probe.lng], { draggable: true, icon: centerIcon, zIndexOffset: 1000 })
      .bindTooltip(`${probe.label} — ${shapeSv}, radie ${radiusKm} km (⌀ ${radiusKm * 2} km) · dra för att flytta`, { permanent: false })
      .on('drag', (e) => {
        const ll = (e.target as L.Marker).getLatLng();
        if (shape === 'circle') (shapeLayer as L.Circle).setLatLng(ll);
        else (shapeLayer as L.Polygon).setLatLngs(probeShapeLatLngs(ll.lat, ll.lng, radiusKm, shape));
      })
      .on('dragstart', () => { markersRef.current.forEach((m) => m.setOpacity(0.25)); })
      .on('dragend', (e) => { const ll = (e.target as L.Marker).getLatLng(); moveProbe(ll.lat, ll.lng); })
      .addTo(layer);

    // Centrera bara om punkten hamnar utanför vyn — annars hoppar kartan när man drar sonden.
    if (!map.getBounds().contains([probe.lat, probe.lng])) {
      map.setView([probe.lat, probe.lng], Math.max(map.getZoom(), 10));
    }

    (async () => {
      const { data, error } = await sb.rpc('features_in_shape', { p_lat: probe.lat, p_lng: probe.lng, radius_km: radiusKm, shape });
      if (error || myToken !== tokenRef.current || !map) return;
      setProbeCounts(data?.counts ?? null);
      // Behåll objektlistorna för export (GeoJSON/CSV) — cappade till 1500/lager i RPC:n.
      setProbeResult(data ? {
        place_names: data.place_names, kulturlager: data.kulturlager,
        runestones: data.runestones, fortresses: data.fortresses,
        cult_sites: data.cult_sites, coins: data.coins, thing_sites: data.thing_sites,
      } : null);
      const add = (arr: any[], color: string, label: (r: any) => string) =>
        (arr || []).forEach((r) => {
          if (r.lat == null || r.lng == null) return;
          const m = L.marker([r.lat, r.lng], { icon: dot(color) }).bindPopup(label(r)).addTo(layer);
          markersRef.current.set(coordKey(r.lat, r.lng), m); // för klick-till-karta från panelen
        });
      add(data?.place_names, '#22c55e', (r) => `<strong>${r.name}</strong><br/>Ortnamn`);
      add(data?.kulturlager, '#a855f7', (r) => `<strong>${r.name}</strong><br/>${r.type ?? 'Kulturlager'}`);
      add(data?.runestones, '#ef4444', (r) => `<strong>${r.signum}</strong><br/>Runsten`);
      add(data?.fortresses, '#f97316', (r) => `<strong>${r.name}</strong><br/>${r.type ?? 'Fornborg'}`);
      add(data?.cult_sites, '#eab308', (r) => `<strong>${r.name}</strong><br/>Kultplats${r.type ? ' · ' + r.type : ''}`);
      add(data?.coins, '#f59e0b', (r) => `<strong>${r.name}</strong><br/>Mynt${r.type ? ' · ' + r.type : ''}`);
      add(data?.thing_sites, '#38bdf8', (r) => `<strong>${r.name}</strong><br/>Tingsplats${r.type ? ' · ' + r.type : ''}`);
    })();

    return () => { layer.clearLayers(); };
  }, [map, isMapReady, probe, radiusKm, shape]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
