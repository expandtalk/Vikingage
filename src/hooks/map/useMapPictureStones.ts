import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Kartlager för bildsten-spolia (picture_stone_reuse med koordinat = kyrkans läge).
// Gate: legendknappen 'picture_stone_reuse' (=== true). Färg per Lindqvist-period;
// återanvändningskontext + tolkningsramar i popupen. Endast koordinatsatta rader ritas.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

const PERIOD_COLOR: Record<string, string> = {
  A: '#f59e0b', B: '#f97316', C: '#ef4444', 'C/D': '#dc2626', D: '#b91c1c', E: '#8b5cf6',
};
const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

export const useMapPictureStones = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const enabled = enabledLegendItems.picture_stone_reuse === true;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!enabled) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from('picture_stone_reuse')
        .select('id,stone_name,parish,lindqvist_period,period_label,reuse_context,visibility,motif,interpretation,notes,lat,lng,source')
        .not('lat', 'is', null);
      if (error || cancelled || !map) return;
      (data as any[] || []).forEach((r) => {
        if (r.lat == null || r.lng == null) return;
        const color = PERIOD_COLOR[r.lindqvist_period] ?? '#64748b';
        const interp = Array.isArray(r.interpretation) ? r.interpretation.join(' · ') : '';
        L.marker([r.lat, r.lng], {
          icon: L.divIcon({
            className: 'psr-stone',
            html: `<div style="width:13px;height:15px;background:${color};border:1.5px solid #0f172a;border-radius:5px 5px 2px 2px"></div>`,
            iconSize: [13, 15], iconAnchor: [7, 8],
          }),
        }).bindPopup(
          `<div style="min-width:210px">
             <strong>${esc(r.stone_name)}</strong>
             <div style="font-size:11px;color:#475569;margin-top:2px">${esc(r.parish)} · period ${esc(r.lindqvist_period ?? '?')} (${esc(r.period_label)})</div>
             <div style="font-size:12px;margin-top:4px">
               Återanvänd: <strong>${esc(r.reuse_context)}</strong>${r.visibility ? ` · ${esc(r.visibility)}` : ''}
             </div>
             ${r.motif ? `<div style="font-size:11px;color:#64748b;margin-top:2px">Motiv: ${esc(r.motif)}</div>` : ''}
             ${interp ? `<div style="font-size:11px;margin-top:4px">Tolkning (omtvistad): <span style="color:${color};font-weight:600">${esc(interp)}</span></div>` : ''}
             ${r.notes ? `<div style="font-size:11px;color:#475569;margin-top:3px">${esc(r.notes)}</div>` : ''}
             <div style="font-size:10px;color:#94a3b8;margin-top:4px;border-top:1px solid #e2e8f0;padding-top:4px">${esc(r.source)}</div>
           </div>`,
          { maxWidth: 300 },
        ).addTo(layer);
      });
    })();
    return () => { cancelled = true; layer.clearLayers(); };
  }, [map, enabled, isMapReady]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
