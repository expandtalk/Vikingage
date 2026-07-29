import { useEffect, useRef, type RefObject } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Ritar dåtida strandlinje (SGU strandförskjutningsmodell, CC-BY) som overlay på en IMPERATIV
// Leaflet-karta (forskningssidorna Öland/Kalmar/Ångermanland). RPC get_paleo_shorelines_nearest
// snappar till närmaste tillgängliga skiva (50–950 e.Kr.). Havsytan visas halvtransparent blå —
// landytan blir det som INTE täcks. year=null → lagret av.

interface ShoreRow { id: string; period_label: string; year_ce: number; water_body_type: 'sea' | 'lake'; geojson: string }

export function useShorelineOverlay(mapRef: RefObject<L.Map | null>, year: number | null) {
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
    if (year == null) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
      }).rpc('get_paleo_shorelines_nearest', { p_year: year });
      if (cancelled || error || !data) return;
      const rows = data as ShoreRow[];
      const features = rows.map((r) => {
        let g: unknown = null;
        try { g = JSON.parse(r.geojson); } catch { g = null; }
        return g ? { type: 'Feature' as const, properties: { label: r.period_label, year: r.year_ce, kind: r.water_body_type }, geometry: g } : null;
      }).filter(Boolean);
      if (cancelled || !mapRef.current || features.length === 0) return;
      const gj = L.geoJSON({ type: 'FeatureCollection', features } as unknown as GeoJSON.FeatureCollection, {
        style: (f) => f?.properties?.kind === 'lake'
          ? { color: '#0ea5e9', weight: 0, fillColor: '#0ea5e9', fillOpacity: 0.18 }
          : { color: '#38bdf8', weight: 1, fillColor: '#38bdf8', fillOpacity: 0.28 },
        interactive: false,
      });
      gj.addTo(mapRef.current);
      gj.bringToBack();
      layerRef.current = gj;
    })();
    return () => { cancelled = true; };
  }, [mapRef, year]);

  // städa vid unmount
  useEffect(() => () => {
    const map = mapRef.current;
    if (map && layerRef.current) { try { map.removeLayer(layerRef.current); } catch { /* karta redan borttagen */ } }
  }, [mapRef]);
}
