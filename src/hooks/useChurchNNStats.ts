import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Avstånd mellan kyrkorna: varje kyrkas avstånd till närmaste andra kyrka (ecclesiastical_sites),
// som fördelning. Visar hur tätt sockenkyrkorna ligger i landskapet.
export interface ChurchNN { n: number; q1: number; median: number; q3: number; p90: number; mean: number; min_m: number; }
const sb = supabase as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }> };

export const useChurchNNStats = () =>
  useQuery({
    queryKey: ['church-nn-stats'],
    queryFn: async (): Promise<ChurchNN | null> => {
      const { data, error } = await sb.rpc('church_nn_stats');
      if (error) throw error;
      return ((data ?? [])[0] ?? null) as ChurchNN | null;
    },
    staleTime: 30 * 60 * 1000,
  });
