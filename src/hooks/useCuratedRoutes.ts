import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Kurerade rutter för bil-lägets väljare (curated_routes-RPC). Bara rutter med >=2 användbara
// waypoints listas — annars kan ingen linje byggas. INGEN gissad geometri: allt ur DB.
export interface CuratedRoute {
  id: string; name: string; name_en: string | null; road_type: string | null;
  importance_level: string | null; waypoint_count: number; length_km: number | null;
}

const sb = supabase as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }> };

export const useCuratedRoutes = () =>
  useQuery<CuratedRoute[]>({
    queryKey: ['curated-routes'],
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await sb.rpc('curated_routes');
      if (error) throw error;
      return (data ?? []) as CuratedRoute[];
    },
  });
