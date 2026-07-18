import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RoyalRelation } from './types';

/**
 * Relationer (äktenskap/förälder/fostran/exil/tjänst/fadderskap/dråp) för en person.
 * royal_relations är litet (~40 rader) → hämta allt och filtrera i klienten, så
 * slipper vi PostgREST-.or()-escaping för namn med parenteser ("Erik Magnusson (hertig)").
 */
export const useKingRelations = (personName?: string) => {
  return useQuery({
    queryKey: ['king-relations', personName],
    queryFn: async (): Promise<RoyalRelation[]> => {
      if (!personName) return [];
      // royal_relations finns ännu ej i genererade Supabase-typer (jfr explore_profiles)
      // → casta genom any tills types.ts regenereras.
      const { data, error } = await (supabase as any).from('royal_relations').select('*');
      if (error) throw error;
      const name = personName.toLowerCase();
      return (data as RoyalRelation[]).filter(
        (r) => r.person_a.toLowerCase() === name || r.person_b.toLowerCase() === name,
      );
    },
    enabled: !!personName,
    staleTime: 5 * 60 * 1000,
  });
};
