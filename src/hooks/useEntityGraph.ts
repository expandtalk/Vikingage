import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** En träff från search_v1 (federerad rankad sök). */
export interface SearchHit {
  entity_type: string;
  entity_id: string;
  signum: string | null;
  label: string;
  sublabel: string | null;
  snippet: string | null;
  score: number;
}

export interface EntityNode {
  id: string;
  type: string;
  label: string;
}

/** En kant ur get_entity_v1 (grafgrannskapet). */
export interface EntityEdge {
  target?: EntityNode;
  source?: EntityNode;
  label_sv: string;
  predicate: string;
  confidence: string | null;
  qualifiers: Record<string, unknown> | null;
  source_ref: string | null;
}

export interface EntityGraph {
  /** null när id:t inte är en registrerad grafnod (t.ex. socken/plats). */
  entity: EntityNode | null;
  edges_in: EntityEdge[];
  edges_out: EntityEdge[];
}

/** Debounce ett värde (för type-ahead-sök utan att spamma RPC:t). */
export const useDebounced = <T,>(value: T, delayMs = 300): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
};

/** Federerad sök via search_v1. Aktiveras vid >= 2 tecken. */
export const useEntitySearch = (query: string, types?: string[]) => {
  const q = query.trim();
  return useQuery({
    queryKey: ['entity-search', q, types ?? null],
    enabled: q.length >= 2,
    queryFn: async (): Promise<SearchHit[]> => {
      const { data, error } = await supabase.rpc('search_v1', {
        p_q: q,
        p_limit: 20,
        ...(types && types.length ? { p_types: types } : {}),
      });
      if (error) throw error;
      return (data ?? []) as SearchHit[];
    },
  });
};

/** Full entitet + grafgrannskap via get_entity_v1. */
export const useEntityGraph = (id: string | null) =>
  useQuery({
    queryKey: ['entity-graph', id],
    enabled: !!id,
    queryFn: async (): Promise<EntityGraph | null> => {
      const { data, error } = await supabase.rpc('get_entity_v1', { p_id: id });
      if (error) throw error;
      return (data as unknown as EntityGraph) ?? null;
    },
  });
