import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hämtar ämnesmatchad media (poddar + video) för en sökterm via RPC media_for_topic.
// Ersätter den statiska RecommendedPodcasts-listan i söksvaret: "gotland" ger nu Gotland-avsnitten,
// inte de sex generella poddarna. URL:erna bär redan UTM (vikingage.se) från RPC:n.
export interface MediaHit {
  item_id: string;
  source_id: string;
  medium: 'podcast' | 'youtube';
  source_name: string;
  creator: string | null;
  title: string;
  url: string;
  published_at: string | null;
  view_count: number | null;
  summary_sv: string | null;
  score: number;
  source_rank: number;
}

const sb = supabase as unknown as {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: MediaHit[] | null; error: unknown }>;
};

export function useMediaForTopic(query: string, limitPerMedium = 8) {
  const q = (query ?? '').trim();
  return useQuery({
    queryKey: ['media-for-topic', q],
    enabled: q.length > 1,
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<{ podcasts: MediaHit[]; videos: MediaHit[] }> => {
      const [pod, vid] = await Promise.all([
        sb.rpc('media_for_topic', { q, p_medium: 'podcast', p_limit: limitPerMedium, p_offset: 0 }),
        sb.rpc('media_for_topic', { q, p_medium: 'youtube', p_limit: limitPerMedium, p_offset: 0 }),
      ]);
      return { podcasts: (pod.data ?? []), videos: (vid.data ?? []) };
    },
  });
}
