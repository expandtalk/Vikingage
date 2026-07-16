
import { useEffect, useMemo } from 'react';
import { useRunicData } from '@/hooks/useRunicData';
import { useLegendManager } from '@/hooks/useLegendManager';
import { useFilterState } from '../FilterState';
import { useFocusManager } from '@/hooks/useFocusManager';
import { useActiveExploreRole } from '@/hooks/useActiveExploreRole';
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
  const activeRole = useActiveExploreRole();
  
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

  // Automatically switch to appropriate periods for different focuses
  const selectedTimePeriod = useMemo(() => {
    if (currentFocus === 'rivers') {
      console.log('🌊 Rivers focus detected - switching to viking_age time period');
      return 'viking_age';
    }
    if (currentFocus === 'inscriptions') {
      console.log('📿 Inscriptions focus detected - switching to viking_age time period');
      return 'viking_age';
    }
    return 'all';
  }, [currentFocus]);

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
    handleHideAll
  } = useLegendManager(
    inscriptions,
    false,
    selectedTimePeriod,
    activeRole,
    dbStats,
    hasActiveSearch,
    inscriptions
  );

  // FIXED: When there's an active search, show only search results on map
  // Otherwise show legend-filtered inscriptions
  const mapInscriptions = useMemo(() => {
    if (hasActiveSearch) {
      console.log(`🗺️ Active search detected - showing ${inscriptions.length} search results on map`);
      return inscriptions;
    } else {
      console.log(`🗺️ No active search - showing ${legendFilteredInscriptions.length} legend-filtered inscriptions on map`);
      return legendFilteredInscriptions;
    }
  }, [hasActiveSearch, inscriptions, legendFilteredInscriptions]);

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
    
    // Time period (critical for rivers focus)
    selectedTimePeriod,
    
    // Pagination
    totalPages,
    currentPage,
    
    // Update handling
    handleInscriptionUpdate
  };
};
