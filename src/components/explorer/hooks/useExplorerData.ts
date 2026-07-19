
import { useEffect, useMemo, useState } from 'react';
import { useRunicData } from '@/hooks/useRunicData';
import { useLegendManager } from '@/hooks/useLegendManager';
import { useFilterState } from '../FilterState';
import { useFocusManager } from '@/hooks/useFocusManager';
import { useActiveExploreProfile } from '@/hooks/useExploreProfiles';
import { resolveProfileLayers } from '@/config/exploreProfiles';
import { filterInscriptionsByPeriod } from '@/utils/timePeriods';
import { useQueryClient } from '@tanstack/react-query';

interface UseExplorerDataProps {
  godNameSearch: string;
  currentPage: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
}

export const useExplorerData = ({ 
  godNameSearch, 
  currentPage, 
  itemsPerPage, 
  setCurrentPage 
}: UseExplorerDataProps) => {
  const queryClient = useQueryClient();
  const { currentFocus } = useFocusManager();
  const activeProfile = useActiveExploreProfile();
  
  const {
    searchQuery,
    selectedLandscape,
    selectedCountry,
    selectedPeriod,
    selectedStatus,
    selectedObjectType,
    setSearchQuery,
    setSelectedLandscape,
    setSelectedCountry,
    setSelectedPeriod,
    setSelectedStatus,
    setSelectedObjectType,
    filterState,
    activeFiltersCount,
    hasActiveSearch,
    handleClearFilters
  } = useFilterState();

  // Startperiod = profilens default; focus kan tvinga viking_age; reglaget kan sedan ändra.
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>(activeProfile.defaultPeriod);

  useEffect(() => {
    if (currentFocus === 'rivers' || currentFocus === 'inscriptions') {
      setSelectedTimePeriod('viking_age');
    } else {
      setSelectedTimePeriod(activeProfile.defaultPeriod);
    }
  }, [currentFocus, activeProfile.id, activeProfile.defaultPeriod]);

  const roleLayerPreset = useMemo(
    () => resolveProfileLayers(activeProfile, currentFocus),
    [activeProfile, currentFocus],
  );

  const enhancedFilterState = {
    ...filterState,
    godNameSearch,
    isVikingMode: false,
    selectedVikingCategory: 'all',
    selectedTimePeriod
  };

  const {
    inscriptions,
    isLoading,
    connectionError,
    dbStats,
    loadData
  } = useRunicData(enhancedFilterState);

  const {
    enabledLegendItems,
    legendItems,
    mapInscriptions: legendFilteredInscriptions,
    handleLegendToggle,
    handleShowAll,
    handleHideAll,
    focusDeity
  } = useLegendManager(
    inscriptions,
    false,
    selectedTimePeriod,
    roleLayerPreset,
    dbStats,
    hasActiveSearch,
    inscriptions
  );

  // FIXED: When there's an active search, show only search results on map
  // Otherwise show legend-filtered inscriptions
  const mapInscriptions = useMemo(() => {
    const base = hasActiveSearch ? inscriptions : legendFilteredInscriptions;
    // Filtrera på vald tidslinjeperiod — runor fanns inte i förhistorien, så
    // förhistoriska perioder tömmer runstenarna (istället för att alltid visa dem).
    const byPeriod = filterInscriptionsByPeriod(base, selectedTimePeriod);
    console.log(`🗺️ Map inscriptions: ${base.length} → ${byPeriod.length} efter period '${selectedTimePeriod}' (search=${hasActiveSearch})`);
    return byPeriod;
  }, [hasActiveSearch, inscriptions, legendFilteredInscriptions, selectedTimePeriod]);

  // Calculate pagination
  const totalPages = Math.ceil(inscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInscriptions = inscriptions.slice(startIndex, endIndex);

  // Reset to first page when inscriptions change
  useEffect(() => {
    setCurrentPage(1);
  }, [inscriptions.length, searchQuery, selectedLandscape, selectedCountry, selectedPeriod, selectedStatus, selectedObjectType, godNameSearch, setCurrentPage]);

  useEffect(() => {
    loadData();
  }, [selectedLandscape, selectedCountry, selectedPeriod, selectedStatus, selectedObjectType, godNameSearch]);

  const handleClearFiltersAndGods = () => {
    handleClearFilters();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadData();
  };

  // Function to handle inscription updates and trigger data refresh
  const handleInscriptionUpdate = async (updatedInscription: any) => {
    console.log('🔄 Inscription updated, refreshing data...', updatedInscription.signum);
    // FIXAD: Invalidate med rätt query keys
    await queryClient.invalidateQueries({ queryKey: ['runic-inscriptions-enhanced-v2'] });
    await queryClient.invalidateQueries({ queryKey: ['inscription-extended'] });
    await queryClient.invalidateQueries({ queryKey: ['db-stats-enhanced'] });
    // Force reload of data
    loadData();
  };

  return {
    // Filter state
    searchQuery,
    selectedLandscape,
    selectedCountry,
    selectedPeriod,
    selectedStatus,
    selectedObjectType,
    setSearchQuery,
    setSelectedLandscape,
    setSelectedCountry,
    setSelectedPeriod,
    setSelectedStatus,
    setSelectedObjectType,
    activeFiltersCount,
    hasActiveSearch,
    handleClearFilters: handleClearFiltersAndGods,
    handleSearch,
    
    // Data
    inscriptions,
    currentInscriptions,
    isLoading,
    connectionError,
    dbStats,
    loadData,
    
    // Legend
    enabledLegendItems,
    legendItems,
    mapInscriptions,
    handleLegendToggle,
    handleShowAll,
    handleHideAll,
    focusDeity,

    // Time period (critical for rivers focus)
    selectedTimePeriod,
    setSelectedTimePeriod,
    showTimeline: activeProfile.showTimeline,

    // Pagination
    totalPages,
    currentPage,
    
    // Update handling
    handleInscriptionUpdate
  };
};
