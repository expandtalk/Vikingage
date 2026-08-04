import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Fynd per befästning (C14, solidus, hoard, produktion …) — dateringens/funktionens evidenslager.
export interface FortFind {
  fortification_id: string;
  find_type: string;
  label?: string;
  date_from?: number;
  date_to?: number;
  c14_raw?: string;
  description?: string;
  source_ref?: string;
  confidence?: string;
}

export const useFortificationFinds = (enabled: boolean = false) => {
  const [findsByFort, setFindsByFort] = useState<Map<string, FortFind[]>>(new Map());

  useEffect(() => {
    if (!enabled) { setFindsByFort(new Map()); return; }
    const run = async () => {
      // fortification_finds finns ännu ej i types.ts → casta klienten.
      const { data, error } = await (supabase as any)
        .from('fortification_finds')
        .select('fortification_id, find_type, label, date_from, date_to, c14_raw, description, source_ref, confidence');
      if (error) { console.error('Error fetching fortification_finds:', error); return; }
      const map = new Map<string, FortFind[]>();
      for (const r of (data as FortFind[]) || []) {
        if (!r.fortification_id) continue;
        const arr = map.get(r.fortification_id) || [];
        arr.push(r);
        map.set(r.fortification_id, arr);
      }
      setFindsByFort(map);
    };
    run();
  }, [enabled]);

  return { findsByFort };
};
