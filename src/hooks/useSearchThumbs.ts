import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Batchad tumnagel-hämtning för sökträffar (idag: runinskrifter via search_thumbs-RPC).
// EN RPC för alla synliga inskriftsträffar → en liten bild per rad utan N+1-frågor.
// Returnerar en Map<entity_id, url>; saknas bild → ingen nyckel (raden faller till ikon).
const sb = supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => any };

export const useSearchThumbs = (ids: string[]) => {
  // Stabil nyckel: sorterad, unik. Tom lista → hoppa frågan.
  const key = Array.from(new Set(ids)).sort();
  return useQuery({
    queryKey: ['search-thumbs', key],
    enabled: key.length > 0,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await sb.rpc('search_thumbs', { p_ids: key });
      if (error || !Array.isArray(data)) return {};
      const map: Record<string, string> = {};
      for (const row of data as { entity_id: string; thumb_url: string }[]) {
        if (row.entity_id && row.thumb_url) map[row.entity_id] = row.thumb_url;
      }
      return map;
    },
  });
};
