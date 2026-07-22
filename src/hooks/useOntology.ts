import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Läser ontologins katalogtabeller (det agenter/forskare läser) för /ontologi-sidan.
const sb = supabase as any;

export interface OntologyData {
  types: any[]; predicates: any[]; measures: any[]; methods: any[]; references: any[];
}

export const useOntology = () =>
  useQuery({
    queryKey: ['ontology-catalog'],
    queryFn: async (): Promise<OntologyData> => {
      const [types, predicates, measures, methods, references] = await Promise.all([
        sb.from('ontology_entity_types').select('*').order('code'),
        sb.from('rel_predicates').select('*').order('code'),
        sb.from('ontology_measures').select('*').order('code'),
        sb.from('dating_methods').select('*').order('code'),
        sb.from('scientific_references').select('*').order('year', { ascending: false }),
      ]);
      return {
        types: types.data ?? [], predicates: predicates.data ?? [], measures: measures.data ?? [],
        methods: methods.data ?? [], references: references.data ?? [],
      };
    },
    staleTime: 30 * 60 * 1000,
  });
