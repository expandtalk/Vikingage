import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Kopplar varje fornborg till närmaste -inge-namn (bebyggelsenamn, ofta äldre järnålder).
// Läser vyn v_fornborg_inge. inge_dating_hypothesis är en OBEKRÄFTAD ortnamnshypotes (<=2 km),
// aldrig en datering av borgen — visas därför som hypotes i UI.
export interface FornborgInge {
  hillfort_id: string;
  nearest_inge: string | null;
  inge_distance_m: number | null;
  inge_dating_hypothesis: string | null;
}

export const useFornborgInge = (enabled: boolean = false) => {
  const [ingeByFort, setIngeByFort] = useState<Map<string, FornborgInge>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIngeByFort(new Map());
      return;
    }

    const fetchInge = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const pageSize = 1000;
        let from = 0;
        const rows: FornborgInge[] = [];
        for (;;) {
          // v_fornborg_inge finns ännu inte i genererade types.ts → casta klienten för detta anrop.
          const { data, error: supErr } = await (supabase as any)
            .from('v_fornborg_inge')
            .select('hillfort_id, nearest_inge, inge_distance_m, inge_dating_hypothesis')
            .range(from, from + pageSize - 1);
          if (supErr) {
            console.error('Error fetching v_fornborg_inge:', supErr);
            setError('Failed to load -inge associations');
            return;
          }
          rows.push(...((data as FornborgInge[]) || []));
          if (!data || data.length < pageSize) break;
          from += pageSize;
        }
        const map = new Map<string, FornborgInge>();
        for (const r of rows) if (r.hillfort_id) map.set(r.hillfort_id, r);
        setIngeByFort(map);
      } catch (e) {
        console.error('Error loading -inge associations:', e);
        setError('Failed to load -inge associations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInge();
  }, [enabled]);

  return { ingeByFort, isLoading, error };
};
