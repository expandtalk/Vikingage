import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { useProximityProbe } from '@/hooks/useProximityProbe';

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

// Regelbunden polygon (fyrkant=4, hexagon=6) kring en punkt, radie i km. Lokal
// ekvirektangulär approximation — exakt nog på dessa avstånd (tiotal km).
const polygonVerts = (lat: number, lng: number, rKm: number, n: number, rotDeg: number): [number, number][] => {
  const latR = rKm / 111.32;
  const lngR = rKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = ((rotDeg + (i * 360) / n) * Math.PI) / 180;
    out.push([lat + latR * Math.cos(a), lng + lngR * Math.sin(a)]);
  }
  return out;
};

export const useMapProximityProbe = ({ map, isMapReady }: Props) => {
  const { probe, radiusKm, shape } = useProximityProbe();
  const layerRef = useRef<L.LayerGroup | null>(null);
  const tokenRef = useRef(0);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!probe) return;

    const myToken = ++tokenRef.current;
    const radiusM = radiusKm * 1000;

    // Form: cirkel (isotrop), fyrkant (rutnät/väg) eller hexagon (central-place).
    const shapeStyle = { color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.06, dashArray: '6 4' };
    if (shape === 'circle') {
      L.circle([probe.lat, probe.lng], { radius: radiusM, ...shapeStyle }).addTo(layer);
    } else {
      // Fyrkant: 4 hörn roterade 45° (platt topp). Hexagon: 6 hörn (spetsig topp).
      const verts = polygonVerts(probe.lat, probe.lng, radiusKm, shape === 'square' ? 4 : 6, shape === 'square' ? 45 : 0);
      L.polygon(verts, shapeStyle).addTo(layer);
    }
    const shapeSv = shape === 'circle' ? 'cirkel' : shape === 'square' ? 'fyrkant' : 'hexagon';
    L.circleMarker([probe.lat, probe.lng], { radius: 6, color: '#78350f', weight: 2, fillColor: '#fbbf24', fillOpacity: 1 })
      .bindTooltip(`${probe.label} — ${shapeSv}, radie ${radiusKm} km (⌀ ${radiusKm * 2} km)`, { permanent: false }).addTo(layer);

    map.setView([probe.lat, probe.lng], Math.max(map.getZoom(), 10));

    (async () => {
      const { data, error } = await sb.rpc('features_near_point', { p_lat: probe.lat, p_lng: probe.lng, radius_m: radiusM });
      if (error || myToken !== tokenRef.current || !map) return;
      const add = (arr: any[], color: string, label: (r: any) => string) =>
        (arr || []).forEach((r) => {
          if (r.lat == null || r.lng == null) return;
          L.marker([r.lat, r.lng], { icon: dot(color) }).bindPopup(label(r)).addTo(layer);
        });
      add(data?.place_names, '#22c55e', (r) => `<strong>${r.name}</strong><br/>Ortnamn`);
      add(data?.kulturlager, '#a855f7', (r) => `<strong>${r.name}</strong><br/>${r.type ?? 'Kulturlager'}`);
      add(data?.runestones, '#ef4444', (r) => `<strong>${r.signum}</strong><br/>Runsten`);
      add(data?.fortresses, '#f97316', (r) => `<strong>${r.name}</strong><br/>${r.type ?? 'Fornborg'}`);
    })();

    return () => { layer.clearLayers(); };
  }, [map, isMapReady, probe, radiusKm, shape]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
