import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Central-place-fingerprint: feature-vektor per centralplats för kvantitativ jämförelse.
export interface CentralPlaceProfile {
  id: string;
  name: string;
  kind: string;               // emporium | cult_central | koping | harbour | region_network | town
  region: string | null;
  country: string | null;
  period_start: number | null;
  period_end: number | null;
  graves_total: number | null;
  graves_excavated: number | null;
  sample_pct: number | null;
  silver_hoards: number | null;
  region_solidi: number | null;
  black_earth_ha: number | null;
  has_harbour: boolean | null;
  has_mint: boolean | null;
  runestones: number | null;
  cult_evidence: string | null;
  imports: string | null;
  successor: string | null;
  sample_note: string | null;
  significance: string | null;
  source: string | null;
  confidence: string | null;
}

export const useCentralPlaceProfiles = () =>
  useQuery({
    queryKey: ['central-place-profiles'],
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as { from: (t: string) => any })
        .from('central_place_profiles')
        .select('*')
        .order('period_start', { ascending: true });
      if (error) throw error;
      return (data ?? []) as CentralPlaceProfile[];
    },
    staleTime: 10 * 60 * 1000,
  });
