import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VIKING_REGIONS } from '@/utils/vikingRegions/vikingRegionData';
import type { VikingRegion } from '@/utils/vikingRegions/types';

// Vikingaregioner/handelsplatser ur DB (viking_regions) — ersätter hårdkodade VIKING_REGIONS.
interface Row {
  id: string; viking_name: string; modern_name: string | null; lat: number | null; lng: number | null;
  description: string | null; category: string | null; timeperiod: string | null; type: string | null;
}
const toRegion = (r: Row): VikingRegion => ({
  lat: r.lat ?? 0, lng: r.lng ?? 0, vikingName: r.viking_name, modernName: r.modern_name ?? '',
  description: r.description ?? '', category: (r.category ?? 'other') as VikingRegion['category'],
  timeperiod: (r.timeperiod ?? 'all_viking') as VikingRegion['timeperiod'],
  type: (r.type ?? undefined) as VikingRegion['type'],
});

export const useVikingRegionsDb = () => {
  const q = useQuery({
    queryKey: ['viking-regions-db'],
    queryFn: async (): Promise<VikingRegion[]> => {
      const { data, error } = await supabase.from('viking_regions').select('*');
      if (error || !data || data.length === 0) return VIKING_REGIONS;
      return (data as Row[]).map(toRegion);
    },
    staleTime: 30 * 60 * 1000,
  });
  return { ...q, data: q.data ?? VIKING_REGIONS };
};
