import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BrowserStone {
  id: string;
  signum: string;
  series: string | null;
  lat: number;
  lng: number;
  style_group: string | null;
  object_category: string | null;
  has_cross: boolean | null;
  period_start: number | null;
  dating_text: string | null;
}

/**
 * Hela den geopositionerade runinskriftskorpusen (~7 400) i ett lean-anrop.
 * Normalisering av signum-serie sker server-side (RPC runestone_browser).
 * Fasettering/filtrering görs klient-sida för direkt respons (ingen round-trip per klick).
 */
export function useRunestoneBrowser() {
  return useQuery({
    queryKey: ['runestone-browser'],
    staleTime: 1000 * 60 * 30,
    queryFn: async (): Promise<BrowserStone[]> => {
      const { data, error } = await (supabase as any).rpc('runestone_browser');
      if (error) throw error;
      return (data ?? []) as BrowserStone[];
    },
  });
}
