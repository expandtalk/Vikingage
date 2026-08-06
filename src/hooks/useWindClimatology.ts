import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Vindklimatologi (SMHI) per plats → vindros. 8 sektorer, andel per riktning vinden kommer från.
export interface WindSector {
  sector: string;
  sector_deg: number;
  frequency_pct: number;
  station: string | null;
  period_from: string | null;
  period_to: string | null;
  source: string | null;
}

export const useWindClimatology = (location = 'Kalmarsund') =>
  useQuery({
    queryKey: ['wind-climatology', location],
    queryFn: async (): Promise<WindSector[]> => {
      const { data, error } = await (supabase as any)
        .from('wind_climatology')
        .select('sector, sector_deg, frequency_pct, station, period_from, period_to, source')
        .eq('location', location)
        .order('sector_deg');
      if (error) throw error;
      return (data ?? []) as WindSector[];
    },
    staleTime: 60 * 60 * 1000,
  });
