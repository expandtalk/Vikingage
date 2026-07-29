import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Avrättnings-domänen: PLATSER (heritage_sites, RAÄ Fornsök CC0) + HÄNDELSER (execution_events,
// tid/person/brott — Wikidata CC0 m.fl. rena källor). Två lager: platsen kan ha flyttat, händelsen
// är daterad. Se execution_events-migrationen + källdisciplinen (aldrig rotter.se, katalogskydd).

export interface ExecutionPlace {
  id: string; name: string; raa_type: string | null;
  lat: number; lng: number; landscape: string | null; parish: string | null; period: string | null;
}
export interface ExecutionEvent {
  id: string; executed_person: string | null; crime: string | null; method: string | null;
  event_date: string | null; event_year: number | null; place_name: string | null; parish: string | null;
  lat: number | null; lng: number | null; executioner: string | null;
  description: string | null; source_ref: string | null; source_url: string | null;
}

export function useExecutionSites() {
  return useQuery({
    queryKey: ['execution-sites'],
    queryFn: async () => {
      const places: ExecutionPlace[] = [];
      // Paginera heritage_sites (avrättnings-typer) — kan vara >1000.
      for (let from = 0; ; from += 1000) {
        const { data, error } = await (supabase.from('heritage_sites') as any)
          .select('id,name,raa_type,lat,lng,landscape,parish,period')
          .or('raa_type.ilike.%avrätt%,raa_type.ilike.%galg%,raa_type.ilike.%stegl%')
          .not('lat', 'is', null).range(from, from + 999);
        if (error) throw error;
        const rows = (data ?? []) as ExecutionPlace[];
        places.push(...rows);
        if (rows.length < 1000) break;
      }
      const { data: ev, error: e2 } = await (supabase.from('execution_events') as any)
        .select('id,executed_person,crime,method,event_date,event_year,place_name,parish,lat,lng,executioner,description,source_ref,source_url')
        .order('event_year', { ascending: true });
      if (e2) throw e2;
      return { places, events: (ev ?? []) as ExecutionEvent[] };
    },
    staleTime: 5 * 60 * 1000,
  });
}
