import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { useTimeEpoch, epochRange } from '@/hooks/useTimeEpoch';

// Kartlager för art-/innovationsintroduktioner (species_introductions med koordinat),
// filtrerat på vald tidsepok. Gate: legendknappen 'species_introductions' (=== true).
// Färg per proxy-typ (samma som tidslinjen). Endast koordinatsatta rader ritas.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

const PROXY_COLOR: Record<string, string> = {
  adna: '#c084fc', zooarchaeology: '#f59e0b', iconography: '#34d399', onomastics: '#22d3ee', text: '#94a3b8',
};
const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

export const useMapSpeciesMarkers = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const enabled = enabledLegendItems.species_introductions === true;
  const epochKey = useTimeEpoch();

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!enabled) return;

    const { from, to } = epochRange(epochKey);
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from('species_introductions')
        .select('id,entity,proxy_type,lat,lng,date_text,date_from,date_to,confidence,source,region')
        .not('lat', 'is', null);
      if (error || cancelled || !map) return;
      (data as any[] || []).forEach((r) => {
        if (r.lat == null || r.lng == null) return;
        // Epok-överlapp: postens intervall [date_from, date_to||date_from] snittar [from,to].
        const df = r.date_from ?? null;
        if (df == null) return;
        const dt = r.date_to ?? df;
        if (dt < from || df > to) return;
        const color = PROXY_COLOR[r.proxy_type] ?? '#fbbf24';
        L.circleMarker([r.lat, r.lng], { radius: 6, color: '#1e293b', weight: 1.5, fillColor: color, fillOpacity: 0.9 })
          .bindPopup(
            `<div style="min-width:190px">
               <strong>${esc(r.entity)}</strong>
               <div style="font-size:12px;color:#475569;margin-top:2px">${esc(r.date_text)}</div>
               ${r.region ? `<div style="font-size:11px;color:#64748b">${esc(r.region)}</div>` : ''}
               <div style="font-size:11px;margin-top:4px">
                 <span style="color:${color};font-weight:600">${esc(r.proxy_type)}</span> · ${esc(r.confidence)}
               </div>
               <div style="font-size:10px;color:#94a3b8;margin-top:4px;border-top:1px solid #e2e8f0;padding-top:4px">${esc(r.source)}</div>
             </div>`,
            { maxWidth: 260 },
          )
          .addTo(layer);
      });
    })();
    return () => { cancelled = true; layer.clearLayers(); };
  }, [map, enabled, isMapReady, epochKey]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
