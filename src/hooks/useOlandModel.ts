import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Öland-modellen: samlad vy (v_oland_model, migration 20260728250000) med runstenar,
// fornborgar, Frö-namn, guld-/silverfynd och kyrkor på Öland — rena lat/lng per punkt.
export interface OlandPoint {
  kind: 'runestone' | 'church' | 'hillfort' | 'fro_name' | 'find' | string;
  name: string;
  lat: number;
  lng: number;
  note: string | null;
}

export const useOlandModel = () =>
  useQuery({
    queryKey: ['oland-model'],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<OlandPoint[]> => {
      const sb = supabase as unknown as {
        from: (t: string) => { select: (c: string) => Promise<{ data: OlandPoint[] | null; error: unknown }> };
      };
      const { data, error } = await sb.from('v_oland_model').select('kind,name,lat,lng,note');
      if (error) throw error;
      return (data ?? []).filter((p) => p.lat != null && p.lng != null);
    },
  });
