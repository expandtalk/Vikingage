import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Kurerade SIDOR/upplevelser nära en punkt (content_pages via pages_near). Typmedvetet:
// region matchar när den INNEHÅLLER punkten (bbox), rutt/plats när de är inom radien.
// Rankas serverside: rutt/plats du står vid > region du är i, sedan avstånd.
export interface NearbyPage {
  slug: string;
  url: string;
  title_sv: string;
  title_en: string | null;
  kind: string;               // 'route' | 'site' | 'region' | 'theme'
  verb_sv: string | null;     // 'Gå leden' | 'Besök' | 'Utforska'
  verb_en: string | null;
  teaser_sv: string | null;
  teaser_en: string | null;
  dist_m: number;
  geom_approx: boolean;
}

export const useNearbyPages = (lat?: number | null, lng?: number | null, radiusKm = 40) =>
  useQuery({
    queryKey: ['nearby-pages', lat, lng, radiusKm],
    enabled: lat != null && lng != null,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('pages_near', {
        p_lat: lat as number,
        p_lng: lng as number,
        radius_m: Math.round(radiusKm * 1000),
      });
      if (error) throw error;
      return (data ?? []) as NearbyPage[];
    },
  });
