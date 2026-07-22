import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Kartlager för aDNA-platser (archaeological_sites med koordinat) + deras genetiska
// individer (genetic_individuals). Gate: legendknappen 'adna_sites'. Popupen visar
// prov-id, genetiskt kön, Y-/mt-haplogrupp, 14C och härkomst per individ.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

export const useMapAncestrySites = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const enabled = enabledLegendItems.adna_sites === true;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!enabled) return;

    let cancelled = false;
    (async () => {
      const [sitesRes, indsRes] = await Promise.all([
        (supabase as any).from('archaeological_sites').select('id,name,period,dating,coordinates,description').not('coordinates', 'is', null),
        (supabase as any).from('genetic_individuals').select('site_id,sample_id,genetic_sex,y_haplogroup,mt_haplogroup,radiocarbon,ancestry'),
      ]);
      if (cancelled || !map || sitesRes.error) return;
      const bySite = new Map<string, any[]>();
      (indsRes.data as any[] || []).forEach((i) => {
        if (!i.site_id) return;
        const arr = bySite.get(i.site_id) ?? []; arr.push(i); bySite.set(i.site_id, arr);
      });
      (sitesRes.data as any[] || []).forEach((s) => {
        const m = /\(([^,]+),([^)]+)\)/.exec(String(s.coordinates ?? ''));
        if (!m) return;
        const lng = parseFloat(m[1]); const lat = parseFloat(m[2]);
        if (!isFinite(lat) || !isFinite(lng)) return;
        const inds = bySite.get(s.id) ?? [];
        const indHtml = inds.map((i) =>
          `<li style="margin-bottom:4px">
             <strong>${esc(i.sample_id)}</strong> ${i.genetic_sex ? `(${esc(i.genetic_sex)})` : ''}
             ${i.y_haplogroup ? `<div style="font-size:10px"><span style="color:#3b82f6">♂ faderslinje (Y)</span>: ${esc(i.y_haplogroup)}</div>` : ''}
             ${i.mt_haplogroup ? `<div style="font-size:10px"><span style="color:#db2777">♀ moderslinje (mt)</span>: ${esc(i.mt_haplogroup)}</div>` : ''}
             ${i.radiocarbon ? `<div style="font-size:10px;color:#64748b">14C ${esc(i.radiocarbon)}</div>` : ''}
             ${i.ancestry ? `<div style="font-size:10px;color:#64748b">${esc(i.ancestry)}</div>` : ''}
           </li>`).join('');
        L.marker([lat, lng], {
          icon: L.divIcon({ className: 'adna', html: `<div style="width:14px;height:14px;border-radius:50%;background:#a855f7;border:2px solid #f8fafc"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] }),
        }).bindPopup(
          `<div style="min-width:210px">
             <strong>🧬 ${esc(s.name)}</strong>
             <div style="font-size:11px;color:#475569;margin-top:2px">${esc(s.period)}${s.dating ? ` · ${esc(s.dating)}` : ''}</div>
             ${s.description ? `<div style="font-size:11px;color:#64748b;margin-top:3px">${esc(s.description)}</div>` : ''}
             ${inds.length ? `<div style="font-size:11px;margin-top:4px;border-top:1px solid #e2e8f0;padding-top:4px">${inds.length} aDNA-individ${inds.length > 1 ? 'er' : ''}:<ul style="margin:4px 0 0 16px;padding:0">${indHtml}</ul></div>` : ''}
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
