import { describe, it, expect } from "vitest";
import {
  BASEMAPS,
  getBasemapConfig,
  isKnownLayerKey,
  PROFILE_ICONS,
  THEME_ACCENTS,
} from "./exploreCapabilities";

describe("exploreCapabilities", () => {
  it("every basemap has an https tile URL and attribution", () => {
    for (const cfg of Object.values(BASEMAPS)) {
      expect(cfg.url).toMatch(/^https:\/\//);
      expect(cfg.attribution.length).toBeGreaterThan(0);
      expect(cfg.maxZoom).toBeGreaterThan(0);
    }
  });

  it("getBasemapConfig falls back to osm for an unknown id", () => {
    // @ts-expect-error runtime fallback for a value outside the union
    expect(getBasemapConfig("nope")).toBe(BASEMAPS.osm);
    expect(getBasemapConfig("terrain")).toBe(BASEMAPS.terrain);
  });

  it("isKnownLayerKey accepts real layers and rejects junk", () => {
    expect(isKnownLayerKey("place_names")).toBe(true);
    expect(isKnownLayerKey("runic_inscriptions")).toBe(true);
    expect(isKnownLayerKey("water_routes")).toBe(true);
    expect(isKnownLayerKey("not_a_layer")).toBe(false);
  });

  it("has an icon component and accent for the profile keys", () => {
    expect(PROFILE_ICONS.dna).toBeTruthy();
    expect(PROFILE_ICONS.globe).toBeTruthy();
    expect(THEME_ACCENTS.typology).toMatch(/^#/);
  });
});
