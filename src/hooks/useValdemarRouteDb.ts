import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { valdemarsRoute } from '@/utils/valdemarsRoute';
import type { RoutePoint } from '@/utils/routes/types';

// Valdemars segelled ur DB (valdemar_route_points, ordnad via seq) — ersätter hårdkodad rutt.
interface Row {
  id: string; seq: number | null; name: string | null; lat: number | null; lng: number | null;
  is_lotstation: boolean | null; is_major_waypoint: boolean | null; section: string | null; description: string | null;
}
const toPoint = (r: Row): RoutePoint => ({
  id: r.id, name: r.name ?? '', coordinates: { lat: r.lat ?? 0, lng: r.lng ?? 0 },
  description: r.description ?? undefined, section: r.section ?? undefined,
  isLotstation: r.is_lotstation ?? undefined, isMajorWaypoint: r.is_major_waypoint ?? undefined,
});

export const useValdemarRouteDb = () => {
  const q = useQuery({
    queryKey: ['valdemar-route-db'],
    queryFn: async (): Promise<RoutePoint[]> => {
      const { data, error } = await supabase.from('valdemar_route_points').select('*').order('seq', { ascending: true });
      if (error || !data || data.length === 0) return valdemarsRoute();
      return (data as Row[]).map(toPoint);
    },
    staleTime: 30 * 60 * 1000,
  });
  return { ...q, data: q.data ?? valdemarsRoute() };
};
