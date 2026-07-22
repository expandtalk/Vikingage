import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// De äldsta DATERADE bebyggelsenamnen (Vikstrand 2013, Järnålderns bebyggelsenamn).
// Dateringen är fyndplatsens (boplats/gravfält) och en HYPOTES om namnets ålder —
// inte en objektiv mätpunkt. uncertainty='hög' där Vikstrand satt frågetecken.
export interface NameDating {
  id: string;
  name: string;
  socken: string | null;
  landscape: string | null;
  name_type: string | null;
  dating_text: string | null;
  dating_basis: string | null;
  uncertainty: string | null;
  page: number | null;
  source: string;
  note: string | null;
  lat: number | null;
  lng: number | null;
}

// Grov sorteringsnyckel: äldsta epok-ordet i dateringstexten → ungefärligt startår.
// Bara för att ordna listan äldst först; visas aldrig som exakt årtal.
const ERA_YEARS: Array<[RegExp, number]> = [
  [/bronsålder/i, -1100],
  [/förromersk/i, -500],
  [/äldre järnålder/i, -300],
  [/romersk/i, 1],
  [/folkvandring/i, 400],
  [/vendel/i, 550],
  [/vikingatid/i, 800],
  [/järnålder/i, -100], // generisk järnålder om inget mer specifikt
];
export const eraSortYear = (text: string | null): number => {
  if (!text) return 9999;
  for (const [re, y] of ERA_YEARS) if (re.test(text)) return y;
  return 9999;
};

export const useNameDatings = () =>
  useQuery({
    queryKey: ['name-datings'],
    queryFn: async (): Promise<NameDating[]> => {
      const { data, error } = await (supabase as any)
        .from('name_datings')
        .select(
          'id,name,socken,landscape,name_type,dating_text,dating_basis,uncertainty,page,source,note, place_names(lat,lng)',
        );
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({
        id: r.id, name: r.name, socken: r.socken, landscape: r.landscape,
        name_type: r.name_type, dating_text: r.dating_text, dating_basis: r.dating_basis,
        uncertainty: r.uncertainty, page: r.page, source: r.source, note: r.note,
        lat: r.place_names?.lat ?? null, lng: r.place_names?.lng ?? null,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });
