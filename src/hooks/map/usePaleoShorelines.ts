import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Dåtida strandlinjer ur SGU:s strandförskjutningsmodell (CC-BY), tabell paleo_shorelines.
// Regionalt avgränsat (Mälardalen/Uppland), skivor 50–950 e.Kr. RPC:n snappar till
// närmaste tillgängliga skiva, så lagret funkar även när fler år läggs till.

export interface ShorelineFeature {
  id: string;
  period_label: string;
  year_ce: number;
  water_body_type: 'sea' | 'lake';
  geojson: string;
}

// Plattformens tidsperiod → ungefärligt år (year_ce). RPC snappar sedan till närmaste skiva.
const PERIOD_YEAR: Record<string, number> = {
  viking_age: 950,
  vendel_period: 700,
  migration_period: 500,
  roman_iron_age: 200,
  iron_age: 200,
  medieval: 1000,
  all: 950,
};

export function usePaleoShorelines(
  enabledLegendItems: Record<string, boolean>,
  selectedTimePeriod: string,
  isVisible: boolean,
): ShorelineFeature[] {
  const [features, setFeatures] = useState<ShorelineFeature[]>([]);
  const enabled = isVisible && enabledLegendItems.paleo_shoreline === true;
  const year = PERIOD_YEAR[selectedTimePeriod] ?? 950;

  useEffect(() => {
    if (!enabled) {
      setFeatures([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
      }).rpc('get_paleo_shorelines_nearest', { p_year: year });
      if (cancelled) return;
      if (error || !data) {
        if (error) console.warn('⚠️ paleo_shorelines RPC:', error.message);
        setFeatures([]);
        return;
      }
      setFeatures(data as ShorelineFeature[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, year]);

  return features;
}
