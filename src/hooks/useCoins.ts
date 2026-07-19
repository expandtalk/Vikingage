import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Coin {
  id: string;
  name: string;
  name_en: string | null;
  category: string; // nordic_royal | roman_solidus | hoard | imitation | runmynt
  issuer: string | null;
  issuer_king_id: string | null;
  mint: string | null;
  metal: string | null;
  denomination: string | null;
  period_start: number | null;
  period_end: number | null;
  obverse: string | null;
  reverse: string | null;
  find_place: string | null;
  coordinates: unknown; // point — parsas i vyn
  significance: string | null;
  description: string | null;
  description_en: string | null;
  sources: string | null;
}

export const useCoins = () =>
  useQuery({
    queryKey: ['coins'],
    queryFn: async (): Promise<Coin[]> => {
      // coins finns ännu ej i genererade Supabase-typer → casta genom any.
      const { data, error } = await (supabase as any)
        .from('coins')
        .select('*')
        .order('period_start', { ascending: true, nullsFirst: true });
      if (error) throw error;
      return (data ?? []) as Coin[];
    },
    staleTime: 5 * 60 * 1000,
  });

/** point → {lat,lng}. Hanterar både objekt {x,y} och sträng "(lng,lat)". */
export const parseCoinCoord = (c: unknown): { lat: number; lng: number } | null => {
  if (!c) return null;
  if (typeof c === 'object' && c !== null && 'x' in c && 'y' in c) {
    const o = c as { x: number; y: number };
    return { lng: o.x, lat: o.y };
  }
  if (typeof c === 'string') {
    const m = c.match(/\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
    if (m) return { lng: parseFloat(m[1]), lat: parseFloat(m[2]) };
  }
  return null;
};
