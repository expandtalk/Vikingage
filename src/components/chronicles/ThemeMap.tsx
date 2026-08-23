import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OSM_BASEMAP, leafletTileOptions } from '@/config/basemaps';

// Temakarta: plottar temats FAKTISKA has_theme-noder (grafkopplade platser) med koordinat ur
// place_names — inte en nyckelordssökning. Löser "kartan ska bara visa relaterade ställen":
// bara det som kuraterats till temat syns. Självdöljande om inga koordinatsatta noder finns.
const sb = supabase as unknown as {
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }>;
  from: (t: string) => any;
};
type Pt = { id: string; label: string; lat: number; lng: number };

export const ThemeMap: React.FC<{ themeId: string; sv: boolean }> = ({ themeId, sv }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const { data: points = [] } = useQuery({
    queryKey: ['theme-map', themeId],
    enabled: !!themeId,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Pt[]> => {
      const { data: edges } = await sb.rpc('graph_neighborhood', { p_id: themeId });
      const ids = (edges ?? [])
        .filter((e: any) => e.predicate === 'has_theme')
        .map((e: any) => e.other_id);
      if (!ids.length) return [];
      // Koordinater ur place_names (inhemska socknar/kloster) OCH heritage_sites (t.ex. Gustavia,
      // Carolusborg — System III-platserna utomlands som ej finns i place_names).
      const { data: places } = await sb.from('place_names').select('id,name,lat,lng').in('id', ids);
      const found = new Set((places ?? []).map((p: any) => p.id));
      const rest = ids.filter((id: string) => !found.has(id));
      let sites: any[] = [];
      if (rest.length) {
        const { data } = await sb.from('heritage_sites').select('id,name,lat,lng').in('id', rest);
        sites = data ?? [];
      }
      return [...(places ?? []), ...sites]
        .filter((p: any) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
        .map((p: any) => ({ id: p.id, label: p.name, lat: p.lat, lng: p.lng }));
    },
  });

  // Init EN gång (ResizeObserver + fördröjda invalidateSize mot 0-bredd-init, jfr PlaceMap).
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { preferCanvas: true, center: [59, 15], zoom: 5, scrollWheelZoom: false });
    const bm = leafletTileOptions(OSM_BASEMAP);
    L.tileLayer(bm.url, bm.options).addTo(map);
    mapRef.current = map;
    const ro = new ResizeObserver(() => { try { map.invalidateSize(); } catch { /* noop */ } });
    ro.observe(ref.current);
    const timers = [60, 250, 600, 1200].map((d) => setTimeout(() => { try { map.invalidateSize(); } catch { /* noop */ } }, d));
    return () => {
      try { ro.disconnect(); } catch { /* noop */ }
      timers.forEach(clearTimeout);
      map.remove(); mapRef.current = null;
    };
  }, []);

  // Rita punkterna + zooma till deras utbredning.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !points.length) return;
    const g = L.layerGroup().addTo(map);
    const latlngs: [number, number][] = [];
    for (const p of points) {
      latlngs.push([p.lat, p.lng]);
      L.circleMarker([p.lat, p.lng], {
        radius: 5, color: '#0f172a', weight: 0.8, fillColor: '#f59e0b', fillOpacity: 0.85,
      }).bindPopup(`<b>${p.label}</b>`).addTo(g);
    }
    try { map.fitBounds(L.latLngBounds(latlngs).pad(0.15)); } catch { /* noop */ }
    return () => { g.remove(); };
  }, [points]);

  if (!points.length) return null;
  return (
    <div>
      <div ref={ref} className="w-full h-[420px] rounded-lg overflow-hidden border border-slate-700" style={{ minHeight: 320 }} />
      <p className="mt-1 text-[10px] text-slate-500">
        {sv
          ? `${points.length} platser kopplade till temat · © OpenStreetMap`
          : `${points.length} places linked to the theme · © OpenStreetMap`}
      </p>
    </div>
  );
};
