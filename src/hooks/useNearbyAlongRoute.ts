import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AlongRouteFeature } from '@/hooks/useRoadtrip';

// Korridorsökning: "sevärt längs vägen". Skickar rutt-linjen (nedsamplad) till RPC:n
// nearby_along_route, som mäter avstånd till LINJEN (omvägstolerans p_buffer_km), respekterar
// intresse (p_types = påslagna lagertyper) och rankar på signifikans. Samma objekt-union +
// signifikansmodell som nearby_features_ranked, men itinerär-ordnad (frac_along).

// Nedsampla rutten så param-listan hålls rimlig (OSRM-geometrin kan ha hundratals punkter).
// Behåll alltid första + sista + jämnt fördelade mellanpunkter.
const downsample = (coords: [number, number][], max = 150): [number, number][] => {
  if (coords.length <= max) return coords;
  const step = (coords.length - 1) / (max - 1);
  const out: [number, number][] = [];
  for (let i = 0; i < max; i++) out.push(coords[Math.round(i * step)]);
  return out;
};

const sb = supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: any; error: any }> };

export const useNearbyAlongRoute = (
  coords: [number, number][] | null | undefined,
  types: string[] | null,
  bufferKm = 3,
) => {
  const ds = coords && coords.length >= 2 ? downsample(coords) : null;
  const key = ds ? `${ds.length}:${ds[0].join(',')}:${ds[ds.length - 1].join(',')}` : 'none';
  return useQuery<AlongRouteFeature[]>({
    queryKey: ['nearby-along-route', key, (types ?? []).join(','), bufferKm],
    enabled: !!ds,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!ds) return [];
      const { data, error } = await sb.rpc('nearby_along_route', {
        p_lngs: ds.map((c) => c[1]),
        p_lats: ds.map((c) => c[0]),
        p_buffer_km: bufferKm,
        p_limit: 40,
        p_types: types && types.length ? types : null,
        p_season: null,
      });
      if (error) throw error;
      return (data ?? []) as AlongRouteFeature[];
    },
  });
};
