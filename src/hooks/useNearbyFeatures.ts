import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { NearMeFeature } from '@/hooks/useNearMe';

// Fristående, återanvändbar hämtning av närliggande objekt via den befintliga RPC:n
// nearby_features(p_lat, p_lng, p_radius_km default 40, p_limit default 200) → blandade lager
// (runstenar, kyrkor, estates, lämningar, fornborgar, vårdkasar m.fl.), sorterade på avstånd.
// Ingen ny DB-skrivning. Droppbar på vilken karta som helst.
export const useNearbyFeatures = (
  lat?: number | null,
  lng?: number | null,
  radiusKm = 1,
  limit = 200,
) =>
  useQuery({
    queryKey: ['nearby-features', lat, lng, radiusKm, limit],
    enabled: lat != null && lng != null,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('nearby_features', {
        p_lat: lat as number, p_lng: lng as number, p_radius_km: radiusKm, p_limit: limit,
      });
      if (error) throw error;
      return (data ?? []) as NearMeFeature[];
    },
  });
