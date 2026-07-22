import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GERMANIC_TIME_PERIODS, type GermanicTimelinePeriod } from '@/utils/germanicTimeline/periods';

// Germansk tidslinje ur DB (germanic_periods). Hela objektet ligger i detail-jsonb, så
// raden mappas rakt av. Fallback på hårdkodad GERMANIC_TIME_PERIODS. Ordnas på start_year.
interface Row { start_year: number | null; detail: GermanicTimelinePeriod }

export const useGermanicPeriodsDb = () => {
  const q = useQuery({
    queryKey: ['germanic-periods-db'],
    queryFn: async (): Promise<GermanicTimelinePeriod[]> => {
      const { data, error } = await supabase.from('germanic_periods').select('start_year, detail').order('start_year', { ascending: true });
      if (error || !data || data.length === 0) return GERMANIC_TIME_PERIODS;
      return (data as Row[]).map((r) => r.detail).filter(Boolean);
    },
    staleTime: 30 * 60 * 1000,
  });
  return { ...q, data: q.data ?? GERMANIC_TIME_PERIODS };
};
