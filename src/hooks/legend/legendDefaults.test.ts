import { describe, it, expect } from 'vitest';
import { generateBasicInscriptionItems } from './legendItemGenerators';
import { itemEnabled } from './itemEnabled';

/**
 * Golden master: default-tillståndet (tomt enabledLegendItems) fångades FÖRE refaktorn
 * till itemEnabled/LEGEND_DEFAULTS. Detta test låser att refaktorn inte råkade flippa
 * något lagers default. Om en rad ändras måste det vara ett MEDVETET beslut.
 */
const DEFAULT_ENABLED: Record<string, boolean> = {
  cat_runic: true, runic_inscriptions: true, cat_church: true, ecclesiastical_churches: true,
  heritage_kyrka: false, heritage_kapell: false, heritage_kloster: false, heritage_sites: true,
  heritage_kalla: false, heritage_skeppssattning: false, heritage_ganggrift: false,
  heritage_vardkase: false, heritage_dos: false, heritage_bildsten: false, heritage_labyrint: false,
  religious_places: false, religious_odin: false, religious_frey: false, religious_thor: false,
  religious_ull: false, religious_njord: false, religious_frigg: false, religious_other: false,
  water_routes: true, valdemar_route: true, river_routes: true, viking_roads: true,
  road_rullstensas: true, road_halvagar: true, road_vinteragar: true, road_landmarks: true,
  cat_defense: true, viking_fortresses: true, viking_cities: true, stake_barriers: false,
  cat_folk: true, folk_groups: true, viking_regions: false, cat_geo: true, place_names: false,
  historical_events: true, species_introductions: false, picture_stone_reuse: false,
  coins: false, adna_sites: false, paleo_shoreline: false,
  // GIS-analyslager tillagt (runstenstäthet per härad) — medvetet AV som standard.
  runestone_density: false,
};

const buildMap = () => {
  const items = generateBasicInscriptionItems([], false, {}, (k: string) => k, 'all', undefined, []);
  const map: Record<string, boolean> = {};
  const walk = (arr: any[]) => arr.forEach((it) => { map[it.id] = it.enabled; if (it.children) walk(it.children); });
  walk(items);
  return map;
};

describe('legend default-tillstånd (golden master)', () => {
  it('itemEnabled: explicit val vinner, annars default, annars AV', () => {
    expect(itemEnabled({ coins: true }, 'coins')).toBe(true);        // explicit på slår default AV
    expect(itemEnabled({ runic_inscriptions: false }, 'runic_inscriptions')).toBe(false); // explicit av slår default PÅ
    expect(itemEnabled({}, 'runic_inscriptions')).toBe(true);        // default PÅ
    expect(itemEnabled({}, 'coins')).toBe(false);                    // default AV
    expect(itemEnabled({}, 'okänt_id')).toBe(false);                 // okänt → AV
  });

  it('default-kartan är oförändrad efter refaktorn', () => {
    expect(buildMap()).toEqual(DEFAULT_ENABLED);
  });

  it('tidigare hårdkodade AV-lager går nu att slå PÅ (stuck-toggle-fixen)', () => {
    const items = generateBasicInscriptionItems([], false,
      { religious_places: true, religious_thor: true, stake_barriers: true, viking_regions: true },
      (k: string) => k, 'all', undefined, []);
    const map: Record<string, boolean> = {};
    const walk = (arr: any[]) => arr.forEach((it) => { map[it.id] = it.enabled; if (it.children) walk(it.children); });
    walk(items);
    expect(map.religious_places).toBe(true);
    expect(map.religious_thor).toBe(true);
    expect(map.stake_barriers).toBe(true);
    expect(map.viking_regions).toBe(true);
  });
});
