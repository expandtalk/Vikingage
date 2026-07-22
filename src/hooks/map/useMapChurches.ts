import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Kyrkor efter reformationen (~1550) utan medeltida ursprung göms — de moderna
// kyrkorna (t.ex. 1900-/2000-tal) är inte relevanta för det forn-/medeltida temat.
const MEDIEVAL_MAX_YEAR = 1550;

// Rikt kyrkolager ur ecclesiastical_sites: byggår, stift, socken/härad, ruinstatus + bild
// (Wikimedia Commons via Wikidata P18). Viewport-laddat via ecclesiastical_in_bbox, zoom-gate ≥8.
// Gate: legendknappen 'ecclesiastical_churches' (=== true, av som standard).

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

const sb = supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: any; error: any }> };
const ZOOM_MIN = 6; // kyrkorna laddas från regional zoom (var 8 → syntes inte i överblick)

const colorFor = (kind: string, status: string | null) => {
  if (status === 'ruin') return '#6b7280';                 // ruin = grå
  if (kind === 'monastery' || kind === 'nunnery') return '#c026d3';
  if (kind === 'cathedral') return '#b45309';
  if (kind === 'chapel') return '#db2777';
  if (kind === 'hospital') return '#0891b2';
  return '#e11d48';                                         // sockenkyrka = rött
};

const iconFor = (kind: string, status: string | null) => L.divIcon({
  html: `<div style="width:13px;height:13px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    background:${colorFor(kind, status)};border:1.5px solid #1e293b;box-shadow:0 1px 2px rgba(0,0,0,0.4);
    ${status === 'ruin' ? 'opacity:.75;border-style:dashed;' : ''}"></div>`,
  className: 'church-dot', iconSize: [13, 13], iconAnchor: [6, 12], popupAnchor: [0, -11],
});

const esc = (s: string) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

const popupHtml = (r: any) => {
  const ruin = r.status === 'ruin';
  const img = r.image_url
    ? `<img src="${esc(r.image_url)}?width=320" alt="${esc(r.name)}" loading="lazy"
         style="width:100%;max-width:280px;height:auto;border-radius:6px;margin:6px 0;display:block"
         onerror="this.style.display='none'"/>`
    : '';
  const rows: string[] = [];
  if (r.built_from) rows.push(`Byggår: ${r.built_from}${r.dating_class ? ` (${esc(r.dating_class)})` : ''}`);
  else if (r.dating_class) rows.push(`Datering: ${esc(r.dating_class)}`);
  if (r.diocese) rows.push(`Stift: ${esc(r.diocese)}`);
  if (r.socken) rows.push(`Socken: ${esc(r.socken)}${r.harad ? ` · ${esc(r.harad)} härad` : ''}`);
  const attr = r.image_attribution
    ? `<div style="font-size:10px;color:#94a3b8;margin-top:4px">${esc(r.image_attribution)}</div>` : '';
  const probeBtn = (r.lat != null && r.lng != null)
    ? `<button onclick="window.setProximityProbe(${r.lat},${r.lng},'${esc(String(r.name)).replace(/'/g, '')}')"
         style="margin-top:8px;font-size:11px;padding:4px 8px;border-radius:6px;border:1px solid #f59e0b;background:#fef3c7;color:#78350f;cursor:pointer">
         Visa omkrets (fynd i närheten)</button>`
    : '';
  return `<div style="min-width:200px">
    <strong>${esc(r.name)}</strong>${ruin ? ' <span style="color:#6b7280">· ruin</span>' : ''}
    ${img}
    <div style="font-size:12px;color:#475569;line-height:1.5">${rows.join('<br/>')}</div>${attr}
    ${probeBtn}
  </div>`;
};

export const useMapChurches = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const tokenRef = useRef(0);
  const zoomedRef = useRef(false);
  const enabled = enabledLegendItems.ecclesiastical_churches === true;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;

    if (!enabled) { layer.clearLayers(); return; }

    // Fokus=churches: zooma in på Sverige EN gång så kyrkorna syns direkt (utan att
    // kapa vyn i vanliga utforska-läget, som saknar focus-parametern).
    if (!zoomedRef.current && typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).get('focus') === 'churches'
        && map.getZoom() < ZOOM_MIN) {
      zoomedRef.current = true;
      map.setView([58.6, 15.2], ZOOM_MIN);
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = async () => {
      const myToken = ++tokenRef.current;
      if (map.getZoom() < ZOOM_MIN) { layer.clearLayers(); return; }  // överblick: använd Kulturlager
      const b = map.getBounds();
      const { data, error } = await sb.rpc('ecclesiastical_in_bbox', {
        min_lng: b.getWest(), min_lat: b.getSouth(), max_lng: b.getEast(), max_lat: b.getNorth(), p_limit: 4000,
      });
      if (error || myToken !== tokenRef.current || !map) return;
      layer.clearLayers();
      (data as any[] || []).forEach((r) => {
        if (r.lat == null || r.lng == null) return;
        // Göm moderna kyrkor: byggda efter ~1550 utan medeltida ursprung. Odaterade
        // (built_from = null) och medeltida behålls.
        if (r.built_from != null && r.built_from > MEDIEVAL_MAX_YEAR
            && !/medeltid/i.test(String(r.dating_class ?? ''))) return;
        L.marker([r.lat, r.lng], { icon: iconFor(r.kind, r.status) })
          .bindPopup(popupHtml(r), { maxWidth: 320, className: 'church-popup' })
          .addTo(layer);
      });
    };
    const debounced = () => { if (timer) clearTimeout(timer); timer = setTimeout(refresh, 250); };
    map.on('moveend zoomend', debounced);
    refresh();
    return () => { map.off('moveend zoomend', debounced); if (timer) clearTimeout(timer); layer.clearLayers(); };
  }, [map, enabled, isMapReady]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch (e) { console.warn('church layer cleanup', e); }
  }, [map]);
};
