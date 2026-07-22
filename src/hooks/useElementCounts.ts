import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hur ofta varje namnled förekommer i ortnamnsregistret (OSM-gazetteern + kurerat).
// Källa: RPC placename_element_counts.
export interface ElementCount { element_key: string; n_osm: number; n_curated: number }

const sb = supabase as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }> };

export const useElementCounts = () =>
  useQuery({
    queryKey: ['placename-element-counts'],
    queryFn: async (): Promise<Record<string, ElementCount>> => {
      const { data, error } = await sb.rpc('placename_element_counts');
      if (error) throw error;
      const out: Record<string, ElementCount> = {};
      ((data ?? []) as ElementCount[]).forEach((r) => { out[r.element_key] = r; });
      return out;
    },
    staleTime: 30 * 60 * 1000,
  });
