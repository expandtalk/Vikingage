import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Förskatte-borgterritorier (Öland): Voronoi/Thiessen-polygoner kring fornborgarna =
// teoretiska upptagningsområden FÖRE socken/skatte-formen. Daterade borgar ritas kraftigare
// än odaterade (källkritik: alla är inte samtida). Gate: legend 'fort_territories'.
// Hypotesgenererande lager — jämför mot guld (coins) + sockengräns.
interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  safelyAddLayer: (layer: L.Layer) => boolean;
}
const sb = supabase as unknown as { rpc: (fn: string, args?: any) => any };

export const useMapFortTerritories = ({ map, enabledLegendItems, isMapReady, safelyAddLayer }: Props) => {
  const ref = useRef<L.Layer | null>(null);
  const on = !!enabledLegendItems['fort_territories'];

  useEffect(() => {
    const m = map; if (!m || !isMapReady.current) return;
    if (ref.current) { try { m.removeLayer(ref.current); } catch { /* noop */ } ref.current = null; }
    if (!on) return;
    let cancelled = false;
    (async () => {
      const { data } = await sb.rpc('oland_fort_territories');
      if (cancelled || !data) return;
      const g = L.layerGroup();
      for (const f of data as any[]) {
        let geom; try { geom = JSON.parse(f.geojson); } catch { continue; }
        const style = f.dated
          ? { color: '#b45309', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.10 }
          : { color: '#64748b', weight: 1, dashArray: '4 4', fillColor: '#94a3b8', fillOpacity: 0.05 };
        L.geoJSON(geom, { style: () => style as any })
          .bindPopup(`<strong>${f.fort_name}</strong><br/>Teoretiskt borgterritorium (Voronoi, schematiskt)${f.dated ? `<br/>Daterad: ${f.period_start ?? ''}–${f.period_end ?? ''}` : '<br/><em>odaterad — territoriet vägs lägre</em>'}<br/><a href="/fortresses" style="font-size:11px;color:#0ea5e9">Läs mer om fornborgar →</a>`)
          .addTo(g);
      }
      if (safelyAddLayer(g)) ref.current = g;
    })();
    return () => { cancelled = true; if (ref.current) { try { m.removeLayer(ref.current); } catch { /* noop */ } ref.current = null; } };
  }, [map, isMapReady, on, safelyAddLayer]);

  useEffect(() => () => { try { if (ref.current && map?.hasLayer(ref.current)) map.removeLayer(ref.current); } catch { /* noop */ } }, [map]);
};
