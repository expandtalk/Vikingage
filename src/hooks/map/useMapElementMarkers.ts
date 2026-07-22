import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { setSpotlight } from '@/hooks/useElementSpotlight';

// Steg 2c: visar alla OSM-orter med ett valt namnled (URL ?element=tor) som eget lager.
// Läser URL-parametern vid montering (route-byte remountar Explore → hooken körs om).
interface Props { map: L.Map | null; isMapReady: React.RefObject<boolean> }
const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

export const useMapElementMarkers = ({ map, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();

    const key = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('element')
      : null;
    if (!key) { setSpotlight({ key: null, count: 0 }); return; }

    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from('place_names')
        .select('name, lat, lng, element_category')
        .eq('source', 'osm')
        .contains('element_keys', [key])
        .not('lat', 'is', null)
        .limit(2000);
      if (error || cancelled || !map) return;
      const rows = (data as any[]) || [];
      rows.forEach((r) => {
        if (r.lat == null || r.lng == null) return;
        L.circleMarker([r.lat, r.lng], { radius: 5, color: '#78350f', weight: 1, fillColor: '#fbbf24', fillOpacity: 0.9 })
          .bindPopup(`<strong>${esc(r.name)}</strong><br/><span style="font-size:11px;color:#64748b">led: ${esc(key)}${r.element_category ? ` · ${esc(r.element_category)}` : ''}</span>`)
          .addTo(layer);
      });
      setSpotlight({ key, count: rows.length });
    })();
    return () => { cancelled = true; };
  }, [map, isMapReady]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
