import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CarverAttribute } from '@/config/carverAttributes';

// carver_attributes är en ny tabell (ej i genererade supabase-typer ännu) → any-vy.
export const useCarverAttributes = (carverId?: string) =>
  useQuery({
    queryKey: ['carver-attributes', carverId],
    enabled: !!carverId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('carver_attributes')
        .select('*')
        .eq('carver_id', carverId)
        .order('attribute_type');
      if (error) throw error;
      return (data ?? []) as CarverAttribute[];
    },
  });
