import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { overlapsPeriod } from '@/utils/germanicTimeline/periodRange';

// Kartlager för art-/innovationsintroduktioner (species_introductions med koordinat),
// filtrerat på vald PERIOD (samma tidskontroll som folkgrupper/städer/eventlinje —
// den tidigare separata epok-kontrollen är borttagen). Gate: 'species_introductions'.
// Färg per proxy-typ (samma som tidslinjen). Endast koordinatsatta rader ritas.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  selectedTimePeriod: string;
}

const PROXY_COLOR: Record<string, string> = {
  adna: '#c084fc', zooarchaeology: '#f59e0b', iconography: '#34d399', onomastics: '#22d3ee', text: '#94a3b8',
};
const EVENT_COLOR: Record<string, string> = {
  epidemic: '#ef4444', climate: '#38bdf8', catastrophe: '#fb923c', settlement: '#a3e635',
  military: '#f87171', raid: '#fb7185', political: '#818cf8', migration: '#c026d3',
};
const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

export const useMapSpeciesMarkers = ({ map, enabledLegendItems, isMapReady, selectedTimePeriod }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const enabled = enabledLegendItems.species_introductions === true;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!enabled) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from('species_introductions')
        .select('id,entity,proxy_type,lat,lng,date_text,date_from,date_to,confidence,source,region,geo_precision')
        .not('lat', 'is', null);
      if (error || cancelled || !map) return;
      (data as any[] || []).forEach((r) => {
        if (r.lat == null || r.lng == null) return;
        // Periodöverlapp: postens [date_from, date_to] snittar vald period.
        if (!overlapsPeriod(selectedTimePeriod, r.date_from, r.date_to)) return;
        const color = PROXY_COLOR[r.proxy_type] ?? '#fbbf24';
        // Regionala rader (geo_precision='regional') är INTE punkter — rita som dämpad,
        // streckad halo så de inte läses som exakt fyndplats. Övriga = solid prick.
        const regional = r.geo_precision === 'regional';
        const style = regional
          ? { radius: 11, color, weight: 1.5, dashArray: '3', fillColor: color, fillOpacity: 0.15 }
          : { radius: 6, color: '#1e293b', weight: 1.5, fillColor: color, fillOpacity: 0.9 };
        L.circleMarker([r.lat, r.lng], style)
          .bindPopup(
            `<div style="min-width:190px">
               <strong>${esc(r.entity)}</strong>
               <div style="font-size:12px;color:#475569;margin-top:2px">${esc(r.date_text)}</div>
               ${r.region ? `<div style="font-size:11px;color:#64748b">${esc(r.region)}</div>` : ''}
               ${regional ? `<div style="font-size:10px;color:#b45309;margin-top:3px">≈ regionalt läge (ej exakt fyndplats)</div>` : ''}
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
        if (!overlapsPeriod(selectedTimePeriod, e.year_start, e.year_end)) return;
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
  }, [map, enabled, isMapReady, selectedTimePeriod]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
