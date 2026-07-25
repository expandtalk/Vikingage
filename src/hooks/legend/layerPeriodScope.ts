// Period-scoping av kartlager: för perioder ÄLDRE än vendeltid är bara ett fåtal
// lager relevanta (historiska händelser, folk & regioner, megaliter/äldre gravar,
// landhöjning, aDNA, innovationer). Övriga (runstenar, städer, mynt, kyrkor,
// tingsplatser, vikingaleder, maktsäten …) döljs. Vendeltid + vikingatid = fullt.
//
// Detta är en ren härledning ovanpå enabledLegendItems — rå-staten rörs inte, så
// när användaren går tillbaka till vikingatid återställs alla lager-val.

const FULL_PERIODS = new Set(['vendel_period', 'viking_age']);

// Leaf-gate-nycklar som kartlager-hooksen faktiskt läser (inte display-kategorier).
export const EARLY_ALLOWED_LAYERS = new Set<string>([
  'historical_events',
  'folk_groups',
  'germanic_timeline',
  'viking_regions',
  'heritage_sites',            // parent-master för Kulturlager
  'heritage_dos',
  'heritage_ganggrift',
  'heritage_skeppssattning',
  'paleo_shoreline',
  'adna_sites',
  'species_introductions',     // arter & innovationer
]);

// Lager som ska vara PÅ som standard i äldre perioder, så kartan inte blir tom.
// Djuptidens huvudinnehåll på kartan: folkgrupper (opt-out men force-off i basePresets),
// arter/innovationer och aDNA-platser. Utan detta döljs runstenar men inget tänds i stället.
export const EARLY_DEFAULT_ON = new Set<string>([
  'folk_groups', 'species_introductions', 'adna_sites',
]);

// Opt-out-lager (gate:ar `!== false`, dvs PÅ även när nyckeln saknas) måste tvingas
// av explicit i äldre perioder — annars ritas de trots att de inte står i staten.
const FORCE_OFF_OPT_OUT = [
  'river_routes', 'water_routes', 'valdemar_route',
  'viking_cities', 'koping', 'established_city', 'trading_post', 'religious_center', 'gotlandic_center',
  'ecclesiastical_churches', 'runic_inscriptions',
];

export const isEarlyPeriod = (period?: string): boolean =>
  !!period && !FULL_PERIODS.has(period);

/**
 * Returnerar en period-anpassad kopia av enabledLegendItems. För äldre perioder
 * tvingas allt utom EARLY_ALLOWED_LAYERS av. För vendeltid/vikingatid returneras
 * indata oförändrad (samma referens → inga onödiga re-renders).
 */
export const scopeLayersByPeriod = (
  enabled: { [key: string]: boolean },
  period?: string
): { [key: string]: boolean } => {
  if (!isEarlyPeriod(period)) return enabled;
  const scoped: { [key: string]: boolean } = {};
  for (const k of Object.keys(enabled)) {
    scoped[k] = EARLY_ALLOWED_LAYERS.has(k) ? enabled[k] : false;
  }
  // Tänd djuptidens kärninnehåll så kartan visar något (annars: runstenar dolda, inget kvar).
  for (const k of EARLY_DEFAULT_ON) scoped[k] = true;
  for (const k of FORCE_OFF_OPT_OUT) {
    if (!EARLY_ALLOWED_LAYERS.has(k)) scoped[k] = false;
  }
  return scoped;
};
