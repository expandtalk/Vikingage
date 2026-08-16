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
 * Hela den geopositionerade runinskriftskorpusen (~7 400).
 * Normalisering av signum-serie sker server-side (RPC runestone_browser).
 * Fasettering/filtrering görs klient-sida för direkt respons (ingen round-trip per klick).
 *
 * PAGINERING: PostgREST kapar VARJE svar vid projektets `db-max-rows` (~2000 hos oss) OAVSETT
 * hur många rader funktionen returnerar (7 396) → ett enda anrop gav bara 2000 och resten
 * försvann tyst. Vi loopar därför i sidor. RPC:n saknar egen ORDER BY, så vi tvingar en
 * deterministisk ordning med `.order('id')` (annars kan rader hoppa/dubbleras mellan sidor).
 */
const PAGE = 1000; // ≤ db-max-rows i alla miljöer; ~8 anrop för hela korpusen (cachas 30 min)

export function useRunestoneBrowser() {
  return useQuery({
    queryKey: ['runestone-browser'],
    staleTime: 1000 * 60 * 30,
    queryFn: async (): Promise<BrowserStone[]> => {
      const all: BrowserStone[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await (supabase as any)
          .rpc('runestone_browser')
          .order('id', { ascending: true })
          .range(from, from + PAGE - 1);
        if (error) throw error;
        const rows = (data ?? []) as BrowserStone[];
        all.push(...rows);
        if (rows.length < PAGE) break; // sista (ofullständiga) sidan → klart
      }
      return all;
    },
  });
}
