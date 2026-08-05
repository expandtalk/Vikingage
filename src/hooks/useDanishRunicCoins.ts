import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Danska runmynt + guldbrakteater ur runic_inscriptions (ligger EJ i coins-tabellen).
// Rättigheter: signum/translitteration/översättning kommer från Rundata (ODbL) — fria att visa.
// Runer.ku.dk:s översättningar visas ALDRIG (licens obelagt fri).
export interface RunicCoin {
  id: string;
  signum: string;
  name: string | null;
  transliteration: string | null;
  translation_en: string | null;
  translation_sv: string | null;
  dating_text: string | null;
  period_start: number | null;
  period_end: number | null;
  object_type: string | null;
  material: string | null;
  parish: string | null;
  province: string | null;
  rundata_image_url: string | null;
}

export const useDanishRunicCoins = () =>
  useQuery({
    queryKey: ['danish-runic-coins'],
    queryFn: async (): Promise<RunicCoin[]> => {
      const { data, error } = await (supabase as any)
        .from('runic_inscriptions')
        .select(
          'id,signum,name,transliteration,translation_en,translation_sv,dating_text,period_start,period_end,object_type,material,parish,province,rundata_image_url',
        )
        .eq('country', 'Denmark')
        .or('object_type.ilike.*mynt*,object_type.ilike.*brakteat*')
        .order('object_type', { ascending: true })
        .order('signum', { ascending: true });
      if (error) throw error;
      return (data ?? []) as RunicCoin[];
    },
    staleTime: 5 * 60 * 1000,
  });
