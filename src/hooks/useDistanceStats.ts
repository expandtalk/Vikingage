import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Baslinjetest: medianavstånd från ortnamnsgrupp (makt/kontroll/sakralt) till
// närmaste sockenkyrka. Koordinaten är OSM-bebyggelsepunkten (ej kyrkan) → EJ
// cirkulärt. RPC distance_stats_baseline (PostGIS KNN mot ecclesiastical_sites).
export interface DistanceStat {
  grp: 'makt' | 'kontroll' | 'sakralt';
  n: number;
  min_m: number;
  q1: number;
  median: number;
  q3: number;
  p90: number;
  max_m: number;
  mean: number;
}

const sb = supabase as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }> };

export const useDistanceStats = () =>
  useQuery({
    queryKey: ['distance-stats-baseline'],
    queryFn: async (): Promise<DistanceStat[]> => {
      const { data, error } = await sb.rpc('distance_stats_baseline');
      if (error) throw error;
      return (data ?? []) as DistanceStat[];
    },
    staleTime: 30 * 60 * 1000,
  });
