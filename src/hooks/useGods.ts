import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Gudar ur DB (gods-tabellen, 16 st) — ersätter den hårdkodade listan i GodCardsGrid.
export interface God {
  id: string;
  name: string;
  name_old_norse: string | null;
  category: string | null;      // aesir | vanir | giant | other
  domain: string[] | null;
  description: string | null;
  symbols: string[] | null;
  wikidata_id: string | null;
}

export const useGods = () =>
  useQuery({
    queryKey: ['gods'],
    queryFn: async (): Promise<God[]> => {
      const { data, error } = await supabase.from('gods').select('*').order('name');
      if (error) throw error;
      return (data ?? []) as God[];
    },
    staleTime: 30 * 60 * 1000,
  });
