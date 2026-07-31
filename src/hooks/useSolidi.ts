import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Individuella romerska/bysantinska solidi (SHM CC BY + Fischer). Fyndplats sockennivå/by.
export interface Solidus {
  id: string;
  ruler: string | null;
  parish: string | null;
  find_place: string | null;
  landscape: string | null;
  coordinates: unknown;
  source: string | null;
}

export const useSolidi = () =>
  useQuery({
    queryKey: ['solidi'],
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as { from: (t: string) => any })
        .from('solidi')
        .select('id,ruler,parish,find_place,landscape,coordinates,source')
        .limit(3000);
      if (error) throw error;
      return (data ?? []) as Solidus[];
    },
  });
