import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HistoricalEventMarker {
  id: string;
  event_name: string;
  event_name_en: string;
  year_start: number;
  year_end?: number;
  event_type: string;
  significance_level: string;
  description?: string;
  description_en?: string;
  region_affected?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const useHistoricalEventMarkers = (
  selectedTimePeriod: string = 'viking_age',
  isEnabled: boolean = true
) => {
  return useQuery({
    queryKey: ['historical-event-markers', selectedTimePeriod],
    queryFn: async (): Promise<HistoricalEventMarker[]> => {
      console.log('🏛️ Fetching historical events for map markers...');
      
      // Period-intervall — nycklarna MÅSTE matcha GERMANIC_TIME_PERIODS-id:na, annars
      // faller filtret bort (range=undefined) och alla rader returneras. Tidigare fanns
      // felaktiga nycklar (iron_age/medieval) och saknade de fem äldsta perioderna.
      const periodRanges: { [key: string]: [number, number] } = {
        'paleolithic': [-45000, -10000],
        'mesolithic': [-10000, -4000],
        'neolithic': [-4000, -1700],
        'bronze_age': [-1700, -500],
        'pre_roman_iron': [-500, 1],
        'roman_iron': [1, 400],
        'migration_period': [400, 550],
        'vendel_period': [550, 793],
        'viking_age': [793, 1066],
      };

      const range = periodRanges[selectedTimePeriod];
      let query = supabase
        .from('historical_events')
        .select('*')
        .order('year_start', { ascending: true });

      if (range) {
        const [startYear, endYear] = range;
        query = query
          .gte('year_start', startYear)
          .lte('year_start', endYear);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching historical events:', error);
        throw error;
      }

      // Map known regions to coordinates
      const regionCoordinates: { [key: string]: { lat: number; lng: number } } = {
        'Sverige': { lat: 59.3293, lng: 18.0686 }, // Stockholm
        'Mälaren': { lat: 59.3, lng: 17.0 }, // Lake Mälaren
        'Danmark': { lat: 55.6761, lng: 12.5683 }, // Copenhagen
        'Hedeby': { lat: 54.4925, lng: 9.5659 }, // Hedeby
        'England': { lat: 53.0, lng: -1.0 }, // Central England
        'Northumbria': { lat: 55.0, lng: -2.0 }, // Northumbria
        'Kent': { lat: 51.25, lng: 0.75 }, // Kent
        'Irland': { lat: 53.1424, lng: -7.6921 }, // Ireland center
        'Dublin': { lat: 53.3498, lng: -6.2603 }, // Dublin
        'Frankrike': { lat: 46.2276, lng: 2.2137 }, // France center
        'Akvitanien': { lat: 44.8378, lng: -0.5792 }, // Bordeaux
        'Loire': { lat: 47.2184, lng: -1.5536 }, // Nantes
        'Seine': { lat: 48.8566, lng: 2.3522 }, // Paris
        'Paris': { lat: 48.8566, lng: 2.3522 }, // Paris
        'Nederländerna': { lat: 52.1326, lng: 5.2913 }, // Netherlands
        'Utrecht': { lat: 52.0907, lng: 5.1214 }, // Utrecht
        'Spanien': { lat: 40.4637, lng: -3.7492 }, // Spain center
        'Cadiz': { lat: 36.5271, lng: -6.2886 }, // Cadiz
        'Sevilla': { lat: 37.3891, lng: -5.9845 }, // Seville
        'Bretagne': { lat: 48.2020, lng: -2.9326 }, // Brittany
        'Anjou': { lat: 47.4784, lng: -0.5632 }, // Angers
        'Frisland': { lat: 53.2194, lng: 5.8006 }, // Frisia
        'Bysantinska riket': { lat: 41.0082, lng: 28.9784 }, // Constantinople
        'Lindisfarne': { lat: 55.6694, lng: -1.7939 }, // Lindisfarne
        'Nantes': { lat: 47.2184, lng: -1.5536 }, // Nantes
        'Rouen': { lat: 49.4431, lng: 1.0993 }, // Rouen
        'Dorestad': { lat: 51.9697, lng: 5.3442 } // Dorestad
      };

      const events = data?.map(event => {
        // Find coordinates for the first region mentioned
        let coordinates = undefined;
        if (event.region_affected && event.region_affected.length > 0) {
          const firstRegion = event.region_affected[0];
          coordinates = regionCoordinates[firstRegion];
        }

        return {
          ...event,
          coordinates
        };
      }) || [];

      console.log(`✅ Loaded ${events.length} historical events for period ${selectedTimePeriod}`);
      return events;
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper function to get event type color
export const getEventTypeColor = (eventType: string): string => {
  const colors: { [key: string]: string } = {
    'raid': '#FF4444',          // Red for raids
    'settlement': '#44AA44',    // Green for settlements
    'political': '#4444FF',     // Blue for political events
    'military': '#FF8844',      // Orange for military events
    'religious': '#AA44AA',     // Purple for religious events
    'trade': '#44AAAA'          // Cyan for trade events
  };
  return colors[eventType] || '#888888';
};

// Helper function to get event type icon
export const getEventTypeIcon = (eventType: string): string => {
  const icons: { [key: string]: string } = {
    'raid': '⚔️',
    'settlement': '🏘️',
    'political': '👑',
    'military': '🛡️',
    'religious': '✝️',
    'trade': '💰'
  };
  return icons[eventType] || '📍';
};

// Helper function to get significance level size
export const getSignificanceSize = (significance: string): number => {
  const sizes: { [key: string]: number } = {
    'very_high': 12,
    'high': 10,
    'medium': 8,
    'low': 6
  };
  return sizes[significance] || 8;
};