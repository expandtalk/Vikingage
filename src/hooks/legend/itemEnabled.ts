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
  heritage_stones: true, // "Stenar"-kategorins förälder PÅ (barnen milstenar/gränsstenar… driver kartan)
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
  runic_titles: false, // sociala titlar på runstenar (kung→frigiven), färg per rang-tier; opt-in
  runbleck_only: false, // fristående filter: begränsa kartan till runbleck/amuletter (~150)
  place_names: false, // ~495 ortnamn klottrar kartan; tänds medvetet (opt-in). Ligger under
  // Kulturlager (Daniel), kategoriserat på element-typ (sakral/makt/natur):
  place_names_sacral: true,
  place_names_power: true,
  place_names_nature: true,
  paleo_shoreline: false,
  species_introductions: false,
  picture_stone_reuse: false,
  coins: false,
  shipwrecks: false, // marinarkeologi (barn under Marinarkeologi-kategorin), opt-in
  adna_sites: false,
  estates: false, // maktsäten (förälder, opt-in) — ekonomihistorikerns lager
  // Maktsäten-typer (barn). Default PÅ så att när man slår på "Maktsäten" (kaskad) syns
  // alla typer; stäng av en typ för att smalna av. useMapEstates gate:ar per typ.
  estates_kungsgard: true,
  estates_husaby: true,
  estates_borg: true,
  estates_handelsplats: true,
  estates_ovrigt: true,
  stake_barriers: false,
  beacon_sites: false, // vårdkasar (RAÄ + manuell komplettering), fristående lager under Försvar & bevakning
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
  heritage_grotta: true, // grottor & överhäng PÅ som standard (Äventyr-innehåll) — Daniel 2026-08-01
  // Förälder-gate för "Folktradition & sägen" (heritage_grottas kategori). Måste vara PÅ
  // här: useMapHeritageSites parentOn() läser enabledLegendItems.heritage_folklore RAKT AV
  // (inte via itemEnabled), och LegendCategory visar bara barn när kategorins egen enabled
  // är true (processLegendItems gör samma råa === true-koll för toppnivå-poster). Utan denna
  // rad seedas grottan visserligen på kartan, men kategorin ligger hopfälld/otogglingsbar i
  // legend-UI:t. Sätt INTE de andra folktros-barnen (jättar/offerplatser/vårdträd) true.
  heritage_folklore: true,

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
 * KURERAD MOBIL-STARTUPPSÄTTNING (Daniel 2026-08-06): på telefon ska kartan öppna lugn —
 * bara **runstenar, kyrkor och fornlämningar** PÅ, allt annat av. "Visa allt" är ett medvetet
 * opt-in därifrån (brandslangen var default förut → oöverskådligt på liten skärm).
 *
 * VIKTIGT: många lager gate:ar `!== false` (dvs PÅ om nyckeln är ODEFINIERAD). Därför räcker det
 * INTE att bara tända de tre grupperna — varje default-på-lager måste EXPLICIT nollställas, annars
 * läcker de igenom. Vi bygger därför en full false-karta (alla kända default-nycklar + extra
 * gate-nycklar som renderar lager men saknas i LEGEND_DEFAULTS) och tänder sedan de kurerade.
 */
const MOBILE_ON: string[] = [
  // Runstenar (svenska + utländska) — kategori-parent + barn som driver kartan
  'cat_runic', 'runic_inscriptions', 'foreign_inscriptions',
  // Kyrkor & kristendom
  'cat_church', 'ecclesiastical_churches', 'early_christian_sites', 'medieval_monasteries', 'late_medieval_sites',
  // Fornlämningar: Kulturlager-parent + representativa gravtyper/monument (bbox-laddat → lätt)
  'heritage_sites', 'heritage_gravfalt', 'heritage_stensattning', 'heritage_ganggrift',
  'heritage_dos', 'heritage_domarring', 'heritage_skeppssattning', 'heritage_stenkammargrav',
  'heritage_reststen', 'heritage_hallristning',
];
// Extra gate-nycklar (renderar lager via `!== false` men står inte i LEGEND_DEFAULTS) — måste
// nollställas explicit. Speglar EXTRA_GATE_KEYS i useLegendManager.handleHideAll.
const MOBILE_EXTRA_OFF: string[] = [
  'historical_events', 'valdemar_route', 'road_rullstensas', 'road_halvagar', 'road_vinteragar',
  'road_landmarks', 'place_names_sacral', 'place_names_power', 'place_names_nature',
  'religious_center', 'trading_post', 'koping', 'established_city', 'gotlandic_center', 'viking_cities',
];
export const MOBILE_DEFAULT_LAYERS: Record<string, boolean> = (() => {
  const out: Record<string, boolean> = {};
  for (const k of Object.keys(LEGEND_DEFAULTS)) out[k] = false;
  for (const k of MOBILE_EXTRA_OFF) out[k] = false;
  for (const k of MOBILE_ON) out[k] = true;
  return out;
})();

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
