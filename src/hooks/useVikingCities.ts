
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { parseCoordinates } from '@/hooks/useRunicData/coordinateUtils';
import { overlapsPeriod } from '@/utils/germanicTimeline/periodRange';

interface VikingCity {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: string;
  period_start: number;
  period_end: number;
  country: string;
  region?: string;
  description: string;
  historical_significance?: string;
  replaces?: string;
  unesco_site: boolean;
  status: string;
  population_estimate?: number;
}

export const useVikingCities = (isEnabled: boolean = true) => {
  return useQuery({
    queryKey: ['viking-cities'],
    queryFn: async (): Promise<VikingCity[]> => {
      console.log('Fetching Viking cities from database...');
      
      const { data, error } = await supabase
        .from('viking_cities')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching Viking cities:', error);
        throw error;
      }

      // Transform the data to match our interface
      const cities = data?.map(city => {
        // Use global coordinate parser
        const coordinates = parseCoordinates(city.coordinates) || { lat: 0, lng: 0 };

        return {
          ...city,
          coordinates
        };
      }) || [];

      console.log(`Loaded ${cities.length} Viking cities`);
      return cities;
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Filtrera städer på vald period via den delade GERMANIC_TIME_PERIODS-logiken.
// Tidigare använde denna en egen 'early/high/late'-vokabulär som aldrig matchade
// de faktiska period-id:na ('viking_age' m.fl.) → filtret var en no-op och t.ex.
// Oslo (1000–1066) visades felaktigt redan i vendeltid.
export const filterCitiesByPeriod = (cities: VikingCity[], selectedPeriod: string): VikingCity[] => {
  return cities.filter((city) => overlapsPeriod(selectedPeriod, city.period_start, city.period_end));
};

// Helper function to get category color - UPDATED to include religious centers
export const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'religious_center': '#8B4513', // Brown
    'trading_post': '#1E90FF',    // Blue  
    'koping': '#32CD32',          // Green
    'established_city': '#FFD700', // Gold
    'gotlandic_center': '#FF6347'  // Red-orange
  };
  return colors[category] || '#808080';
};

// Helper function to get category label - UPDATED to include religious centers
export const getCategoryLabel = (category: string): string => {
  const labels: { [key: string]: string } = {
    'religious_center': 'Religiöst centrum',
    'trading_post': 'Handelsplats',
    'koping': 'Köping', 
    'established_city': 'Etablerad stad',
    'gotlandic_center': 'Gotländskt centrum'
  };
  return labels[category] || category;
};

