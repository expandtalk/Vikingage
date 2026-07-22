import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Steg 2b: fri hypotesprövning. Medianavstånd för testmängd vs baslinje (ortnamnsled)
// till närmaste mål (kyrka/fornborg/kulturlager/runsten). Koordinat = OSM-punkt (ej cirkulärt).
export interface FreeStat {
  grp: 'test' | 'baseline';
  n: number; q1: number; median: number; q3: number; p90: number; mean: number;
}
const sb = supabase as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }> };

export const useFreeDistanceStats = (test: string[], baseline: string[], target: string) =>
  useQuery({
    queryKey: ['free-distance-stats', [...test].sort(), [...baseline].sort(), target],
    queryFn: async (): Promise<FreeStat[]> => {
      const { data, error } = await sb.rpc('distance_stats', { p_test: test, p_baseline: baseline, p_target: target });
      if (error) throw error;
      return (data ?? []) as FreeStat[];
    },
    enabled: test.length > 0 && baseline.length > 0,
    staleTime: 10 * 60 * 1000,
  });
