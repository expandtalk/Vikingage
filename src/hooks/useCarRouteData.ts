import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CarRouteFeature } from '@/hooks/useCarRoute';

// Hämtar rutt-linjen (viking_road_line) och objekten längs vägen (features_along_route) för en
// vald kurerad rutt. Buffert i meter styr korridorbredden; p_max_km klipper rutten (default 300 km).

const sb = supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: any; error: any }> };

// GeoJSON LineString ({coordinates:[[lng,lat],...]}) → [lat,lng]-par för Leaflet.
const parseLine = (geojson: string | null | undefined): [number, number][] => {
  if (!geojson) return [];
  try {
    const g = JSON.parse(geojson);
    const coords = g?.coordinates;
    if (!Array.isArray(coords)) return [];
    return coords
      .filter((c: unknown) => Array.isArray(c) && (c as number[]).length >= 2)
      .map((c: number[]) => [c[1], c[0]] as [number, number]);
  } catch { return []; }
};

export const useRouteLine = (roadId: string | null, maxKm = 300) =>
  useQuery<[number, number][]>({
    queryKey: ['viking-road-line', roadId, maxKm],
    enabled: !!roadId,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      if (!roadId) return [];
      const { data, error } = await sb.rpc('viking_road_line', { p_road_id: roadId, p_max_km: maxKm });
      if (error) throw error;
      return parseLine(data?.[0]?.geojson);
    },
  });

export const useRouteFeatures = (
  roadId: string | null,
  bufferM: number,
  maxKm = 300,
  types: string[] | null = null,
) =>
  useQuery<CarRouteFeature[]>({
    queryKey: ['features-along-route', roadId, bufferM, maxKm, (types ?? []).join(',')],
    enabled: !!roadId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!roadId) return [];
      const { data, error } = await sb.rpc('features_along_route', {
        p_road_id: roadId,
        p_buffer_m: Math.round(bufferM),
        p_max_km: maxKm,
        p_types: types && types.length ? types : null,
        p_limit: 800,
      });
      if (error) throw error;
      return (data ?? []) as CarRouteFeature[];
    },
  });
