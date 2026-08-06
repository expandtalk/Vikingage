import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Rik svarskontext för en sökt plats: karta-centrum + kopplade runinskrifter + bilder.
// (Forskar-länken väntar tills object_source→scholar-kedjan är utredd.)
export interface AnswerCtx {
  center: { lat: number; lng: number } | null;
  page: { slug: string; title: string } | null;
  inscriptions: { id: string; signum: string | null; label: string; lat: number; lng: number; place: string | null }[];
  images: { url: string; desc: string | null }[];
  research: { id: string; name: string; role: string | null; affiliation: string | null }[];
  // documents-länkad litteratur (böcker om den sökta entiteten) — isbn driver "Hitta boken"-länk.
  literature: { id: string; title: string; author: string | null; year: number | null; isbn: string | null; kind: string | null }[];
  count: number;
}

export const useAnswerContext = (name?: string) =>
  useQuery({
    queryKey: ['answer-context', name],
    enabled: !!name && name.trim().length >= 2,
    queryFn: async (): Promise<AnswerCtx> => {
      const { data, error } = await (supabase as any).rpc('entity_answer_context', { p_name: name });
      if (error) throw error;
      return (data ?? { center: null, page: null, inscriptions: [], images: [], research: [], literature: [], count: 0 }) as AnswerCtx;
    },
    staleTime: 5 * 60 * 1000,
  });
