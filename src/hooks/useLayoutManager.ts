import { usePanelManager } from "./usePanelManager";
import { useActiveExploreProfile } from "./useExploreProfiles";
import { deriveLayoutFlags } from "@/config/exploreProfiles";

export const useLayoutManager = () => {
  const { panels, activePreset } = usePanelManager();
  const profile = useActiveExploreProfile();
  const flags = deriveLayoutFlags(profile);

  return {
    panels,
    activePreset,
    shouldShowControls: flags.shouldShowControls,
    shouldShowMap: flags.shouldShowMap,
    shouldShowFilters: flags.shouldShowFilters,
    shouldShowTimeline: flags.shouldShowTimeline,
  };
};
