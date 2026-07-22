
import { supabase } from '@/integrations/supabase/client';
import type { DbStats } from './types';

export const loadDatabaseStats = async (): Promise<DbStats> => {
  try {
    console.log('📊 Loading database statistics...');
    
    // Get inscriptions count
    const { count: inscriptionsCount, error: inscriptionsError } = await supabase
      .from('runic_inscriptions')
      .select('*', { count: 'exact', head: true });

    if (inscriptionsError) {
      console.error('Error loading inscriptions count:', inscriptionsError);
    }

    // Get coordinates count
    const { count: coordinatesCount, error: coordinatesError } = await supabase
      .from('coordinates')
      .select('*', { count: 'exact', head: true });

    if (coordinatesError) {
      console.error('Error loading coordinates count:', coordinatesError);
    }

    // Get carvers count
    const { count: carversCount, error: carversError } = await supabase
      .from('carvers')
      .select('*', { count: 'exact', head: true });

    if (carversError) {
      console.error('Error loading carvers count:', carversError);
    }

    // Get artefacts count from the artefacts table
    const { count: artefactsCount, error: artefactsError } = await supabase
      .from('artefacts')
      .select('*', { count: 'exact', head: true });

    if (artefactsError) {
      console.error('Error loading artefacts count:', artefactsError);
    }

    // Get Viking cities count
    const { count: citiesCount, error: citiesError } = await supabase
      .from('viking_cities')
      .select('*', { count: 'exact', head: true });

    if (citiesError) {
      console.error('Error loading Viking cities count:', citiesError);
    }

    // Fornborgs-/befästningssiffra = kurerade befästningar (viking_fortresses)
    // + hela fornborgsregistret (swedish_hillforts, ~1235). Kortet "Fornborgar"
    // ska visa hela beståndet, inte bara de 49 kurerade.
    const [{ count: vfCount, error: fortressesError }, { count: hfCount }] = await Promise.all([
      supabase.from('viking_fortresses').select('*', { count: 'exact', head: true }),
      supabase.from('swedish_hillforts').select('*', { count: 'exact', head: true }),
    ]);
    const fortressesCount = (vfCount || 0) + (hfCount || 0);

    if (fortressesError) {
      console.error('Error loading Viking fortresses count:', fortressesError);
    }

    // Get Viking names stats
    const { data: vikingNamesStats, error: vikingNamesError } = await supabase
      .rpc('get_viking_names_stats');

    if (vikingNamesError) {
      console.error('Error loading Viking names stats:', vikingNamesError);
    }

    // Get hundreds count
    const { count: hundredsCount, error: hundredsError } = await supabase
      .from('hundreds')
      .select('*', { count: 'exact', head: true });
    
    if (hundredsError) {
      console.error('Error loading hundreds count:', hundredsError);
    }
    
    // Get parishes count
    const { count: parishesCount, error: parishesError } = await supabase
      .from('parishes')
      .select('*', { count: 'exact', head: true });

    if (parishesError) {
      console.error('Error loading parishes count:', parishesError);
    }

    // Get folk groups count
    const { count: folkGroupsCount, error: folkGroupsError } = await supabase
      .from('folk_groups')
      .select('*', { count: 'exact', head: true });

    if (folkGroupsError) {
      console.error('Error loading folk groups count:', folkGroupsError);
    }

    // Get genetic individuals count (representing genetic evolution events)
    const { count: geneticIndividualsCount, error: geneticIndividualsError } = await supabase
      .from('genetic_individuals')
      .select('*', { count: 'exact', head: true });

    if (geneticIndividualsError) {
      console.error('Error loading genetic individuals count:', geneticIndividualsError);
    }

    // Get royal chronicles count (historical kings + sources + dynasties)
    const { count: historicalKingsCount, error: historicalKingsError } = await supabase
      .from('historical_kings')
      .select('*', { count: 'exact', head: true });

    if (historicalKingsError) {
      console.error('Error loading historical kings count:', historicalKingsError);
    }

    const { count: historicalSourcesCount, error: historicalSourcesError } = await supabase
      .from('historical_sources')
      .select('*', { count: 'exact', head: true });

    if (historicalSourcesError) {
      console.error('Error loading historical sources count:', historicalSourcesError);
    }

    const { count: royalDynastiesCount, error: royalDynastiesError } = await supabase
      .from('royal_dynasties')
      .select('*', { count: 'exact', head: true });

    if (royalDynastiesError) {
      console.error('Error loading royal dynasties count:', royalDynastiesError);
    }

    const totalRoyalChroniclesEntries = (historicalKingsCount || 0) + (historicalSourcesCount || 0) + (royalDynastiesCount || 0);

    // Get river systems count
    const { count: riversCount, error: riversError } = await supabase
      .from('river_systems')
      .select('*', { count: 'exact', head: true });

    if (riversError) {
      console.error('Error loading river systems count:', riversError);
    }

    // Verkliga antal per kartlager (legenden visade tidigare hårdkodade/inaktuella tal;
    // kyrkorna saknades helt = 0). Head-count, billigt, körs parallellt.
    const head = (table: string) => supabase.from(table).select('*', { count: 'exact', head: true });
    const [churchesRes, coinsRes, spoliaRes, speciesRes, heritageRes, estatesRes, adnaSitesRes] = await Promise.all([
      head('ecclesiastical_sites'),
      head('coins'),
      head('picture_stone_reuse'),
      head('species_introductions'),
      head('heritage_sites'),
      head('estates'),
      supabase.from('genetic_individuals').select('site_id'),
    ]);
    const adnaSites = new Set(
      (adnaSitesRes.data || []).map((r: { site_id: string | null }) => r.site_id).filter(Boolean)
    ).size;

    const stats: DbStats = {
      layerCounts: {
        churches: churchesRes.count || 0,
        coins: coinsRes.count || 0,
        spolia: spoliaRes.count || 0,
        species: speciesRes.count || 0,
        adnaSites,
        heritageTotal: heritageRes.count || 0,
        estates: estatesRes.count || 0,
      },
      totalInscriptions: inscriptionsCount || 0,
      totalCoordinates: coordinatesCount || 0,
      totalCarvers: carversCount || 0,
      totalArtefacts: artefactsCount || 0,
      totalCities: citiesCount || 0,
      totalFortresses: fortressesCount || 0,
      totalVikingNames: vikingNamesStats?.[0]?.total_names || 0,
      totalHundreds: hundredsCount || 0,
      totalParishes: parishesCount || 0,
      totalFolkGroups: folkGroupsCount || 0,
      totalGeneticEvents: geneticIndividualsCount || 0,
      totalRoyalChronicles: totalRoyalChroniclesEntries,
      totalRivers: riversCount || 0,
    };

    console.log('📊 Database statistics loaded:', stats);
    return stats;
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
