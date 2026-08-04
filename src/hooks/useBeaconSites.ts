import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Vårdkasar (RAÄ) — försvarets kommunikationsnät. Del av "befästningar & centra"-bilden.
export interface BeaconSite {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  landscape?: string;
  municipality?: string;
  parish?: string;
}

export const useBeaconSites = (enabled: boolean = false) => {
  const [beacons, setBeacons] = useState<BeaconSite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) { setBeacons([]); return; }
    const run = async () => {
      setIsLoading(true);
      try {
        const pageSize = 1000;
        let from = 0;
        const rows: any[] = [];
        for (;;) {
          const { data, error } = await (supabase as any)
            .from('beacon_sites')
            .select('id, name, landscape, municipality, parish, lat, lng')
            .range(from, from + pageSize - 1);
          if (error) { console.error('Error fetching beacon_sites:', error); break; }
          rows.push(...(data || []));
          if (!data || data.length < pageSize) break;
          from += pageSize;
        }
        setBeacons(
          rows
            .filter(r => r.lat != null && r.lng != null)
            .map(r => ({
              id: r.id, name: r.name, landscape: r.landscape,
              municipality: r.municipality, parish: r.parish,
              coordinates: { lat: r.lat, lng: r.lng },
            }))
        );
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [enabled]);

  return { beacons, isLoading };
};
