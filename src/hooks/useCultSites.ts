import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RELIGIOUS_PLACES, type ReligiousPlace } from '@/utils/religiousLocations/religiousPlacesData';

// Kultplatser (cult_sites) ur DB — ersätter den hårdkodade RELIGIOUS_PLACES-listan.
// Faller tillbaka på den hårdkodade listan om tabellen är tom/otillgänglig, så vyn
// aldrig blir tom (defensivt tills alla konsumenter är omkopplade).
interface CultSiteRow {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  deity: string | null;
  type: string | null;
  evidence: string[] | null;
  description: string | null;
  historical_periods: string[] | null;
  established_period: string | null;
  paired_with: string | null;
  is_multiple: boolean | null;
  region: string | null;
  sources: string[] | null;
}

const toReligiousPlace = (r: CultSiteRow): ReligiousPlace => ({
  id: r.id,
  name: r.name,
  coordinates: { lat: r.lat ?? 0, lng: r.lng ?? 0 },
  deity: (r.deity ?? 'other') as ReligiousPlace['deity'],
  type: (r.type ?? 'cult_site') as ReligiousPlace['type'],
  evidence: (r.evidence ?? []) as ReligiousPlace['evidence'],
  description: r.description ?? '',
  historicalPeriods: r.historical_periods ?? [],
  establishedPeriod: r.established_period ?? '',
  pairedWith: r.paired_with ?? undefined,
  isMultiple: r.is_multiple ?? undefined,
  region: r.region ?? '',
  sources: r.sources ?? [],
});

export const useCultSites = () =>
  useQuery({
    queryKey: ['cult-sites'],
    queryFn: async (): Promise<ReligiousPlace[]> => {
      const { data, error } = await supabase.from('cult_sites').select('*');
      if (error || !data || data.length === 0) {
        if (error) console.warn('⚠️ cult_sites, faller tillbaka på hårdkodad lista:', error.message);
        return RELIGIOUS_PLACES;
      }
      return (data as CultSiteRow[]).map(toReligiousPlace);
    },
    staleTime: 30 * 60 * 1000,
  });
