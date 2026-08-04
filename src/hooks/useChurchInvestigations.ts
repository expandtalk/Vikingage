import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Kyrkoundersökningar per kyrka (church_investigations) — vad som hittats under golvet / i källaren,
// grävningar och arkivbelägg kopplade till kyrkan. Länkas via church_id (ecclesiastical_sites.id).
export interface ChurchInvestigation {
  year_from?: number;
  year_to?: number;
  investigation_type?: string;
  find_context?: string;
  what_found?: string;
  source_type?: string;
  source_citation?: string;
  source_url?: string;
  evidence_class?: string;
}

export const useChurchInvestigations = (churchId: string | null) => {
  const [investigations, setInvestigations] = useState<ChurchInvestigation[]>([]);

  useEffect(() => {
    if (!churchId) { setInvestigations([]); return; }
    let cancelled = false;
    const run = async () => {
      const { data, error } = await (supabase as any)
        .from('church_investigations')
        .select('year_from,year_to,investigation_type,find_context,what_found,source_type,source_citation,source_url,evidence_class')
        .eq('church_id', churchId)
        .order('year_from', { ascending: true });
      if (error) { console.error('Error fetching church_investigations:', error); return; }
      if (!cancelled) setInvestigations((data as ChurchInvestigation[]) || []);
    };
    run();
    return () => { cancelled = true; };
  }, [churchId]);

  return { investigations };
};
