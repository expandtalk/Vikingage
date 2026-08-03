import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Live korpus-siffror till runsidan (RPC runic_atlas_stats). count_runestones() = sanningskälla.
export interface RunicCorpusStats {
  runestones: number;
  inscriptions: number;
  with_coords: number;
  by_landscape: { landscape: string; c: number }[];
  by_country: { country: string; c: number }[];
}

const sb = supabase as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }> };

export const useRunicCorpusStats = () =>
  useQuery<RunicCorpusStats | null>({
    queryKey: ['runic-atlas-stats'],
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await sb.rpc('runic_atlas_stats');
      if (error) throw error;
      return (data ?? null) as RunicCorpusStats | null;
    },
  });
