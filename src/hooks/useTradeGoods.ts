import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Handelsvaror (trade_goods): export/import med evidensnot. Driver "export → silver"-mekanismen.
export interface TradeGood {
  slug: string;
  name: string;
  name_en: string | null;
  commodity_class: string | null;   // människa | päls | järn | ädelmetall | lyxvara | råvara | redskap
  direction: string | null;          // export | import
  era_from: number | null;
  era_to: number | null;
  evidence_note: string | null;
}

export const useTradeGoods = () =>
  useQuery({
    queryKey: ['trade-goods'],
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as { from: (t: string) => any })
        .from('trade_goods')
        .select('slug,name,name_en,commodity_class,direction,era_from,era_to,evidence_note')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as TradeGood[];
    },
    staleTime: 10 * 60 * 1000,
  });
