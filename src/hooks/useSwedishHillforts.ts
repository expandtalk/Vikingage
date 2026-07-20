import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SwedishHillfort {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  raa_number: string;
  landscape: string;
  parish?: string;
  municipality?: string;
  county?: string;
  country: string;
  fortress_type: string;
  description?: string;
  status: string;
  period?: string;
  cultural_significance?: string;
  source_reference?: string;
}

export const useSwedishHillforts = (enabled: boolean = false) => {
  const [hillforts, setHillforts] = useState<SwedishHillfort[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert PostgreSQL point to coordinates object
  const parseCoordinates = (coordinatesData: any): { lat: number; lng: number } | null => {
    if (!coordinatesData) return null;
    
    if (typeof coordinatesData === 'string') {
      const match = coordinatesData.match(/\(([^,]+),([^)]+)\)/);
      if (match) {
        return {
          lng: parseFloat(match[1]),
          lat: parseFloat(match[2])
        };
      }
    } else if (coordinatesData && typeof coordinatesData === 'object') {
      if (coordinatesData.lat && coordinatesData.lng) {
        return coordinatesData;
      }
      if (coordinatesData.x && coordinatesData.y) {
        return { lng: coordinatesData.x, lat: coordinatesData.y };
      }
    }
    
    return null;
  };

  useEffect(() => {
    if (!enabled) {
      setHillforts([]);
      return;
    }

    const fetchHillforts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Paginera förbi PostgREST:s 1000-radstak — vi har nu ~1235 fornborgar.
        const pageSize = 1000;
        let from = 0;
        const allRows: any[] = [];
        for (;;) {
          const { data, error: supabaseError } = await supabase
            .from('swedish_hillforts')
            .select('*')
            .order('landscape', { ascending: true })
            .order('name', { ascending: true })
            .range(from, from + pageSize - 1);
          if (supabaseError) {
            console.error('Error fetching Swedish hillforts:', supabaseError);
            setError('Failed to load Swedish hillforts');
            return;
          }
          allRows.push(...(data || []));
          if (!data || data.length < pageSize) break;
          from += pageSize;
        }

        const processedHillforts = allRows.map(hillfort => ({
          ...hillfort,
          coordinates: parseCoordinates(hillfort.coordinates)
        })).filter(hillfort => hillfort.coordinates !== null) as SwedishHillfort[];

        console.log(`Loaded ${processedHillforts.length} Swedish hillforts`);
        setHillforts(processedHillforts);

      } catch (error) {
        console.error('Error loading Swedish hillforts:', error);
        setError('Failed to load Swedish hillforts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHillforts();
  }, [enabled]);

  return { hillforts, isLoading, error };
};