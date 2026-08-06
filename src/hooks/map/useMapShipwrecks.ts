import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Kartlager för skeppsvrak (marinarkeologi). Gate: legendknappen 'shipwrecks'
// (barn under Marinarkeologi-kategorin, default AV). Punkt = vrakposition ur
// shipwrecks_map-vyn (ST_Y/ST_X → lat/lng; rå PostGIS-geom kan ej läsas i klienten).
// Färg per fartygstyp. Popup: identifiering + datering (m. konfidens) + proveniens.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

const TYPE_COLOR: Record<string, string> = {
  linjeskepp: '#7f1d1d',
  brännare: '#ea580c',
  fraktskepp: '#1d4ed8',
  okänt: '#64748b',
};
const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

export const useMapShipwrecks = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const enabled = enabledLegendItems.shipwrecks === true;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!enabled) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from('shipwrecks_map')
        .select('id,name,survey_label,vessel_type,identification,identification_confidence,construction,dating_summary,dating_confidence,sinking_event,raa_number,source_attribution,source_license,lat,lng');
      if (error || cancelled || !map) return;
      (data as any[] || []).forEach((r) => {
        const lat = parseFloat(r.lat); const lng = parseFloat(r.lng);
        if (!isFinite(lat) || !isFinite(lng)) return;
        const color = TYPE_COLOR[String(r.vessel_type ?? '').toLowerCase()] ?? '#64748b';
        L.circleMarker([lat, lng], { radius: 6, color: '#0f172a', weight: 1.5, fillColor: color, fillOpacity: 0.95 })
          .bindPopup(
            `<div style="min-width:210px">
               <strong>${esc(r.name)}</strong>${r.survey_label ? ` <span style="font-size:10px;color:#94a3b8">(${esc(r.survey_label)})</span>` : ''}
               <div style="font-size:12px;margin-top:3px">${esc(r.vessel_type)}${r.identification ? ` · ${esc(r.identification)}` : ''}${r.identification_confidence ? ` <em style="color:#64748b">(${esc(r.identification_confidence)})</em>` : ''}</div>
               ${r.dating_summary ? `<div style="font-size:11px;color:#475569;margin-top:3px">Datering: ${esc(r.dating_summary)}${r.dating_confidence ? ` (${esc(r.dating_confidence)})` : ''}</div>` : ''}
               ${r.construction ? `<div style="font-size:11px;color:#64748b;margin-top:2px">${esc(r.construction)}</div>` : ''}
               ${r.sinking_event ? `<div style="font-size:11px;margin-top:3px">${esc(r.sinking_event)}</div>` : ''}
               ${r.raa_number ? `<div style="font-size:10px;color:#94a3b8;margin-top:2px">${esc(r.raa_number)}</div>` : ''}
               <div style="font-size:10px;color:#94a3b8;margin-top:4px;border-top:1px solid #e2e8f0;padding-top:4px">${esc(r.source_attribution)}${r.source_license ? ` · ${esc(r.source_license)}` : ''}</div>
             </div>`,
            { maxWidth: 320 },
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
