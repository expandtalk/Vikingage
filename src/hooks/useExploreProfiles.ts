import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveExploreRole } from "./useActiveExploreRole";
import {
  buildProfilesFromRows,
  PROFILE_SEEDS,
  type ExploreProfile,
  type ExploreProfileRow,
} from "@/config/exploreProfiles";

/**
 * Läser Explore-profilerna från Supabase. Faller robust tillbaka på de typade
 * kod-seeds om hämtningen fallerar, returnerar tomt, eller inte finns ännu.
 */
export const useExploreProfiles = (): ExploreProfile[] => {
  const { data } = useQuery({
    queryKey: ["explore-profiles"],
    queryFn: async (): Promise<ExploreProfile[]> => {
      const { data, error } = await supabase
        .from("explore_profiles")
        .select("id, sort_order, label, description, config")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return buildProfilesFromRows(data as unknown as ExploreProfileRow[]);
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: PROFILE_SEEDS,
  });

  return data && data.length ? data : PROFILE_SEEDS;
};

/** Den för närvarande aktiva profilen (store-id upplöst mot profil-listan). */
export const useActiveExploreProfile = (): ExploreProfile => {
  const id = useActiveExploreRole();
  const profiles = useExploreProfiles();
  return profiles.find((p) => p.id === id) ?? profiles[0] ?? PROFILE_SEEDS[0];
};
