import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Osteologiska individer (genetic_individuals) kopplade till en regent via king_id.
// Visar skelett-/gravdata på kung-kortet när kungen har en identifierad grav.
export interface KingOsteology {
  id: string;
  individual_label: string | null;
  archaeological_sex: string | null;
  age: string | null;
  stature_cm: number | null;
  pathology: string | null;
  dental_status: string | null;
  grave_number: string | null;
  burial_context: string | null;
  source: string | null;
  site_name: string | null;
}

export const useKingOsteology = (kingId?: string) =>
  useQuery({
    queryKey: ['king-osteology', kingId],
    enabled: !!kingId,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<KingOsteology[]> => {
      // Cast: types.ts ännu ej regenererad med de nya kolumnerna (stature_cm/king_id m.fl.).
      const sb = supabase as unknown as {
        from: (t: string) => {
          select: (s: string) => { eq: (c: string, v: string) => Promise<{ data: any[] | null; error: any }> };
        };
      };
      const { data, error } = await sb
        .from('genetic_individuals')
        .select('id, individual_label, archaeological_sex, age, stature_cm, pathology, dental_status, grave_number, burial_context, source, site:site_id(name)')
        .eq('king_id', kingId!);
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        individual_label: r.individual_label ?? null,
        archaeological_sex: r.archaeological_sex ?? null,
        age: r.age ?? null,
        stature_cm: r.stature_cm ?? null,
        pathology: r.pathology ?? null,
        dental_status: r.dental_status ?? null,
        grave_number: r.grave_number ?? null,
        burial_context: r.burial_context ?? null,
        source: r.source ?? null,
        site_name: r.site?.name ?? null,
      }));
    },
  });
