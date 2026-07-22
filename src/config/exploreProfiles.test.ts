import { describe, it, expect } from "vitest";
import {
  PROFILE_IDS,
  PROFILE_SEEDS,
  normalizeProfileId,
  resolveProfileLayers,
  deriveLayoutFlags,
  layerEmphasis,
  emphasisStyle,
  validateProfile,
  buildProfilesFromRows,
  profileToPanels,
} from "./exploreProfiles";

const seed = (id: string) => PROFILE_SEEDS.find((p) => p.id === id)!;

describe("normalizeProfileId", () => {
  it("keeps valid ids", () => {
    expect(normalizeProfileId("linguist")).toBe("linguist");
    expect(normalizeProfileId("trade")).toBe("trade");
  });
  it("maps legacy ids to explore", () => {
    expect(normalizeProfileId("explorer")).toBe("explore");
    expect(normalizeProfileId("researcher")).toBe("explore");
  });
  it("defaults unknown/empty to explore", () => {
    expect(normalizeProfileId(null)).toBe("explore");
    expect(normalizeProfileId("garbage")).toBe("explore");
  });
});

describe("PROFILE_SEEDS", () => {
  it("has exactly the seven profile ids", () => {
    expect(PROFILE_SEEDS.map((p) => p.id).sort()).toEqual([...PROFILE_IDS].sort());
  });
  it("every seed passes validation (all refs known)", () => {
    for (const p of PROFILE_SEEDS) {
      expect(validateProfile(p)).toEqual([]);
    }
  });
  it("every primaryLayer is also enabled in that profile's layers", () => {
    for (const p of PROFILE_SEEDS) {
      for (const key of p.primaryLayers) {
        expect(p.layers[key]).toBe(true);
      }
    }
  });
});

describe("resolveProfileLayers", () => {
  it("enables the profile's own layers on an all-false base", () => {
    const preset = resolveProfileLayers(seed("linguist"), null);
    expect(preset.place_names).toBe(true);
    expect(preset.runic_inscriptions).toBe(true);
    expect(preset.hundreds).toBe(false);
  });
  it("applies focus overrides on top of the profile", () => {
    const preset = resolveProfileLayers(seed("explore"), "gods");
    expect(preset.religious_places).toBe(true);
    expect(preset.religious_odin).toBe(true);
    expect(preset.runic_inscriptions).toBe(false); // gods-focus hides runestones
  });
  it("rivers focus turns on the water network", () => {
    const preset = resolveProfileLayers(seed("explore"), "rivers");
    expect(preset.river_routes).toBe(true);
    expect(preset.water_routes).toBe(true);
    expect(preset.viking_fortresses).toBe(false);
  });
});

describe("deriveLayoutFlags", () => {
  it("linguist hides the timeline; geographer shows it", () => {
    expect(deriveLayoutFlags(seed("linguist")).shouldShowTimeline).toBe(false);
    expect(deriveLayoutFlags(seed("geographer")).shouldShowTimeline).toBe(true);
  });
  it("geographer hides filters (map maximized)", () => {
    expect(deriveLayoutFlags(seed("geographer")).shouldShowFilters).toBe(false);
  });
});

describe("layerEmphasis + emphasisStyle", () => {
  it("primary layers read primary, others muted", () => {
    expect(layerEmphasis(seed("linguist"), "place_names")).toBe("primary");
    expect(layerEmphasis(seed("linguist"), "gods")).toBe("muted");
  });
  it("muted style is dimmer than primary", () => {
    expect(emphasisStyle("muted").opacity).toBeLessThan(emphasisStyle("primary").opacity);
  });
});

describe("buildProfilesFromRows", () => {
  it("falls back to seeds when rows are empty or null", () => {
    expect(buildProfilesFromRows(null)).toBe(PROFILE_SEEDS);
    expect(buildProfilesFromRows([])).toBe(PROFILE_SEEDS);
  });
  it("builds and sorts valid rows, dropping unknown layer keys", () => {
    const rows = [
      {
        id: "linguist",
        sort_order: 2,
        label: { sv: "Lingvist", en: "Linguist" },
        config: {
          icon: "microscope",
          basemap: "light",
          theme: "typology",
          layers: { place_names: true, bogus_layer: true },
          primaryLayers: ["place_names"],
          defaultPeriod: "all",
          showTimeline: false,
          panels: seed("linguist").panels,
        },
      },
    ];
    const built = buildProfilesFromRows(rows as never);
    expect(built).toHaveLength(1);
    expect(built[0].layers.place_names).toBe(true);
    expect(built[0].layers.bogus_layer).toBeUndefined();
  });
  it("falls back to seeds when every row is invalid", () => {
    const rows = [{ id: "x", config: { basemap: "moon" } }];
    expect(buildProfilesFromRows(rows as never)).toBe(PROFILE_SEEDS);
  });
});

describe("profileToPanels", () => {
  it("map is always visible; profile drives legend/results/filters visibility", () => {
    const panels = profileToPanels(seed("geographer"));
    expect(panels.map.visible).toBe(true);
    expect(panels.filters.visible).toBe(false); // geographer maximizes the map
    expect(panels.legend.visible).toBe(true);
  });
  it("minimized emphasis maps to minimized:true", () => {
    const panels = profileToPanels(seed("explore"));
    expect(panels.filters.visible).toBe(true);
    expect(panels.filters.minimized).toBe(true);
  });
});
