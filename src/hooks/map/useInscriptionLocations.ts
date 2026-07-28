import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { InscriptionLocationOverride } from './useRunicInscriptionMarkers';

/**
 * Laddar ursprungslägen för de runstenar som flyttats (inscription_locations, role='original'
 * med verifierad koordinat) → Map<inscription_id, {lat,lng,place}>. Hämtas EN gång (tom dep,
 * stabil identitet efter laddning) så kartans marker-effekt inte hamnar i en refetch-loop.
 * Används för karttoggeln "ursprunglig plats" i runstenslagret.
 */
export function useInscriptionOriginalLocations(): Map<string, InscriptionLocationOverride> {
  const [byId, setById] = useState<Map<string, InscriptionLocationOverride>>(() => new Map());

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await (supabase.from('inscription_locations') as any)
        .select('inscription_id, lat, lng, place_name')
        .eq('role', 'original')
        .not('lat', 'is', null);
      if (!active || error || !data) return;
      const m = new Map<string, InscriptionLocationOverride>();
      for (const r of data as Array<{ inscription_id: string; lat: number; lng: number; place_name: string | null }>) {
        if (r.inscription_id && Number.isFinite(r.lat) && Number.isFinite(r.lng)) {
          m.set(r.inscription_id, { lat: r.lat, lng: r.lng, place: r.place_name });
        }
      }
      setById(m);
    })();
    return () => { active = false; };
  }, []);

  return byId;
}
