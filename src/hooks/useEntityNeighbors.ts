import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mapNeighbor, type NeighborRow, type NeighborDestination } from '@/config/entityDestinations';

export type { NeighborRow, NeighborDestination } from '@/config/entityDestinations';

const sb = supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> };

// Hämtar en entitets graf-grannar via graph_neighborhood och mappar dem till destinationer.
export function useEntityNeighbors(entityId: string | null) {
  const q = useQuery({
    queryKey: ['entity-neighbors', entityId],
    enabled: !!entityId,
    queryFn: async (): Promise<NeighborDestination[]> => {
      const { data, error } = await sb.rpc('graph_neighborhood', { p_id: entityId });
      if (error || !Array.isArray(data)) return [];
      return (data as NeighborRow[]).map(mapNeighbor).filter((x): x is NeighborDestination => x !== null);
    },
  });
  return { data: q.data ?? [], isLoading: q.isLoading };
}
