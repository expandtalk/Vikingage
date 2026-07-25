import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { overlapsPeriod } from '@/utils/germanicTimeline/periodRange';

// Solidus-lager: guldprickar per fyndplats + stämpellänk-polylinjer till die-kontext-
// regioner (Öland, Bornholm, kontinenten). Data: solidi-tabellen (Fischer 2023 Småland).
// Periodfiltrerat på mynten issued_from/to → folkvandringstid. Gate: 'solidus_die_links'.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  selectedTimePeriod: string;
}

// Regioncentroider för die-kontext (etiketter i die_link_context → ungefärlig punkt).
const REGION: Record<string, [number, number]> = {
  'Öland': [56.75, 16.65], 'Gotland': [57.5, 18.5], 'Bornholm': [55.13, 14.92],
  'Italien': [42.5, 12.5], 'Ungern': [47.0, 19.5], 'Polen': [52.0, 19.5], 'Tjeckien': [49.8, 15.5],
};
const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));
const yr = (y: number | null) => (y == null ? '' : y < 0 ? `${-y} f.Kr.` : `${y} e.Kr.`);

export const useMapSolidi = ({ map, enabledLegendItems, isMapReady, selectedTimePeriod }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const enabled = enabledLegendItems.solidus_die_links === true;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!enabled) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from('solidi')
        .select('cat_no,ruler,mint,ric_ref,issued_from,issued_to,weight_g,find_place,parish,county,die_link_sides,die_link_context,coordinates')
        .not('coordinates', 'is', null);
      if (error || cancelled || !map) return;
      (data as any[] || []).forEach((r) => {
        const m = /\(([^,]+),([^)]+)\)/.exec(String(r.coordinates ?? ''));
        if (!m) return;
        const lng = parseFloat(m[1]); const lat = parseFloat(m[2]);
        if (!isFinite(lat) || !isFinite(lng)) return;
        if (!overlapsPeriod(selectedTimePeriod, r.issued_from, r.issued_to)) return;

        // Stämpellänk-linjer till namngivna regioner i die_link_context.
        if (r.die_link_sides && r.die_link_context) {
          for (const [name, ll] of Object.entries(REGION)) {
            if (String(r.die_link_context).includes(name)) {
              L.polyline([[lat, lng], ll], { color: '#d4af37', weight: 1.5, opacity: 0.6, dashArray: '5 4' }).addTo(layer);
            }
          }
        }

        const period = r.issued_from != null ? `${yr(r.issued_from)}${r.issued_to != null && r.issued_to !== r.issued_from ? '–' + yr(r.issued_to) : ''}` : '';
        L.circleMarker([lat, lng], { radius: 6, color: '#7c5c00', weight: 1.5, fillColor: '#d4af37', fillOpacity: 0.95 })
          .bindPopup(
            `<div style="min-width:210px">
               <strong>Solidus — ${esc(r.ruler)}</strong>
               ${period ? `<div style="font-size:11px;color:#475569;margin-top:2px">${esc(period)}</div>` : ''}
               <div style="font-size:12px;margin-top:3px">${r.mint ? `Myntort: ${esc(r.mint)}` : ''}${r.ric_ref ? ` · ${esc(r.ric_ref)}` : ''}</div>
               ${r.weight_g ? `<div style="font-size:11px;color:#64748b">${esc(r.weight_g)} g</div>` : ''}
               <div style="font-size:11px;margin-top:4px">Fyndplats: <strong>${esc(r.find_place)}</strong>${r.parish ? `, ${esc(r.parish)} sn` : ''}${r.county ? ` (${esc(r.county)} län)` : ''}</div>
               ${r.die_link_sides ? `<div style="font-size:11px;color:#7c5c00;margin-top:4px;border-top:1px solid #e2e8f0;padding-top:4px">🔗 Stämpellänk (${esc(r.die_link_sides)}) → ${esc(r.die_link_context)}</div>` : ''}
               <div style="font-size:10px;color:#94a3b8;margin-top:4px">Fischer 2023, Solidi of Småland</div>
             </div>`,
            { maxWidth: 300 },
          )
          .addTo(layer);
      });
    })();
    return () => { cancelled = true; layer.clearLayers(); };
  }, [map, enabled, isMapReady, selectedTimePeriod]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
