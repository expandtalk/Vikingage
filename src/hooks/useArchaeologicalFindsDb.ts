import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ARCHAEOLOGICAL_FINDS } from '@/utils/archaeologicalFinds';
import type { ArchaeologicalFind } from '@/utils/archaeologicalFinds/types';

// Arkeologiska fynd ur DB (archaeological_finds) — ersätter hårdkodade ARCHAEOLOGICAL_FINDS.
// Fallback på den hårdkodade listan om tabellen är tom/otillgänglig.
interface Row {
  id: string; name: string; name_en: string | null; lat: number | null; lng: number | null;
  period: string | null; culture: string | null; significance: string | null; description: string | null;
  start_year: number | null; end_year: number | null; country: string | null; find_type: string | null;
}
const toFind = (r: Row): ArchaeologicalFind => ({
  id: r.id, name: r.name, nameEn: r.name_en ?? r.name, lat: r.lat ?? 0, lng: r.lng ?? 0,
  period: r.period ?? '', culture: r.culture ?? '', significance: r.significance ?? '',
  description: r.description ?? '', startYear: r.start_year ?? 0, endYear: r.end_year ?? 0,
  country: r.country ?? '', findType: (r.find_type ?? 'artifacts') as ArchaeologicalFind['findType'],
});

export const useArchaeologicalFindsDb = () => {
  const q = useQuery({
    queryKey: ['archaeological-finds-db'],
    queryFn: async (): Promise<ArchaeologicalFind[]> => {
      const { data, error } = await supabase.from('archaeological_finds').select('*');
      if (error || !data || data.length === 0) return ARCHAEOLOGICAL_FINDS;
      return (data as Row[]).map(toFind);
    },
    staleTime: 30 * 60 * 1000,
  });
  return { ...q, data: q.data ?? ARCHAEOLOGICAL_FINDS };
};
