import { supabase } from '@/integrations/supabase/client';
import type { DbStats } from './types';

// Startsidans statistik i EN round-trip. Tidigare kördes ~25 separata count-anrop (flera
// sekventiella) → en kritisk nätverkskedja på ~4,7 s som försenade LCP och gav pop-in-känslan.
// Nu räknas allt server-side i RPC:t get_homepage_stats() (migration 20260818240000, ~280 ms).
export const loadDatabaseStats = async (): Promise<DbStats> => {
  try {
    // get_homepage_stats är nyare än de genererade Supabase-typerna → casta.
    const { data, error } = await (supabase.rpc as unknown as (fn: string) => Promise<{ data: unknown; error: unknown }>)('get_homepage_stats');
    if (error) throw error;
    if (!data) throw new Error('get_homepage_stats returned no data');
    return data as unknown as DbStats;
  } catch (error) {
    console.error('Error loading database statistics:', error);
    return {
      totalInscriptions: 0,
      totalCoordinates: 0,
      totalCarvers: 0,
      totalArtefacts: 0,
      totalCities: 0,
      totalFortresses: 0,
      totalVikingNames: 0,
      totalHundreds: 0,
      totalParishes: 0,
      totalFolkGroups: 0,
      totalGeneticEvents: 0,
      totalRoyalChronicles: 0,
      totalRivers: 0,
    };
  }
};

// Keep the old export as alias for backward compatibility
export const loadDbStats = loadDatabaseStats;
