import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Museilager: museerna (museums) som punkter med praktisk popup (typ, ort, webbplats, antal
// samlingsobjekt). Gate: legend 'museums'. Primitiv dep → ingen refetch-loop.
interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  safelyAddLayer: (layer: L.Layer) => boolean;
}
const sb = supabase as unknown as { from: (t: string) => any };
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const TYPE_SV: Record<string, string> = {
  läns: 'Länsmuseum', riks: 'Riksmuseum', arkeologi: 'Arkeologiskt', friluft: 'Friluftsmuseum',
  fartyg: 'Fartygsmuseum', konst: 'Konstmuseum', lokal: 'Lokalmuseum', övrigt: 'Museum',
};

export const useMapMuseums = ({ map, enabledLegendItems, isMapReady, safelyAddLayer }: Props) => {
  const ref = useRef<L.Layer | null>(null);
  const on = !!enabledLegendItems['museums'];

  useEffect(() => {
    const m = map; if (!m || !isMapReady.current) return;
    if (ref.current) { try { m.removeLayer(ref.current); } catch { /* noop */ } ref.current = null; }
    if (!on) return;
    let cancelled = false;
    (async () => {
      const { data } = await sb.from('museums')
        .select('id,name,museum_type,website,city,county,lat,lng, museum_objects(count)');
      if (cancelled || !data) return;
      const g = L.layerGroup();
      for (const mu of data as any[]) {
        if (mu.lat == null || mu.lng == null) continue;
        const objs = Array.isArray(mu.museum_objects) ? (mu.museum_objects[0]?.count ?? 0) : 0;
        const icon = L.divIcon({ html: '<div style="font-size:20px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))">🏛️</div>', className: 'vp-museum-marker', iconSize: [24, 24], iconAnchor: [12, 20], popupAnchor: [0, -18] });
        const site = mu.website ? `<br/><a href="${esc(mu.website)}" target="_blank" rel="noopener" style="color:#38bdf8">Webbplats ↗</a>` : '';
        const objLine = objs ? `<br/><span style="color:#666">${objs} samlingsobjekt i databasen</span>` : '';
        L.marker([mu.lat, mu.lng], { icon })
          .bindPopup(`<div style="max-width:240px"><strong>${esc(mu.name)}</strong><br/><span style="color:#666">${esc(TYPE_SV[mu.museum_type] || mu.museum_type || 'Museum')}${mu.city ? ' · ' + esc(mu.city) : ''}</span>${objLine}${site}</div>`)
          .addTo(g);
      }
      if (safelyAddLayer(g)) ref.current = g;
    })();
    return () => { cancelled = true; if (ref.current) { try { m.removeLayer(ref.current); } catch { /* noop */ } ref.current = null; } };
  }, [map, isMapReady, on, safelyAddLayer]);

  useEffect(() => () => { try { if (ref.current && map?.hasLayer(ref.current)) map.removeLayer(ref.current); } catch { /* noop */ } }, [map]);
};
