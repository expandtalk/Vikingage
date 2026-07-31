import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlaceNameRow {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  element_keys: string[] | null;
  element_category: string | null;
  feature_type: string | null;
  province: string | null;
  earliest_attestation_year: number | null;
  attested_form: string | null;
  attestation_source: string | null;
  source: string | null;
  source_license: string | null;
  attribution: string | null;
  name_authority: string | null;   // osm | wikidata | lantmateriet
  normed_name: string | null;       // auktoritetens (LM/Wikidata) form; gällande när authority <> osm
}

// Alla ortnamn (place_names). Referensdataset (~495 st), cache:as länge.
export const usePlaceNamesData = () =>
  useQuery({
    queryKey: ['place-names-all'],
    queryFn: async (): Promise<PlaceNameRow[]> => {
      const { data, error } = await (supabase as any)
        .from('place_names')
        .select(
          'id,name,lat,lng,element_keys,element_category,feature_type,province,earliest_attestation_year,attested_form,attestation_source,source,source_license,attribution,name_authority,normed_name',
        )
        // Sidan visar det kurerade urvalet (metod-showcase). OSM-gazetteern (~42k)
        // är analysunderlag och skulle spränga klient-listan; den nås via RPC:er.
        .neq('source', 'osm')
        .order('name', { ascending: true });
      if (error) throw error;
      // God ortnamnssed: visa den normerade (LM/Wikidata) formen som gällande namn när sådan finns.
      return ((data ?? []) as PlaceNameRow[]).map((r) => (
        r.normed_name && r.name_authority && r.name_authority !== 'osm' ? { ...r, name: r.normed_name } : r
      ));
    },
    staleTime: 10 * 60 * 1000,
  });
