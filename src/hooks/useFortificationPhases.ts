import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Intra-site-faser per befästning (fortification_phases) — byggd-om-i-faser-tidslinje.
export interface FortPhase {
  phase_order: number;
  phase_name: string;
  period_start?: number;
  period_end?: number;
  function?: string;   // defense | control_trade | administrative | royal_residence
  siting?: string;     // defensible_height | logistics_hub | island_chokepoint
  description?: string;
  source_ref?: string;
  confidence?: string;
}

export const useFortificationPhases = (fortId: string | null) => {
  const [phases, setPhases] = useState<FortPhase[]>([]);

  useEffect(() => {
    if (!fortId) { setPhases([]); return; }
    let cancelled = false;
    const run = async () => {
      // fortification_phases finns ännu ej i types.ts → casta klienten.
      const { data, error } = await (supabase as any)
        .from('fortification_phases')
        .select('phase_order,phase_name,period_start,period_end,function,siting,description,source_ref,confidence')
        .eq('fortification_id', fortId)
        .order('phase_order', { ascending: true });
      if (error) { console.error('Error fetching fortification_phases:', error); return; }
      if (!cancelled) setPhases((data as FortPhase[]) || []);
    };
    run();
    return () => { cancelled = true; };
  }, [fortId]);

  return { phases };
};
