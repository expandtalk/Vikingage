import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Guld (solidi) per Ölands-borgs Voronoi-territorium. Hypotesgenererande — se RPC-kommentar.
export interface FortGold {
  fort_name: string;
  dated: boolean;
  solidi_count: number;
  gold_grams: number;
  geojson: string;
}

export const useGoldPerFortTerritory = () =>
  useQuery({
    queryKey: ['gold_per_fort_territory'],
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as { rpc: (fn: string, a?: unknown) => any })
        .rpc('gold_per_fort_territory');
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({
        fort_name: r.fort_name,
        dated: !!r.dated,
        solidi_count: Number(r.solidi_count) || 0,
        gold_grams: Number(r.gold_grams) || 0,
        geojson: r.geojson,
      })) as FortGold[];
    },
  });
