import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EntityFacet {
  facet_key: string;
  label_sv: string;
  label_en: string;
  destination: string;
  is_external: boolean;
  icon: string | null;
  prior_weight: number;
}

const sb = supabase as unknown as {
  from: (t: string) => {
    select: (c: string) => {
      eq: (c: string, v: string) => { eq: (c: string, v: string) => { order: (c: string, o: { ascending: boolean }) => Promise<{ data: unknown; error: unknown }> } };
    };
  };
};

// Kurerade "bryt-i-val"-facetter för en entitet (entity_facets). Komplement till KG-grannarna
// (useEntityNeighbors) — används när grafen är tunn eller när vi vill styra ordningen manuellt.
export function useEntityFacets(entityType: string | null, entityId: string | null) {
  const q = useQuery({
    queryKey: ['entity-facets', entityType, entityId],
    enabled: !!entityType && !!entityId,
    queryFn: async (): Promise<EntityFacet[]> => {
      const { data, error } = await sb
        .from('entity_facets')
        .select('facet_key,label_sv,label_en,destination,is_external,icon,prior_weight')
        .eq('entity_type', entityType as string)
        .eq('entity_id', entityId as string)
        .order('prior_weight', { ascending: false });
      if (error || !Array.isArray(data)) return [];
      return data as EntityFacet[];
    },
  });
  return { data: q.data ?? [], isLoading: q.isLoading };
}
