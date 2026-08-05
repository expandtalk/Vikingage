import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Konst & inventarier kopplade till en kyrka (kalkmålningar, skulpturer, altarskåp, runstenar…).
// Modellerar fakta; visar ej verbatim källtext. Målare via artist-embedding.
export interface ChurchArtwork {
  id: string;
  artwork_type: string;
  title: string | null;
  motif: string | null;
  dating_text: string | null;
  year_from: number | null;
  year_to: number | null;
  material: string | null;
  location_in_church: string | null;
  condition: string | null;
  source: string | null;
  source_url: string | null;
  image_url: string | null;
  artist: { name: string } | null;
}

export const useChurchArtworks = (churchId: string | undefined) =>
  useQuery({
    queryKey: ['church-artworks', churchId],
    enabled: !!churchId,
    queryFn: async (): Promise<ChurchArtwork[]> => {
      const { data, error } = await (supabase as any)
        .from('church_artworks')
        .select(
          'id,artwork_type,title,motif,dating_text,year_from,year_to,material,location_in_church,condition,source,source_url,image_url,artist:artists(name)',
        )
        .eq('church_id', churchId)
        .order('year_from', { ascending: true, nullsFirst: true });
      if (error) throw error;
      return (data ?? []) as ChurchArtwork[];
    },
    staleTime: 5 * 60 * 1000,
  });
