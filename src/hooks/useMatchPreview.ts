import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Ordförädling: hur många ortnamn (OSM-registret) matchar ett mönster, + exempel.
// Låter en användare tuna stam/gräns/uteslutningar tills sökningen blir rätt.
export interface MatchPreview { n: number; samples: string[] }
const sb = supabase as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }> };

export const useMatchPreview = (patterns: string[], excludes: string[], boundary: string, enabled: boolean) =>
  useQuery({
    queryKey: ['match-preview', [...patterns].sort(), [...excludes].sort(), boundary],
    queryFn: async (): Promise<MatchPreview> => {
      const { data, error } = await sb.rpc('placename_match_preview', { p_patterns: patterns, p_excludes: excludes, p_boundary: boundary });
      if (error) throw error;
      return (data ?? { n: 0, samples: [] }) as MatchPreview;
    },
    enabled: enabled && patterns.length > 0,
    staleTime: 5 * 60 * 1000,
  });
