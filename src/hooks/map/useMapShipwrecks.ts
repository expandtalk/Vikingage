import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { supabase } from '@/integrations/supabase/client';

// Kartlager för skeppsvrak (marinarkeologi). Gate: legendknappen 'shipwrecks'.
// KLUSTRING: ~2900 vrak (RAÄ Fornsök m.fl.) → de vanliga vraken klustras (annars oläsbar klump),
// men de IKONISKA (significance='iconic') hålls UTANFÖR klustret i ett eget lager så de alltid syns
// med sin guldankar-ikon ovanpå. Punkt = vrakposition ur shipwrecks_map (ST_Y/ST_X → lat/lng).

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
  const clusterRef = useRef<L.LayerGroup | null>(null);   // vanliga vrak (klustrade)
  const iconicRef = useRef<L.LayerGroup | null>(null);    // ikoniska vrak (alltid synliga)
  const enabled = enabledLegendItems.shipwrecks === true;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!clusterRef.current) {
      clusterRef.current = (L as any).markerClusterGroup({
        chunkedLoading: true, maxClusterRadius: 60, disableClusteringAtZoom: 13,
        spiderfyOnMaxZoom: true, showCoverageOnHover: false,
      }) as L.LayerGroup;
      map.addLayer(clusterRef.current);
    }
    if (!iconicRef.current) iconicRef.current = L.layerGroup().addTo(map);
    const cluster = clusterRef.current;
    const iconicLayer = iconicRef.current;
    cluster.clearLayers();
    iconicLayer.clearLayers();
    if (!enabled) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from('shipwrecks_map')
        .select('id,name,survey_label,vessel_type,identification,identification_confidence,construction,dating_summary,dating_confidence,sinking_event,sinking_year,raa_number,source_attribution,source_license,significance,lat,lng');
      if (error || cancelled || !map) return;
      (data as any[] || []).forEach((r) => {
        const lat = parseFloat(r.lat); const lng = parseFloat(r.lng);
        if (!isFinite(lat) || !isFinite(lng)) return;
        const iconic = String(r.significance ?? '') === 'iconic';
        const color = TYPE_COLOR[String(r.vessel_type ?? '').toLowerCase()] ?? '#64748b';
        const yr = r.sinking_year ? ` <span style="font-size:11px;color:#b45309">✝ ${esc(r.sinking_year)}</span>` : '';
        const popup =
          `<div style="min-width:210px">
             <strong>${esc(r.name)}</strong>${yr}${r.survey_label ? ` <span style="font-size:10px;color:#94a3b8">(${esc(r.survey_label)})</span>` : ''}
             ${iconic ? '<div style="font-size:10px;color:#b45309;font-weight:600;letter-spacing:.04em;margin-top:2px">IKONISKT VRAK</div>' : ''}
             <div style="font-size:12px;margin-top:3px">${esc(r.vessel_type)}${r.identification ? ` · ${esc(r.identification)}` : ''}${r.identification_confidence ? ` <em style="color:#64748b">(${esc(r.identification_confidence)})</em>` : ''}</div>
             ${r.dating_summary ? `<div style="font-size:11px;color:#475569;margin-top:3px">Datering: ${esc(r.dating_summary)}${r.dating_confidence ? ` (${esc(r.dating_confidence)})` : ''}</div>` : ''}
             ${r.construction ? `<div style="font-size:11px;color:#64748b;margin-top:2px">${esc(r.construction)}</div>` : ''}
             ${r.sinking_event ? `<div style="font-size:11px;margin-top:3px">${esc(r.sinking_event)}</div>` : ''}
             ${r.raa_number ? `<div style="font-size:10px;color:#94a3b8;margin-top:2px">${esc(r.raa_number)}</div>` : ''}
             <div style="font-size:10px;color:#94a3b8;margin-top:4px;border-top:1px solid #e2e8f0;padding-top:4px">${esc(r.source_attribution)}${r.source_license ? ` · ${esc(r.source_license)}` : ''}</div>
           </div>`;
        if (iconic) {
          // Ikoniskt vrak: guldankar-badge (KLICKBAR 26×26, inte noll-stor) + namn som tooltip
          // (tooltip fångar inga klick). Tidigare iconSize [0,0] gjorde regalskeppen oklickbara.
          const icon = L.divIcon({
            className: 'wreck-iconic',
            html: `<span style="display:flex;width:24px;height:24px;border-radius:50%;background:#f59e0b;border:2px solid #78350f;box-shadow:0 1px 5px rgba(0,0,0,.55);align-items:center;justify-content:center;font-size:14px">⚓</span>`,
            iconSize: [26, 26], iconAnchor: [13, 13],
          });
          L.marker([lat, lng], { icon, zIndexOffset: 1000 })
            .bindPopup(popup, { maxWidth: 320 })
            .bindTooltip(esc(r.name), { permanent: true, direction: 'right', offset: [12, 0], className: 'wreck-label' })
            .addTo(iconicLayer);
        } else {
          // Vanligt vrak: liten prick (divIcon) i klustret.
          const dot = L.divIcon({
            className: 'wreck-dot', iconSize: [12, 12], iconAnchor: [6, 6],
            html: `<span style="display:block;width:10px;height:10px;border-radius:50%;background:${color};border:1px solid #0f172a;box-shadow:0 0 2px rgba(0,0,0,.4)"></span>`,
          });
          cluster.addLayer(L.marker([lat, lng], { icon: dot }).bindPopup(popup, { maxWidth: 320 }));
        }
      });
    })();
    return () => { cancelled = true; cluster.clearLayers(); iconicLayer.clearLayers(); };
  }, [map, enabled, isMapReady]);

  useEffect(() => () => {
    try { if (clusterRef.current && map?.hasLayer(clusterRef.current)) map.removeLayer(clusterRef.current); } catch { /* noop */ }
    try { if (iconicRef.current && map?.hasLayer(iconicRef.current)) map.removeLayer(iconicRef.current); } catch { /* noop */ }
    clusterRef.current = null; iconicRef.current = null;
  }, [map]);
};
