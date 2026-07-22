import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RunicTheophoricSummary {
  total_with_translit: number;
  thor_names: number;
  odin_names: number;
  frey: number;
  thor_vigi: { signum: string; text: string }[];
}

// Teofora/kultiska led i runinskrifternas translittereringar (server-RPC, boundary-medveten).
export const useRunicTheophoricSummary = () =>
  useQuery({
    queryKey: ['runic-theophoric-summary'],
    queryFn: async (): Promise<RunicTheophoricSummary | null> => {
      const { data, error } = await (supabase as any).rpc('runic_theophoric_summary');
      if (error) throw error;
      return (data ?? null) as RunicTheophoricSummary | null;
    },
    staleTime: 30 * 60 * 1000,
  });
