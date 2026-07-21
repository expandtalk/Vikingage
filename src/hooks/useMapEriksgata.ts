import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Ritar Eriksgatan (kungavalets riksrunda) på kartan från DB: viking_roads
// 'Eriksgatan' + road_waypoints (11 punkter, waypoint_order). Verifierad data —
// samma mönster som useMapValdemarsRoute. Gate: legendknappen 'eriksgatan'.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  safelyAddLayer: (layer: L.Layer) => boolean;
}

const sb = supabase as unknown as { from: (t: string) => any };
const parsePoint = (c: unknown): [number, number] | null => {
  const m = String(c ?? '').match(/\(([-\d.]+),([-\d.]+)\)/);
  return m ? [parseFloat(m[2]), parseFloat(m[1])] : null; // [lat, lng] från point(lng,lat)
};

// Utpekade fyndpunkter som alltid visas i Eriksgata-vyn (Daniel).
const FEATURED: { ll: [number, number]; name: string }[] = [
  { ll: [59.6817, 17.3406], name: 'Mora stenar (kungavalsplats)' },
  { ll: [58.2956, 14.7756], name: 'Rökstenen (Ög 136)' },
];

interface NearbyFeatures {
  runestones: { signum: string; lat: number; lng: number }[];
  churches: { name: string; type: string; lat: number; lng: number }[];
}

export const useMapEriksgata = ({ map, enabledLegendItems, isMapReady, safelyAddLayer }: Props) => {
  const layersRef = useRef<L.Layer[]>([]);
  const dataRef = useRef<{ pts: [number, number][]; wps: { ll: [number, number]; name: string; type: string }[]; nearby: NearbyFeatures } | null>(null);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    let cancelled = false;

    const clear = () => {
      layersRef.current.forEach((l) => { try { map.removeLayer(l); } catch { /* noop */ } });
      layersRef.current = [];
    };
    clear();

    // Ritas bara där en profil uttryckligen tänt den (rutt-/farledsvyer) — inte överallt.
    if (enabledLegendItems.eriksgatan !== true) return;

    const draw = (data: NonNullable<typeof dataRef.current>) => {
      if (cancelled || !map || data.pts.length < 2) return;
      const line = L.polyline(data.pts, { color: '#d97706', weight: 3, opacity: 0.9, dashArray: '10, 6' })
        .bindPopup('<strong>Eriksgatan</strong><br/>Kungavalets riksrunda genom landskapen');
      if (safelyAddLayer(line)) layersRef.current.push(line);
      data.wps.forEach((w) => {
        const isBorder = w.type === 'junction';
        const marker = L.circleMarker(w.ll, {
          radius: isBorder ? 6 : 5, color: '#7c2d12', weight: 2,
          fillColor: isBorder ? '#f59e0b' : '#d97706', fillOpacity: 0.95,
        }).bindPopup(`<strong>${w.name}</strong>`);
        if (safelyAddLayer(marker)) layersRef.current.push(marker);
      });

      // Runstenar inom 1 km av leden (små röda prickar).
      data.nearby.runestones.forEach((r) => {
        const m = L.circleMarker([r.lat, r.lng], {
          radius: 3, color: '#b91c1c', weight: 1, fillColor: '#ef4444', fillOpacity: 0.85,
        }).bindPopup(`<strong>${r.signum}</strong><br/>Runsten nära Eriksgatan`);
        if (safelyAddLayer(m)) layersRef.current.push(m);
      });
      // Medeltida kyrkor/kapell/kloster inom 1 km (små lila prickar).
      data.nearby.churches.forEach((c) => {
        const m = L.circleMarker([c.lat, c.lng], {
          radius: 3, color: '#7e22ce', weight: 1, fillColor: '#a855f7', fillOpacity: 0.85,
        }).bindPopup(`<strong>${c.name}</strong><br/>${c.type} nära Eriksgatan`);
        if (safelyAddLayer(m)) layersRef.current.push(m);
      });
      // Utpekade fyndpunkter (Mora stenar, Rökstenen) — guldmarkör med etikett.
      FEATURED.forEach((f) => {
        const m = L.circleMarker(f.ll, {
          radius: 7, color: '#78350f', weight: 2, fillColor: '#fbbf24', fillOpacity: 1,
        }).bindPopup(`<strong>${f.name}</strong>`);
        if (safelyAddLayer(m)) layersRef.current.push(m);
      });
    };

    if (dataRef.current) { draw(dataRef.current); return () => { cancelled = true; }; }

    (async () => {
      const { data: road } = await sb.from('viking_roads').select('id').eq('name', 'Eriksgatan').maybeSingle();
      if (!road?.id) return;
      const { data: wps } = await sb.from('road_waypoints').select('name, coordinates, waypoint_type, waypoint_order')
        .eq('road_id', road.id).order('waypoint_order', { ascending: true });
      const parsed = (wps ?? []).map((w: any) => ({ ll: parsePoint(w.coordinates), name: w.name as string, type: w.waypoint_type as string }))
        .filter((w: any) => w.ll) as { ll: [number, number]; name: string; type: string }[];
      const { data: near } = await sb.rpc('eriksgata_nearby', { radius_m: 1000 });
      const nearby: NearbyFeatures = { runestones: near?.runestones ?? [], churches: near?.churches ?? [] };
      dataRef.current = { pts: parsed.map((w) => w.ll), wps: parsed, nearby };
      draw(dataRef.current);
    })();

    return () => { cancelled = true; };
  }, [map, enabledLegendItems.eriksgatan, isMapReady, safelyAddLayer]);
};
