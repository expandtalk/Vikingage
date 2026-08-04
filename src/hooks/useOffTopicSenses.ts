import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OffTopicSense {
  sense_label_sv: string;
  sense_label_en: string;
  note_sv: string | null;
  note_en: string | null;
  destination: string | null;
}

const sb = supabase as unknown as {
  from: (t: string) => {
    select: (c: string) => {
      eq: (c: string, v: string) => { eq: (c: string, v: boolean) => { order: (c: string, o: { ascending: boolean }) => Promise<{ data: unknown; error: unknown }> } };
    };
  };
};

// Homonym-disambiguering: off-topic betydelser av söksträngen (our_domain=false) som visas
// "vid sidan", avmarkerade — t.ex. "Tor" → Tor Browser. Vi hävdar vår kanoniska mening och
// noterar de andra utan att fokusera på dem.
export function useOffTopicSenses(query: string) {
  const term = query.trim().toLowerCase();
  const q = useQuery({
    queryKey: ['offtopic-senses', term],
    enabled: term.length >= 2,
    queryFn: async (): Promise<OffTopicSense[]> => {
      const { data, error } = await sb
        .from('entity_senses')
        .select('sense_label_sv,sense_label_en,note_sv,note_en,destination')
        .eq('term', term)
        .eq('our_domain', false)
        .order('rank', { ascending: true });
      if (error || !Array.isArray(data)) return [];
      return data as OffTopicSense[];
    },
  });
  return { data: q.data ?? [] };
}
