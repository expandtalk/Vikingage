import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Nearby-rank: avstånd + signifikans + graf-auktoritet + typ-mättnad → score + läsbar rank_reason.
export interface RankedFeature {
  feature_type: string;
  feature_id: string;
  label: string;
  lat: number;
  lng: number;
  distance_km: number;
  significance: number;
  authority: number;
  score: number;
  rank_reason: string;
}

export const useNearbyRanked = (lat: number | null | undefined, lng: number | null | undefined, radiusKm: number) =>
  useQuery({
    queryKey: ['nearby-ranked', lat, lng, radiusKm],
    enabled: lat != null && lng != null,
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as { rpc: (fn: string, a?: unknown) => any })
        .rpc('nearby_features_ranked', { p_lat: lat, p_lng: lng, p_radius_km: radiusKm, p_limit: 120 });
      if (error) throw error;
      return (data ?? []) as RankedFeature[];
    },
    staleTime: 60 * 1000,
  });
