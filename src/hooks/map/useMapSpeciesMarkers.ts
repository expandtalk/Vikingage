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
const EVENT_COLOR: Record<string, string> = {
  epidemic: '#ef4444', climate: '#38bdf8', catastrophe: '#fb923c', settlement: '#a3e635',
  military: '#f87171', raid: '#fb7185', political: '#818cf8', migration: '#c026d3',
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

      // Händelser (historical_events med koordinat), samma epok-filter. Fyrkantig markör.
      const { data: ev } = await (supabase as any)
        .from('historical_events')
        .select('event_name,event_type,year_start,year_end,lat,lng,description,sources')
        .not('lat', 'is', null);
      if (cancelled || !map) return;
      (ev as any[] || []).forEach((e) => {
        if (e.lat == null || e.lng == null) return;
        const ys = e.year_start ?? null; if (ys == null) return;
        const ye = e.year_end ?? ys;
        if (ye < from || ys > to) return;
        const color = EVENT_COLOR[e.event_type] ?? '#fbbf24';
        L.marker([e.lat, e.lng], {
          icon: L.divIcon({ className: 'evt-sq', html: `<div style="width:11px;height:11px;background:${color};border:1.5px solid #0f172a;transform:rotate(45deg)"></div>`, iconSize: [11, 11], iconAnchor: [6, 6] }),
        }).bindPopup(
          `<div style="min-width:190px"><strong>${esc(e.event_name)}</strong>
             <div style="font-size:11px;color:${color};font-weight:600;margin-top:2px">${esc(e.event_type)}</div>
             <div style="font-size:12px;color:#475569;margin-top:3px">${esc(e.description)}</div>
             ${(e.sources || []).length ? `<div style="font-size:10px;color:#94a3b8;margin-top:4px;border-top:1px solid #e2e8f0;padding-top:4px">${esc((e.sources || []).join('; '))}</div>` : ''}
           </div>`, { maxWidth: 280 },
        ).addTo(layer);
      });
    })();
    return () => { cancelled = true; layer.clearLayers(); };
  }, [map, enabled, isMapReady, epochKey]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
