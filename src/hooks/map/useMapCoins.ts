import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Kartlager för mynt/fynd (coins med find_place-koordinat). Gate: legendknappen 'coins'.
// Punkt = fyndplats (t.ex. Vedby borg, Öland-skatter, Gotland). Färg per metall.
// Popupen visar utfärdare + myntort/ursprung så Öland–Gotland–kontinent-mönstret syns.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

const METAL_COLOR: Record<string, string> = {
  gold: '#d4af37', guld: '#d4af37',
  silver: '#cbd5e1',
  copper: '#c2884e', koppar: '#c2884e', 'kopparlegering': '#c2884e', bronze: '#c2884e',
};
const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));
const yr = (y: number | null) => (y == null ? '' : y < 0 ? `${-y} f.Kr.` : `${y} e.Kr.`);

export const useMapCoins = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const enabled = enabledLegendItems.coins === true;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!enabled) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from('coins')
        .select('id,name,category,issuer,mint,metal,denomination,period_start,period_end,find_place,coordinates,significance,description,sources')
        .not('coordinates', 'is', null);
      if (error || cancelled || !map) return;
      (data as any[] || []).forEach((r) => {
        // coordinates lagras som point(lng,lat) → strängen "(lng,lat)"
        const m = /\(([^,]+),([^)]+)\)/.exec(String(r.coordinates ?? ''));
        if (!m) return;
        const lng = parseFloat(m[1]); const lat = parseFloat(m[2]);
        if (!isFinite(lat) || !isFinite(lng)) return;
        const color = METAL_COLOR[String(r.metal ?? '').toLowerCase()] ?? '#cbd5e1';
        const period = r.period_start != null ? `${yr(r.period_start)}${r.period_end != null && r.period_end !== r.period_start ? '–' + yr(r.period_end) : ''}` : '';
        L.circleMarker([lat, lng], { radius: 6, color: '#0f172a', weight: 1.5, fillColor: color, fillOpacity: 0.95 })
          .bindPopup(
            `<div style="min-width:200px">
               <strong>${esc(r.name)}</strong>
               ${period ? `<div style="font-size:11px;color:#475569;margin-top:2px">${esc(period)}</div>` : ''}
               <div style="font-size:12px;margin-top:4px">
                 ${r.issuer ? `${esc(r.issuer)}` : ''}${r.mint ? ` · ${esc(r.mint)}` : ''}
               </div>
               <div style="font-size:11px;color:#64748b;margin-top:2px">
                 ${esc(r.metal)}${r.denomination ? ` · ${esc(r.denomination)}` : ''}${r.category ? ` · ${esc(r.category)}` : ''}
               </div>
               ${r.find_place ? `<div style="font-size:11px;margin-top:4px">Fyndplats: <strong>${esc(r.find_place)}</strong></div>` : ''}
               ${r.significance ? `<div style="font-size:11px;color:#475569;margin-top:3px">${esc(r.significance)}</div>` : ''}
               <div style="font-size:10px;color:#94a3b8;margin-top:4px;border-top:1px solid #e2e8f0;padding-top:4px">${esc(r.sources)}</div>
             </div>`,
            { maxWidth: 300 },
          )
          .addTo(layer);
      });
    })();
    return () => { cancelled = true; layer.clearLayers(); };
  }, [map, enabled, isMapReady]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
