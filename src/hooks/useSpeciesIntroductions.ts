import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Art-/innovationsintroduktioner för tidslinjen. Datering = fyndets/proxyns, ofta
// hypotes — uncertainty + confidence bevaras.
export interface SpeciesIntro {
  id: string;
  entity: string;
  category: string | null;
  proxy_type: string;
  site_name: string | null;
  region: string | null;
  landscape: string | null;
  lat: number | null;
  lng: number | null;
  date_text: string | null;
  date_from: number | null;
  date_to: number | null;
  uncertainty: string | null;
  confidence: string;
  source: string;
  note: string | null;
}

export const useSpeciesIntroductions = () =>
  useQuery({
    queryKey: ['species-introductions'],
    queryFn: async (): Promise<SpeciesIntro[]> => {
      const { data, error } = await (supabase as any)
        .from('species_introductions')
        .select('id,entity,category,proxy_type,site_name,region,landscape,lat,lng,date_text,date_from,date_to,uncertainty,confidence,source,note')
        .order('date_from', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as SpeciesIntro[];
    },
    staleTime: 10 * 60 * 1000,
  });
