import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Centralortsprojektet Ångermanland: tre centralorter (central_places) och deras
// ortnamnskluster (central_place_names). Publik läsning via RLS. Koordinater är
// ännu NULL — datan är textuell tills namnen geokodats mot auktoritativ källa.
export interface CentralPlace {
  id: string;
  name: string;
  region: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  confidence: string | null;
  source: string | null;
}
export interface CentralPlaceName {
  id: string;
  central_place_id: string;
  name: string;
  attested_form: string | null;
  attested_year: number | null;
  element_keys: string[] | null;
  category: string | null;
  evidence_tier: string | null;
  interpretation: string | null;
  lat: number | null;
  lng: number | null;
}
export interface CentralPlaceGroup extends CentralPlace {
  names: CentralPlaceName[];
}

export const useCentralPlaces = () =>
  useQuery({
    queryKey: ['central-places'],
    queryFn: async (): Promise<CentralPlaceGroup[]> => {
      const sb = supabase as unknown as {
        from: (t: string) => { select: (c: string) => { order?: unknown } & Promise<{ data: unknown; error: unknown }> };
      };
      const [placesRes, namesRes] = await Promise.all([
        (sb.from('central_places').select('id,name,region,description,lat,lng,confidence,source') as unknown as Promise<{ data: CentralPlace[]; error: unknown }>),
        (sb.from('central_place_names').select('id,central_place_id,name,attested_form,attested_year,element_keys,category,evidence_tier,interpretation,lat,lng') as unknown as Promise<{ data: CentralPlaceName[]; error: unknown }>),
      ]);
      if (placesRes.error) throw placesRes.error;
      if (namesRes.error) throw namesRes.error;
      const places = placesRes.data ?? [];
      const names = namesRes.data ?? [];
      return places.map((p) => ({ ...p, names: names.filter((n) => n.central_place_id === p.id) }));
    },
    staleTime: 10 * 60 * 1000,
  });
