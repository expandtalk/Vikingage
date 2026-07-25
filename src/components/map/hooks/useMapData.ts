import React, { useMemo } from 'react';
import { getApproximateCoordinates } from "@/utils/coordinateMappingEnhanced";
import { getVikingRegionsByPeriod } from "@/utils/vikingEraRegions";
import { getGroupsByPeriod } from "@/utils/germanicTimeline/timelineData";
import { getFindsInPeriod, ARCHAEOLOGICAL_FINDS } from "@/utils/archaeologicalFinds";
import { filterCitiesByPeriod } from "@/hooks/useVikingCities";
import { useHistoricalEventMarkers } from "@/hooks/useHistoricalEventMarkers";

interface RunicInscription {
  id: string;
  signum: string;
  location?: string;
  province?: string;
  country?: string;
  transliteration?: string;
  translation_en?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface UseMapDataProps {
  inscriptions: RunicInscription[];
  isVikingMode: boolean;
  selectedPeriod: string;
  selectedTimePeriod: string;
  shouldLoadVikingData: boolean;
  vikingCities: any[];
}

export const useMapData = ({
  inscriptions,
  isVikingMode,
  selectedPeriod,
  selectedTimePeriod,
  shouldLoadVikingData,
  vikingCities
}: UseMapDataProps) => {
  // In Viking mode, show ALL inscriptions with coordinates (no country filtering)
  // In modern mode, show all inscriptions
  const inscriptionsWithCoords = useMemo(() => {
    const withCoords = inscriptions.filter(i => getApproximateCoordinates(i, isVikingMode) !== null);
    console.log(`Map: ${isVikingMode ? 'Viking' : 'Modern'} mode - ${withCoords.length} of ${inscriptions.length} inscriptions have coordinates`);
    return withCoords;
  }, [inscriptions, isVikingMode]);

  // FIXED: Viking regions should only show for viking_age period
  const vikingRegions = useMemo(() => {
    if (selectedTimePeriod !== 'viking_age') {
      console.log(`Map: Not showing Viking regions for period: ${selectedTimePeriod}`);
      return [];
    }
    console.log(`Map: Loading Viking regions for period: ${selectedPeriod}`);
    return getVikingRegionsByPeriod(selectedPeriod);
  }, [selectedPeriod, selectedTimePeriod]);

  // FIXED: Germanic groups should match the selected timeline period
  const germanicGroups = useMemo(() => {
    console.log(`Map: Loading Germanic groups for time period: ${selectedTimePeriod}`);
    const groups = getGroupsByPeriod(selectedTimePeriod);
    console.log(`Map: Found ${groups.length} Germanic groups for ${selectedTimePeriod}`);
    return groups;
  }, [selectedTimePeriod]);

  // FIXED: Archaeological finds should be filtered by the correct time period
  const archaeologicalFinds = useMemo(() => {
    console.log(`Map: Loading archaeological finds for time period: ${selectedTimePeriod}`);
    const finds = getFindsInPeriod(ARCHAEOLOGICAL_FINDS, selectedTimePeriod);
    console.log(`Map: Found ${finds.length} archaeological finds for ${selectedTimePeriod}`);
    return finds;
  }, [selectedTimePeriod]);

  // FIXED: Cities should only show for viking_age
  const filteredCities = useMemo(() => {
    if (selectedTimePeriod !== 'viking_age') {
      console.log(`Map: Not showing cities for period: ${selectedTimePeriod}`);
      return [];
    }
    const period = isVikingMode ? selectedPeriod : 'all';
    console.log(`Map: Loading cities for Viking period: ${period}`);
    return filterCitiesByPeriod(vikingCities, period);
  }, [vikingCities, selectedPeriod, selectedTimePeriod, isVikingMode]);

  // Load historical events for the selected time period.
  // Stabil referens: react-querys `data` är undefined mellan hämtningar; ett `= []`-default
  // skapar en NY array varje render → instabil dep i useMapMarkers → oändlig loop. useMemo
  // ger samma [] så länge data är undefined.
  const { data: historicalEventsData, isLoading: eventsLoading } = useHistoricalEventMarkers(selectedTimePeriod, true);
  const historicalEvents = useMemo(() => historicalEventsData ?? [], [historicalEventsData]);

  return {
    inscriptionsWithCoords,
    vikingRegions,
    germanicGroups,
    archaeologicalFinds,
    filteredCities,
    historicalEvents,
    eventsLoading
  };
};
