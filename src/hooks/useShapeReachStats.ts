import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Räckviddstest: antal målobjekt (kyrka/fornborg/…) inom en form (cirkel/fyrkant/hexagon)
// av given radie kring varje ortnamn, median per grupp. Radien uttrycks som en dagsresa.
export interface ReachStat {
  grp: 'test' | 'baseline';
  n: number; median_cnt: number; mean_cnt: number; p90_cnt: number;
}
const sb = supabase as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }> };

export const useShapeReachStats = (test: string[], baseline: string[], target: string, shape: string, radiusKm: number, enabled: boolean) =>
  useQuery({
    queryKey: ['shape-reach', [...test].sort(), [...baseline].sort(), target, shape, radiusKm],
    queryFn: async (): Promise<ReachStat[]> => {
      const { data, error } = await sb.rpc('shape_reach_stats', {
        p_test: test, p_baseline: baseline, p_target: target, p_shape: shape, p_radius_km: radiusKm,
      });
      if (error) throw error;
      return (data ?? []) as ReachStat[];
    },
    enabled: enabled && test.length > 0 && baseline.length > 0,
    staleTime: 10 * 60 * 1000,
  });
