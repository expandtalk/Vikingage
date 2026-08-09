import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Skattfynd (hoards) — egen tabell (komposition + t.p.q.), skild från coins. Publik läsning via RLS.
export interface Hoard {
  id: string;
  name: string;
  find_place: string | null;
  parish: string | null;
  landscape: string | null;
  coordinates: unknown; // point — parsas i vyn (återanvänd parseCoinCoord)
  deposition_tpq: number | null;
  n_coins: number | null;
  n_ornaments: number | null;
  dominant_metal: string | null;
  numismatic_phase: string | null;
  composition_note: string | null;
  significance: string | null;
  description: string | null;
  sources: string | null;
}

export const useHoards = () =>
  useQuery({
    queryKey: ['hoards'],
    queryFn: async (): Promise<Hoard[]> => {
      // hoards finns ännu ej i genererade Supabase-typer → casta genom any.
      const { data, error } = await (supabase as any)
        .from('hoards')
        .select('*')
        .order('deposition_tpq', { ascending: true, nullsFirst: true });
      if (error) throw error;
      return (data ?? []) as Hoard[];
    },
    staleTime: 5 * 60 * 1000,
  });
