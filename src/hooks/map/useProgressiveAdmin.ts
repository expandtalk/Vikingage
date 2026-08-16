import { useEffect, useRef, type RefObject } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Zoom-progressivt admin-gränslager: landskap (utzoomat) → kommun → socken/stad (inzoomat).
// "Med automatik" (Daniel): vid inzoomning byts nivå och bara gränserna i aktuell kartvy hämtas
// (bbox-RPC get_admin_boundaries_in_bbox) → liten payload. Konturlinjer, egen LayerGroup.
// Källa: kommun/socken/stad © Lantmäteriet; landskap OSM (via Wikidata). Attribution i kartkontrollen.

interface LevelCfg { level: string; color: string; weight: number; dash: string; simplify: number; attribution: string }
const LM = 'Administrativ indelning © Lantmäteriet';
const OSM_L = 'Landskap © OpenStreetMap';

function levelForZoom(z: number): LevelCfg {
  if (z >= 11) return { level: 'socken',   color: '#94a3b8', weight: 1,   dash: '2 4', simplify: 0.0004, attribution: LM };
  if (z >= 8)  return { level: 'kommun',   color: '#0ea5e9', weight: 1.5, dash: '5 5', simplify: 0.001,  attribution: LM };
  return              { level: 'landskap', color: '#f59e0b', weight: 2,   dash: '6 5', simplify: 0.004,  attribution: OSM_L };
}

const sbRpc = (fn: string, args: Record<string, unknown>) =>
  (supabase as unknown as { rpc: (f: string, a: Record<string, unknown>) => Promise<{ data: any }> }).rpc(fn, args);

export function useProgressiveAdmin(mapRef: RefObject<L.Map | null>, enabled: boolean) {
  const groupRef = useRef<L.LayerGroup | null>(null);
  const reqRef = useRef(0);
  const lastLevelRef = useRef<string | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!groupRef.current) groupRef.current = L.layerGroup();
    const group = groupRef.current;

    if (!enabled) {
      group.clearLayers();
      if (map.hasLayer(group)) map.removeLayer(group);
      lastLevelRef.current = null;
      return;
    }
    if (!map.hasLayer(group)) group.addTo(map);

    let cancelled = false;
    const draw = async () => {
      const cfg = levelForZoom(map.getZoom());
      const b = map.getBounds();
      const myReq = ++reqRef.current;
      const { data } = await sbRpc('get_admin_boundaries_in_bbox', {
        p_level: cfg.level,
        p_min_lng: b.getWest(), p_min_lat: b.getSouth(),
        p_max_lng: b.getEast(), p_max_lat: b.getNorth(),
        p_simplify: cfg.simplify,
      });
      if (cancelled || myReq !== reqRef.current) return;
      group.clearLayers();
      lastLevelRef.current = cfg.level;
      for (const row of (data ?? []) as { name: string; geojson: string | object }[]) {
        let gj: unknown;
        try { gj = typeof row.geojson === 'string' ? JSON.parse(row.geojson) : row.geojson; } catch { continue; }
        // Gränserna är VISUELL KONTEXT, inte klickbar data: interactive:false så de inte
        // stjäl klick från de tematiska markörerna (annars fastnar klick på t.ex. Uppsala
        // kommuns multipolygon → förvirrande upprepade "Uppsala kommun"-popupar). Namnen
        // finns ändå som etiketter i baskartan (OSM).
        L.geoJSON(gj as any, {
          interactive: false,
          style: () => ({ color: cfg.color, weight: cfg.weight, fill: false, opacity: 0.8, dashArray: cfg.dash }),
          attribution: cfg.attribution,
        }).addTo(group);
      }
    };

    let t: ReturnType<typeof setTimeout>;
    const onMove = () => { clearTimeout(t); t = setTimeout(draw, 250); };
    map.on('moveend zoomend', onMove);
    draw();
    return () => {
      cancelled = true;
      clearTimeout(t);
      map.off('moveend zoomend', onMove);
      group.clearLayers();
    };
  }, [mapRef, enabled]);
}
