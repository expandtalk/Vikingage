import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Kyrkor & kloster ur ecclesiastical_sites (4146 st, alla med koordinat).
export interface Church {
  id: string;
  name: string;
  name_en?: string;
  kind?: string;                 // parish_church | monastery | chapel | holy_place | hospital
  lat: number;
  lng: number;
  landscape?: string;
  parish?: string;
  municipality?: string;
  built_from?: number;
  built_to?: number;
  current_building_year?: number;
  founded_year?: number;
  dissolved_year?: number;
  dating_class?: string;
  dating_source?: string;
  religious_order?: string;
  significance_level?: string;
  patron_saint?: string;
  description?: string;
  description_en?: string;
  historical_notes?: string;
  image_url?: string;
  image_attribution?: string;
  register_url?: string;
}

// Tidsålder-bucket ur bästa tillgängliga byggår (built_from → current_building_year → founded_year).
export type ChurchEra = 'tidigkristet' | 'romansk' | 'gotik' | 'senmedeltid' | 'efterreformatorisk' | 'odaterad';
export function churchEra(c: Church): ChurchEra {
  const y = c.built_from ?? c.current_building_year ?? c.founded_year;
  if (y == null) return 'odaterad';
  if (y < 1100) return 'tidigkristet';
  if (y < 1250) return 'romansk';
  if (y < 1400) return 'gotik';
  if (y < 1520) return 'senmedeltid';
  return 'efterreformatorisk';
}
export function churchYear(c: Church): number | null {
  return c.built_from ?? c.current_building_year ?? c.founded_year ?? null;
}

const COLS =
  'id,name,name_en,kind,lat,lng,landscape,parish,municipality,built_from,built_to,current_building_year,' +
  'founded_year,dissolved_year,dating_class,dating_source,religious_order,significance_level,patron_saint,' +
  'description,description_en,historical_notes,image_url,image_attribution,register_url';

export const useChurches = (enabled: boolean = true) => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) { setChurches([]); return; }
    const run = async () => {
      setIsLoading(true);
      try {
        const pageSize = 1000;
        let from = 0;
        const rows: Church[] = [];
        for (;;) {
          const { data, error } = await (supabase as any)
            .from('ecclesiastical_sites').select(COLS).range(from, from + pageSize - 1);
          if (error) { console.error('Error fetching churches:', error); break; }
          rows.push(...((data as Church[]) || []));
          if (!data || data.length < pageSize) break;
          from += pageSize;
        }
        setChurches(rows.filter((c) => c.lat != null && c.lng != null));
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [enabled]);

  return { churches, isLoading };
};
