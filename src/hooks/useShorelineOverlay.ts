import { useEffect, useRef, type RefObject } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Ritar dåtida strandlinje (SGU strandförskjutningsmodell, CC-BY) som overlay på en IMPERATIV
// Leaflet-karta (forskningssidorna Öland/Kalmar/Ångermanland). RPC get_paleo_shorelines_nearest
// snappar till närmaste tillgängliga skiva (50–950 e.Kr.). Havsytan visas halvtransparent blå.
// year=null → lagret av.
//
// HÄRDAT (2026-07-29): (1) väntar in kartan (init-effekten sätter mapRef.current efter denna hook),
// (2) validerar bort tomma/ogiltiga geometrier — en tom MultiPolygon fick Leaflet att projicera en
// null-latlng och krascha hela sidan, (3) try/catch som sista skydd.

interface ShoreRow { id: string; period_label: string; year_ce: number; water_body_type: 'sea' | 'lake'; geojson: string }

const GEOM_TYPES = new Set(['Polygon', 'MultiPolygon', 'LineString', 'MultiLineString', 'Point', 'MultiPoint', 'GeometryCollection']);
function validGeom(g: unknown): g is GeoJSON.Geometry {
  if (!g || typeof g !== 'object') return false;
  const t = (g as { type?: string }).type;
  if (!t || !GEOM_TYPES.has(t)) return false;
  const coords = (g as { coordinates?: unknown }).coordinates;
  if (!Array.isArray(coords) || coords.length === 0) return false;   // tom geometri → hoppa (kraschkällan)
  return true;
}

// rpcFn: 'get_paleo_shorelines_nearest' (SGU, default) eller 'get_paleo_shorelines_dem'
// (finupplöst Copernicus-DEM-modell, används på Kalmar-sidan). Båda returnerar samma form.
export function useShorelineOverlay(
  mapRef: RefObject<L.Map | null>,
  year: number | null,
  rpcFn: 'get_paleo_shorelines_nearest' | 'get_paleo_shorelines_dem' = 'get_paleo_shorelines_nearest',
) {
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    const clear = () => {
      const map = mapRef.current;
      if (map && layerRef.current) { try { map.removeLayer(layerRef.current); } catch { /* karta borttagen */ } }
      layerRef.current = null;
    };
    clear();
    if (year == null) return () => { cancelled = true; };

    (async () => {
      // vänta in kartan (init-effekten körs efter denna hook vid mount)
      let tries = 0;
      while (!mapRef.current && tries < 180 && !cancelled) {
        await new Promise<void>((r) => { raf = requestAnimationFrame(() => r()); });
        tries++;
      }
      if (cancelled || !mapRef.current) return;

      const { data, error } = await (supabase as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
      }).rpc(rpcFn, { p_year: year });
      if (cancelled || error || !data) return;

      const features: GeoJSON.Feature[] = [];
      for (const r of data as ShoreRow[]) {
        if (!r.geojson) continue;
        let g: unknown;
        try { g = JSON.parse(r.geojson); } catch { continue; }
        if (!validGeom(g)) continue;
        features.push({ type: 'Feature', properties: { kind: r.water_body_type, label: r.period_label }, geometry: g as GeoJSON.Geometry });
      }
      if (cancelled || !mapRef.current || features.length === 0) return;

      try {
        const gj = L.geoJSON({ type: 'FeatureCollection', features } as GeoJSON.FeatureCollection, {
          style: (f) => f?.properties?.kind === 'lake'
            ? { color: '#0ea5e9', weight: 0, fillColor: '#0ea5e9', fillOpacity: 0.18 }
            : { color: '#38bdf8', weight: 1, fillColor: '#38bdf8', fillOpacity: 0.28 },
          interactive: false,
        });
        gj.addTo(mapRef.current);
        gj.bringToBack();
        layerRef.current = gj;
      } catch (e) {
        console.warn('⚠️ strandlinje-overlay hoppades (geometri):', (e as Error)?.message);
      }
    })();

    return () => { cancelled = true; if (raf) cancelAnimationFrame(raf); clear(); };
  }, [mapRef, year, rpcFn]);
}
