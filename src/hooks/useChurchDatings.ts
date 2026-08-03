import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Byggnadshistorik per kyrka ur church_datings (BBR-ingest). Länkas antingen via church_id
// (ecclesiastical_sites, exakt) eller via church_name (för det kurerade christian_sites-lagret
// som saknar ecclesiastical-id). Sorteras kronologiskt.
export interface ChurchDating {
  id: string;
  church_id: string;
  church_name: string | null;
  event_label: string;
  event_type: string | null;
  building_part: string | null;
  year_from: number | null;
  year_to: number | null;
  architect: string | null;
  source_uri: string | null;
  bbr_id: string | null;
}

export interface ChurchDatingRef {
  churchId?: string;
  churchName?: string;
}

const sb = supabase as unknown as {
  from: (t: string) => {
    select: (c: string) => {
      order: (c: string, o: { ascending: boolean; nullsFirst: boolean }) => {
        eq: (c: string, v: string) => Promise<{ data: unknown; error: unknown }>;
        ilike: (c: string, v: string) => Promise<{ data: unknown; error: unknown }>;
      };
    };
  };
};

export const useChurchDatings = (ref: ChurchDatingRef | null) => {
  return useQuery({
    queryKey: ['church-datings', ref?.churchId ?? null, ref?.churchName ?? null],
    enabled: !!(ref?.churchId || ref?.churchName),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ChurchDating[]> => {
      const base = sb.from('church_datings')
        .select('id,church_id,church_name,event_label,event_type,building_part,year_from,year_to,architect,source_uri,bbr_id')
        .order('year_from', { ascending: true, nullsFirst: false });
      const { data, error } = ref?.churchId
        ? await base.eq('church_id', ref.churchId)
        : await base.ilike('church_name', ref!.churchName!);
      if (error) throw error;
      return (data as ChurchDating[]) ?? [];
    },
  });
};
