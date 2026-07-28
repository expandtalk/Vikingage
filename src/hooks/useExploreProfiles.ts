import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveExploreRole, useActiveExploreRoles } from "./useActiveExploreRole";
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

/** Den PRIMÄRA aktiva profilen (basemap/tema/paneler/period tas härifrån). */
export const useActiveExploreProfile = (): ExploreProfile => {
  const id = useActiveExploreRole();
  const profiles = useExploreProfiles();
  return profiles.find((p) => p.id === id) ?? profiles[0] ?? PROFILE_SEEDS[0];
};

/** Alla valda profiler (additivt). Primär = [0]. Memoiserad → stabil referens för useMemo-deps. */
export const useActiveExploreProfiles = (): ExploreProfile[] => {
  const ids = useActiveExploreRoles();
  const profiles = useExploreProfiles();
  return useMemo(() => {
    const picked = ids.map((id) => profiles.find((p) => p.id === id)).filter(Boolean) as ExploreProfile[];
    return picked.length ? picked : [profiles[0] ?? PROFILE_SEEDS[0]];
  }, [ids, profiles]);
};
