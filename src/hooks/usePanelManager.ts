import { useCallback } from "react";
import { useActiveExploreProfile, useExploreProfiles } from "./useExploreProfiles";
import { useActiveExploreRole, setActiveExploreRole } from "./useActiveExploreRole";
import { profileToPanels, normalizeProfileId, type ResolvedPanel } from "@/config/exploreProfiles";

/** Bakåtkompatibel typ som paneler-komponenterna importerar. */
export type PanelConfig = ResolvedPanel;

export interface PanelPreset {
  name: string;
  description: string;
}

export const usePanelManager = () => {
  const activeProfile = useActiveExploreProfile();
  const profiles = useExploreProfiles();
  const activePreset = useActiveExploreRole();

  const panels = profileToPanels(activeProfile);

  // Presets härleds från profillistan (för legacy-konsumenter, t.ex. admin-vyn).
  const presets: Record<string, PanelPreset> = Object.fromEntries(
    profiles.map((p) => [p.id, { name: p.label.sv, description: p.description.sv }]),
  );

  const applyPreset = useCallback((presetName: string) => {
    setActiveExploreRole(normalizeProfileId(presetName));
  }, []);

  // Panelgeometri är nu profil-styrd; drag/resize/toggle är no-ops som bevarar API-ytan.
  const noop = useCallback(() => {}, []);

  return {
    panels,
    activePreset,
    presets,
    updatePanel: noop as (panelId: string, updates: Partial<PanelConfig>) => void,
    togglePanelVisibility: noop as (panelId: string) => void,
    togglePanelMinimized: noop as (panelId: string) => void,
    setPanelPosition: noop as (panelId: string, position: { x: number; y: number }) => void,
    setPanelSize: noop as (panelId: string, size: { width: number; height: number }) => void,
    applyPreset,
    resetToDefaults: useCallback(() => setActiveExploreRole("explore"), []),
  };
};
