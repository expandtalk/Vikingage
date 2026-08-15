import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Admin-gränser (Lantmäteri "Kommun, län och rike", © Lantmäteriet) som GeoJSON via RPC
// get_admin_boundary_geojson. Återanvändbart över regionsidor och nationellt:
//   codes = ['0885','0840']  → bara dessa (Öland)
//   codes = null             → ALLA på nivån (t.ex. alla 290 kommuner) — använd simplify då.
// Indelningen är statisk → hög staleTime. geojson parsas till objekt; centroid för kartcentrering.
export interface AdminBoundary {
  code: string;
  name: string;
  geojson: any; // GeoJSON MultiPolygon/Polygon (parsat)
  clat: number;
  clng: number;
}

export const useAdminBoundary = (level: string, codes: string[] | null, simplify = 0) =>
  useQuery({
    queryKey: ['admin-boundary', level, codes ? [...codes].sort().join(',') : 'ALL', simplify],
    enabled: codes === null || codes.length > 0,
    staleTime: 1000 * 60 * 60, // gränser ändras sällan
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as { rpc: (fn: string, args?: any) => any })
        .rpc('get_admin_boundary_geojson', { p_level: level, p_codes: codes, p_simplify: simplify });
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({
        code: r.code,
        name: r.name,
        clat: r.clat,
        clng: r.clng,
        geojson: typeof r.geojson === 'string' ? JSON.parse(r.geojson) : r.geojson,
      })) as AdminBoundary[];
    },
  });
