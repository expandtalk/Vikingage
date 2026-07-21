/**
 * Element-katalog för ortnamnslagret (GIS-pilot) — REVIDERAD efter metodgranskning
 * (Agneta Nyholm-review, 2026-07). Design: docs/superpowers/specs/2026-07-17-ortnamn-gis-pilot-design.md
 *
 * Fem principer från granskningen är inbyggda i schemat:
 *  1. vi/vall splittade. Genuina *vé/vi*-namn (kult) realiseras som -vi/Ve-/Vä-,
 *     nästan aldrig som "val/vall". "vall" (vǫllr 'slätt/gärde') är genomgående
 *     profant → eget natur-element, sacralConfidence 'none'. Slås ALDRIG ihop.
 *  2. `isControl` markerar baslinje-/kontrollelement (-inge, -hem, -by, -sta …).
 *     De ska INTE tolkas som signal — de är bakgrunden man mäter mot.
 *  3. `boundaryRule` gör matchningen förutsägbar (prefix/suffix/independent/
 *     substring) i stället för tyst inbäddad delsträngsträff (Vallby vs Salinge).
 *  4. Kärn-teofora/kultiska led (Tor/Oden/Frö/Ull/Njärd/Härn/-vi/harg/hov) finns
 *     som eget evidensskikt `core` med hög sacralConfidence — den erkända signalen.
 *  5. `sacralConfidence` (none|low|medium|high) skiljer robusta markörer från
 *     topografiskt konfunderade (Horn, Galt) och rena kontroller (Get, Gås).
 *
 * `qualifierRequired` (t.ex. lund): ledet är sakralt BARA med teofor bestämning
 * (Fröslunda/Torslunda), annars profant (Erikslund, Marielund). Datan var tidigare
 * fel-taggad — alla -lund som 'sakralt'. Effektiv sakral vikt beräknas i UI genom
 * att kräva samförekomst med ett teonym-element.
 *
 * Kategorierna är BÄSTA GISSNING, inte påståenden. Omtvistade led bär `contested`.
 */

export type ElementCategory = 'sacral' | 'power' | 'nature';
export type EvidenceLayer = 'core' | 'extended' | 'control';
export type SacralConfidence = 'none' | 'low' | 'medium' | 'high';
export type BoundaryRule = 'prefix' | 'suffix' | 'independent' | 'substring';

export interface PlaceNameElement {
  /** Stabil nyckel, lagras i place_names.element_keys. */
  key: string;
  /** Visningsnamn i UI. */
  label: string;
  /** Bästa gissning — inte ett påstående. */
  category: ElementCategory;
  /** Evidensskikt: erkänd kärna, utvidgad hypotes, eller kontroll/baslinje. */
  evidenceLayer: EvidenceLayer;
  /** Prior sannolikhet att ledet är sakralt. */
  sacralConfidence: SacralConfidence;
  /** Kontroll-/baslinjeelement — ska inte tolkas som signal. */
  isControl: boolean;
  /** Etymologiskt omtvistad (rapport §5.2). Visas i UI. */
  contested: boolean;
  /** Sakralt endast med teofor bestämning (t.ex. lund → Fröslunda). */
  qualifierRequired?: boolean;
  /** Hur ledet måste sitta i namnet — gör urvalet reproducerbart. */
  boundaryRule: BoundaryRule;
  /** Kort etymologi-not, visas i popup. */
  etymology: string;
  /** Matchningsled, gemener utan diakriter. */
  patterns: string[];
  /** Kända falska träffar (rapport §3.3), gemener utan diakriter. */
  excludes: string[];
}

export const PLACE_NAME_ELEMENTS: PlaceNameElement[] = [
  // ── Skikt 1: KÄRNA — erkända teofora/kultiska led (hög sakral prior) ──────────
  {
    key: 'vi', label: 'Vi (-vi / vé)', category: 'sacral', evidenceLayer: 'core',
    sacralConfidence: 'high', isControl: false, contested: false, boundaryRule: 'suffix',
    etymology: 'Fornnordiska *vé/vi* — helig, inhägnad kultplats. Realiseras som -vi (Odensvi, Härnevi, Ullevi, Frösvi).',
    patterns: ['vi', 've'], excludes: ['vik', 'vind', 'vitt', 'vissa', 'villa'],
  },
  {
    key: 'tor', label: 'Tor / Tors-', category: 'sacral', evidenceLayer: 'core',
    sacralConfidence: 'high', isControl: false, contested: false, boundaryRule: 'prefix',
    etymology: 'Åsguden Tor. Torslunda, Torsåker, Torsvi.',
    patterns: ['tor', 'tors', 'thor'], excludes: ['torp', 'torg', 'torn', 'tort', 'torsk'],
  },
  {
    key: 'oden', label: 'Oden(s)-', category: 'sacral', evidenceLayer: 'core',
    sacralConfidence: 'high', isControl: false, contested: false, boundaryRule: 'prefix',
    etymology: 'Oden. Odensvi, Odensala, Odenslunda.',
    patterns: ['oden', 'odens', 'odin'], excludes: [],
  },
  {
    key: 'fro', label: 'Frö / Frey (Frös-)', category: 'sacral', evidenceLayer: 'core',
    sacralConfidence: 'high', isControl: false, contested: true, boundaryRule: 'prefix',
    etymology: 'Fruktbarhetsguden Frö (Freyr). Frösö, Frösunda, Fröslunda, Frövi. (Kan i undantag vara *frjó* "frö".)',
    patterns: ['fro', 'fros', 'froe', 'frey'], excludes: ['frost', 'from', 'frid'],
  },
  {
    key: 'ull', label: 'Ull(e)-', category: 'sacral', evidenceLayer: 'core',
    sacralConfidence: 'high', isControl: false, contested: false, boundaryRule: 'prefix',
    etymology: 'Guden Ull. Ullevi, Ulleråker, Ullunda.',
    patterns: ['ull', 'ulle', 'ulls', 'ullr'], excludes: [],
  },
  {
    key: 'njard', label: 'Njärd / Njord', category: 'sacral', evidenceLayer: 'core',
    sacralConfidence: 'high', isControl: false, contested: false, boundaryRule: 'prefix',
    etymology: 'Guden Njord / gudinnan *Njärd. Närlunda, Nälberga, Mjärdevi.',
    patterns: ['njard', 'njarde', 'nard', 'nerd'], excludes: [],
  },
  {
    key: 'harn', label: 'Härn (Freja-epitet)', category: 'sacral', evidenceLayer: 'core',
    sacralConfidence: 'high', isControl: false, contested: true, boundaryRule: 'prefix',
    etymology: 'Härn, tillnamn för Freja. Härnevi.',
    patterns: ['harn', 'harne'], excludes: ['harnosand'],
  },
  {
    key: 'harg', label: 'Harg / hörg', category: 'sacral', evidenceLayer: 'core',
    sacralConfidence: 'high', isControl: false, contested: false, boundaryRule: 'independent',
    etymology: 'Fornnordiska *hǫrgr* — stenaltare / hednisk helgedom.',
    patterns: ['harg', 'horg', 'horgh'], excludes: [],
  },
  {
    key: 'hov', label: 'Hov', category: 'sacral', evidenceLayer: 'core',
    sacralConfidence: 'medium', isControl: false, contested: true, boundaryRule: 'independent',
    etymology: 'Kulthall (*hof*) — men även "gård/hov" i profan mening.',
    patterns: ['hov'], excludes: [],
  },
  {
    key: 'lund', label: 'Lund (dunge)', category: 'nature', evidenceLayer: 'core',
    sacralConfidence: 'low', isControl: false, contested: true, qualifierRequired: true, boundaryRule: 'suffix',
    etymology: 'Helig lund BARA med teofor bestämning (Fröslunda, Torslunda). Utan sådan är -lund oftast ett sent herrgårds-/villanamn (Erikslund, Marielund) — profant.',
    patterns: ['lund', 'lunda'], excludes: [],
  },

  // ── Skikt 2: UTVIDGAD hypotes — topografi-först / omtvistade led ───────────────
  {
    key: 'vall', label: 'Vall (vǫllr)', category: 'nature', evidenceLayer: 'extended',
    sacralConfidence: 'none', isControl: false, contested: false, boundaryRule: 'substring',
    etymology: 'Fornnordiska *vǫllr* — slätt, gärde, betesmark. Genomgående profant (Vallby, Valla). Skilj från -vi (kult).',
    patterns: ['vall', 'valla'], excludes: [],
  },
  {
    key: 'sal', label: 'Sal (hall)', category: 'power', evidenceLayer: 'extended',
    sacralConfidence: 'medium', isControl: false, contested: true, boundaryRule: 'independent',
    etymology: 'Hall/sal — möjlig central- eller kultbyggnad. Sala, Odensala, Uppsala.',
    patterns: ['sal', 'sala', 'sall'], excludes: ['salt'],
  },
  {
    key: 'stav', label: 'Stav', category: 'sacral', evidenceLayer: 'extended',
    sacralConfidence: 'low', isControl: false, contested: true, boundaryRule: 'prefix',
    etymology: 'Stav eller stavgård — möjlig kultplats, men omtvistat.',
    patterns: ['stav', 'stava', 'staf'], excludes: [],
  },
  {
    key: 'horn', label: 'Horn', category: 'nature', evidenceLayer: 'extended',
    sacralConfidence: 'low', isControl: false, contested: true, boundaryRule: 'independent',
    etymology: 'Nästan alltid topografiskt horn/udde; teofor tolkning i undantag.',
    patterns: ['horn'], excludes: [],
  },
  {
    key: 'ed', label: 'Ed', category: 'nature', evidenceLayer: 'extended',
    sacralConfidence: 'none', isControl: false, contested: false, boundaryRule: 'independent',
    etymology: 'Näs eller dragställe mellan vatten — kommunikationsknutpunkt.',
    patterns: ['ed', 'eds'], excludes: [],
  },
  {
    key: 'hammar', label: 'Hammar', category: 'nature', evidenceLayer: 'extended',
    sacralConfidence: 'none', isControl: false, contested: false, boundaryRule: 'substring',
    etymology: 'Stenig höjd eller bergklack.',
    patterns: ['hammar'], excludes: ['hamar'],
  },
  {
    key: 'vang', label: 'Vång', category: 'nature', evidenceLayer: 'extended',
    sacralConfidence: 'none', isControl: false, contested: false, boundaryRule: 'substring',
    etymology: 'Inhägnad äng eller gärde.',
    patterns: ['vang', 'vanga', 'vong'], excludes: [],
  },
  {
    key: 'horse', label: 'Häst (Hors/Ross)', category: 'sacral', evidenceLayer: 'extended',
    sacralConfidence: 'low', isControl: false, contested: true, boundaryRule: 'prefix',
    etymology: 'Hästrelaterat — möjlig koppling till hästoffer, men svag.',
    patterns: ['hors', 'ross', 'stod'], excludes: [],
  },
  {
    key: 'galt', label: 'Galt', category: 'sacral', evidenceLayer: 'extended',
    sacralConfidence: 'low', isControl: false, contested: true, boundaryRule: 'prefix',
    etymology: 'Mytologiskt Frejs/Frejas galt — men "Galten" är ofta ett galtformat skär/häll. Måste kontrolleras mot terräng.',
    patterns: ['galt', 'galta'], excludes: [],
  },

  // ── Skikt 3: KONTROLL / baslinje — settlement-suffix, ej signal ────────────────
  {
    key: 'inge', label: '-inge', category: 'nature', evidenceLayer: 'control',
    sacralConfidence: 'none', isControl: true, contested: false, boundaryRule: 'suffix',
    etymology: 'Bland de äldsta bebyggelsenamnen (*-ingi*, "folket vid/ättlingarna till"). Kontrollgrupp — bakgrunden man mäter mot.',
    patterns: ['inge', 'inga', 'ynge'], excludes: [],
  },
  {
    key: 'hem', label: '-hem / -um', category: 'nature', evidenceLayer: 'control',
    sacralConfidence: 'none', isControl: true, contested: false, boundaryRule: 'suffix',
    etymology: 'Gammalt bebyggelsesuffix (*heimr*). Kontrollgrupp.',
    patterns: ['hem', 'hema'], excludes: [],
  },
  {
    key: 'tuna', label: '-tuna', category: 'power', evidenceLayer: 'control',
    sacralConfidence: 'low', isControl: true, contested: true, boundaryRule: 'suffix',
    etymology: 'Ofta kopplat till central-/kungsplats, men vanligt och omdebatterat → behandlas som baslinje.',
    patterns: ['tuna'], excludes: [],
  },
  {
    key: 'by', label: '-by', category: 'nature', evidenceLayer: 'control',
    sacralConfidence: 'none', isControl: true, contested: false, boundaryRule: 'suffix',
    etymology: 'Vanligt bebyggelsesuffix (*bý*). Kontrollgrupp.',
    patterns: ['by', 'bya'], excludes: [],
  },
  {
    key: 'sta', label: '-sta / -stad', category: 'nature', evidenceLayer: 'control',
    sacralConfidence: 'none', isControl: true, contested: false, boundaryRule: 'suffix',
    etymology: 'Bebyggelsesuffix (*staðir*). Kontrollgrupp.',
    patterns: ['sta', 'stad'], excludes: [],
  },
  {
    key: 'torp', label: '-torp', category: 'nature', evidenceLayer: 'control',
    sacralConfidence: 'none', isControl: true, contested: false, boundaryRule: 'suffix',
    etymology: 'Nyodling/utflyttargård (*þorp*), oftast medeltida. Kontrollgrupp.',
    patterns: ['torp'], excludes: [],
  },
  {
    key: 'get', label: 'Get', category: 'nature', evidenceLayer: 'control',
    sacralConfidence: 'none', isControl: true, contested: false, boundaryRule: 'prefix',
    etymology: 'Djurhållningsord (Getinge, Getberget). Mycket låg sakral prior — kontroll.',
    patterns: ['get', 'geta'], excludes: [],
  },
  {
    key: 'gas', label: 'Gås', category: 'nature', evidenceLayer: 'control',
    sacralConfidence: 'none', isControl: true, contested: false, boundaryRule: 'prefix',
    etymology: 'Beskrivande (Gåsö o.d.). Ingen sakral tradition — ren kontroll.',
    patterns: ['gas', 'gase', 'gasa'], excludes: [],
  },
];

const ELEMENTS_BY_KEY: Record<string, PlaceNameElement> = Object.fromEntries(
  PLACE_NAME_ELEMENTS.map((e) => [e.key, e])
);

export const getElement = (key: string): PlaceNameElement | undefined => ELEMENTS_BY_KEY[key];

/** Presentationsdata per kategori (färg + symbol till kartikoner och legend). */
export const ELEMENT_CATEGORY_META: Record<
  ElementCategory,
  { label: string; color: string; symbol: string }
> = {
  sacral: { label: 'Sakralt / kult', color: '#9932CC', symbol: '◆' },
  power: { label: 'Makt / centralplats', color: '#C99A2E', symbol: '■' },
  nature: { label: 'Natur / topografi', color: '#2E8B57', symbol: '●' },
};

/** Presentationsdata per evidensskikt. */
export const EVIDENCE_LAYER_META: Record<
  EvidenceLayer,
  { label: string; labelEn: string; note: string; noteEn: string }
> = {
  core: {
    label: 'Erkänd kärna', labelEn: 'Recognised core',
    note: 'Etablerade teofora/kultiska led — den signal ett test faktiskt ska kunna hitta.',
    noteEn: 'Established theophoric/cultic elements — the signal a test should actually detect.',
  },
  extended: {
    label: 'Utvidgad hypotes', labelEn: 'Extended hypothesis',
    note: 'Topografi-först eller omtvistade led. Positivt utfall kräver granskning.',
    noteEn: 'Topography-first or contested elements. A positive result needs scrutiny.',
  },
  control: {
    label: 'Kontroll / baslinje', labelEn: 'Control / baseline',
    note: 'Vanliga bebyggelsesuffix och djurord. INTE signal — bakgrunden man mäter mot.',
    noteEn: 'Common settlement suffixes and animal words. NOT signal — the baseline to measure against.',
  },
};

export const SACRAL_CONFIDENCE_META: Record<SacralConfidence, { label: string; labelEn: string; color: string }> = {
  high: { label: 'Hög', labelEn: 'High', color: '#22c55e' },
  medium: { label: 'Medel', labelEn: 'Medium', color: '#eab308' },
  low: { label: 'Låg', labelEn: 'Low', color: '#f97316' },
  none: { label: 'Ingen', labelEn: 'None', color: '#6b7280' },
};

/**
 * Normalisera för matchning: gemener, svenska diakriter fällda till bastecken
 * (å/ä→a, ö→o) så mönstren kan skrivas utan diakriter och matcha konsekvent.
 */
export const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '');

/** Testar ett mönster mot ett normaliserat namn enligt boundary-regeln. */
const matchesBoundary = (norm: string, pattern: string, rule: BoundaryRule): boolean => {
  const p = normalizeName(pattern);
  if (!p) return false;
  switch (rule) {
    case 'prefix': return norm.startsWith(p);
    case 'suffix': return norm.endsWith(p);
    case 'independent': return norm === p || norm.startsWith(p) || norm.endsWith(p);
    case 'substring': return norm.includes(p);
  }
};

/**
 * Vilka element matchar ett namn? Ren funktion — samma regel i importskript och UI.
 * Boundary-medveten (rapport-review §3): förutsägbart per boundaryRule, inte tyst
 * inbäddad delsträngsträff. Ett element matchar om något `patterns` uppfyller
 * boundaryRule och inget `excludes` förekommer som delsträng.
 */
export const matchElements = (name: string): string[] => {
  const norm = normalizeName(name);
  if (!norm) return [];

  return PLACE_NAME_ELEMENTS.filter((el) => {
    const excluded = el.excludes.some((ex) => norm.includes(normalizeName(ex)));
    if (excluded) return false;
    return el.patterns.some((p) => matchesBoundary(norm, p, el.boundaryRule));
  }).map((el) => el.key);
};

/**
 * Effektiv sakral vikt för ett namn givet dess matchade element: qualifierRequired-
 * led (lund) räknas bara som sakrala om ett teonym-element (core, hög) samförekommer.
 */
export const effectiveSacralConfidence = (elementKeys: string[]): SacralConfidence => {
  const els = elementKeys.map(getElement).filter(Boolean) as PlaceNameElement[];
  const hasTheonym = els.some((e) => e.evidenceLayer === 'core' && e.sacralConfidence === 'high' && !e.qualifierRequired);
  const order: SacralConfidence[] = ['none', 'low', 'medium', 'high'];
  let best: SacralConfidence = 'none';
  for (const e of els) {
    let c = e.sacralConfidence;
    if (e.qualifierRequired && !hasTheonym) c = 'none'; // lund utan teofor bestämning
    if (order.indexOf(c) > order.indexOf(best)) best = c;
  }
  return best;
};
