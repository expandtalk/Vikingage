import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { NearMeFeature } from '@/hooks/useNearMe';

// Säsongsfiltrerade upplevelser (experiences) nära en punkt via RPC nearby_experiences.
// Samma form som nearby_features → merge:bar rakt in i near me-listan. Säsongsfiltret
// (nuvarande månad mot season_from/to_month) sköts i RPC:n, serverside.
export const useNearbyExperiences = (
  lat?: number | null,
  lng?: number | null,
  radiusKm = 1,
  limit = 200,
) =>
  useQuery({
    queryKey: ['nearby-experiences', lat, lng, radiusKm, limit],
    enabled: lat != null && lng != null,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('nearby_experiences', {
        p_lat: lat as number, p_lng: lng as number, p_radius_km: radiusKm, p_limit: limit,
      });
      if (error) throw error;
      return (data ?? []) as NearMeFeature[];
    },
  });
