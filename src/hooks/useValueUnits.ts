import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Vikingatida/medeltida värdeenheter (value_units) — gemensam nämnare = gram fint silver.
export interface ValueUnit {
  id: string;
  key: string;
  name_sv: string;
  name_en: string | null;
  category: string;              // silver_weight | coin | commodity
  era: string | null;
  silver_grams: number | null;
  confidence: string;            // belagd | trolig | omtvistad
  source: string | null;
  note: string | null;
  sort_order: number;
}

export const useValueUnits = () =>
  useQuery({
    queryKey: ['value-units'],
    queryFn: async (): Promise<ValueUnit[]> => {
      const { data, error } = await (supabase as any).from('value_units').select('*').order('sort_order');
      if (error) throw error;
      return (data ?? []) as ValueUnit[];
    },
    staleTime: 60 * 60 * 1000,
  });
