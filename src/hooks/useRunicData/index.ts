
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { loadEnhancedRunicDataWithBetterCoordinates } from './enhancedDataLoader';
import { loadDatabaseStats } from './statsLoader';
import type { UseRunicDataProps } from './types';

export const useRunicData = (filters: UseRunicDataProps) => {

  // Query for inscriptions with enhanced coordinate mapping
  const {
    data: inscriptions = [],
    isLoading: isInscriptionsLoading,
    error: inscriptionsError,
    refetch: refetchInscriptions
  } = useQuery({
    queryKey: ['runic-inscriptions-enhanced-v2', filters],
    queryFn: () => loadEnhancedRunicDataWithBetterCoordinates(filters),
    // 5 min cache per filterkombination — staleTime: 0 laddade om ~3000 rader
    // vid varje filterändring (P0-fix, se docs/kunskapsgraf-arkitektur.md).
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Query for database statistics
  const {
    data: dbStats = { 
      totalInscriptions: 0, 
      totalCoordinates: 0, 
      totalCarvers: 0,
      totalArtefacts: 0,
      totalCities: 0,
      totalFortresses: 0,
      totalVikingNames: 0
    },
    isLoading: isStatsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['db-stats-enhanced'],
    queryFn: loadDatabaseStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Combined loading state
  const isLoading = isInscriptionsLoading || isStatsLoading;

  // Error handling
  const connectionError = inscriptionsError || null;

  // Load data function
  const loadData = async () => {
    try {
      await Promise.all([refetchInscriptions(), refetchStats()]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return {
    inscriptions,
    isLoading,
    connectionError,
    dbStats,
    loadData
  };
};

export type { UseRunicDataProps } from './types';
