/**
 * ENDA sanningen för legend-lagrens default på/av + ENDA sättet att räkna ut ett lagers
 * enabled-tillstånd. Bakgrund: legend-poster gatades tidigare ad hoc — vissa med
 * `enabledLegendItems.x !== false` (default PÅ), andra `=== true` (default AV), och några
 * HÅRDKODADE `enabled: true/false` (christian sites, ortnamn, hedniska kultplatser) vilket
 * gjorde krysset omöjligt att ändra. Genom att alltid gå via `itemEnabled(state, id)` kan
 * ett lager aldrig mer bli otogglingsbart, och default bor på ETT ställe.
 *
 * Regel: användarens explicita val vinner; annars LEGEND_DEFAULTS; annars AV.
 */
export const LEGEND_DEFAULTS: Record<string, boolean> = {
  // --- Baslager PÅ som standard ---
  runic_inscriptions: true,
  foreign_inscriptions: true,
  viking_cities: true,
  viking_fortresses: true,
  water_routes: true,
  valdemar_route: true,
  river_routes: true,
  viking_roads: true,
  road_rullstensas: true,
  road_halvagar: true,
  road_vinteragar: true,
  road_landmarks: true,
  heritage_sites: true, // förälder PÅ så per-typ-kryssen är åtkomliga (barnen driver kartan)
  ecclesiastical_churches: true,
  germanic_timeline: true,
  folk_groups: true,
  historical_events: true,
  // Gruppkategorier (rubrik-wrappers) — PÅ så barnen syns; barnen driver kartan.
  cat_runic: true,
  cat_church: true,
  cat_defense: true,
  cat_folk: true,
  cat_geo: true,

  // --- Opt-in-lager AV som standard ---
  runestone_density: false, // GIS-analyslager: runstenstäthet per härad (centroid-cirklar)
  place_names: false, // ~495 ortnamn klottrar kartan; tänds medvetet (PR: place-names-opt-in)
  paleo_shoreline: false,
  species_introductions: false,
  picture_stone_reuse: false,
  coins: false,
  adna_sites: false,
  estates: false, // maktsäten (kungsgårdar/handelsplatser) — ekonomihistorikerns lager
  stake_barriers: false,
  viking_regions: false,
  religious_places: false, // (golden master: kategorin är AV som standard i live-generatorn)
  // Kulturlager-barn (viewport-laddade, tunga) — tänd en typ i taget
  heritage_kalla: false,
  heritage_skeppssattning: false,
  heritage_ganggrift: false,
  heritage_vardkase: false,
  heritage_dos: false,
  heritage_bildsten: false,
  heritage_labyrint: false, // stenlabyrinter/trojaborgar (RAÄ), mestadels odaterade/sena

  heritage_kyrka: false,
  heritage_kapell: false,
  heritage_kloster: false,
  // Hedniska kultplatser (var HÅRDKODADE av → gick inte att slå på; nu togglingsbara)
  religious_thor: false,
  religious_odin: false,
  religious_frey: false,
  religious_ull: false,
  religious_njord: false,
  religious_frigg: false,
  religious_other: false,
  // Kristna platser (christianSitesLegend): periodlager PÅ, ordnar/heliga/parent AV
  christian_sites: false,
  early_christian_sites: true,
  medieval_monasteries: true,
  late_medieval_sites: true,
  religious_orders: false,
  cistercian_monasteries: false,
  franciscan_convents: false,
  dominican_convents: false,
  birgittine_monasteries: false,
  holy_places: false,
};

/**
 * Räkna ut om ett lager är på. Explicit användarval vinner; annars default; annars AV.
 * `fallback` låter dynamiska id:n (t.ex. gruppkategorier) ange sin default inline utan
 * att behöva stå i registret.
 */
export const itemEnabled = (
  enabledLegendItems: { [key: string]: boolean } | undefined,
  id: string,
  fallback: boolean = LEGEND_DEFAULTS[id] ?? false,
): boolean => {
  const v = enabledLegendItems?.[id];
  return typeof v === 'boolean' ? v : fallback;
};
