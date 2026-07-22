import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Socken-styrdata: kyrkor i socknen + stiftshistorik + stiftets ledare (RPC parish_governance).
export interface ParishChurch {
  name: string; kind: string; built_from: number | null; dating_class: string | null;
  status: string | null; image_url: string | null; diocese: string | null;
}
export interface DioceseEpoch { diocese: string; from_year: number | null; to_year: number | null; note: string | null; }
export interface Leader { person_name: string; role: string; from_year: number | null; to_year: number | null; diocese: string; }
export interface ParishGovernance { churches: ParishChurch[]; history: DioceseEpoch[]; leadership: Leader[]; }

export function useParishGovernance(socken: string | null) {
  const [data, setData] = useState<ParishGovernance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socken) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data: res, error } = await (supabase as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
      }).rpc('parish_governance', { p_socken: socken });
      if (cancelled) return;
      setLoading(false);
      if (error || !res) { if (error) console.warn('parish_governance:', error.message); setData(null); return; }
      setData(res as ParishGovernance);
    })();
    return () => { cancelled = true; };
  }, [socken]);

  return { data, loading };
}
